/**
 * Partial & Overpayment Handling Service
 * 
 * Handles complex payment scenarios:
 * - Parent pays less than full amount → store as partial
 * - Parent pays more than full amount → create credit balance
 * - Multiple partial payments toward single invoice
 * - Credit balance tracking per parent/student
 */

const supabase = require('../config/db');

class PaymentHandlingService {
  /**
   * Process a payment with amount flexibility
   * 
   * Returns:
   * - { status: 'full_payment', invoiceId, amount }
   * - { status: 'partial_payment', invoiceId, amount, remaining }
   * - { status: 'overpayment', invoiceId, amount, creditApplied, creditBalance }
   */
  async processPayment(paymentData) {
    const {
      schoolId,
      studentId,
      invoiceId,
      amount,
      paymentMethod,
      reference,
    } = paymentData;

    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, amount_due, amount_paid, status')
      .eq('id', invoiceId)
      .eq('school_id', schoolId)
      .single();

    if (invoiceError) {
      throw new Error(`Invoice not found: ${invoiceId}`);
    }

    const amountDue = invoice.amount_due - invoice.amount_paid;
    const result = {
      invoiceId,
      paymentAmount: amount,
      invoiceDueAmount: amountDue,
    };

    // Case 1: Full payment (amount equals or slightly exceeds due amount)
    if (Math.abs(amount - amountDue) < 0.01) {
      result.status = 'full_payment';
      result.remaining = 0;

      await this.recordPayment({
        schoolId,
        studentId,
        invoiceId,
        amount,
        paymentMethod,
        reference,
        type: 'full',
      });

      // Mark invoice as paid
      await supabase
        .from('invoices')
        .update({
          amount_paid: invoice.amount_paid + amount,
          status: 'paid',
        })
        .eq('id', invoiceId);

      return result;
    }

    // Case 2: Partial payment (amount < due amount)
    if (amount < amountDue) {
      result.status = 'partial_payment';
      result.remaining = amountDue - amount;

      await this.recordPayment({
        schoolId,
        studentId,
        invoiceId,
        amount,
        paymentMethod,
        reference,
        type: 'partial',
      });

      // Update invoice - still pending
      await supabase
        .from('invoices')
        .update({
          amount_paid: invoice.amount_paid + amount,
          status: 'partially_paid',
        })
        .eq('id', invoiceId);

      return result;
    }

    // Case 3: Overpayment (amount > due amount)
    if (amount > amountDue) {
      result.status = 'overpayment';

      const overpaidAmount = amount - amountDue;
      result.creditApplied = amountDue;
      result.creditBalance = overpaidAmount;

      // Record payment for full due amount
      await this.recordPayment({
        schoolId,
        studentId,
        invoiceId,
        amount: amountDue,
        paymentMethod,
        reference,
        type: 'full',
      });

      // Mark invoice as paid
      await supabase
        .from('invoices')
        .update({
          amount_paid: invoice.amount_paid + amountDue,
          status: 'paid',
        })
        .eq('id', invoiceId);

      // Create credit balance
      await this.createCreditBalance({
        schoolId,
        studentId,
        amount: overpaidAmount,
        source: `Overpayment on invoice ${invoiceId}`,
        originalPaymentMethod: paymentMethod,
        originalReference: reference,
      });

      return result;
    }
  }

  /**
   * Record payment transaction
   */
  async recordPayment(data) {
    const { schoolId, studentId, invoiceId, amount, paymentMethod, reference, type } = data;

    const { error } = await supabase.from('fee_payments').insert({
      school_id: schoolId,
      student_id: studentId,
      invoice_id: invoiceId,
      amount: amount,
      payment_method: paymentMethod,
      payment_reference: reference,
      payment_type: type,
      status: 'completed',
      paid_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error(`Failed to record payment: ${error.message}`);
    }
  }

  /**
   * Create credit balance for overpayment
   */
  async createCreditBalance(data) {
    const {
      schoolId,
      studentId,
      amount,
      source,
      originalPaymentMethod,
      originalReference,
    } = data;

    const { error } = await supabase.from('credit_balances').insert({
      school_id: schoolId,
      student_id: studentId,
      balance: amount,
      source: source,
      source_payment_method: originalPaymentMethod,
      source_reference: originalReference,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    });

    if (error) {
      console.error('Failed to create credit balance:', error);
    }
  }

  /**
   * Get credit balance for student
   */
  async getCreditBalance(schoolId, studentId) {
    const { data, error } = await supabase
      .from('credit_balances')
      .select('balance, source, created_at')
      .eq('school_id', schoolId)
      .eq('student_id', studentId)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to get credit balance:', error);
      return 0;
    }

    return (data || []).reduce((sum, row) => sum + row.balance, 0);
  }

