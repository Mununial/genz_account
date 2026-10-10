const fs = require('fs');
const serverPath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/server.js';
let s = fs.readFileSync(serverPath, 'utf8');

// 1. Add route import if not present
if (!s.includes('gatewayHostelDemand')) {
  const importTarget = "const gatewayMealPlanningRoutes = require('./routes/gatewayMealPlanning');";
  const importAddition = `const gatewayMealPlanningRoutes = require('./routes/gatewayMealPlanning');\nconst gatewayHostelDemandRoutes = require('./routes/gatewayHostelDemand');`;
  s = s.replace(importTarget, importAddition);
}

// 2. Add API mount if not present
if (!s.includes("app.use('/api/hostel-demand'")) {
  const mountTarget = "app.use('/api/meal-planning', gatewayMealPlanningRoutes);";
  const mountAddition = `app.use('/api/meal-planning', gatewayMealPlanningRoutes);\napp.use('/api/hostel-demand', gatewayHostelDemandRoutes);`;
  s = s.replace(mountTarget, mountAddition);
}

// 3. Add Page Route if not present
if (!s.includes("'/admin/hostel-demand'")) {
  const pageTarget = "app.get(['/admin/meal-planning', '/meal-planning', '/meal-planning.html'], (req, res) => res.sendFile(path.join(publicDir, 'admin-meal-planning.html')));";
  const pageAddition = `app.get(['/admin/meal-planning', '/meal-planning', '/meal-planning.html'], (req, res) => res.sendFile(path.join(publicDir, 'admin-meal-planning.html')));\napp.get(['/admin/hostel-demand', '/hostel-demand', '/hostel-demand.html'], (req, res) => res.sendFile(path.join(publicDir, 'admin-hostel-demand.html')));`;
  s = s.replace(pageTarget, pageAddition);
}

fs.writeFileSync(serverPath, s, 'utf8');
console.log('server.js updated successfully with Hostel Demand routes!');
