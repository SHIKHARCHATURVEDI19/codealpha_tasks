const fs = require('fs');
const cheerio = require('cheerio');

const files = ['index.html', 'product.html', 'cart.html', 'login.html', 'register.html', 'support.html', 'category.html'];

files.forEach(file => {
    let content = fs.readFileSync(`public/${file}`, 'utf8');
    const $ = cheerio.load(content);
    
    // Find the navbar div containing the links
    const navLinksContainer = $('.hidden.md\\:flex.space-x-lg');
    
    // Check if Home already exists
    let hasHome = false;
    navLinksContainer.find('a').each((i, el) => {
        if ($(el).text().trim() === 'Home') hasHome = true;
    });

    if (!hasHome) {
        // Prepend the Home link
        navLinksContainer.prepend('<a class="font-body-md text-body-md text-on-surface-variant hover:text-primary-container transition-colors duration-300" href="index.html">Home</a>\n');
        fs.writeFileSync(`public/${file}`, $.html());
        console.log(`Added Home tab to ${file}`);
    }
});
