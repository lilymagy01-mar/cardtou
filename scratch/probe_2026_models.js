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

async function probe() {
  const apiKey = getApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const models = [
    'gemini-2.0-flash',
    'gemini-2.5-pro'
  ];
  
  for (const modelName of models) {
    try {
      console.log(`Probing ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Hi');
      const text = result.response.text();
      console.log(`Model ${modelName}: SUCCESS - Response Length: ${text.length}`);
    } catch (err) {
      console.log(`Model ${modelName}: FAILED - ${err.message}`);
    }
  }
}

probe();
