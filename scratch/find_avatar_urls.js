const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      if (['node_modules', '.git', 'dist', 'build'].includes(file)) continue;
      const full = path.join(dir, file);
      if (fs.statSync(full).isDirectory()) {
        results = results.concat(walk(full));
      } else if (file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.jsx')) {
        results.push(full);
      }
    }
  } catch(e) {}
  return results;
}

const files = [
  ...walk('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal'),
  ...walk('c:/Users/munun/OneDrive/Desktop/genz_account')
];
const found = new Set();
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.match(/https?:\/\/[^\s"'`]+/g) || [];
  for (const m of matches) {
    if (m.includes('avatar') || m.includes('random') || m.includes('pravatar') || m.includes('dicebear') || m.includes('unsplash') || m.includes('ui-avatars') || m.includes('robohash') || m.includes('picsum') || m.includes('placeholder')) {
      const rel = path.relative('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal', f);
      const key = rel + ' -> ' + m.split('?')[0];
      if (!found.has(key)) {
        found.add(key);
        console.log(key);
      }
    }
  }
}
