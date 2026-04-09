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
  
  // Test the model from image/route.ts
  const models = [
    'gemini-2.0-flash-preview-image-generation',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest'
  ];
  
  for (const modelName of models) {
    try {
      console.log(`Probing ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Hello, are you there? Reply with "YES".');
      const text = result.response.text();
      console.log(`Model ${modelName}: SUCCESS - Response: ${text}`);
    } catch (err) {
      console.log(`Model ${modelName}: FAILED - ${err.message}`);
    }
  }
}

probe();
