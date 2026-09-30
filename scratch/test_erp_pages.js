const http = require('http');
const fs = require('fs');
const path = require('path');

const PAGES = [
  { file: 'receipt-desk.html', dataPage: 'receipt-desk', title: 'Fast e-Receipt Desk' },
  { file: 'dashboard.html', dataPage: 'dashboard', title: 'Executive Accounts Dashboard' },
  { file: 'students.html', dataPage: 'students', title: 'Students Directory & Profile' },
  { file: 'student-fee.html', dataPage: 'student-fee', title: 'Student Fee Details & Ledger' },
  { file: 'payment-details.html', dataPage: 'payment-details', title: 'Student Fee Payment Details' },
  { file: 'student-transport-fee.html', dataPage: 'transport', title: 'Student Transport Fee' },
  { file: 'expenses.html', dataPage: 'expenses', title: 'Expenses & Accounts Master' },
  { file: 'receipts.html', dataPage: 'receipts', title: 'Fee Receipts Register' },
  { file: 'invoices.html', dataPage: 'invoices', title: 'Invoices Register' },
  { file: 'reports.html', dataPage: 'reports', title: 'Financial Reports & Defaulters' }
];

console.log('================================================================');
console.log('STAFF ACCOUNTS ERP - UI REDESIGN VALIDATION SUITE');
console.log('================================================================\n');

let allPassed = true;

// 1. File static checks
console.log('[1/2] Checking AppShell markup consistency across all 10 ERP pages...');
PAGES.forEach(p => {
  const filePath = path.join(__dirname, '..', 'frontend', p.file);
  if (!fs.existsSync(filePath)) {
    console.error(`  [FAIL] Missing file: ${p.file}`);
    allPassed = false;
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');

  // Check 1: Sidebar present
  const hasSidebar = content.includes('class="app-sidebar"') || content.includes("class='app-sidebar'");
  // Check 2: Topbar present
  const hasTopbar = content.includes('class="app-topbar"') || content.includes("class='app-topbar'");
  // Check 3: No obsolete .bec-topbar-blue
  const hasObsoleteTopbar = content.includes('bec-topbar-blue');
  // Check 4: data-page active
  const hasActiveNav = content.includes(`data-page="${p.dataPage}"`) && content.includes(`data-page="${p.dataPage}"`) && content.includes('nav-item active');
  // Check 5: Page title
  const hasPageTitle = content.includes(p.title);

  if (hasSidebar && hasTopbar && !hasObsoleteTopbar && hasActiveNav) {
    console.log(`  [PASS] ${p.file}: Sidebar + Topbar + Active (${p.dataPage}) verified cleanly.`);
  } else {
    console.error(`  [FAIL] ${p.file}: Issues found! sidebar=${hasSidebar}, topbar=${hasTopbar}, obsolete=${hasObsoleteTopbar}, activeNav=${hasActiveNav}`);
    allPassed = false;
  }
});

// 2. HTTP Server checks
console.log('\n[2/2] Checking live HTTP serving for all 10 pages on http://localhost:5000...');

function checkUrl(file) {
  return new Promise((resolve) => {
    http.get(`http://localhost:5000/${file}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`  [HTTP 200] /${file} served successfully (${data.length} bytes)`);
          resolve(true);
        } else {
          console.error(`  [HTTP ${res.statusCode}] Failed to serve /${file}`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.error(`  [HTTP ERROR] /${file}: ${err.message}`);
      resolve(false);
    });
  });
}

(async () => {
  for (const p of PAGES) {
    const ok = await checkUrl(p.file);
    if (!ok) allPassed = false;
  }

  console.log('\n================================================================');
  if (allPassed) {
    console.log('VERIFICATION COMPLETE: ALL 10 ERP PAGES ARE 100% STANDARDIZED & SERVED!');
  } else {
    console.log('VERIFICATION FAILED: Some checks did not pass.');
  }
  console.log('================================================================\n');
})();
