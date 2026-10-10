const fs = require('fs');
const serverPath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/server.js';
let s = fs.readFileSync(serverPath, 'utf8');

// 1. Add route import if not present
if (!s.includes('gatewayTvSignage')) {
  const importTarget = "const gatewayVisitorAlertsRoutes = require('./routes/gatewayVisitorAlerts');";
  const importAddition = `const gatewayVisitorAlertsRoutes = require('./routes/gatewayVisitorAlerts');\nconst gatewayTvSignageRoutes = require('./routes/gatewayTvSignage');`;
  s = s.replace(importTarget, importAddition);
}

// 2. Add API mount if not present
if (!s.includes("app.use('/api/tv'")) {
  const mountTarget = "app.use('/api/visitor-alerts', gatewayVisitorAlertsRoutes);";
  const mountAddition = `app.use('/api/visitor-alerts', gatewayVisitorAlertsRoutes);\napp.use('/api/tv', gatewayTvSignageRoutes);`;
  s = s.replace(mountTarget, mountAddition);
}

// 3. Add Page Route if not present
if (!s.includes("'/tv'")) {
  const pageTarget = "app.get(['/admin/visitor-alerts', '/admin-visitor-alerts.html', '/visitor-alerts'], (req, res) => res.sendFile(path.join(publicDir, 'admin-visitor-alerts.html')));";
  const pageAddition = `app.get(['/admin/visitor-alerts', '/admin-visitor-alerts.html', '/visitor-alerts'], (req, res) => res.sendFile(path.join(publicDir, 'admin-visitor-alerts.html')));
app.get(['/tv', '/tv.html', '/signage', '/digital-signage'], (req, res) => res.sendFile(path.join(publicDir, 'tv.html')));`;
  s = s.replace(pageTarget, pageAddition);
}

fs.writeFileSync(serverPath, s, 'utf8');
console.log('server.js updated successfully with Smart TV Signage routes!');
