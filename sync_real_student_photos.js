/**
 * Migration & Sync Script: Populate Real Student Photos and Documents from original Excel data
 * Source: BEC_Complete_Student_Report_2026-09-24.xlsx
 * Includes retry logic for resilient remote MySQL connectivity.
 */

const path = require('path');
const xlsx = require('./backend/node_modules/xlsx');
const db = require('./backend/config/db');

async function executeWithRetry(fn, retries = 5, delayMs = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`[Retry ${attempt}/${retries}] Query error: ${err.message}. Retrying in ${delayMs}ms...`);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}

async function syncRealStudentData() {
  console.log('--- RESUMING REAL STUDENT PHOTO & DOCUMENT SYNC ---');

  // Read original student report
  const excelPath = path.join(__dirname, 'BEC_Complete_Student_Report_2026-09-24.xlsx');
  const wb = xlsx.readFile(excelPath);
  const sheetName = wb.SheetNames[0];
  const rows = xlsx.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });

  function normalize(str) {
    return String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  const excelMapByName = new Map();
  const excelMapByEmail = new Map();

  for (const row of rows) {
    const rawName = String(row['Student Full Name'] || '').trim();
    if (!rawName || rawName === 'N/A') continue;

    const normName = normalize(rawName);
    const email = normalize(row['Student Email']);

    const dataObj = {
      fullName: rawName,
      photoUrl: row['Student Photo URL'] && row['Student Photo URL'] !== 'N/A' && String(row['Student Photo URL']).startsWith('http') ? String(row['Student Photo URL']).trim() : null,
      signatureUrl: row['Student Signature URL'] && row['Student Signature URL'] !== 'N/A' && String(row['Student Signature URL']).startsWith('http') ? String(row['Student Signature URL']).trim() : null,
      marksheet10thUrl: row['10th Marksheet URL'] && row['10th Marksheet URL'] !== 'N/A' && String(row['10th Marksheet URL']).startsWith('http') ? String(row['10th Marksheet URL']).trim() : null,
      certificate12thUrl: row['12th / Diploma Certificate URL'] && row['12th / Diploma Certificate URL'] !== 'N/A' && String(row['12th / Diploma Certificate URL']).startsWith('http') ? String(row['12th / Diploma Certificate URL']).trim() : null,
      rankCardUrl: row['JEE / Rank Card URL'] && row['JEE / Rank Card URL'] !== 'N/A' && String(row['JEE / Rank Card URL']).startsWith('http') ? String(row['JEE / Rank Card URL']).trim() : null,
      allotmentLetterUrl: row['College Allotment Letter URL'] && row['College Allotment Letter URL'] !== 'N/A' && String(row['College Allotment Letter URL']).startsWith('http') ? String(row['College Allotment Letter URL']).trim() : null,
      aadhaarDocUrl: row['Aadhaar Card Document URL'] && row['Aadhaar Card Document URL'] !== 'N/A' && String(row['Aadhaar Card Document URL']).startsWith('http') ? String(row['Aadhaar Card Document URL']).trim() : null,
      tcClcUrl: row['TC / CLC Certificate URL'] && row['TC / CLC Certificate URL'] !== 'N/A' && String(row['TC / CLC Certificate URL']).startsWith('http') ? String(row['TC / CLC Certificate URL']).trim() : null,
      conductUrl: row['Conduct Certificate URL'] && row['Conduct Certificate URL'] !== 'N/A' && String(row['Conduct Certificate URL']).startsWith('http') ? String(row['Conduct Certificate URL']).trim() : null,
      migrationUrl: row['Migration Certificate URL'] && row['Migration Certificate URL'] !== 'N/A' && String(row['Migration Certificate URL']).startsWith('http') ? String(row['Migration Certificate URL']).trim() : null,
      casteCertUrl: row['Caste Certificate URL'] && row['Caste Certificate URL'] !== 'N/A' && String(row['Caste Certificate URL']).startsWith('http') ? String(row['Caste Certificate URL']).trim() : null,
      residenceCertUrl: row['Residence Certificate URL'] && row['Residence Certificate URL'] !== 'N/A' && String(row['Residence Certificate URL']).startsWith('http') ? String(row['Residence Certificate URL']).trim() : null,
      feeReceiptUrl: row['Fee Receipt URL'] && row['Fee Receipt URL'] !== 'N/A' && String(row['Fee Receipt URL']).startsWith('http') ? String(row['Fee Receipt URL']).trim() : null,
      parentSignatureUrl: row['Parent Signature URL'] && row['Parent Signature URL'] !== 'N/A' && String(row['Parent Signature URL']).startsWith('http') ? String(row['Parent Signature URL']).trim() : null
    };

    if (normName) excelMapByName.set(normName, dataObj);
    if (email) excelMapByEmail.set(email, dataObj);
  }

  // Find students that still don't have photo_url
  const [pendingStudents] = await executeWithRetry(() => db.query(`
    SELECT s.id, s.reg_no, s.roll_no, s.full_name, u.email
    FROM students s
    JOIN users u ON s.user_id = u.id
    WHERE s.photo_url IS NULL OR s.signature_url IS NULL
  `));

  console.log(`Pending students to sync: ${pendingStudents.length}`);

  let updatedCount = 0;
  for (const st of pendingStudents) {
    const normName = normalize(st.full_name);
    const normEmail = normalize(st.email);

    const match = excelMapByName.get(normName) || excelMapByEmail.get(normEmail);

    if (match) {
      const updates = [];
      const values = [];

      if (match.photoUrl) {
        updates.push('photo_url = ?');
        values.push(match.photoUrl);
      }
      if (match.signatureUrl) {
        updates.push('signature_url = ?');
        values.push(match.signatureUrl);
      }
      if (match.marksheet10thUrl) {
        updates.push('marksheet_10th_url = ?');
        values.push(match.marksheet10thUrl);
      }
      if (match.certificate12thUrl) {
        updates.push('certificate_12th_url = ?');
        values.push(match.certificate12thUrl);
      }
      if (match.rankCardUrl) {
        updates.push('rank_card_url = ?');
        values.push(match.rankCardUrl);
      }
      if (match.allotmentLetterUrl) {
        updates.push('allotment_letter_url = ?');
        values.push(match.allotmentLetterUrl);
      }
      if (match.aadhaarDocUrl) {
        updates.push('aadhaar_doc_url = ?');
        values.push(match.aadhaarDocUrl);
      }
      if (match.tcClcUrl) {
        updates.push('tc_clc_url = ?');
        values.push(match.tcClcUrl);
      }
      if (match.conductUrl) {
        updates.push('conduct_url = ?');
        values.push(match.conductUrl);
      }
      if (match.migrationUrl) {
        updates.push('migration_url = ?');
        values.push(match.migrationUrl);
      }
      if (match.casteCertUrl) {
        updates.push('caste_cert_url = ?');
        values.push(match.casteCertUrl);
      }
      if (match.residenceCertUrl) {
        updates.push('residence_cert_url = ?');
        values.push(match.residenceCertUrl);
      }
      if (match.feeReceiptUrl) {
        updates.push('fee_receipt_url = ?');
        values.push(match.feeReceiptUrl);
      }
      if (match.parentSignatureUrl) {
        updates.push('parent_signature_url = ?');
        values.push(match.parentSignatureUrl);
      }

      if (updates.length > 0) {
        values.push(st.id);
        await executeWithRetry(() => db.query(`UPDATE students SET ${updates.join(', ')} WHERE id = ?`, values));
        updatedCount++;
      }
    }
  }

  console.log(`Updated ${updatedCount} remaining students successfully.`);

  const [finalCheck] = await executeWithRetry(() => db.query(`
    SELECT count(*) as total, count(photo_url) as with_photo, count(signature_url) as with_sig
    FROM students
  `));
  console.log('\nFINAL DATABASE STATUS:', finalCheck[0]);

  process.exit(0);
}

syncRealStudentData().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
