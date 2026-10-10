const { execFile } = require('child_process');
const fs = require('fs');

const browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const baseDir = 'C:\\Users\\munun\\.gemini\\antigravity-ide\\brain\\61812a7d-bfa3-43c8-b7c3-12ee6f90608b';

const desktopPath = `${baseDir}\\parent_approval_desktop.png`;
const mobilePath = `${baseDir}\\parent_approval_mobile.png`;

async function capture() {
  console.log('Capturing Parent Approval Desktop...');
  await new Promise(resolve => {
    execFile(browserPath, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--virtual-time-budget=3000',
      '--window-size=1400,1050',
      '--screenshot=' + desktopPath,
      'http://localhost:5002/parent-approval?id=4'
    ], () => resolve());
  });

  console.log('Capturing Parent Approval Mobile...');
  await new Promise(resolve => {
    execFile(browserPath, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--virtual-time-budget=3000',
      '--window-size=390,844',
      '--screenshot=' + mobilePath,
      'http://localhost:5002/parent-approval?id=4'
    ], () => resolve());
  });

  console.log('Desktop exists:', fs.existsSync(desktopPath), 'size:', fs.existsSync(desktopPath) ? fs.statSync(desktopPath).size : 0);
  console.log('Mobile exists:', fs.existsSync(mobilePath), 'size:', fs.existsSync(mobilePath) ? fs.statSync(mobilePath).size : 0);
}

capture().catch(console.error);
