const https = require('https');

const API_KEY = '3lqdhCpj5nMYyeBZ9UJgrQ8oIN4Ls7Gf0i2PETHVxAK1O6XFbz9jWsIHG7LcPtdNZTEJrzawloFgkeKR';

async function checkFast2SMS() {
  console.log('--- Testing Fast2SMS API Key ---');
  
  // 1. Check Wallet Balance
  const balancePromise = new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'www.fast2sms.com',
      path: '/dev/wallet',
      method: 'POST',
      headers: {
        'authorization': API_KEY,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.end();
  });

  try {
    const bal = await balancePromise;
    console.log('Wallet Status:', bal.status, bal.body);
  } catch (e) {
    console.error('Wallet check failed:', e.message);
  }
}

checkFast2SMS();
