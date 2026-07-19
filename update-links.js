const fs = require('fs');
const cheerio = require('cheerio');

const files = ['index.html', 'product.html', 'cart.html', 'login.html', 'register.html', 'support.html', 'category.html'];

files.forEach(file => {
    let content = fs.readFileSync(`public/${file}`, 'utf8');
    const $ = cheerio.load(content);
    
    // Update navbar links
    $('a').each((i, el) => {
        const text = $(el).text().trim();
        if (text === 'Latest Drops') {
            $(el).attr('href', 'index.html#products-container');
        } else if (text === 'Quantum Collection') {
            $(el).attr('href', 'category.html?c=quantum');
        } else if (text === 'Hardware') {
            // Be careful to only match exact Hardware link if there are others
            if ($(el).hasClass('text-on-surface-variant')) {
                $(el).attr('href', 'category.html?c=hardware');
            }
        }
    });

    // In index.html, update the bento grid wrapping divs to act as links
    if (file === 'index.html') {
        const h3s = $('h3');
        h3s.each((i, el) => {
            const text = $(el).text().trim();
            if (text === 'Hardware') {
                $(el).closest('.group').attr('onclick', "window.location.href='category.html?c=hardware'");
            } else if (text === 'Wearables') {
                $(el).closest('.group').attr('onclick', "window.location.href='category.html?c=wearables'");
            } else if (text === 'Pro Audio') {
                $(el).closest('.group').attr('onclick', "window.location.href='category.html?c=audio'");
            }
        });
    }

    fs.writeFileSync(`public/${file}`, $.html());
});

console.log('Navigation links updated.');
