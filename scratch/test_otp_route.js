const https = require('https');

const API_KEY = '3lqdhCpj5nMYyeBZ9UJgrQ8oIN4Ls7Gf0i2PETHVxAK1O6XFbz9jWsIHG7LcPtdNZTEJrzawloFgkeKR';

function testOtpRoute() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      route: 'otp',
      variables_values: '894120',
      numbers: '6370998587'
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

testOtpRoute().then(res => console.log('OTP Route Result:', res)).catch(console.error);
