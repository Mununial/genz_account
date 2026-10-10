const https = require('https');

const API_KEY = '3lqdhCpj5nMYyeBZ9UJgrQ8oIN4Ls7Gf0i2PETHVxAK1O6XFbz9jWsIHG7LcPtdNZTEJrzawloFgkeKR';

function sendFast2Sms({ numbers, message }) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      route: 'q',
      message: message,
      language: 'english',
      flash: 0,
      numbers: numbers
    });

    const options = {
      hostname: 'www.fast2sms.com',
      path: '/dev/bulkV2',
      method: 'POST',
      headers: {
        'authorization': API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Test sending to 6370998587
async function run() {
  const testMsg = 'GenZ Univ: SMS Gateway connected successfully! Fast2SMS quick alerts active for Fees, GatePass & Tickets.';
  console.log('Sending message (' + testMsg.length + ' chars):', testMsg);
  const result = await sendFast2Sms({ numbers: '6370998587', message: testMsg });
  console.log('Fast2SMS Result:', result);
}

run().catch(console.error);
