const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      if (['node_modules', '.git', 'dist', 'build', 'artifacts'].includes(file)) continue;
      const full = path.join(dir, file);
      if (fs.statSync(full).isDirectory()) {
        results = results.concat(walk(full));
      } else {
        results.push(full);
      }
    }
  } catch(e) {}
  return results;
}

const allDirs = [
  'c:/Users/munun/OneDrive/Desktop/genz_account',
  'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP'
];

for (const dir of allDirs) {
  const files = walk(dir);
  for (const f of files) {
    if (f.endsWith('.js')) {
      try {
        const content = fs.readFileSync(f, 'utf8');
        if (content.includes("require('nodemailer')") || content.includes('require("nodemailer")')) {
          console.log(path.relative('c:/Users/munun', f));
        }
      } catch(e) {}
    }
  }
}
