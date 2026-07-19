const fs = require('fs');
const cheerio = require('cheerio');

// Load the newly refactored index.html as the base layout
const baseHtml = fs.readFileSync('public/index.html', 'utf8');

function createAuthPage(type) {
    const $ = cheerio.load(baseHtml);
    
    // Remove Hero and Products section
    $('main').empty();
    
    // Auth Form HTML
    const title = type === 'login' ? 'Login' : 'Register';
    const formId = type === 'login' ? 'login-form' : 'register-form';
    const btnText = type === 'login' ? 'Sign In' : 'Create Account';
    const linkText = type === 'login' ? 'Need an account? Register here.' : 'Already have an account? Login here.';
    const linkUrl = type === 'login' ? 'register.html' : 'login.html';
    
    const extraField = type === 'register' ? `
        <div class="mb-md">
            <label class="block font-label-md text-on-surface mb-xs">Username</label>
            <input type="text" id="username" required class="w-full bg-[#0A0A0A] border border-outline-variant rounded-full py-3 px-4 text-sm text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all outline-none">
        </div>
    ` : '';
    
    const formHtml = `
    <div class="max-w-md mx-auto mt-xl mb-xl">
        <div class="glass-panel rounded-3xl p-xl">
            <h1 class="font-headline-lg text-headline-lg text-on-surface mb-lg text-center">${title}</h1>
            <form id="${formId}">
                ${extraField}
                <div class="mb-md">
                    <label class="block font-label-md text-on-surface mb-xs">Email</label>
                    <input type="email" id="email" required class="w-full bg-[#0A0A0A] border border-outline-variant rounded-full py-3 px-4 text-sm text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all outline-none">
                </div>
                <div class="mb-lg">
                    <label class="block font-label-md text-on-surface mb-xs">Password</label>
                    <input type="password" id="password" required class="w-full bg-[#0A0A0A] border border-outline-variant rounded-full py-3 px-4 text-sm text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all outline-none">
                </div>
                <button type="submit" class="btn-primary w-full py-3 rounded-full font-label-md text-label-md font-bold mb-md">
                    ${btnText}
                </button>
            </form>
            <div class="text-center mt-md">
                <a href="${linkUrl}" class="font-label-sm text-label-sm text-primary-fixed-dim hover:text-primary transition-colors">${linkText}</a>
            </div>
        </div>
    </div>`;
    
    $('main').append(formHtml);
    fs.writeFileSync(`public/${type}.html`, $.html());
}

createAuthPage('login');
createAuthPage('register');
console.log('Auth pages refactored.');
