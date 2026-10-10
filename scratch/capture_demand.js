const { execFile } = require('child_process');
const fs = require('fs');

const browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDesktop = 'C:\\Users\\munun\\.gemini\\antigravity-ide\\brain\\61812a7d-bfa3-43c8-b7c3-12ee6f90608b\\demand_desktop.png';
const outMobile = 'C:\\Users\\munun\\.gemini\\antigravity-ide\\brain\\61812a7d-bfa3-43c8-b7c3-12ee6f90608b\\demand_mobile.png';

async function capture() {
  console.log('Capturing Hostel Demand Desktop...');
  await new Promise(resolve => {
    execFile(browserPath, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--virtual-time-budget=3000',
      '--window-size=1400,1050',
      '--screenshot=' + outDesktop,
      'http://localhost:5002/admin/hostel-demand'
    ], () => resolve());
  });

  console.log('Capturing Hostel Demand Mobile...');
  await new Promise(resolve => {
    execFile(browserPath, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--virtual-time-budget=3000',
      '--window-size=390,844',
      '--screenshot=' + outMobile,
      'http://localhost:5002/admin/hostel-demand'
    ], () => resolve());
  });

  console.log('Desktop exists:', fs.existsSync(outDesktop), 'size:', fs.existsSync(outDesktop) ? fs.statSync(outDesktop).size : 0);
  console.log('Mobile exists:', fs.existsSync(outMobile), 'size:', fs.existsSync(outMobile) ? fs.statSync(outMobile).size : 0);
}

capture().catch(console.error);
