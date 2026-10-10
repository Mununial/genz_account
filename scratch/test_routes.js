const https = require('https');

const API_KEY = '3lqdhCpj5nMYyeBZ9UJgrQ8oIN4Ls7Gf0i2PETHVxAK1O6XFbz9jWsIHG7LcPtdNZTEJrzawloFgkeKR';

function testRoute(route, extra = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      route,
      ...extra,
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

async function run() {
  console.log('Testing v3 route:');
  const rV3 = await testRoute('v3', { sender_id: 'TXTIND', message: 'GenZ Univ test' });
  console.log('v3:', rV3);

  console.log('Testing dlt route:');
  const rDlt = await testRoute('dlt', { sender_id: 'TXTIND', message: 'GenZ Univ test' });
  console.log('dlt:', rDlt);
}

run().catch(console.error);
