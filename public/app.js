const API_URL = 'http://localhost:3000/api';

// --- State Management ---
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let currentToken = localStorage.getItem('token') || null;
let allProducts = [];

// --- Utility Functions ---
const saveCart = () => localStorage.setItem('cart', JSON.stringify(cart));
const updateCartCount = () => {
    const counts = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    counts.forEach(el => el.textContent = totalItems);
};

window.addToCart = (id) => {
    let product = null;
    // Check if it's in the global products list (allProducts might exist)
    if (typeof allProducts !== 'undefined') {
        product = allProducts.find(p => p.id === id);
    }
    // If not found (e.g. on product.html where allProducts might not be loaded), we need the API or we can just fetch it.
    // But since the product data is rendered, we can assume the caller knows the ID. 
    // Actually, on product details, allProducts might not exist, but we can fetch it, OR we can pass the whole object.
    // Wait, let's just make it async and fetch it if not in allProducts.
    if (!product && typeof API_URL !== 'undefined') {
        fetch(`${API_URL}/products/${id}`)
            .then(res => res.json())
            .then(p => {
                if (p.error) return;
                addToCartLogic(p);
            });
        return;
    }
    
    if (product) addToCartLogic(product);
};

const addToCartLogic = (product) => {
    const existing = cart.find(item => item.product_id === product.id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ product_id: product.id, name: product.name, price: product.price, quantity: 1, image_url: product.image_url });
    }
    saveCart();
    updateCartCount();
    showToast(`Added ${product.name} to cart`);
    if (typeof gsap !== 'undefined') {
        gsap.fromTo('.cart-count', { scale: 1.5 }, { scale: 1, duration: 0.3, ease: "back.out(1.7)" });
    }
};

