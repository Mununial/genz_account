const testCases = [
  { label: 'Super Admin by email', id: 'ayush.mallick@bec.ac.in', pwd: 'Ayushtech@26' },
  { label: 'Super Admin by name shortcut', id: 'ayush', pwd: 'Ayushtech@26' },
  { label: 'Accountant by email', id: 'harihara.parida@bec.ac.in', pwd: 'Bec@Harihara2026!' },
  { label: 'Accountant by shortcut', id: 'harihara', pwd: 'Bec@Harihara2026!' },
  { label: 'Director by email', id: 'bn.biswal@bec.ac.in', pwd: 'Bec@Biswal2026!' },
  { label: 'Director by phone', id: '9861142627', pwd: 'Bec@Biswal2026!' },
  { label: 'Examiner by email', id: 'manoj.pati@bec.ac.in', pwd: 'Bec@Manoj2026!' },
  { label: 'Examiner by shortcut', id: 'manoj', pwd: 'Bec@Manoj2026!' },
  { label: 'HOD CSE Anita by name', id: 'anita', pwd: 'Bec@Anita2026!' },
  { label: 'HOD CSE Anita by phone', id: '7008407876', pwd: 'Bec@Anita2026!' },
  { label: 'HOD Agri Ananyaa by name', id: 'ananyaa', pwd: 'Bec@Ananyaa2026!' },
  { label: 'HOD Agri Ananyaa by phone', id: '7978282332', pwd: 'Bec@Ananyaa2026!' },
  { label: 'HOD Mech Dr. Bishnu by name', id: 'bishnu', pwd: 'Bec@Bishnu2026!' },
  { label: 'HOD Mech Dr. Bishnu by phone', id: '9438009384', pwd: 'Bec@Bishnu2026!' },
  { label: 'HOD EEE Dr. Binaya by name', id: 'binaya', pwd: 'Bec@Binaya2026!' },
  { label: 'HOD EEE Dr. Binaya by phone', id: '7789948853', pwd: 'Bec@Binaya2026!' },
  { label: 'HOD Aero Dr. Sangram by name', id: 'sangram', pwd: 'Bec@Sangram2026!' },
  { label: 'HOD Aero Dr. Sangram by phone', id: '7008323684', pwd: 'Bec@Sangram2026!' },
  { label: 'HOD MBA Ashis by name', id: 'ashis', pwd: 'Bec@Ashis2026!' },
  { label: 'HOD MBA Ashis by phone', id: '9040514865', pwd: 'Bec@Ashis2026!' }
];

(async () => {
  let passed = 0;
  for (const tc of testCases) {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: tc.id, password: tc.pwd })
      });
      const data = await res.json();
      if (data.success) {
        passed++;
        const staffName = data.data.user.staff ? data.data.user.staff.full_name : data.data.user.email;
        console.log(`[PASS] ${tc.label.padEnd(30)} -> Role: ${data.data.user.role.padEnd(14)} | Name: ${staffName}`);
      } else {
        console.log(`[FAIL] ${tc.label.padEnd(30)} -> ${data.message}`);
      }
    } catch (e) {
      console.log(`[ERR]  ${tc.label.padEnd(30)} -> ${e.message}`);
    }
  }
  console.log(`\n========================================`);
  console.log(`TOTAL PASSED: ${passed} / ${testCases.length}`);
  console.log(`========================================`);
  process.exit(passed === testCases.length ? 0 : 1);
})();
