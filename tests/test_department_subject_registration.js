const http = require('http');

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
  if (!res.data || !res.data.data?.token) {
    throw new Error(`Login failed for ${username}: ${JSON.stringify(res.data)}`);
  }
  return res.data.data.token;
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 TESTING DEPARTMENT-WISE SUBJECT REGISTRATION SYSTEM');
  console.log('====================================================\n');

  try {
    // 0. Reset previous test registrations for clean repeatable run
    console.log('Step 0: Resetting Previous Test Registrations...');
    const adminTokenPre = await login('admin', '123456');
    await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/registration/admin/registrations/reset',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminTokenPre}` }
    });
    console.log('✓ Clean test environment initialized.\n');

    // 1. Metadata check
    console.log('Step 1: Checking Programs & Departments Metadata...');
    const metaRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/registration/metadata',
      method: 'GET'
    });
    console.log(`Programs count: ${metaRes.data?.data?.programs?.length || 0}`);
    console.log(`Departments count: ${metaRes.data?.data?.departments?.length || 0}`);
    if (!metaRes.data?.data?.programs?.length || !metaRes.data?.data?.departments?.length) {
      throw new Error('Metadata missing programs or departments');
    }
    console.log('✓ Metadata endpoint verified.\n');

    // 2. Student login (Tushar Mhato - 2644)
    console.log('Step 2: Student Login & Eligibility...');
    const studentToken = await login('2644', '123456');
    console.log('✓ Student logged in successfully.');

    const eligRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/registration/eligibility',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const stuData = eligRes.data?.data;
    console.log(`Student: ${stuData?.fullName} | Roll: ${stuData?.rollNumber} | Dept: ${stuData?.department?.name} (${stuData?.department?.code}) | Sem: ${stuData?.semester}`);
    console.log(`Fee paid: ₹${stuData?.eligibility?.totalPaid} / ₹${stuData?.eligibility?.totalAnnualFee} (${stuData?.eligibility?.feePaidPercent}%)`);
    console.log(`Eligible for registration: ${stuData?.eligibility?.eligible}`);
    if (!stuData?.department?.id) {
      throw new Error('Eligibility failed to resolve student department');
    }

    // 3. Subjects list
    console.log('\nStep 3: Fetching Subjects for Student...');
    const subRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/registration/subjects?department_id=${stuData.department.id}&semester=${stuData.semester}&program_id=${stuData.program.id}`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const subjects = subRes.data?.data?.subjects || [];
    console.log(`Found ${subjects.length} subjects for ${stuData.department.code} Semester ${stuData.semester}:`);
    subjects.forEach(s => console.log(`   - [${s.code}] ${s.name} (${s.credits} Credits, ${s.type})`));
    if (subjects.length === 0) {
      throw new Error('No subjects found for student department and semester');
    }
    const totalCredits = subjects.reduce((sum, s) => sum + (s.credits || 0), 0);
    console.log(`Total credits for selected subjects: ${totalCredits} (Allowed range: 20-28)`);
    if (totalCredits < 20 || totalCredits > 28) {
      throw new Error(`Total credits ${totalCredits} outside required 20-28 credit boundary`);
    }

    // 4. Submit Registration
    console.log('\nStep 4: Submitting Subject Registration...');
    const subIds = subjects.map(s => s.id);
    const submitRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/registration/submit',
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json'
      }
    }, {
      subjectIds: subIds,
      registrationType: 'REGULAR'
    });

    console.log('Submit response:', submitRes.data);
    const regId = submitRes.data?.data?.registrationId;
    const refNo = submitRes.data?.data?.referenceNumber;
    console.log(`✓ Registration Submitted! ID: ${regId}, Reference Number: ${refNo}`);
    if (!refNo || !refNo.startsWith('REG-2026-')) {
      throw new Error(`Invalid reference number format: ${refNo}`);
    }

    // 5. Department HOD Review & Isolation Test
    console.log('\nStep 5: Testing Department HOD Queue & Scoped Isolation...');
    
    // Test isolation: HOD CSE should NOT see MECH student's registration
    const cseHodToken = await login('hod.cse', '123456');
    const cseListRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/registration/hod/registrations',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${cseHodToken}` }
    });
    const cseRegs = cseListRes.data?.data?.registrations || [];
    const foundInCse = cseRegs.some(r => r.id === regId || r.reference_number === refNo);
    console.log(`Isolation verification: Found registration ${refNo} in HOD CSE queue? ${foundInCse ? 'FAIL (Leak)' : 'PASS (Isolated)'}`);
    if (foundInCse) throw new Error('Security/Isolation violation: HOD CSE can see another department registration!');

    // Login as MECH HOD (responsible for MECH student)
    const mechHodToken = await login('hod.mech', '123456');
    console.log('✓ HOD MECH logged in.');
    const mechListRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/registration/hod/registrations',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${mechHodToken}` }
    });
    const mechRegs = mechListRes.data?.data?.registrations || [];
    console.log(`HOD MECH queue registrations count: ${mechRegs.length}`);
    console.log('HOD MECH stats:', mechListRes.data?.data?.stats);
    const targetReg = mechRegs.find(r => r.id === regId || r.reference_number === refNo);
    if (!targetReg) {
      throw new Error(`Registration ${refNo} not found in HOD MECH queue!`);
    }
    console.log(`✓ Registration ${refNo} correctly placed in HOD MECH queue.`);

    // HOD Forwards to Director
    console.log('\nHOD Endorsing & Forwarding to Director...');
    const hodFwdRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/registration/hod/${regId}/forward`,
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${mechHodToken}`,
        'Content-Type': 'application/json'
      }
    }, {
      remarks: 'Verified student academic standing and fee clearance. Endorsed for Director approval.'
    });
    console.log('HOD Forward response:', hodFwdRes.data?.message);
    if (!hodFwdRes.data?.success) throw new Error('HOD Forward failed');

    // 6. Director Review & Approval (Global View)
    console.log('\nStep 6: Director Review & Clearance (All Departments View)...');
    const dirToken = await login('director', '123456');
    console.log('✓ Director logged in.');

    const dirListRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/registration/director/registrations',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${dirToken}` }
    });
    console.log(`Director global queue count: ${dirListRes.data?.data?.registrations?.length || 0}`);
    console.log('Director stats summary by status:', dirListRes.data?.data?.statsDashboard?.byStatus);
    console.log('Director stats by department count:', Object.keys(dirListRes.data?.data?.statsDashboard?.byDepartment || {}).length);

    const dirApproveRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/registration/director/${regId}/approve`,
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${dirToken}`,
        'Content-Type': 'application/json'
      }
    }, {
      remarks: 'Approved under BPUT regulations. Cleared for Accounts fee audit and final confirmation.'
    });
    console.log('Director Approve response:', dirApproveRes.data?.message);
    if (!dirApproveRes.data?.success) throw new Error('Director Approval failed');

    // 7. Student Pays BPUT Exam Fee (₹1,550)
    console.log('\nStep 7: Student Pays BPUT Examination Fee (₹1,550)...');
    const payFeeRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/registration/${regId}/pay-exam-fee`,
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json'
      }
    }, {
      paymentMethod: 'ONLINE_UPI',
      amount: 1550
    });
    console.log('Exam fee payment response:', payFeeRes.data?.message);
    if (!payFeeRes.data?.success) throw new Error('Student Exam Fee payment failed');
    console.log(`✓ Exam Fee Paid! Receipt: ${payFeeRes.data?.data?.receiptNumber}, Amount: ₹${payFeeRes.data?.data?.amount}`);

    // 8. Examination Section Review & Mark Received / Completed
    console.log('\nStep 8: College Examination Section Review & Mark Received / Completed...');
    const examToken = await login('exam.section', '123456');
    console.log('✓ Examination Section officer logged in.');

    const examListRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/registration/exam-section/registrations',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${examToken}` }
    });
    const examQueue = examListRes.data?.data?.registrations || [];
    console.log(`Exam Section queue count: ${examQueue.length}`);
    console.log('Exam Section stats:', examListRes.data?.data?.stats);
    
    const targetExamReg = examQueue.find(r => r.id === regId || r.reference_number === refNo);
    if (!targetExamReg) {
      throw new Error(`Registration ${refNo} not found in Examination Section queue!`);
    }
    console.log(`✓ Registration ${refNo} found in Exam Section with fee status: ${targetExamReg.exam_fee_status}`);

    const examMarkReceivedRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/registration/exam-section/${regId}/mark-received`,
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${examToken}`,
        'Content-Type': 'application/json'
      }
    }, {
      remarks: 'Application and BPUT Exam Fee received. Verified and confirmed for university records.'
    });
    console.log('Exam Section Mark Received response:', examMarkReceivedRes.data?.message);
    if (!examMarkReceivedRes.data?.success) throw new Error('Exam Section Mark Received failed');

    // 9. Re-check student portal status
    console.log('\nStep 9: Verifying Final Confirmation on Student Portal...');
    const finalEligRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/registration/eligibility',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const activeReg = finalEligRes.data?.data?.existingRegistration;
    console.log(`Final Registration Status for student: ${activeReg?.status} | Ref: ${activeReg?.reference_number}`);
    console.log(`Exam Fee Status: ${activeReg?.exam_fee_status} | Receipt: ${activeReg?.exam_receipt_no}`);
    if (activeReg?.status !== 'CONFIRMED') {
      throw new Error(`Expected CONFIRMED status, got ${activeReg?.status}`);
    }

    // 10. Admin CSV Bulk Subject Import
    console.log('\nStep 10: Testing Admin CSV Bulk Subject Import...');
    const adminToken = await login('admin', '123456');
    console.log('✓ Admin logged in.');

    const sampleCsv = `code,name,program_code,department_code,semester,credits,type,sequence
CS801,Advanced Cloud Computing,BTECH,CSE,8,4,CORE,1
CS802,Deep Learning Lab,BTECH,CSE,8,2,LAB,2`;

    const bulkRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/registration/admin/subjects/bulk',
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    }, {
      csvData: sampleCsv
    });
    console.log('Bulk import result:', bulkRes.data);
    if (!bulkRes.data?.success || bulkRes.data?.data?.imported !== 2) {
      throw new Error('Bulk subject import failed');
    }

    console.log('\n====================================================');
    console.log('🎉 ALL 10 END-TO-END WORKFLOW TESTS PASSED PERFECTLY!');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ TEST FAILED:', err);
    process.exit(1);
  }
}

runTests();
