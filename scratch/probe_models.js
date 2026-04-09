const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

function getApiKey() {
  try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const match = env.match(/GEMINI_API_KEY=([^\r\n]+)/);
    return match ? match[1] : '';
  } catch (e) {
    return '';
  }
}

async function listModels() {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error('API Key not found in .env.local');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-2.0-flash-exp'];
  
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('hi');
      console.log(`Model ${modelName}: OK`);
    } catch (err) {
      console.log(`Model ${modelName}: FAILED - ${err.message}`);
    }
  }
}

listModels();
