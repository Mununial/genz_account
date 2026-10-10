const fs = require('fs');

const p = 'C:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/server.js';
let content = fs.readFileSync(p, 'utf8');

// Replace publicDir static serving
const oldStatic = 'app.use(express.static(publicDir));';
const newStatic = `app.use(express.static(publicDir, {
  etag: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));`;

if (content.includes(oldStatic)) {
  content = content.replace(oldStatic, newStatic);
  console.log('Updated publicDir static serving with strict no-cache');
}

// Replace bus static serving
const oldBus = "app.use('/bus', express.static(busDist, { maxAge: '1h' }));";
const newBus = `app.use('/bus', express.static(busDist, {
  etag: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));`;

if (content.includes(oldBus)) {
  content = content.replace(oldBus, newBus);
  console.log('Updated bus static serving with strict no-cache');
}

fs.writeFileSync(p, content, 'utf8');
console.log('server.js updated successfully.');
