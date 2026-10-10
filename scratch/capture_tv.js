const { execFile } = require('child_process');
const fs = require('fs');

const browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const baseDir = 'C:\\Users\\munun\\.gemini\\antigravity-ide\\brain\\61812a7d-bfa3-43c8-b7c3-12ee6f90608b';

const tvDisplayPath = `${baseDir}\\smart_tv_signage_1080p.png`;
const mobileDisplayPath = `${baseDir}\\smart_tv_signage_mobile.png`;

async function capture() {
  console.log('Capturing Smart TV 1080p Full Display...');
  await new Promise(resolve => {
    execFile(browserPath, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--virtual-time-budget=3500',
      '--window-size=1920,1080',
      '--screenshot=' + tvDisplayPath,
      'http://localhost:5002/tv'
    ], () => resolve());
  });

  console.log('Capturing Smart TV Mobile Preview...');
  await new Promise(resolve => {
    execFile(browserPath, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--virtual-time-budget=3500',
      '--window-size=390,844',
      '--screenshot=' + mobileDisplayPath,
      'http://localhost:5002/tv'
    ], () => resolve());
  });

  console.log('TV exists:', fs.existsSync(tvDisplayPath), 'size:', fs.existsSync(tvDisplayPath) ? fs.statSync(tvDisplayPath).size : 0);
  console.log('Mobile exists:', fs.existsSync(mobileDisplayPath), 'size:', fs.existsSync(mobileDisplayPath) ? fs.statSync(mobileDisplayPath).size : 0);
}

capture().catch(console.error);
