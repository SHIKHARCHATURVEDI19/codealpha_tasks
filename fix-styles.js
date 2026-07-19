const fs = require('fs');

const files = ['index.html', 'product.html', 'cart.html', 'login.html', 'register.html', 'support.html'];

files.forEach(file => {
    let content = fs.readFileSync(`public/${file}`, 'utf8');
    
    // Fix <style> to <style type="text/tailwindcss">
    content = content.replace(/<style>/g, '<style type="text/tailwindcss">');
    
    // Add bg-background and text-on-background to body if not present
    if (content.includes('<body class="')) {
        if (!content.includes('bg-background')) {
            content = content.replace('<body class="', '<body class="bg-background text-on-background ');
        }
    } else {
        content = content.replace('<body>', '<body class="bg-background text-on-background">');
    }
    
    fs.writeFileSync(`public/${file}`, content);
});

console.log('Fixed styles in all HTML files.');