  /**
   * Apply credit balance to new invoice
   */
  async applyCreditToInvoice(schoolId, studentId, invoiceId) {
    const creditBalance = await this.getCreditBalance(schoolId, studentId);

    if (creditBalance <= 0) {
      return { applied: 0, remaining: 0 };
    }

    // Get invoice due amount
    const { data: invoice } = await supabase
      .from('invoices')
      .select('amount_due, amount_paid')
      .eq('id', invoiceId)
      .single();

    const amountDue = invoice.amount_due - invoice.amount_paid;
    const creditToApply = Math.min(creditBalance, amountDue);

    // Apply credit
    await supabase
      .from('invoices')
      .update({
        amount_paid: invoice.amount_paid + creditToApply,
        status: creditToApply >= amountDue ? 'paid' : 'partially_paid',
      })
      .eq('id', invoiceId);

    // Record as credit payment
    await this.recordPayment({
      schoolId,
      studentId,
      invoiceId,
      amount: creditToApply,
      paymentMethod: 'credit_balance',
      reference: 'AUTO_CREDIT_APPLIED',
      type: creditToApply >= amountDue ? 'full' : 'partial',
    });

    // Deduct from credit balance
    const { data: creditRow } = await supabase
      .from('credit_balances')
      .select('balance')
      .eq('school_id', schoolId)
      .eq('student_id', studentId)
      .single();
    const newBalance = Math.max(0, (creditRow?.balance || 0) - creditToApply);
    await supabase
      .from('credit_balances')
      .update({ balance: newBalance })
      .eq('school_id', schoolId)
      .eq('student_id', studentId);

    return {
      applied: creditToApply,
      remaining: creditBalance - creditToApply,
      invoiceRemaining: Math.max(0, amountDue - creditToApply),
    };
  }

  /**
   * Issue refund for erroneous overpayment
   * (Requires admin approval)
   */
  async issueRefund(schoolId, creditId, amount, reason) {
    const { error } = await supabase.from('refunds').insert({
      school_id: schoolId,
      credit_id: creditId,
      amount: amount,
      reason: reason,
      status: 'pending', // Should be approved by admin
      requested_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error(`Failed to issue refund: ${error.message}`);
    }
  }

  /**
   * Summary for parents/admin showing payment breakdown
   */
  async getPaymentSummary(schoolId, studentId) {
    const { data: invoices } = await supabase
      .from('invoices')
      .select('id, amount_due, amount_paid, status')
      .eq('school_id', schoolId)
      .eq('student_id', studentId);

    const creditBalance = await this.getCreditBalance(schoolId, studentId);

    const totalDue = (invoices || []).reduce((sum, inv) => sum + inv.amount_due, 0);
    const totalPaid = (invoices || []).reduce((sum, inv) => sum + inv.amount_paid, 0);
    const totalOwing = totalDue - totalPaid;

    return {
      totalDue,
      totalPaid,
      totalOwing,
      creditBalance,
      invoices: invoices || [],
      summary: {
        paidInFull: (invoices || []).filter(i => i.status === 'paid').length,
        partiallyPaid: (invoices || []).filter(i => i.status === 'partially_paid').length,
        unpaid: (invoices || []).filter(i => i.status === 'unpaid').length,
      },
    };
  }
}

module.exports = new PaymentHandlingService();
