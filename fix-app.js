const fs = require('fs');
let content = fs.readFileSync('public/app.js', 'utf8');

// I will split the file by the duplicate markers.
// The file has:
// 1. Initial setup up to renderCart
// 2. renderCart (new)
// 3. handleAuth (new)
// 4. loadProductDetails (new)
// 5. Duplicate renderCart (old/new)
// ...
// 6. DOMContentLoaded

const idx1 = content.indexOf('const renderCart = () => {', content.indexOf('const loadProductDetails = async () => {'));
if (idx1 !== -1) {
    const startOfDuplicate = idx1;
    // Find DOMContentLoaded
    const idxDOM = content.lastIndexOf('document.addEventListener(\'DOMContentLoaded\', () => {');
    
    if (idxDOM > startOfDuplicate) {
        content = content.substring(0, startOfDuplicate) + content.substring(idxDOM);
        fs.writeFileSync('public/app.js', content);
        console.log('Fixed app.js by removing duplicated section between loadProductDetails and DOMContentLoaded');
    }
}
