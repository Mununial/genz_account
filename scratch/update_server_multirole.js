const fs = require('fs');
const serverPath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/server.js';
let s = fs.readFileSync(serverPath, 'utf8');

// 1. Add route import if not present
if (!s.includes('gatewayMultiRole')) {
  const importTarget = "const gatewayPollsRoutes = require('./routes/gatewayPolls');";
  const importAddition = `const gatewayPollsRoutes = require('./routes/gatewayPolls');\nconst gatewayMultiRoleRoutes = require('./routes/gatewayMultiRole');`;
  s = s.replace(importTarget, importAddition);
}

// 2. Add API mount if not present
if (!s.includes("app.use('/api/roles'")) {
  const mountTarget = "app.use('/api/polls', gatewayPollsRoutes);";
  const mountAddition = `app.use('/api/polls', gatewayPollsRoutes);\napp.use('/api/roles', gatewayMultiRoleRoutes);`;
  s = s.replace(mountTarget, mountAddition);
}

// 3. Add Page Routes if not present
if (!s.includes("'/security'")) {
  const pageTarget = "app.get(['/admin/polls', '/polls', '/polls.html'], (req, res) => res.sendFile(path.join(publicDir, 'admin-polls.html')));";
  const pageAddition = `app.get(['/admin/polls', '/polls', '/polls.html'], (req, res) => res.sendFile(path.join(publicDir, 'admin-polls.html')));
app.get(['/security', '/security-dashboard', '/security.html'], (req, res) => res.sendFile(path.join(publicDir, 'security-dashboard.html')));
app.get(['/staff', '/staff-dashboard', '/staff.html', '/faculty'], (req, res) => res.sendFile(path.join(publicDir, 'staff-dashboard.html')));
app.get(['/parent', '/parent-portal', '/parent.html', '/parents'], (req, res) => res.sendFile(path.join(publicDir, 'parent-portal.html')));`;
  s = s.replace(pageTarget, pageAddition);
}

fs.writeFileSync(serverPath, s, 'utf8');
console.log('server.js updated successfully with Multi-Role routes!');
