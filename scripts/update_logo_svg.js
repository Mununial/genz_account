const fs = require('fs');
const path = require('path');

const imgPath = path.join(__dirname, '..', 'frontend', 'assets', 'genz-logo.jpg');
const svgPath = path.join(__dirname, '..', 'frontend', 'assets', 'logo.svg');

const b64 = fs.readFileSync(imgPath).toString('base64');
const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><image href='data:image/jpeg;base64,${b64}' width='100' height='100'/></svg>\n`;

fs.writeFileSync(svgPath, svg, 'utf8');
console.log('Successfully updated frontend/assets/logo.svg with new Gen-Z University circular logo!');
