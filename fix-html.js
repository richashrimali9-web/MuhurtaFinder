const fs = require('fs');
const path = require('path');

// Read the built index.html
const htmlPath = path.join(__dirname, 'build', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Replace type="module" with regular script tag
html = html.replace(/type="module"\s+crossorigin\s+/g, '');
html = html.replace(/type="module"\s+/g, '');

// Write back the modified HTML
fs.writeFileSync(htmlPath, html, 'utf8');

console.log('✅ Removed module type from script tags');