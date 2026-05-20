/**
 * Payment Reconciliation Service
 * 
 * Nightly job that compares Paystack/MoMo transactions against fee_payments table.
 * Flags mismatches for investigation:
 * - Transaction paid but not recorded in DB
 * - Fee payment recorded but transaction not found
 * - Amount mismatch
 * - Status mismatch (completed vs pending)
 */

const supabase = require('../config/db');
const { sendPaymentAlert } = require('./emailService');

class PaymentReconciliationService {
  /**
   * Run full daily reconciliation
   * Should be called by cron job nightly at 2 AM
   */
  async runDailyReconciliation() {
    console.log('[Payment Reconciliation] Starting daily reconciliation...');
    
    try {
      const results = {
        successful: 0,
        mismatches: [],
        errors: [],
        timestamp: new Date().toISOString(),
      };

      // Reconcile each school independently
      const { data: schools, error: schoolError } = await supabase
        .from('schools')
        .select('id, name, email');

      if (schoolError) {
        results.errors.push(`Failed to fetch schools: ${schoolError.message}`);
        await this.logReconciliation(results);
        return results;
      }

      for (const school of schools || []) {
        try {
          const schoolResults = await this.reconcileSchool(school.id, school.name);
          results.successful += schoolResults.successful;
          results.mismatches.push(...schoolResults.mismatches);
          
          // Alert school if critical mismatches found
          if (schoolResults.mismatches.length > 0 && school.email) {
            await this.alertSchoolOfMismatches(school, schoolResults.mismatches);
          }
        } catch (err) {
          results.errors.push(`School ${school.id} reconciliation failed: ${err.message}`);
        }
      }

      await this.logReconciliation(results);
      console.log('[Payment Reconciliation] Completed:', results);
      return results;
    } catch (err) {
      console.error('[Payment Reconciliation] Fatal error:', err);
      throw err;
    }
  }

  /**
   * Reconcile a single school's payments
   */
  async reconcileSchool(schoolId, schoolName) {
    const results = { successful: 0, mismatches: [] };

    try {
      // Get all completed payments from this school in the last 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: feePayments, error: feeError } = await supabase
        .from('fee_payments')
        .select('id, invoice_id, amount, status, payment_reference, created_at, updated_at')
        .eq('school_id', schoolId)
        .gte('created_at', ninetyDaysAgo.toISOString())
        .in('status', ['completed', 'pending', 'failed']);

      if (feeError) throw feeError;

      // Get all Paystack transactions for this school
      const { data: transactions, error: txError } = await supabase
        .from('payment_transactions')
        .select('id, reference, amount, status, provider, created_at')
        .eq('school_id', schoolId)
        .gte('created_at', ninetyDaysAgo.toISOString());

      if (txError) throw txError;

      // Build maps for easy lookup
      const feesByReference = new Map();
      const feesByInvoice = new Map();
      (feePayments || []).forEach(fee => {
        if (fee.payment_reference) {
          feesByReference.set(fee.payment_reference, fee);
        }
        if (fee.invoice_id) {
          feesByInvoice.set(fee.invoice_id, fee);
        }
      });

      const txsByReference = new Map();
      (transactions || []).forEach(tx => {
        txsByReference.set(tx.reference, tx);
      });

      // Check for mismatches
      for (const fee of (feePayments || [])) {
        // Skip failed and pending
        if (fee.status === 'failed' || fee.status === 'pending') continue;

        // Find corresponding transaction
        const tx = fee.payment_reference ? txsByReference.get(fee.payment_reference) : null;

        if (!tx) {
          results.mismatches.push({
            type: 'ORPHAN_FEE_PAYMENT',
            severity: 'HIGH',
            schoolId,
            feeId: fee.id,
            invoiceId: fee.invoice_id,
            amount: fee.amount,
            reference: fee.payment_reference,
            message: `Fee payment recorded but transaction not found: GHS ${fee.amount}`,
            detectedAt: new Date().toISOString(),
          });
        } else {
          // Compare amounts (in pesewas in DB vs GHS in transaction)
          const feeAmountGHS = fee.amount;
          const txAmountGHS = tx.amount / 100; // Paystack returns pesewas

          if (Math.abs(feeAmountGHS - txAmountGHS) > 0.01) {
            results.mismatches.push({
              type: 'AMOUNT_MISMATCH',
              severity: 'CRITICAL',
              schoolId,
              feeId: fee.id,
              transactionId: tx.id,
              feeAmount: feeAmountGHS,
              transactionAmount: txAmountGHS,
              difference: Math.abs(feeAmountGHS - txAmountGHS),
              message: `Amount mismatch: Fee shows GHS ${feeAmountGHS}, transaction shows GHS ${txAmountGHS}`,
              detectedAt: new Date().toISOString(),
            });
          }

          // Compare status
          const feeStatusNormalized = fee.status.toLowerCase();
          const txStatusNormalized = tx.status.toLowerCase();
          
          if (feeStatusNormalized !== txStatusNormalized) {
            results.mismatches.push({
              type: 'STATUS_MISMATCH',
              severity: 'MEDIUM',
              schoolId,
              feeId: fee.id,
              transactionId: tx.id,
              feeStatus: feeStatusNormalized,
              transactionStatus: txStatusNormalized,
              message: `Status mismatch: Fee is ${feeStatusNormalized}, transaction is ${txStatusNormalized}`,
              detectedAt: new Date().toISOString(),
            });
          }
        }
      }

      // Check for orphan transactions (paid but not recorded)
      for (const tx of (transactions || [])) {
        if (tx.status !== 'completed') continue;

        const fee = txsByReference.has(tx.reference) 
          ? txsByReference.get(tx.reference)
          : feesByReference.get(tx.reference);

        if (!fee) {
          results.mismatches.push({
            type: 'ORPHAN_TRANSACTION',
            severity: 'CRITICAL',
            schoolId,
            transactionId: tx.id,
            reference: tx.reference,
            amount: tx.amount / 100,
            provider: tx.provider,
            message: `Transaction completed but fee payment not recorded: GHS ${tx.amount / 100}`,
            detectedAt: new Date().toISOString(),
          });
        }
      }

      results.successful = (feePayments || []).length;
      return results;
    } catch (err) {
      console.error(`[Reconciliation] Error reconciling school ${schoolId}:`, err);
      throw err;
    }
  }

