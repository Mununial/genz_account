const { execFile } = require('child_process');
const fs = require('fs');

const browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const baseDir = 'C:\\Users\\munun\\.gemini\\antigravity-ide\\brain\\61812a7d-bfa3-43c8-b7c3-12ee6f90608b';
const doubtsPath = `${baseDir}\\classroom_doubts_desktop.png`;

async function capture() {
  console.log('Capturing Classroom Doubts Tab Desktop...');
  // We can inject JS or load the page and click doubts tab
  // Or in classroom.html we can support #doubts hash or default
  await new Promise(resolve => {
    execFile(browserPath, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--virtual-time-budget=3000',
      '--window-size=1400,1050',
      '--screenshot=' + doubtsPath,
      'http://localhost:5002/classroom#doubts'
    ], () => resolve());
  });

  console.log('Doubts Desktop exists:', fs.existsSync(doubtsPath), 'size:', fs.existsSync(doubtsPath) ? fs.statSync(doubtsPath).size : 0);
}

capture().catch(console.error);
