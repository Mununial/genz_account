const { execFile } = require('child_process');
const fs = require('fs');

const browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const baseDir = 'C:\\Users\\munun\\.gemini\\antigravity-ide\\brain\\61812a7d-bfa3-43c8-b7c3-12ee6f90608b';

const targets = [
  { url: 'http://localhost:5002/security', name: 'security' },
  { url: 'http://localhost:5002/staff', name: 'staff' },
  { url: 'http://localhost:5002/parent', name: 'parent' }
];

async function captureAll() {
  for (const t of targets) {
    const desktopPath = `${baseDir}\\${t.name}_desktop.png`;
    const mobilePath = `${baseDir}\\${t.name}_mobile.png`;

    console.log(`Capturing ${t.name} Desktop...`);
    await new Promise(resolve => {
      execFile(browserPath, [
        '--headless=new',
        '--disable-gpu',
        '--hide-scrollbars',
        '--virtual-time-budget=3000',
        '--window-size=1400,1050',
        '--screenshot=' + desktopPath,
        t.url
      ], () => resolve());
    });

    console.log(`Capturing ${t.name} Mobile...`);
    await new Promise(resolve => {
      execFile(browserPath, [
        '--headless=new',
        '--disable-gpu',
        '--hide-scrollbars',
        '--virtual-time-budget=3000',
        '--window-size=390,844',
        '--screenshot=' + mobilePath,
        t.url
      ], () => resolve());
    });

    console.log(`${t.name} Desktop exists:`, fs.existsSync(desktopPath), 'size:', fs.existsSync(desktopPath) ? fs.statSync(desktopPath).size : 0);
    console.log(`${t.name} Mobile exists:`, fs.existsSync(mobilePath), 'size:', fs.existsSync(mobilePath) ? fs.statSync(mobilePath).size : 0);
  }
}

captureAll().catch(console.error);
