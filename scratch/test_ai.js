const fetch = require('node-fetch');

async function test() {
  const url = 'http://localhost:3000/api/ai/message';
  const payload = {
    occasion: 'wedding',
    relationship: 'friend',
    senderName: 'Agent',
    recipientName: 'User',
    tone: 'warm'
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
