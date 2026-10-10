const fs = require('fs');
const file = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/routes/gatewayPolls.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace("res.status(500).send('Error generating Poll CSV');", "res.status(500).send('Error generating Poll CSV: ' + err.message);");
fs.writeFileSync(file, content, 'utf8');
console.log('Modified gatewayPolls.js with error message');
