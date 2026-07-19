const fs = require('fs');
const cheerio = require('cheerio');

// Load index.html as the base layout
const baseHtml = fs.readFileSync('public/index.html', 'utf8');
const $ = cheerio.load(baseHtml);

// Remove Hero Section
$('main section').eq(0).remove(); // Removes Hero

// Remove Featured Categories (Bento grid)
$('main section').eq(0).remove(); // Removes Bento Grid

// Now the first section is Latest Drops. Let's rename it to the Category title
const categorySection = $('main section').eq(0);
categorySection.find('h2').text('Collection');
categorySection.find('h2').attr('id', 'category-title');
categorySection.find('a').remove(); // Remove "View All"

// Save to category.html
fs.writeFileSync('public/category.html', $.html());

console.log('category.html created.');
