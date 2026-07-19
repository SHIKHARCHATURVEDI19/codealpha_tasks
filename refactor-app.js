const fs = require('fs');

let appJs = fs.readFileSync('public/app.js', 'utf8');

// Replace renderProducts
const renderProductsRegex = /const renderProducts = \(\) => \{[\s\S]*?\/\/ GSAP Stagger Animation for cards\s*if \(animate && typeof gsap !== 'undefined'\) \{\s*gsap.from\('\.product-card', \{[\s\S]*?\}\);\s*\}\s*\};/m;

const newRenderProducts = `const renderProducts = () => {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    let html = '';
    const animate = container.innerHTML === '';
    
    products.forEach(p => {
        const saleBadge = p.is_sale ? '<div class="absolute top-md left-md z-10 bg-primary-container/10 text-primary-container px-sm py-xs rounded-full font-label-sm text-label-sm border border-primary-container/20 backdrop-blur-md">Sale!</div>' : '';
        const priceHtml = p.original_price ? \`\${p.price.toFixed(2)} <s class="text-xs text-outline-variant">\$\${p.original_price.toFixed(2)}</s>\` : \`\${p.price.toFixed(2)}\`;
        
        html += \`
        <div class="glass-panel rounded-xl p-md group flex flex-col h-full card-hover relative cursor-pointer product-card" onclick="window.location.href='product.html?id=\${p.id}'">
            \${saleBadge}
            <div class="aspect-square rounded-lg overflow-hidden mb-md relative bg-[#1A1D1E] flex items-center justify-center">
                <img class="w-full h-full object-cover mix-blend-screen opacity-90 group-hover:scale-105 transition-transform duration-500" src="\${p.image_url}">
            </div>
            <h3 class="font-headline-md text-headline-md text-on-surface mb-xs">\${p.name}</h3>
            <p class="font-body-md text-body-md text-on-surface-variant mb-md flex-grow">\${p.description.substring(0, 50)}...</p>
            <div class="flex justify-between items-center mt-auto">
                <span class="font-label-md text-label-md text-primary-fixed-dim">$\${priceHtml}</span>
                <button class="bg-surface-variant/50 hover:bg-primary-container hover:text-black text-on-surface p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0" onclick="event.stopPropagation(); addToCart(\${p.id})">
                    <span class="material-symbols-outlined" data-icon="add_shopping_cart">add_shopping_cart</span>
                </button>
            </div>
        </div>\`;
    });
    
    container.innerHTML = html;
    
    if (animate && typeof gsap !== 'undefined') {
        gsap.from('.product-card', { y: 50, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" });
    }
};`;

appJs = appJs.replace(renderProductsRegex, newRenderProducts);

// Replace loadProductDetails
const loadProductDetailsRegex = /const loadProductDetails = async \(\) => \{[\s\S]*?\}\s*\}\s*\}\s*\}\s*\};/m;

const newLoadProductDetails = `const loadProductDetails = async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    const container = document.getElementById('product-details-container');
    if (!container) return;

    try {
        const res = await fetch(\`\${API_URL}/products/\${id}\`);
        const product = await res.json();
        
        if (product.error) {
            container.innerHTML = '<p>Product not found.</p>';
            return;
        }

        const priceHtml = product.original_price ? 
            \`<span class="font-headline-lg text-headline-lg text-primary-fixed-dim">$\${product.price.toFixed(2)}</span>
             <span class="font-body-lg text-body-lg text-outline-variant line-through mb-1">$\${product.original_price.toFixed(2)}</span>\` : 
            \`<span class="font-headline-lg text-headline-lg text-primary-fixed-dim">$\${product.price.toFixed(2)}</span>\`;

        container.innerHTML = \`
        <div class="grid grid-cols-1 md:grid-cols-2 gap-xl">
            <div class="glass-panel rounded-3xl p-md flex items-center justify-center h-[500px] md:h-[600px] sticky top-32 product-img-cont">
                <img src="\${product.image_url}" class="w-full h-full object-cover mix-blend-screen" />
            </div>
            <div class="flex flex-col justify-center product-info-cont">
                <div class="inline-flex items-center space-x-2 bg-primary-container/10 text-primary-container px-sm py-xs rounded-full font-label-sm text-label-sm border border-primary-container/20 mb-md w-max">
                    <span class="material-symbols-outlined text-[14px]">local_shipping</span>
                    <span>In Stock (\${product.stock} available)</span>
                </div>
                <h1 class="font-display-lg text-headline-lg md:text-display-lg text-on-surface mb-sm">\${product.name}</h1>
                <p class="font-body-lg text-body-lg text-on-surface-variant mb-lg">\${product.description}</p>
                <div class="flex items-end space-x-md mb-xl">
                    \${priceHtml}
                </div>
                <div class="flex space-x-md mb-lg">
                    <button class="btn-primary flex-grow font-label-md text-label-md py-4 rounded-full font-bold flex items-center justify-center" onclick="addToCart(\${product.id})">
                        <span class="material-symbols-outlined mr-2">shopping_bag</span> Add to Cart
                    </button>
                </div>
            </div>
        </div>\`;
        
        if (typeof gsap !== 'undefined') {
            gsap.from('.product-img-cont', { x: -50, opacity: 0, duration: 0.8 });
            gsap.from('.product-info-cont', { x: 50, opacity: 0, duration: 0.8 });
        }
    } catch (err) {
        console.error(err);
    }
};`;

