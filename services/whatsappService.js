// services/whatsappService.js
const { wrapServiceCall } = require('./notificationUtils');

async function sendReceipt(parentPhone, receiptData) {
  const response = await fetch('https://api.arkesel.com/v2/sms/whatsapp/send', {
    method: 'POST',
    headers: {
      'api-key': process.env.ARKESEL_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sender: receiptData.schoolName.replace(/\s/g, ''),
      recipient: [parentPhone],
      message: buildReceiptMessage(receiptData)
    })
  });
  return response.json();
}

async function sendSms(parentPhone, message, senderName = 'SchoolOS') {
  const response = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
    method: 'POST',
    headers: {
      'api-key': process.env.ARKESEL_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sender: senderName.substring(0, 11).replace(/\s/g, ''), // SMS sender max 11 chars
      message: message,
      recipients: [parentPhone]
    })
  });
  return response.json();
}

function buildReceiptMessage(data) {
  return `*${data.schoolName}* — Fee Receipt ✅\n\n` +
    `Student: ${data.studentName}\n` +
    `Class: ${data.className}\n` +
    `Amount: GHS ${data.amount}\n` +
    `Method: ${data.method}\n` +
    `Date: ${data.date}\n` +
    `Ref: ${data.reference}\n\n` +
    `Thank you for your payment!`;
}

// Keep the interface similar for backward compatibility
async function sendPaymentReceipt(params) {
    // Transform old params to new receiptData if needed, or just pass it
    const receiptData = {
        schoolName: params.schoolName || 'SchoolOS',
        studentName: params.name || 'Student',
        className: params.className || 'Class',
        amount: params.amount,
        method: params.method || 'Cash',
        date: new Date().toLocaleDateString(),
        reference: params.invoiceId || 'N/A'
    };
    return wrapServiceCall(sendReceipt(params.to, receiptData), 'sendPaymentReceipt whatsapp');
}

module.exports = {
  sendReceipt,
  sendSms,
  buildReceiptMessage,
  sendPaymentReceipt
};

