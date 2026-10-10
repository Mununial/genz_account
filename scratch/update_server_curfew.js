const fs = require('fs');
const serverPath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/server.js';
let s = fs.readFileSync(serverPath, 'utf8');

// 1. Add route import if not present
if (!s.includes('gatewayCurfewAlerts')) {
  const importTarget = "const gatewayAuditReportsRoutes = require('./routes/gatewayAuditReports');";
  const importAddition = `const gatewayAuditReportsRoutes = require('./routes/gatewayAuditReports');\nconst gatewayCurfewAlertsRoutes = require('./routes/gatewayCurfewAlerts');`;
  s = s.replace(importTarget, importAddition);
}

// 2. Add API mount if not present
if (!s.includes("app.use('/api/curfew-alerts'")) {
  const mountTarget = "app.use('/api/audit-reports', gatewayAuditReportsRoutes);";
  const mountAddition = `app.use('/api/audit-reports', gatewayAuditReportsRoutes);\napp.use('/api/curfew-alerts', gatewayCurfewAlertsRoutes);`;
  s = s.replace(mountTarget, mountAddition);
}

// 3. Add Page Route if not present
if (!s.includes("'/warden'")) {
  const pageTarget = "app.get(['/admin/audit-reports', '/admin-audit-reports.html'], (req, res) => res.sendFile(path.join(publicDir, 'admin-audit-reports.html')));";
  const pageAddition = `app.get(['/admin/audit-reports', '/admin-audit-reports.html'], (req, res) => res.sendFile(path.join(publicDir, 'admin-audit-reports.html')));\napp.get(['/warden', '/warden-dashboard', '/warden-dashboard.html'], (req, res) => res.sendFile(path.join(publicDir, 'warden-dashboard.html')));`;
  s = s.replace(pageTarget, pageAddition);
}

fs.writeFileSync(serverPath, s, 'utf8');
console.log('server.js updated successfully with Warden and Curfew routes!');
