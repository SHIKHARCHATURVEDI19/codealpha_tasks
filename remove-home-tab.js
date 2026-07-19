const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(publicDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(content);
    
    // Find all 'a' tags inside the navbar and remove the one with text 'Home'
    let modified = false;
    $('nav a').each((i, el) => {
        if ($(el).text().trim() === 'Home') {
            $(el).remove();
            modified = true;
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, $.html());
        console.log(`Removed Home tab from ${file}`);
    }
});
