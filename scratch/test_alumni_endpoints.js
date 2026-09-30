const http = require('http');
const app = require('../backend/server');

let server;
let baseUrl;

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(url, reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

async function run() {
  server = app.listen(0, async () => {
    baseUrl = `http://localhost:${server.address().port}`;

    try {
      // 1. Login staff
      const login = await request('/api/auth/login', {
        method: 'POST',
        body: { email: 'admin@bec.ac.in', password: 'Admin@BEC2026!' }
      });
      const token = login.data.data.token;

      // 2. Fetch Alumni
      const alumniRes = await request('/api/admin/alumni', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Alumni List Response Status:', alumniRes.status);
      console.log('Total Alumni:', alumniRes.data.data.total);
      console.log('Stats:', alumniRes.data.data.stats);
      console.log('First 2 Alumni:', alumniRes.data.data.alumni.slice(0, 2).map(a => ({
        name: a.full_name,
        batch: a.passout_batch,
        company: a.company_name,
        designation: a.designation,
        cgpa: a.final_cgpa,
        noDues: a.no_dues_status
      })));

      // 3. Test Graduate a student to Alumni
      const gradRes = await request('/api/admin/promotion/passout-alumni', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          studentId: 1644, // Tushar Mhato
          passoutYear: 2026,
          finalCgpa: 8.75,
          degreeAwarded: 'Diploma in Mechanical Engineering (1st Class)',
          companyName: 'Larsen & Toubro (L&T)',
          designation: 'Junior Engineer Trainee',
          workLocation: 'Bhubaneswar',
          placementStatus: 'PLACED',
          cautionDepositAction: 'REFUNDED',
          remarks: 'No Dues Cleared from Mechanical Workshop and Accounts.'
        }
      });

      console.log('\nGraduation Response Status:', gradRes.status);
      console.log('Graduation Message:', gradRes.data.message);
      console.log('Graduated Student is_alumni:', gradRes.data.data.is_alumni);
      console.log('Graduated Student status:', gradRes.data.data.student_status);
      console.log('Graduated Student company:', gradRes.data.data.company_name);

      server.close();
      process.exit(0);
    } catch (err) {
      console.error('Error:', err);
      server.close();
      process.exit(1);
    }
  });
}

run();