  /**
   * Log reconciliation results to audit table
   */
  async logReconciliation(results) {
    try {
      const { error } = await supabase.from('reconciliation_logs').insert({
        results: results,
        successful_count: results.successful,
        mismatch_count: results.mismatches.length,
        error_count: results.errors.length,
        run_date: new Date().toISOString(),
      });

      if (error) console.error('[Reconciliation] Failed to log results:', error);
    } catch (err) {
      console.error('[Reconciliation] Error logging:', err);
    }
  }

  /**
   * Alert school admin of critical payment mismatches
   */
  async alertSchoolOfMismatches(school, mismatches) {
    const critical = mismatches.filter(m => m.severity === 'CRITICAL');
    if (critical.length === 0) return;

    const total = mismatches.reduce((sum, m) => {
      if (m.type === 'AMOUNT_MISMATCH') return sum + m.difference;
      if (m.type === 'ORPHAN_FEE_PAYMENT') return sum + m.amount;
      if (m.type === 'ORPHAN_TRANSACTION') return sum + m.amount;
      return sum;
    }, 0);

    try {
      await sendPaymentAlert({
        to: school.email,
        schoolName: school.name,
        subject: `⚠️ Payment Reconciliation Alert: ${critical.length} issues found`,
        mismatches: critical,
        totalDiscrepancy: total,
      });
    } catch (err) {
      console.error('[Reconciliation] Failed to send alert:', err);
    }
  }

  /**
   * Manual reconciliation for specific school (admin triggered)
   */
  async reconcileSchoolNow(schoolId) {
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('id, name, email')
      .eq('id', schoolId)
      .single();

    if (schoolError) throw schoolError;

    const results = await this.reconcileSchool(schoolId, school.name);
    
    if (results.mismatches.length > 0) {
      await this.alertSchoolOfMismatches(school, results.mismatches);
    }

    return results;
  }
}

module.exports = new PaymentReconciliationService();
