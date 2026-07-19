const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function applyCommonMods($, pageType) {
    // Add GSAP and app.js
    $('body').append('<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>');
    $('body').append('<script src="app.js"></script>');
    
    // Add toast container
    $('body').append('<div id="toast-container" class="fixed bottom-4 right-4 z-50 flex flex-col gap-2"></div>');
    
    // Auth links
    const authBtn = $('button:has(span:contains("account_circle"))');
    authBtn.replaceWith('<div id="auth-links" class="flex items-center space-x-4 font-label-sm text-label-sm"></div>');
    
    // Cart button
    const cartBtn = $('button:has(span:contains("shopping_cart"))');
    if (pageType === 'cart') {
        cartBtn.replaceWith('<a href="/" class="text-on-surface-variant hover:text-primary font-label-sm text-label-sm">Continue Shopping</a>');
    } else {
        cartBtn.attr('id', 'cart-btn');
        cartBtn.attr('onclick', "window.location.href='cart.html'");
        cartBtn.addClass('relative');
        cartBtn.append('<span class="cart-count absolute top-0 right-0 bg-primary-container text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center transform translate-x-1/4 -translate-y-1/4">0</span>');
    }
}

// 1. INDEX.HTML
{
    const html = fs.readFileSync('public/stitch_modern_luxe_tech_store/quantum_store_home/code.html', 'utf8');
    const $ = cheerio.load(html);
    applyCommonMods($, 'index');
    
    // Hero Video
    const heroBg = $('section.relative .bg-cover.bg-center').first();
    if(heroBg.length) {
        heroBg.replaceWith('<video autoplay loop muted playsinline class="absolute inset-0 w-full h-full object-cover z-0"><source src="assets/hero-video.mp4" type="video/mp4"></video>');
    }
    
    // Product Grid
    const latestDropsH2 = $('h2:contains("Latest Drops")');
    if (latestDropsH2.length) {
        const grid = latestDropsH2.parent().next('.grid');
        if (grid.length) {
            grid.attr('id', 'products-container');
            grid.empty();
        }
    }
    
    fs.writeFileSync('public/index.html', $.html());
    console.log('index.html refactored');
}

// 2. PRODUCT.HTML
{
    const html = fs.readFileSync('public/stitch_modern_luxe_tech_store/quantum_pro_headphones_details/code.html', 'utf8');
    const $ = cheerio.load(html);
    applyCommonMods($, 'product');
    
    // The main content is under <main> -> <div class="max-w-container-max...">
    const mainDiv = $('main > div.max-w-container-max');
    if (mainDiv.length) {
        mainDiv.attr('id', 'product-details-container');
        mainDiv.empty();
    }
    
    fs.writeFileSync('public/product.html', $.html());
    console.log('product.html refactored');
}

// 3. CART.HTML
{
    const html = fs.readFileSync('public/stitch_modern_luxe_tech_store/your_cart_checkout/code.html', 'utf8');
    const $ = cheerio.load(html);
    applyCommonMods($, 'cart');
    
    // Cart Items
    // In Stitch cart, there is a <div class="col-span-1 lg:col-span-2 space-y-gutter">
    // Inside it are the cart items.
    const cartItemsContainer = $('h1:contains("Your Cart")').parent().parent().find('.lg\\:col-span-2.space-y-gutter');
    if (cartItemsContainer.length) {
        cartItemsContainer.attr('id', 'cart-items-container');
        cartItemsContainer.empty();
    } else {
        console.log('Could not find cart items container using lg:col-span-2 class. Searching by structure.');
        // alternative
        const firstCartItem = $('h3:contains("Quantum Pro Headphones")').closest('.glass-panel');
        if (firstCartItem.length) {
            const container = firstCartItem.parent();
            container.attr('id', 'cart-items-container');
            container.empty();
        }
    }
    
    // Order Summary
    const summaryCard = $('h2:contains("Order Summary")').closest('.glass-panel');
    if (summaryCard.length) {
        // total amount is typically in a flex with "Total" text
        const totalDiv = summaryCard.find('span:contains("Total")').next('span');
        if (totalDiv.length) {
            totalDiv.attr('id', 'cart-total');
        }
        
        // Checkout btn
        const checkoutBtn = summaryCard.find('button:contains("Proceed to Checkout")');
        if (checkoutBtn.length) {
            checkoutBtn.attr('id', 'checkout-btn');
        }
    }
    
    fs.writeFileSync('public/cart.html', $.html());
    console.log('cart.html refactored');
}
