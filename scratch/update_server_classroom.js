const fs = require('fs');
const serverPath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/server.js';
let s = fs.readFileSync(serverPath, 'utf8');

// 1. Add route import if not present
if (!s.includes('gatewayClassroom')) {
  const importTarget = "const gatewayParentApprovalRoutes = require('./routes/gatewayParentApproval');";
  const importAddition = `const gatewayParentApprovalRoutes = require('./routes/gatewayParentApproval');\nconst gatewayClassroomRoutes = require('./routes/gatewayClassroom');`;
  s = s.replace(importTarget, importAddition);
}

// 2. Add API mount if not present
if (!s.includes("app.use('/api/classroom'")) {
  const mountTarget = "app.use('/api/parent-approval', gatewayParentApprovalRoutes);";
  const mountAddition = `app.use('/api/parent-approval', gatewayParentApprovalRoutes);\napp.use('/api/classroom', gatewayClassroomRoutes);`;
  s = s.replace(mountTarget, mountAddition);
}

// 3. Add Page Route if not present
if (!s.includes("'/classroom'")) {
  const pageTarget = "app.get(['/parent-approval', '/parent-approval.html'], (req, res) => res.sendFile(path.join(publicDir, 'parent-approval.html')));";
  const pageAddition = `app.get(['/parent-approval', '/parent-approval.html'], (req, res) => res.sendFile(path.join(publicDir, 'parent-approval.html')));
app.get(['/classroom', '/classroom.html', '/notes'], (req, res) => res.sendFile(path.join(publicDir, 'classroom.html')));`;
  s = s.replace(pageTarget, pageAddition);
}

fs.writeFileSync(serverPath, s, 'utf8');
console.log('server.js updated successfully with Classroom routes!');
