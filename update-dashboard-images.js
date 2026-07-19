const fs = require('fs');
const cheerio = require('cheerio');

const htmlPath = 'public/dashboard.html';
const html = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

const newImages = ['assets/unnamed.jpg', 'assets/unnamed (1).jpg', 'assets/unnamed (2).jpg'];
let imageIndex = 0;

// The order items are inside elements with class 'glass-card' and they have an img tag.
// Specifically we want the recent order stream images.
$('.glass-card img').each((i, el) => {
    if (imageIndex < newImages.length) {
        $(el).attr('src', newImages[imageIndex]);
        imageIndex++;
    }
});

fs.writeFileSync(htmlPath, $.html());
console.log('Updated product images in dashboard.html');
