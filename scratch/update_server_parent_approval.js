const fs = require('fs');
const serverPath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/server.js';
let s = fs.readFileSync(serverPath, 'utf8');

// 1. Add route import if not present
if (!s.includes('gatewayParentApproval')) {
  const importTarget = "const gatewayMultiRoleRoutes = require('./routes/gatewayMultiRole');";
  const importAddition = `const gatewayMultiRoleRoutes = require('./routes/gatewayMultiRole');\nconst gatewayParentApprovalRoutes = require('./routes/gatewayParentApproval');`;
  s = s.replace(importTarget, importAddition);
}

// 2. Add API mount if not present
if (!s.includes("app.use('/api/parent-approval'")) {
  const mountTarget = "app.use('/api/roles', gatewayMultiRoleRoutes);";
  const mountAddition = `app.use('/api/roles', gatewayMultiRoleRoutes);\napp.use('/api/parent-approval', gatewayParentApprovalRoutes);`;
  s = s.replace(mountTarget, mountAddition);
}

// 3. Add Page Route if not present
if (!s.includes("'/parent-approval'")) {
  const pageTarget = "app.get(['/parent', '/parent-portal', '/parent.html', '/parents'], (req, res) => res.sendFile(path.join(publicDir, 'parent-portal.html')));";
  const pageAddition = `app.get(['/parent', '/parent-portal', '/parent.html', '/parents'], (req, res) => res.sendFile(path.join(publicDir, 'parent-portal.html')));
app.get(['/parent-approval', '/parent-approval.html'], (req, res) => res.sendFile(path.join(publicDir, 'parent-approval.html')));`;
  s = s.replace(pageTarget, pageAddition);
}

fs.writeFileSync(serverPath, s, 'utf8');
console.log('server.js updated successfully with Parent Approval routes!');
