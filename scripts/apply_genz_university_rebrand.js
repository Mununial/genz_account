/**
 * Script: apply_genz_university_rebrand.js
 * Comprehensive rebrand of the entire codebase and database to GEN-Z UNIVERSITY.
 */

const fs = require('fs');
const path = require('path');
require('../backend/node_modules/dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });
const db = require('../backend/config/db');

async function updateDatabase() {
  console.log('--- 1. UPDATING DATABASE BRANDING IN SYSTEM_SETTINGS ---');
  try {
    const settings = [
      { key: 'college_name', val: 'GEN-Z UNIVERSITY' },
      { key: 'college_code', val: 'GENZ' },
      { key: 'college_affiliation', val: 'Autonomous Private University & Approved by UGC / AICTE' },
      { key: 'college_email', val: 'accounts@genz.edu.in' },
      { key: 'college_address', val: 'Gen-Z Knowledge City Campus, Bhubaneswar, Odisha 752054' }
    ];

    for (const s of settings) {
      await db.query(
        `UPDATE system_settings SET setting_value = ?, updated_at = NOW() WHERE setting_key = ?`,
        [s.val, s.key]
      );
      console.log(`  ✓ Updated system_settings [${s.key}] = ${s.val}`);
    }

    // Verify
    const [rows] = await db.query(`SELECT setting_key, setting_value FROM system_settings WHERE setting_key LIKE 'college_%'`);
    console.table(rows);
  } catch (err) {
    console.error('Error updating system_settings:', err.message);
  }
}

function rebrandFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Exact & Case variations
  content = content.replace(/GEN-Z UNIVERSITY \(GENZ\)/g, 'GEN-Z UNIVERSITY (GZU)');
  content = content.replace(/Gen-Z University \(GENZ\)/g, 'Gen-Z University');
  content = content.replace(/Gen-Z University/g, 'Gen-Z University');
  content = content.replace(/GEN-Z UNIVERSITY/g, 'GEN-Z UNIVERSITY');
  content = content.replace(/gen-z university/g, 'gen-z university');

  content = content.replace(/Affiliated to BPUT, Odisha & Approved by AICTE, New Delhi/g, 'Autonomous Private University & Approved by UGC / AICTE');
  content = content.replace(/Affiliated to BPUT, Odisha & Approved by AICTE/g, 'Autonomous Private University & Approved by UGC / AICTE');
  content = content.replace(/Affiliated to BPUT, Odisha/g, 'Approved by UGC / AICTE');

  content = content.replace(/accounts@bec\.ac\.in/g, 'accounts@genz.edu.in');
  content = content.replace(/info@bec\.ac\.in/g, 'info@genz.edu.in');
  content = content.replace(/admin@bec\.ac\.in/g, 'admin@genz.edu.in');
  content = content.replace(/www\.becbbsr\.ac\.in/g, 'www.genz.edu.in');
  content = content.replace(/At-Paniora, NK Nagar, Pittapally, Bhubaneswar, Odisha 752054/g, 'Gen-Z Knowledge City Campus, Bhubaneswar, Odisha 752054');

  // Application titles
  content = content.replace(/GENZ Accounts & Finance Management System/g, 'Gen-Z University Accounts & Finance Management System');
  content = content.replace(/GENZ Accounts & Finance System/g, 'Gen-Z University Accounts & Finance System');
  content = content.replace(/GENZ Accounts System/g, 'Gen-Z University Accounts System');
  content = content.replace(/GENZ ERP Management System/g, 'Gen-Z University ERP Management System');
  content = content.replace(/GENZ ERP/g, 'Gen-Z ERP');
  content = content.replace(/GENZ Accounts/g, 'Gen-Z University Accounts');
  content = content.replace(/GENZ Branch/g, 'Gen-Z Main Campus');
  content = content.replace(/GENZ Crest/g, 'Gen-Z University Crest');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✓ Rebranded: ${path.relative(path.join(__dirname, '..'), filePath)}`);
  }
}

function processDirectory(dirPath, extensions = ['.html', '.js', '.css', '.bat', '.json', '.md']) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', '.system_generated', 'dist'].includes(entry.name)) continue;
      processDirectory(fullPath, extensions);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (extensions.includes(ext)) {
        rebrandFile(fullPath);
      }
    }
  }
}

async function main() {
  await updateDatabase();

  console.log('\n--- 2. UPDATING FRONTEND & BACKEND FILES ---');
  const rootDir = path.join(__dirname, '..');
  
  // Specific critical root files
  rebrandFile(path.join(rootDir, 'start.bat'));
  rebrandFile(path.join(rootDir, 'package.json'));
  rebrandFile(path.join(rootDir, 'backend', 'package.json'));
  rebrandFile(path.join(rootDir, 'backend', 'server.js'));
  rebrandFile(path.join(rootDir, 'backend', 'services', 'receiptService.js'));
  rebrandFile(path.join(rootDir, 'backend', 'utils', 'helpers.js'));
  rebrandFile(path.join(rootDir, 'backend', 'config', 'mockDb.js'));

  // Process all files in frontend and backend (excluding node_modules)
  processDirectory(path.join(rootDir, 'frontend'));
  processDirectory(path.join(rootDir, 'backend'));

  console.log('\n--- 3. VERIFYING RECEIPT SERVICE AND HELPERS ---');
  const receiptServicePath = path.join(rootDir, 'backend', 'services', 'receiptService.js');
  let rsContent = fs.readFileSync(receiptServicePath, 'utf8');
  rsContent = rsContent.replace(/institution: 'Gen-Z University'/g, "institution: 'GEN-Z UNIVERSITY'");
  rsContent = rsContent.replace(/affiliation: 'Affiliated to BPUT, Odisha & Approved by AICTE'/g, "affiliation: 'Autonomous Private University & Approved by UGC / AICTE'");
  rsContent = rsContent.replace(/address: 'At-Paniora, NK Nagar, Pittapally, Bhubaneswar, Odisha 752054'/g, "address: 'Gen-Z Knowledge City Campus, Bhubaneswar, Odisha 752054'");
  fs.writeFileSync(receiptServicePath, rsContent, 'utf8');

  // Helpers receipt prefix
  const helpersPath = path.join(rootDir, 'backend', 'utils', 'helpers.js');
  let hpContent = fs.readFileSync(helpersPath, 'utf8');
  hpContent = hpContent.replace(/GENZ-REC-/g, 'GZU-REC-');
  fs.writeFileSync(helpersPath, hpContent, 'utf8');

  // becExportUtils.js institution block & logo
  const exportUtilsPath = path.join(rootDir, 'frontend', 'js', 'becExportUtils.js');
  let euContent = fs.readFileSync(exportUtilsPath, 'utf8');
  euContent = euContent.replace(/name: 'GEN-Z UNIVERSITY \(GENZ\)'/g, "name: 'GEN-Z UNIVERSITY'");
  euContent = euContent.replace(/filename = 'BEC_Report'/g, "filename = 'GENZ_Report'");
  euContent = euContent.replace(/filename: 'BEC_Report'/g, "filename: 'GENZ_Report'");
  euContent = euContent.replace(/const docRef = `GENZ\/ACC\/REP/g, 'const docRef = `GENZ/ACC/REP');
  euContent = euContent.replace(
    /<div style="width: 52px; height: 52px; border-radius: 8px; background: #1E3A8A; color: white; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 900;">\s*🎓\s*<\/div>/g,
    '<img src="/assets/genz-logo.jpg" style="width: 56px; height: 56px; border-radius: 50%; object-fit: contain; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">'
  );
  fs.writeFileSync(exportUtilsPath, euContent, 'utf8');

  console.log('\n--- MASTER REBRANDING TO GEN-Z UNIVERSITY COMPLETED! ---');
  process.exit(0);
}

main().catch(err => {
  console.error('Rebranding failed:', err);
  process.exit(1);
});
