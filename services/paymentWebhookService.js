const crypto = require('crypto');
const supabase = require('../config/db');
const smsService = require('./smsService');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

function verifySignature(rawBody, signature) {
  if (!PAYSTACK_SECRET_KEY || !signature || !Buffer.isBuffer(rawBody)) return false;
  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(String(signature), 'hex'));
}

function resolvePaymentChannel(data) {
  const channel = (data.channel || '').toLowerCase();
  const bank = (data.authorization?.bank || '').toLowerCase();
  const brand = (data.authorization?.brand || '').toLowerCase();

  if (channel === 'card' || channel === 'qr') {
    return { payment_method: 'card', provider: brand || 'card' };
  }
  if (channel === 'bank') {
    return { payment_method: 'bank_transfer', provider: 'bank' };
  }
  if (bank === 'mtn') return { payment_method: 'mobile_money', provider: 'mtn' };
  if (bank === 'vodafone' || bank === 'telecel') return { payment_method: 'mobile_money', provider: 'telecel' };
  if (bank === 'airteltigo') return { payment_method: 'mobile_money', provider: 'at' };
  return { payment_method: 'mobile_money', provider: bank || 'mobile_money' };
}

async function handleChargeSuccess(event) {
  const data = event.data;
  if (!data) return;

  const reference = data.reference;
  const metadata = data.metadata || {};
  const tenantId = metadata.tenant_id;
  const invoiceId = metadata.invoice_id;
  const studentId = metadata.student_id;
  const amountPesewas = data.amount || 0;
  const amount = Math.round(amountPesewas / 100);
  const transactionId = String(data.id || reference);

  if (!reference || !tenantId || !invoiceId || !studentId) {
    console.error('Paystack webhook missing required fields:', { reference, tenantId, invoiceId, studentId });
    return;
  }

  const { payment_method } = resolvePaymentChannel(data);

  const { data: rpcResult, error: rpcError } = await supabase.rpc('process_paystack_payment', {
    p_school_id: tenantId,
    p_invoice_id: invoiceId,
    p_student_id: studentId,
    p_amount: amount,
    p_payment_method: payment_method,
    p_reference: reference,
    p_transaction_id: transactionId,
  });

  if (rpcError) {
    console.error('Paystack webhook RPC error:', rpcError);
    return;
  }

  if (!rpcResult?.success) {
    console.warn('Paystack webhook: RPC declined:', rpcResult?.error);
    return;
  }

  try {
    await sendPaymentSms(studentId, tenantId, amount, invoiceId, reference);
  } catch (smsErr) {
    console.error('Paystack webhook SMS error:', smsErr.message);
  }
}

async function sendPaymentSms(studentId, schoolId, amount, invoiceId, reference) {
  const { data: student } = await supabase
    .from('students')
    .select('name, phone')
    .eq('id', studentId)
    .eq('tenant_id', schoolId)
    .single();

  if (!student) return;

  const { data: parentLink } = await supabase
    .from('parents')
    .select('user_id')
    .eq('student_id', studentId)
    .maybeSingle();

  let phone = student.phone;
  if (parentLink?.user_id) {
    const { data: parentUser } = await supabase
      .from('users')
      .select('phone')
      .eq('id', parentLink.user_id)
      .maybeSingle();
    if (parentUser?.phone) phone = parentUser.phone;
  }

  if (!phone) return;

  const { data: invoice } = await supabase
    .from('invoices')
    .select('invoice_number, total_amount, paid_amount')
    .eq('id', invoiceId)
    .single();

  if (!invoice) return;

  const outstanding = Math.max(0, Number(invoice.total_amount) - Number(invoice.paid_amount));

  await smsService.send({
    to: phone,
    message: `Payment received: GHS ${amount.toLocaleString()} for ${student.name}. Invoice ${invoice.invoice_number}. Outstanding balance: GHS ${outstanding.toLocaleString()}. Thank you.`,
  });
}

module.exports = {
  verifySignature,
  resolvePaymentChannel,
  handleChargeSuccess,
};
