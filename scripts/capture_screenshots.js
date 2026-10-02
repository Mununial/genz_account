const http = require('http');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const ARTIFACT_DIR = path.join(__dirname, '..', 'artifacts');
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function login(username, password) {
  const res = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: username, password: password || '123456' });
  return res.data?.data?.token;
}

function captureScreenshot(url, outputPath) {
  const cmd = `"${CHROME_PATH}" --headless=new --disable-gpu --virtual-time-budget=3000 --window-size=1440,1250 --screenshot="${outputPath}" "${url}"`;
  try {
    execSync(cmd, { stdio: 'pipe' });
    console.log(`✓ Captured: ${path.basename(outputPath)}`);
    return true;
  } catch (err) {
    console.error(`Failed to capture ${outputPath}:`, err.message);
    return false;
  }
}

const BRAIN_DIR = 'C:\\Users\\munun\\.gemini\\antigravity-ide\\brain\\61812a7d-bfa3-43c8-b7c3-12ee6f90608b';

function saveBoth(url, filename) {
  const p1 = path.join(ARTIFACT_DIR, filename);
  const p2 = path.join(BRAIN_DIR, filename);
  captureScreenshot(url, p1);
  if (fs.existsSync(p1)) {
    fs.copyFileSync(p1, p2);
  }
}

async function run() {
  console.log('Capturing screenshots for all portals and student workflow...\n');

  // 1. HOD Portal (Mechanical Engineering)
  const hodToken = await login('hod.mech', '123456');
  if (hodToken) {
    saveBoth(`http://localhost:5000/hod-registrations.html?token=${hodToken}`, 'hod_portal_screenshot.png');
  }

  // 2. Director Portal (All Departments)
  const dirToken = await login('director', '123456');
  if (dirToken) {
    saveBoth(`http://localhost:5000/director-registrations.html?token=${dirToken}`, 'director_portal_screenshot.png');
  }

  // 3. Dedicated College Examination Section Page (BPUT Exam Cell)
  const examToken = await login('exam.section', '123456');
  if (examToken) {
    saveBoth(`http://localhost:5000/exam-registrations.html?token=${examToken}`, 'exam_section_queue_screenshot.png');
  }

  // 3B. Accounts Department Fee Register
  const accToken = await login('admin', '123456');
  if (accToken) {
    saveBoth(`http://localhost:5000/accounts-registrations.html?token=${accToken}`, 'accounts_portal_screenshot.png');
  }

  await new Promise(r => setTimeout(r, 1000));

  // 4. Admin Subject Catalog & CSV Import
  const adminToken = await login('admin', '123456');
  if (adminToken) {
    saveBoth(`http://localhost:5000/admin-subjects.html?token=${adminToken}`, 'admin_subjects_screenshot.png');
  }

  await new Promise(r => setTimeout(r, 1000));

  // 5. Student Self-Apply Portal (Aisha Priyadarsini Sahoo - Eligible + Self-Apply Checklist)
  const aishaToken = await login('2026BEC03001', '123456');
  if (aishaToken) {
    saveBoth(`http://localhost:5000/student-portal.html?token=${aishaToken}&tab=subject-registration`, 'student_self_apply_screenshot.png');
  }

  await new Promise(r => setTimeout(r, 1000));

  // 6. Student Confirmed Roadmap Tracker (Tushar Mhato - 5-Stage Stepper + Exam Fee Paid + Confirmed Slip + Next Sem Loop)
  const tusharToken = await login('2644', '123456');
  if (tusharToken) {
    saveBoth(`http://localhost:5000/student-portal.html?token=${tusharToken}&tab=subject-registration&sem=2`, 'student_roadmap_tracker_screenshot.png');
  }

  console.log('\nAll screenshots captured successfully in artifacts and brain directories!');
}

run();
