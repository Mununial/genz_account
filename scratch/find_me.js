const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      if (['node_modules', '.git', 'dist', 'build', 'assets'].includes(file)) continue;
      const full = path.join(dir, file);
      if (fs.statSync(full).isDirectory()) {
        results = results.concat(walk(full));
      } else if (file.endsWith('.js')) {
        results.push(full);
      }
    }
  } catch(e) {}
  return results;
}

const allDirs = [
  'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal',
  'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management'
];

for (const dir of allDirs) {
  const files = walk(dir);
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    if (content.includes('/me') || content.includes('auth/me')) {
      content.split('\n').forEach((l, i) => {
        if (l.includes("'/me'") || l.includes('"/me"') || l.includes("'/auth/me'") || l.includes('"/auth/me"')) {
          console.log(path.relative('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP', f) + ':' + (i+1) + ' -> ' + l.trim());
        }
      });
    }
  }
}