// Note: I will just use string replacement on a larger chunk for loadProductDetails if regex fails, but let's try a safer replacement.
appJs = appJs.split('const loadProductDetails = async () => {')[0] + newLoadProductDetails + '\\n\\n' + 
        'const renderCart = () => {' + appJs.split('const renderCart = () => {')[1];

// Replace renderCart
const renderCartRegex = /let html = '<div class="cart-list">';[\s\S]*?html \+= '<\/div>';/m;
const newRenderCartHtml = `let html = '<div class="space-y-gutter">';
    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        html += \`
        <div class="glass-panel rounded-2xl p-md flex flex-col sm:flex-row items-center gap-md cart-item" data-index="\${index}">
            <div class="w-24 h-24 bg-[#1A1D1E] rounded-xl flex-shrink-0 flex items-center justify-center p-2">
                <img src="\${item.image_url}" class="w-full h-full object-cover mix-blend-screen">
            </div>
            <div class="flex-grow text-center sm:text-left">
                <h3 class="font-headline-md text-on-surface text-lg mb-1">\${item.name}</h3>
                <div class="flex items-center justify-center sm:justify-start space-x-2 mt-2">
                    <button class="text-on-surface-variant hover:text-primary transition-colors minus" data-id="\${item.product_id}"><span class="material-symbols-outlined text-sm">remove</span></button>
                    <span class="font-label-md w-4 text-center">\${item.quantity}</span>
                    <button class="text-on-surface-variant hover:text-primary transition-colors plus" data-id="\${item.product_id}"><span class="material-symbols-outlined text-sm">add</span></button>
                </div>
            </div>
            <div class="font-headline-md text-primary-fixed-dim text-xl">$\${(item.price * item.quantity).toFixed(2)}</div>
            <button class="text-error hover:text-error-container transition-colors p-2 remove-btn" data-id="\${item.product_id}">
                <span class="material-symbols-outlined">delete</span>
            </button>
        </div>\`;
    });
    html += '</div>';`;

appJs = appJs.replace(renderCartRegex, newRenderCartHtml);

// Fix updateAuthLinks
const authLinksRegex = /const updateAuthLinks = \(\) => \{[\s\S]*?\}\s*\};/m;
const newAuthLinks = `const updateAuthLinks = () => {
    const authLinks = document.getElementById('auth-links');
    if (!authLinks) return;
    
    if (currentUser) {
        authLinks.innerHTML = \`
            <span class="text-on-surface-variant">Hi, \${currentUser.username}</span>
            <a href="#" id="logout-btn" class="hover:text-primary transition-colors">Logout</a>
        \`;
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            currentUser = null;
            currentToken = null;
            updateAuthLinks();
            showToast('Logged out');
            if (window.location.pathname.includes('cart.html')) {
                window.location.href = 'index.html';
            }
        });
    } else {
        authLinks.innerHTML = \`
            <a href="login.html" class="hover:text-primary transition-colors">Login</a>
            <span class="text-on-surface-variant">/</span>
            <a href="register.html" class="hover:text-primary transition-colors">Register</a>
        \`;
    }
};`;
appJs = appJs.replace(authLinksRegex, newAuthLinks);

fs.writeFileSync('public/app.js', appJs);
console.log('app.js updated successfully');
