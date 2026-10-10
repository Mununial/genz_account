const fs = require('fs');
const serverPath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/server.js';
let s = fs.readFileSync(serverPath, 'utf8');

// 1. Add route import if not present
if (!s.includes('gatewayVisitorAlerts')) {
  const importTarget = "const gatewayClassroomRoutes = require('./routes/gatewayClassroom');";
  const importAddition = `const gatewayClassroomRoutes = require('./routes/gatewayClassroom');\nconst gatewayVisitorAlertsRoutes = require('./routes/gatewayVisitorAlerts');`;
  s = s.replace(importTarget, importAddition);
}

// 2. Add API mount if not present
if (!s.includes("app.use('/api/visitor-alerts'")) {
  const mountTarget = "app.use('/api/classroom', gatewayClassroomRoutes);";
  const mountAddition = `app.use('/api/classroom', gatewayClassroomRoutes);\napp.use('/api/visitor-alerts', gatewayVisitorAlertsRoutes);`;
  s = s.replace(mountTarget, mountAddition);
}

// 3. Add Page Route if not present
if (!s.includes("'/admin/visitor-alerts'")) {
  const pageTarget = "app.get(['/classroom', '/classroom.html', '/notes'], (req, res) => res.sendFile(path.join(publicDir, 'classroom.html')));";
  const pageAddition = `app.get(['/classroom', '/classroom.html', '/notes'], (req, res) => res.sendFile(path.join(publicDir, 'classroom.html')));
app.get(['/admin/visitor-alerts', '/admin-visitor-alerts.html', '/visitor-alerts'], (req, res) => res.sendFile(path.join(publicDir, 'admin-visitor-alerts.html')));`;
  s = s.replace(pageTarget, pageAddition);
}

fs.writeFileSync(serverPath, s, 'utf8');
console.log('server.js updated successfully with Visitor Alerts routes!');
