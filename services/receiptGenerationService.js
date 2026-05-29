/**
 * Receipt Generation Service
 * 
 * Every payment must auto-generate a PDF receipt with:
 * - Unique receipt ID
 * - Timestamp
 * - School stamp/logo
 * - Payment details (amount, method, student, invoice)
 * - QR code linking to receipt verification
 */

const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const supabase = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

class ReceiptGenerationService {
  /**
   * Generate receipt PDF for a payment
   * Returns: { receiptId, receiptUrl, filePath }
   */
  async generateReceipt(paymentData) {
    const {
      schoolId,
      studentId,
      studentName,
      invoiceId,
      amount,
      currency = 'GHS',
      paymentMethod = 'mobile_money',
      reference,
      schoolName,
      schoolLogo,
      schoolAddress,
      schoolPhone,
    } = paymentData;

    const receiptId = `REC-${Date.now()}-${uuidv4().substring(0, 8)}`.toUpperCase();

    try {
      // Create PDF
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
      });

      // Add header
      if (schoolLogo) {
        try {
          doc.image(schoolLogo, { width: 80 });
        } catch (err) {
          console.warn('School logo not found, skipping');
        }
      }

      doc.fontSize(20).font('Helvetica-Bold').text(schoolName || 'School Receipt', {
        align: 'center',
      });

      doc.fontSize(10).font('Helvetica').text(schoolAddress || '', {
        align: 'center',
      });
      doc.text(`Phone: ${schoolPhone || 'N/A'}`, { align: 'center' });
      doc.moveDown();

      // Receipt details
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('PAYMENT RECEIPT', { align: 'center' });
      doc.moveTo(40, doc.y + 5).lineTo(555, doc.y + 5).stroke();
      doc.moveDown();

      // Receipt metadata
      const now = new Date();
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Receipt ID: ${receiptId}`)
        .text(`Date: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`);

      doc.moveDown();

      // Student and invoice info
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('PAYMENT DETAILS')
        .font('Helvetica')
        .text(`Student: ${studentName || 'N/A'}`)
        .text(`Invoice ID: ${invoiceId || 'N/A'}`)
        .text(`Reference: ${reference || 'N/A'}`);

      doc.moveDown();

      // Amount section
      doc.fontSize(11).font('Helvetica-Bold').text('AMOUNT PAID');
      doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();

      const amountText = `${currency} ${Number(amount).toFixed(2)}`;
      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .text(amountText, { align: 'center' });
      doc.moveDown();

      // Payment method
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Payment Method: ${this.formatPaymentMethod(paymentMethod)}`)
        .text(`Transaction Status: COMPLETED`);

      doc.moveDown();

      // QR code for verification
      try {
        const qrData = `${process.env.FRONTEND_URL || 'https://getschoolos.me'}/verify-receipt/${receiptId}`;
        const qrImage = await QRCode.toDataURL(qrData);
        doc.image(qrImage, {
          fit: [100, 100],
          align: 'center',
        });
        doc.fontSize(8).text('Scan to verify receipt', { align: 'center' });
      } catch (err) {
        console.error('QR code generation failed:', err);
      }

      doc.moveDown();

      // Footer
      doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc
        .fontSize(8)
        .font('Helvetica')
        .text(
          'This is an automatically generated receipt. It is valid as proof of payment.',
          { align: 'center' }
        )
        .text(
          `For inquiries, contact ${schoolName || 'your school'} or call ${schoolPhone || 'school phone'}.`,
          { align: 'center' }
        );

      // Write to file
      const receiptDir = path.join(process.cwd(), 'receipts');
      if (!fs.existsSync(receiptDir)) {
        fs.mkdirSync(receiptDir, { recursive: true });
      }

      const fileName = `${receiptId}.pdf`;
      const filePath = path.join(receiptDir, fileName);

      return new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);
        doc.end();

        stream.on('finish', () => {
          // Store receipt metadata in DB
          this.storeReceiptMetadata({
            receiptId,
            schoolId,
            studentId,
            invoiceId,
            amount,
            currency,
            filePath,
          }).catch(err => console.error('Failed to store receipt metadata:', err));

          resolve({
            receiptId,
            receiptUrl: `/receipts/${fileName}`,
            filePath,
          });
        });

        stream.on('error', reject);
      });
    } catch (err) {
      console.error('Receipt generation failed:', err);
      throw err;
    }
  }

  async storeReceiptMetadata(metadata) {
    const { error } = await supabase.from('receipts').insert({
      receipt_id: metadata.receiptId,
      school_id: metadata.schoolId,
      student_id: metadata.studentId,
      invoice_id: metadata.invoiceId,
      amount: metadata.amount,
      currency: metadata.currency,
      file_path: metadata.filePath,
      generated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Failed to store receipt metadata:', error);
      throw error;
    }
  }

  formatPaymentMethod(method) {
    const methods = {
      mobile_money: 'Mobile Money (MoMo)',
      card: 'Debit/Credit Card',
      bank_transfer: 'Bank Transfer',
      cash: 'Cash Payment',
      cheque: 'Cheque',
    };
    return methods[method] || method;
  }

  /**
   * Retrieve receipt by ID (with verification)
   */
  async getReceipt(receiptId) {
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('receipt_id', receiptId)
      .single();

    if (error) {
      throw new Error(`Receipt not found: ${receiptId}`);
    }

    return data;
  }

  /**
   * Email receipt to student/parent
   */
  async emailReceipt(receiptId, recipientEmail, recipientName) {
    try {
      const receipt = await this.getReceipt(receiptId);
      const emailService = require('./emailService');

      await emailService.sendPaymentReceipt({
        to: recipientEmail,
        name: recipientName,
        amount: receipt.amount,
        currency: receipt.currency,
        invoiceId: receipt.invoice_id,
        receiptId: receipt.receipt_id,
        schoolName: 'School', // Should be fetched from schools table
        attachmentPath: receipt.file_path,
      });

      return { success: true, receiptId };
    } catch (err) {
      console.error('Failed to email receipt:', err);
      throw err;
    }
  }
}

module.exports = new ReceiptGenerationService();
