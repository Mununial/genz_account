const fs = require('fs');
const serverPath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/server.js';
let s = fs.readFileSync(serverPath, 'utf8');

// 1. Add route import if not present
if (!s.includes('gatewayPolls')) {
  const importTarget = "const gatewayHostelDemandRoutes = require('./routes/gatewayHostelDemand');";
  const importAddition = `const gatewayHostelDemandRoutes = require('./routes/gatewayHostelDemand');\nconst gatewayPollsRoutes = require('./routes/gatewayPolls');`;
  s = s.replace(importTarget, importAddition);
}

// 2. Add API mount if not present
if (!s.includes("app.use('/api/polls'")) {
  const mountTarget = "app.use('/api/hostel-demand', gatewayHostelDemandRoutes);";
  const mountAddition = `app.use('/api/hostel-demand', gatewayHostelDemandRoutes);\napp.use('/api/polls', gatewayPollsRoutes);`;
  s = s.replace(mountTarget, mountAddition);
}

// 3. Add Page Route if not present
if (!s.includes("'/admin/polls'")) {
  const pageTarget = "app.get(['/admin/hostel-demand', '/hostel-demand', '/hostel-demand.html'], (req, res) => res.sendFile(path.join(publicDir, 'admin-hostel-demand.html')));";
  const pageAddition = `app.get(['/admin/hostel-demand', '/hostel-demand', '/hostel-demand.html'], (req, res) => res.sendFile(path.join(publicDir, 'admin-hostel-demand.html')));\napp.get(['/admin/polls', '/polls', '/polls.html'], (req, res) => res.sendFile(path.join(publicDir, 'admin-polls.html')));`;
  s = s.replace(pageTarget, pageAddition);
}

fs.writeFileSync(serverPath, s, 'utf8');
console.log('server.js updated successfully with Polls routes!');
