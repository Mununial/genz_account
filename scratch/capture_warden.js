const { execFile } = require('child_process');
const fs = require('fs');

const browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDesktop = 'C:\\Users\\munun\\.gemini\\antigravity-ide\\brain\\61812a7d-bfa3-43c8-b7c3-12ee6f90608b\\warden_desktop.png';
const outMobile = 'C:\\Users\\munun\\.gemini\\antigravity-ide\\brain\\61812a7d-bfa3-43c8-b7c3-12ee6f90608b\\warden_mobile.png';

async function capture() {
  console.log('Capturing Desktop with virtual-time-budget...');
  await new Promise(resolve => {
    execFile(browserPath, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--virtual-time-budget=3000',
      '--window-size=1400,950',
      '--screenshot=' + outDesktop,
      'http://localhost:5002/warden'
    ], () => resolve());
  });

  console.log('Capturing Mobile with virtual-time-budget...');
  await new Promise(resolve => {
    execFile(browserPath, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--virtual-time-budget=3000',
      '--window-size=390,844',
      '--screenshot=' + outMobile,
      'http://localhost:5002/warden'
    ], () => resolve());
  });

  console.log('Done captures!');
}

capture().catch(console.error);
