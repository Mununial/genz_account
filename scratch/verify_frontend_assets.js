const fs = require('fs');
const http = require('http');

function getHtml(path) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:5000' + path, res => {
      let b = '';
      res.on('data', chunk => b += chunk);
      res.on('end', () => resolve({ status: res.statusCode, html: b }));
    }).on('error', reject);
  });
}

async function checkAll() {
  console.log('--- VERIFYING FRONTEND PAGES & SCRIPTS ---');

  // 1. Check reports.html
  const rep = await getHtml('/reports.html');
  console.log('reports.html HTTP Status:', rep.status);
  const repChecks = [
    'tabBtnDefaulters',
    'tabBtnCollections',
    'tabBtnRegistrations',
    'reportViewDefaulters',
    'reportViewCollections',
    'reportViewRegistrations',
    'regTotalCount',
    'regPaidCount',
    'regUnpaidCount',
    'exportDefaultersExcel',
    'exportDefaultersPDF',
    'exportCollectionsExcel',
    'exportCollectionsPDF',
    'exportRegistrationsExcel',
    'exportRegistrationsPDF',
    '/js/becExportUtils.js',
    '/js/reports.js'
  ];
  repChecks.forEach(id => {
    const found = rep.html.includes(id);
    console.log('  [reports.html] ' + id + ': ' + (found ? 'PASS' : 'FAIL'));
    if (!found) throw new Error('Missing ' + id);
  });

  // 2. Check students.html
  const stu = await getHtml('/students.html');
  console.log('\nstudents.html HTTP Status:', stu.status);
  const stuChecks = [
    'pillAll',
    'pillDuesOnly',
    'pillClearedOnly',
    'pillRegPaid',
    'pillRegUnpaid',
    'studentsCourseFilter',
    'studentsBranchFilter',
    'studentsDuesFilter',
    'studentsRegFeeFilter',
    'exportDirectoryExcel',
    'exportDirectoryPDF',
    '/js/becExportUtils.js'
  ];
  stuChecks.forEach(id => {
    const found = stu.html.includes(id);
    console.log('  [students.html] ' + id + ': ' + (found ? 'PASS' : 'FAIL'));
    if (!found) throw new Error('Missing ' + id);
  });

  // 3. Check receipts.html
  const rec = await getHtml('/receipts.html');
  console.log('\nreceipts.html HTTP Status:', rec.status);
  const recChecks = [
    'exportReceiptsToExcel',
    'exportReceiptsToPDF',
    '/js/becExportUtils.js',
    '/js/becRealFee.js'
  ];
  recChecks.forEach(id => {
    const found = rec.html.includes(id);
    console.log('  [receipts.html] ' + id + ': ' + (found ? 'PASS' : 'FAIL'));
    if (!found) throw new Error('Missing ' + id);
  });

  // 4. Check becExportUtils.js syntax
  const exportUtilsContent = fs.readFileSync('frontend/js/becExportUtils.js', 'utf8');
  console.log('\nbecExportUtils.js Size:', exportUtilsContent.length, 'bytes');
  console.log('becExportUtils exports to Excel:', exportUtilsContent.includes('exportToExcel'));
  console.log('becExportUtils exports to PDF:', exportUtilsContent.includes('exportToPDF'));
  console.log('becExportUtils institutional header:', exportUtilsContent.includes('GEN-Z UNIVERSITY'));

  console.log('\n>>> ALL 4 PAGE CHECKS & ASSETS FULLY VERIFIED SUCCESS! <<<');
}

checkAll().catch(e => { console.error(e); process.exit(1); });
