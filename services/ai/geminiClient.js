const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;
let _lastUsed = 0;

function getModel() {
  if (!model) {
    const key = process.env.GOOGLE_API_KEY;
    if (!key) {
      console.warn('[AI] GOOGLE_API_KEY not set. AI features disabled. Get free key at https://aistudio.google.com/app/apikey');
      return null;
    }
    genAI = new GoogleGenerativeAI(key);
    model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { maxOutputTokens: 150, temperature: 0.7 },
    });
  }
  _lastUsed = Date.now();
  return model;
}

function isAIAvailable() {
  return !!process.env.GOOGLE_API_KEY;
}

function getLastUsed() {
  return _lastUsed;
}

module.exports = { getModel, isAIAvailable, getLastUsed };
