const fs = require('fs');
const path = require('path');

// Read the built index.html
const htmlPath = path.join(__dirname, 'build', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// More aggressive removal of module-related attributes
html = html.replace(/type="module"\s+crossorigin\s+/g, '');
html = html.replace(/type="module"\s+/g, '');
html = html.replace(/\s+crossorigin/g, '');
html = html.replace(/nomodule/g, '');

// Ensure script tags don't have any module-related attributes
html = html.replace(/<script([^>]*?)crossorigin([^>]*?)>/g, '<script$1$2>');

// Write back the modified HTML
fs.writeFileSync(htmlPath, html, 'utf8');

console.log('✅ Removed all module-related attributes from script tags');