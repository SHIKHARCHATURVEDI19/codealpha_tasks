const fs = require('fs');
const cheerio = require('cheerio');

let content = fs.readFileSync('public/dashboard.html', 'utf8');
const $ = cheerio.load(content);

// Replace the navbar links with the standard ones
const navLinksContainer = $('nav.hidden.md\\:flex.gap-lg.items-center');
navLinksContainer.empty();
navLinksContainer.append(`
<a class="text-on-surface-variant hover:text-primary-container transition-colors duration-300 font-body-md text-body-md" href="index.html">Home</a>
<a class="text-on-surface-variant hover:text-primary-container transition-colors duration-300 font-body-md text-body-md" href="index.html#products-container">Latest Drops</a>
<a class="text-on-surface-variant hover:text-primary-container transition-colors duration-300 font-body-md text-body-md" href="category.html?c=quantum">Quantum Collection</a>
<a class="text-on-surface-variant hover:text-primary-container transition-colors duration-300 font-body-md text-body-md" href="category.html?c=hardware">Hardware</a>
<a class="text-on-surface-variant hover:text-primary-container transition-colors duration-300 font-body-md text-body-md" href="support.html">Support</a>
`);

// Add type="text/tailwindcss" to the style block if missing
$('style').not('[type="text/tailwindcss"]').attr('type', 'text/tailwindcss');

fs.writeFileSync('public/dashboard.html', $.html());
console.log('Dashboard links and styles updated.');
