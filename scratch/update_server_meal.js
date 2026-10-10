const fs = require('fs');
const serverPath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/server.js';
let s = fs.readFileSync(serverPath, 'utf8');

// 1. Add route import if not present
if (!s.includes('gatewayMealPlanning')) {
  const importTarget = "const gatewayCurfewAlertsRoutes = require('./routes/gatewayCurfewAlerts');";
  const importAddition = `const gatewayCurfewAlertsRoutes = require('./routes/gatewayCurfewAlerts');\nconst gatewayMealPlanningRoutes = require('./routes/gatewayMealPlanning');`;
  s = s.replace(importTarget, importAddition);
}

// 2. Add API mount if not present
if (!s.includes("app.use('/api/meal-planning'")) {
  const mountTarget = "app.use('/api/curfew-alerts', gatewayCurfewAlertsRoutes);";
  const mountAddition = `app.use('/api/curfew-alerts', gatewayCurfewAlertsRoutes);\napp.use('/api/meal-planning', gatewayMealPlanningRoutes);`;
  s = s.replace(mountTarget, mountAddition);
}

// 3. Add Page Route if not present
if (!s.includes("'/admin/meal-planning'")) {
  const pageTarget = "app.get(['/warden', '/warden-dashboard', '/warden-dashboard.html'], (req, res) => res.sendFile(path.join(publicDir, 'warden-dashboard.html')));";
  const pageAddition = `app.get(['/warden', '/warden-dashboard', '/warden-dashboard.html'], (req, res) => res.sendFile(path.join(publicDir, 'warden-dashboard.html')));\napp.get(['/admin/meal-planning', '/meal-planning', '/meal-planning.html'], (req, res) => res.sendFile(path.join(publicDir, 'admin-meal-planning.html')));`;
  s = s.replace(pageTarget, pageAddition);
}

fs.writeFileSync(serverPath, s, 'utf8');
console.log('server.js updated successfully with Meal Planning routes!');