const showToast = (message, isError = false) => {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `glass-panel px-4 py-3 rounded-lg border shadow-lg font-label-md text-on-surface transition-all duration-300 ${isError ? 'border-error text-error bg-error-container/20' : 'border-primary-container text-primary-container bg-primary-container/10'}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // GSAP Animation for toast
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(toast, { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3 });
        setTimeout(() => {
            gsap.to(toast, { x: 50, opacity: 0, duration: 0.3, onComplete: () => toast.remove() });
        }, 3000);
    } else {
        setTimeout(() => toast.remove(), 3000);
    }
};

const setupAuthUI = () => {
    const authLinks = document.getElementById('auth-links');
    if (!authLinks) return;
    
    if (currentUser) {
        authLinks.innerHTML = `
            <a href="dashboard.html" class="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Hi, ${currentUser.username}</a>
            <a href="#" id="logout-btn" class="hover:text-primary transition-colors">Logout</a>
        `;
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            currentUser = null;
            currentToken = null;
            setupAuthUI();
            showToast('Logged out successfully');
            if (window.location.pathname.includes('cart.html') || window.location.pathname.includes('checkout.html')) {
                window.location.href = 'index.html';
            }
        });
    } else {
        authLinks.innerHTML = `
            <a href="login.html" class="hover:text-primary transition-colors">Login</a>
            <span class="text-on-surface-variant">/</span>
            <a href="register.html" class="hover:text-primary transition-colors">Register</a>
        `;
    }
};

// --- Page Specific Logic ---

const loadProducts = async () => {
    const container = document.getElementById('products-container');
    if (!container) return;

    try {
        const params = new URLSearchParams(window.location.search);
        const category = params.get('c');
        
        let url = `${API_URL}/products`;
        if (category) {
            url += `?category=${category}`;
            const titleEl = document.getElementById('category-title');
            if (titleEl) {
                if (category === 'quantum') titleEl.textContent = 'Quantum Collection';
                else titleEl.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            }
        }
        
        const res = await fetch(url);
        allProducts = await res.json();
        renderProducts(allProducts);

        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                const filtered = allProducts.filter(p => 
                    p.name.toLowerCase().includes(query) || 
                    p.description.toLowerCase().includes(query)
                );
                renderProducts(filtered, false);
            });
        }
    } catch (err) {
        container.innerHTML = '<p>Error loading products.</p>';
    }
};

const renderProducts = (productsToRender = allProducts, animate = true) => {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (productsToRender.length === 0) {
        container.innerHTML = '<p class="text-on-surface-variant text-center col-span-full py-xl">No products found.</p>';
        return;
    }
    
    let html = '';
    
    productsToRender.forEach(p => {
        const saleBadge = p.is_sale ? '<div class="absolute top-md left-md z-10 bg-primary-container/10 text-primary-container px-sm py-xs rounded-full font-label-sm text-label-sm border border-primary-container/20 backdrop-blur-md">Sale</div>' : '';
        const priceHtml = p.original_price ? `$${p.price.toFixed(2)} <s class="text-xs text-outline-variant">$${p.original_price.toFixed(2)}</s>` : `$${p.price.toFixed(2)}`;
        
        html += `
        <div class="glass-panel rounded-xl p-md group flex flex-col h-full card-hover relative cursor-pointer product-card" onclick="window.location.href='product.html?id=${p.id}'">
            ${saleBadge}
            <div class="aspect-square rounded-lg overflow-hidden mb-md relative bg-[#1A1D1E] flex items-center justify-center">
                <img class="w-full h-full object-cover mix-blend-screen opacity-90 group-hover:scale-105 transition-transform duration-500" src="${p.image_url}">
            </div>
            <h3 class="font-headline-md text-headline-md text-on-surface mb-xs">${p.name}</h3>
            <p class="font-body-md text-body-md text-on-surface-variant mb-md flex-grow">${p.description.substring(0, 50)}...</p>
            <div class="flex justify-between items-center mt-auto">
                <span class="font-label-md text-label-md text-primary-fixed-dim">${priceHtml}</span>
                <button class="bg-surface-variant/50 hover:bg-primary-container hover:text-black text-on-surface p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0" onclick="event.stopPropagation(); addToCart(${p.id})">
                    <span class="material-symbols-outlined" data-icon="add_shopping_cart">add_shopping_cart</span>
                </button>
            </div>
        </div>`;
    });
    
    container.innerHTML = html;
    
    if (animate && typeof gsap !== 'undefined') {
        gsap.from('.product-card', { y: 50, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" });
    }
};

const renderCart = () => {
    const container = document.getElementById('cart-container');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty. <a href="index.html" style="color:var(--accent)">Go shopping!</a></p>';
        document.getElementById('cart-summary').style.display = 'none';
        return;
    }

    document.getElementById('cart-summary').style.display = 'block';
    
    let html = '<div class="space-y-gutter">';
    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        html += `
        <div class="glass-panel rounded-2xl p-md flex flex-col sm:flex-row items-center gap-md cart-item" data-index="${index}">
            <div class="w-24 h-24 bg-[#1A1D1E] rounded-xl flex-shrink-0 flex items-center justify-center p-2">
                <img src="${item.image_url}" class="w-full h-full object-cover mix-blend-screen">
            </div>
            <div class="flex-grow text-center sm:text-left">
                <h3 class="font-headline-md text-on-surface text-lg mb-1">${item.name}</h3>
                <div class="flex items-center justify-center sm:justify-start space-x-2 mt-2">
                    <button class="text-on-surface-variant hover:text-primary transition-colors minus" data-id="${item.product_id}"><span class="material-symbols-outlined text-sm">remove</span></button>
                    <span class="font-label-md w-4 text-center">${item.quantity}</span>
                    <button class="text-on-surface-variant hover:text-primary transition-colors plus" data-id="${item.product_id}"><span class="material-symbols-outlined text-sm">add</span></button>
                </div>
            </div>
            <div class="font-headline-md text-primary-fixed-dim text-xl">${(item.price * item.quantity).toFixed(2)}</div>
            <button class="text-error hover:text-error-container transition-colors p-2 remove-btn" data-id="${item.product_id}">
                <span class="material-symbols-outlined">delete</span>
            </button>
        </div>`;
    });
    html += '</div>';
    container.innerHTML = html;

    document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;

    // Add event listeners
    document.querySelectorAll('.plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            const item = cart.find(i => i.product_id === id);
            item.quantity++;
            saveCart();
            renderCart();
            updateCartCount();
        });
    });

    document.querySelectorAll('.minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            const item = cart.find(i => i.product_id === id);
            if (item.quantity > 1) {
                item.quantity--;
            } else {
                cart = cart.filter(i => i.product_id !== id);
            }
            saveCart();
            renderCart();
            updateCartCount();
        });
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            const itemElement = e.target.closest('.cart-item');
            
            // GSAP remove animation
            if (typeof gsap !== 'undefined') {
                gsap.to(itemElement, {
                    x: 100, opacity: 0, duration: 0.3, onComplete: () => {
                        cart = cart.filter(i => i.product_id !== id);
                        saveCart();
                        renderCart();
                        updateCartCount();
                    }
                });
            } else {
                cart = cart.filter(i => i.product_id !== id);
                saveCart();
                renderCart();
                updateCartCount();
            }
        });
    });
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.onclick = async () => {
            if (!currentUser) {
                showToast('Please login to checkout', true);
                setTimeout(() => window.location.href = 'login.html', 1500);
                return;
            }

            try {
                checkoutBtn.disabled = true;
                checkoutBtn.textContent = 'Processing...';
                
                const res = await fetch(`${API_URL}/orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentToken}`
                    },
                    body: JSON.stringify({ items: cart, total_price: total })
                });

                if (res.ok) {
                    cart = [];
                    saveCart();
                    updateCartCount();
                    showToast('Order placed successfully!');
                    setTimeout(() => window.location.href = 'index.html', 2000);
                } else {
                    const err = await res.json();
                    showToast(err.error || 'Failed to place order', true);
                    checkoutBtn.disabled = false;
                    checkoutBtn.textContent = 'Checkout';
                }
            } catch (err) {
                showToast('Network error', true);
                checkoutBtn.disabled = false;
                checkoutBtn.textContent = 'Checkout';
            }
        };
    }
};

const handleAuth = () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const res = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    showToast('Logged in successfully');
                    setTimeout(() => window.location.href = 'index.html', 1000);
                } else {
                    showToast(data.error || 'Login failed', true);
                }
            } catch (err) {
                showToast('Network error', true);
            }
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const res = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });
                
                const data = await res.json();
                if (res.ok) {
                    showToast('Registration successful! Please login.');
                    setTimeout(() => window.location.href = 'login.html', 1500);
                } else {
                    showToast(data.error || 'Registration failed', true);
                }
            } catch (err) {
                showToast('Network error', true);
            }
        });
    }
};


const loadProductDetails = async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    const container = document.getElementById('product-details-container');
    if (!container) return;

    try {
        const res = await fetch(`${API_URL}/products/${id}`);
        const product = await res.json();
        
        if (product.error) {
            container.innerHTML = '<p>Product not found.</p>';
            return;
        }

        const priceHtml = product.original_price ? 
            `<span class="font-headline-lg text-headline-lg text-primary-fixed-dim">$${product.price.toFixed(2)}</span>
             <span class="font-body-lg text-body-lg text-outline-variant line-through mb-1">$${product.original_price.toFixed(2)}</span>` : 
            `<span class="font-headline-lg text-headline-lg text-primary-fixed-dim">$${product.price.toFixed(2)}</span>`;

        container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-xl">
            <div class="glass-panel rounded-3xl p-md flex items-center justify-center h-[500px] md:h-[600px] sticky top-32 product-img-cont">
                <img src="${product.image_url}" class="w-full h-full object-cover mix-blend-screen" />
            </div>
            <div class="flex flex-col justify-center product-info-cont">
                <div class="inline-flex items-center space-x-2 bg-primary-container/10 text-primary-container px-sm py-xs rounded-full font-label-sm text-label-sm border border-primary-container/20 mb-md w-max">
                    <span class="material-symbols-outlined text-[14px]">local_shipping</span>
                    <span>In Stock (${product.stock} available)</span>
                </div>
                <h1 class="font-display-lg text-headline-lg md:text-display-lg text-on-surface mb-sm">${product.name}</h1>
                <p class="font-body-lg text-body-lg text-on-surface-variant mb-lg">${product.description}</p>
                <div class="flex items-end space-x-md mb-xl">
                    ${priceHtml}
                </div>
                <div class="flex space-x-md mb-lg">
                    <button class="btn-primary flex-grow font-label-md text-label-md py-4 rounded-full font-bold flex items-center justify-center" onclick="addToCart(${product.id})">
                        <span class="material-symbols-outlined mr-2">shopping_bag</span> Add to Cart
                    </button>
                </div>
            </div>
        </div>`;
        
        if (typeof gsap !== 'undefined') {
            gsap.from('.product-img-cont', { x: -50, opacity: 0, duration: 0.8 });
            gsap.from('.product-info-cont', { x: 50, opacity: 0, duration: 0.8 });
        }
    } catch (err) {
        console.error(err);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Basic setup
    updateCartCount();
    setupAuthUI();
    
    // Page routing
    if (document.getElementById('products-container')) {
        loadProducts();
    }
    if (document.getElementById('product-details-container')) {
        loadProductDetails();
    }
    if (document.getElementById('cart-container')) {
        renderCart();
    }
    
    handleAuth();

    // GSAP global animations (e.g. Nav fade in)
    if (typeof gsap !== 'undefined') {
        gsap.from('nav', { y: -50, opacity: 0, duration: 0.6, ease: "power2.out" });
        gsap.from('.section-title', { opacity: 0, x: -20, duration: 0.6, delay: 0.2 });
    }
});
