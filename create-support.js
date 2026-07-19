const fs = require('fs');
const cheerio = require('cheerio');

// Load index.html to use as the base layout
const baseHtml = fs.readFileSync('public/index.html', 'utf8');
const $ = cheerio.load(baseHtml);

// Empty main container
$('main').empty();

// Create Support Section HTML
const supportHtml = `
<div class="max-w-container-max mx-auto px-lg py-xl mt-xl mb-xl">
    <div class="text-center mb-xl">
        <h1 class="font-display-lg text-display-lg text-on-surface mb-sm">Support Center</h1>
        <p class="font-body-lg text-body-lg text-on-surface-variant">We're here to help. Find answers to common questions or reach out to our team.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-xl">
        <!-- Contact Form -->
        <div class="glass-panel rounded-3xl p-xl">
            <h2 class="font-headline-lg text-headline-lg text-on-surface mb-md">Contact Us</h2>
            <form id="contact-form" onsubmit="event.preventDefault(); showToast('Message sent! Our support team will get back to you soon.');">
                <div class="mb-md">
                    <label class="block font-label-md text-on-surface mb-xs">Name</label>
                    <input type="text" required class="w-full bg-[#0A0A0A] border border-outline-variant rounded-full py-3 px-4 text-sm text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all outline-none">
                </div>
                <div class="mb-md">
                    <label class="block font-label-md text-on-surface mb-xs">Email</label>
                    <input type="email" required class="w-full bg-[#0A0A0A] border border-outline-variant rounded-full py-3 px-4 text-sm text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all outline-none">
                </div>
                <div class="mb-lg">
                    <label class="block font-label-md text-on-surface mb-xs">Message</label>
                    <textarea required rows="4" class="w-full bg-[#0A0A0A] border border-outline-variant rounded-2xl py-3 px-4 text-sm text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all outline-none"></textarea>
                </div>
                <button type="submit" class="btn-primary w-full py-3 rounded-full font-label-md text-label-md font-bold mb-md">
                    Send Message
                </button>
            </form>
        </div>

        <!-- FAQs -->
        <div class="flex flex-col gap-md">
            <h2 class="font-headline-lg text-headline-lg text-on-surface mb-xs">Frequently Asked Questions</h2>
            
            <div class="glass-panel rounded-2xl p-md">
                <h3 class="font-headline-md text-headline-md text-on-surface mb-1">What is the return policy?</h3>
                <p class="font-body-md text-body-md text-on-surface-variant">We offer a 30-day money-back guarantee for all Quantum products. The item must be in its original condition and packaging.</p>
            </div>
            
            <div class="glass-panel rounded-2xl p-md">
                <h3 class="font-headline-md text-headline-md text-on-surface mb-1">How long does shipping take?</h3>
                <p class="font-body-md text-body-md text-on-surface-variant">Standard shipping takes 3-5 business days. Expedited shipping is available at checkout for 1-2 business days delivery.</p>
            </div>
            
            <div class="glass-panel rounded-2xl p-md">
                <h3 class="font-headline-md text-headline-md text-on-surface mb-1">Do you ship internationally?</h3>
                <p class="font-body-md text-body-md text-on-surface-variant">Yes! We ship to over 50 countries globally. Shipping costs and timelines vary based on location.</p>
            </div>
            
            <div class="glass-panel rounded-2xl p-md">
                <h3 class="font-headline-md text-headline-md text-on-surface mb-1">Where can I track my order?</h3>
                <p class="font-body-md text-body-md text-on-surface-variant">Once your order ships, you will receive a tracking link via email. You can also track your order in your account dashboard.</p>
            </div>
        </div>
    </div>
</div>
`;

$('main').append(supportHtml);

// Save support.html
fs.writeFileSync('public/support.html', $.html());

// Update navigation links across all HTML files
const files = ['index.html', 'product.html', 'cart.html', 'login.html', 'register.html', 'support.html'];
files.forEach(file => {
    let content = fs.readFileSync(`public/${file}`, 'utf8');
    const $doc = cheerio.load(content);
    // Find Support link and update href
    $doc('a').each((i, el) => {
        if ($doc(el).text().trim() === 'Support') {
            $doc(el).attr('href', 'support.html');
        }
    });
    fs.writeFileSync(`public/${file}`, $doc.html());
});

console.log('Support page created and links updated.');
