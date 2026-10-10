const fs = require('fs');

const basePath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal';

// 1. Update server.js
const serverJsPath = `${basePath}/server.js`;
if (fs.existsSync(serverJsPath)) {
  let s = fs.readFileSync(serverJsPath, 'utf8');

  const oldRoutes = `app.get(['/bus', '/transit', '/student-bus', '/student-bus-tracking'], (req, res) => res.redirect('http://localhost:5000/#student'));
app.get(['/admin/bus', '/admin/transit', '/admin-bus', '/admin-bus-management'], (req, res) => res.redirect('http://localhost:5000/#admin'));`;

  const newRoutes = `const busDist = path.join(publicDir, 'bus');
app.use('/bus', express.static(busDist, { maxAge: '1h' }));
app.get(['/bus', '/bus/*', '/transit', '/student-bus', '/student-bus-tracking'], (req, res) => {
  res.sendFile(path.join(busDist, 'index.html'));
});
app.get(['/admin/bus', '/admin/transit', '/admin-bus', '/admin-bus-management'], (req, res) => {
  res.redirect('/bus/#admin');
});`;

  if (s.includes(oldRoutes)) {
    s = s.replace(oldRoutes, newRoutes);
    fs.writeFileSync(serverJsPath, s, 'utf8');
    console.log('✅ Updated server.js routes for /bus');
  } else {
    console.log('⚠️ Could not find exact oldRoutes in server.js, attempting regex replacement...');
    s = s.replace(
      /app\.get\(\['\/bus'[\s\S]*?res\.redirect\('http:\/\/localhost:5000\/#admin'\)\);/,
      newRoutes
    );
    fs.writeFileSync(serverJsPath, s, 'utf8');
    console.log('✅ Regex replaced in server.js');
  }
}

// 2. Update student-portal.html
const spPath = `${basePath}/public/student-portal.html`;
if (fs.existsSync(spPath)) {
  let sp = fs.readFileSync(spPath, 'utf8');
  sp = sp.replaceAll('http://localhost:5000/#student', '/bus/#student');
  sp = sp.replaceAll('http://localhost:5000/#admin', '/bus/#admin');
  fs.writeFileSync(spPath, sp, 'utf8');
  console.log('✅ Updated student-portal.html bus links to /bus/#student');
}

// 3. Update admin-command-center.html
const accPath = `${basePath}/public/admin-command-center.html`;
if (fs.existsSync(accPath)) {
  let acc = fs.readFileSync(accPath, 'utf8');
  acc = acc.replaceAll('http://localhost:5000/#admin', '/bus/#admin');
  acc = acc.replaceAll('http://localhost:5000/#student', '/bus/#student');
  fs.writeFileSync(accPath, acc, 'utf8');
  console.log('✅ Updated admin-command-center.html bus links to /bus/#admin');
}

// 4. Update admin.html
const adminPath = `${basePath}/public/admin.html`;
if (fs.existsSync(adminPath)) {
  let adm = fs.readFileSync(adminPath, 'utf8');
  adm = adm.replaceAll('http://localhost:5000/#admin', '/bus/#admin');
  adm = adm.replaceAll('http://localhost:5000/#student', '/bus/#student');
  fs.writeFileSync(adminPath, adm, 'utf8');
  console.log('✅ Updated admin.html bus links to /bus/#admin');
}

console.log('All bus links updated successfully.');
