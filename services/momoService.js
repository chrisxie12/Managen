const MOMO_BASE_URL = process.env.MOMO_ENVIRONMENT === 'production' 
  ? 'https://momodeveloper.mtn.com' 
  : 'https://sandbox.momodeveloper.mtn.com';

async function getAccessToken() {
  const API_USER = process.env.MOMO_API_USER;
  const API_KEY = process.env.MOMO_API_KEY;
  
  const response = await fetch(`${MOMO_BASE_URL}/collection/token/`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${API_USER}:${API_KEY}`).toString('base64')}`,
      'Ocp-Apim-Subscription-Key': process.env.MOMO_SUBSCRIPTION_KEY
    }
  });
  const data = await response.json();
  return data.access_token;
}

async function requestToPay(amount, phone, externalId, studentName) {
  const response = await fetch(`${MOMO_BASE_URL}/collection/v1_0/requesttopay`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${await getAccessToken()}`,
      'X-Reference-Id': externalId,
      'X-Target-Environment': process.env.MOMO_ENVIRONMENT,
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': process.env.MOMO_SUBSCRIPTION_KEY
    },
    body: JSON.stringify({
      amount: amount.toString(),
      currency: 'GHS',
      externalId: externalId,
      payer: { partyIdType: 'MSISDN', partyId: phone },
      payerMessage: 'School fees payment',
      payeeNote: `Fee payment for ${studentName}`
    })
  });
  
  if (!response.ok) throw new Error(`MoMo error: ${response.status}`);
  return { referenceId: externalId, status: 'pending' };
}

async function getTransactionStatus(referenceId) {
  const response = await fetch(`${MOMO_BASE_URL}/collection/v1_0/requesttopay/${referenceId}`, {
    headers: { 
      'Authorization': `Bearer ${await getAccessToken()}`,
      'X-Target-Environment': process.env.MOMO_ENVIRONMENT,
      'Ocp-Apim-Subscription-Key': process.env.MOMO_SUBSCRIPTION_KEY
    }
  });
  return response.json(); // { status: 'SUCCESSFUL' | 'PENDING' | 'FAILED' }
}

module.exports = {
  requestToPay,
  getTransactionStatus,
  getAccessToken
};
