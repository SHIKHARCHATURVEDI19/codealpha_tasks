// Quantum Store - Client Application Engine
// Relative API URL enables seamless local development and live cloud deployment without CORS/mixed-content issues
const API_URL = '/api';

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

const showToast = (message, isError = false) => {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `glass-panel px-4 py-3 rounded-lg border shadow-xl font-label-md transition-all duration-300 pointer-events-auto flex items-center gap-2 ${
        isError ? 'border-error text-error bg-error-container/30' : 'border-primary-container text-primary-container bg-primary-container/15'
    }`;
    
    const icon = isError ? 'error' : 'check_circle';
    toast.innerHTML = `<span class="material-symbols-outlined text-[18px]">${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    if (typeof gsap !== 'undefined') {
        gsap.fromTo(toast, { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3 });
        setTimeout(() => {
            gsap.to(toast, { x: 50, opacity: 0, duration: 0.3, onComplete: () => toast.remove() });
        }, 3200);
    } else {
        setTimeout(() => toast.remove(), 3200);
    }
};

window.addToCart = async (id, quantity = 1) => {
    let product = allProducts.find(p => p.id === id);
    if (!product) {
        try {
            const res = await fetch(`${API_URL}/products/${id}`);
            product = await res.json();
        } catch (e) {
            console.error('Failed to fetch product for cart', e);
        }
    }

    if (!product || product.error) {
        showToast('Could not add product to cart', true);
        return;
    }

    addToCartLogic(product, quantity);
};

const addToCartLogic = (product, quantity = 1) => {
    const existing = cart.find(item => item.product_id === product.id);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image_url: product.image_url
        });
    }
    saveCart();
    updateCartCount();
    showToast(`Added ${product.name} to cart`);

    if (typeof gsap !== 'undefined') {
        gsap.fromTo('.cart-count', { scale: 1.6 }, { scale: 1, duration: 0.35, ease: "back.out(1.8)" });
    }
};

// --- Auth UI Handling ---
const setupAuthUI = () => {
    const authLinksContainers = document.querySelectorAll('#auth-links');
    if (!authLinksContainers.length) return;

    authLinksContainers.forEach(container => {
        if (currentUser) {
            container.innerHTML = `
                <a href="dashboard.html" class="text-on-surface hover:text-primary-container font-semibold transition-colors flex items-center gap-1">
                    <span class="material-symbols-outlined text-[18px]">account_circle</span>
                    <span>Hi, ${currentUser.username}</span>
                </a>
                <button id="logout-btn" class="text-on-surface-variant hover:text-error transition-colors ml-2 font-label-sm">Logout</button>
            `;
            const logoutBtn = container.querySelector('#logout-btn');
            if (logoutBtn) {
                logoutBtn.onclick = (e) => {
                    e.preventDefault();
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    currentUser = null;
                    currentToken = null;
                    setupAuthUI();
                    showToast('Logged out successfully');
                    if (window.location.pathname.includes('dashboard.html') || window.location.pathname.includes('cart.html')) {
                        setTimeout(() => window.location.href = 'index.html', 800);
                    }
                };
            }
        } else {
            container.innerHTML = `
                <a href="login.html" class="text-on-surface-variant hover:text-primary-container transition-colors">Login</a>
                <span class="text-on-surface-variant/40">/</span>
                <a href="register.html" class="text-on-surface-variant hover:text-primary-container transition-colors">Register</a>
            `;
        }
    });
};

// --- Product Catalog (Home & Category Pages) ---
const loadProducts = async () => {
    const container = document.getElementById('products-container');
    if (!container) return;

    try {
        const params = new URLSearchParams(window.location.search);
        const category = params.get('c');

        let url = `${API_URL}/products`;
        if (category) {
            url += `?category=${encodeURIComponent(category)}`;
            const titleEl = document.getElementById('category-title');
            if (titleEl) {
                if (category === 'quantum') titleEl.textContent = 'Quantum Collection';
                else if (category === 'hardware') titleEl.textContent = 'Hardware Innovations';
                else if (category === 'audio') titleEl.textContent = 'Acoustic Engineering';
                else if (category === 'wearables') titleEl.textContent = 'Cybernetic Wearables';
                else titleEl.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            }
        }

        const res = await fetch(url);
        allProducts = await res.json();
        renderProducts(allProducts);

        // Search filtering
        const searchInput = document.getElementById('search-input') || document.querySelector('input[placeholder*="Search products"]');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                const filtered = allProducts.filter(p =>
                    p.name.toLowerCase().includes(query) ||
                    (p.description && p.description.toLowerCase().includes(query)) ||
                    (p.category && p.category.toLowerCase().includes(query))
                );
                renderProducts(filtered, false);
            });
        }
    } catch (err) {
        container.innerHTML = '<p class="text-on-surface-variant text-center col-span-full py-xl">Unable to connect to Quantum Store network.</p>';
    }
};

const renderProducts = (productsToRender = allProducts, animate = true) => {
    const container = document.getElementById('products-container');
    if (!container) return;

    container.innerHTML = '';

    if (!productsToRender || productsToRender.length === 0) {
        container.innerHTML = '<p class="text-on-surface-variant text-center col-span-full py-xl">No products found matching your criteria.</p>';
        return;
    }

    let html = '';
    productsToRender.forEach(p => {
        const saleBadge = p.is_sale ? '<div class="absolute top-3 left-3 z-10 bg-primary-container/20 text-primary-container px-2.5 py-0.5 rounded-full font-label-sm text-[11px] border border-primary-container/30 backdrop-blur-md">Sale</div>' : '';
        const priceHtml = p.original_price
            ? `$${p.price.toFixed(2)} <s class="text-xs text-on-surface-variant/60 ml-1">$${p.original_price.toFixed(2)}</s>`
            : `$${p.price.toFixed(2)}`;

        html += `
        <div class="glass-panel rounded-2xl p-4 group flex flex-col h-full card-hover relative cursor-pointer product-card transition-all duration-300 border border-white/5 hover:border-primary-container/30" onclick="window.location.href='product.html?id=${p.id}'">
            ${saleBadge}
            <div class="aspect-square rounded-xl overflow-hidden mb-4 relative bg-[#0d1114] flex items-center justify-center p-2">
                <img class="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500" src="${p.image_url}" alt="${p.name}" onerror="this.src='assets/keyboard_2K.jpeg'">
            </div>
            <div class="flex items-center gap-1 text-[11px] font-label-sm text-primary-container/70 uppercase tracking-wider mb-1">
                ${p.category || 'Hardware'}
            </div>
            <h3 class="font-headline-md text-base text-on-surface mb-1 font-semibold line-clamp-1">${p.name}</h3>
            <p class="font-body-md text-xs text-on-surface-variant mb-4 flex-grow line-clamp-2">${p.description || ''}</p>
            <div class="flex justify-between items-center mt-auto pt-2 border-t border-white/5">
                <span class="font-headline-md text-primary-container font-bold text-sm">${priceHtml}</span>
                <button class="bg-primary-container/10 hover:bg-primary-container text-primary-container hover:text-[#00363a] p-2 rounded-full transition-all duration-300 active:scale-90" onclick="event.stopPropagation(); addToCart(${p.id})">
                    <span class="material-symbols-outlined text-[18px]" data-icon="add_shopping_cart">add_shopping_cart</span>
                </button>
            </div>
        </div>`;
    });

    container.innerHTML = html;

    if (animate && typeof gsap !== 'undefined') {
        gsap.from('.product-card', { y: 30, opacity: 0, duration: 0.5, stagger: 0.06, ease: "power2.out" });
    }
};

// --- Product Details Page (product.html) ---
const loadProductDetails = async () => {
    const container = document.getElementById('product-details-container');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || 1; // default to first product if none specified

    try {
        const res = await fetch(`${API_URL}/products/${id}`);
        const product = await res.json();

        if (product.error) {
            container.innerHTML = `
                <div class="text-center py-20">
                    <h2 class="font-headline-lg text-on-surface mb-4">Product Not Found</h2>
                    <p class="text-on-surface-variant mb-6">The requested quantum component is currently unavailable.</p>
                    <a href="index.html" class="btn-primary px-8 py-3 rounded-full font-label-md font-bold">Return to Store</a>
                </div>`;
            return;
        }

        const priceHtml = product.original_price
            ? `<div class="flex items-baseline gap-3">
                 <span class="font-headline-lg text-3xl md:text-4xl text-primary-container font-bold">$${product.price.toFixed(2)}</span>
                 <s class="font-body-lg text-on-surface-variant/60 line-through">$${product.original_price.toFixed(2)}</s>
               </div>`
            : `<div class="font-headline-lg text-3xl md:text-4xl text-primary-container font-bold">$${product.price.toFixed(2)}</div>`;

        container.innerHTML = `
        <!-- Breadcrumb -->
        <nav aria-label="Breadcrumb" class="mb-8">
            <ol class="flex items-center gap-2 font-label-sm text-xs text-on-surface-variant">
                <li><a class="hover:text-primary-container transition-colors" href="index.html">Store</a></li>
                <li><span class="material-symbols-outlined text-[14px]">chevron_right</span></li>
                <li><a class="hover:text-primary-container transition-colors capitalize" href="category.html?c=${product.category}">${product.category || 'Hardware'}</a></li>
                <li><span class="material-symbols-outlined text-[14px]">chevron_right</span></li>
                <li class="text-primary-container font-medium">${product.name}</li>
            </ol>
        </nav>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <!-- Product Gallery -->
            <div class="lg:col-span-7 flex flex-col gap-4">
                <div class="glass-panel rounded-2xl aspect-square md:aspect-[4/3] flex items-center justify-center overflow-hidden relative group border border-white/10 p-6 bg-[#0a0e11]">
                    <img id="main-product-img" src="${product.image_url}" alt="${product.name}" class="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" onerror="this.src='assets/keyboard_2K.jpeg'">
                    ${product.is_sale ? '<span class="absolute top-4 left-4 bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Special Offer</span>' : ''}
                </div>
            </div>

            <!-- Product Specs & Buy Box -->
            <div class="lg:col-span-5 flex flex-col gap-6">
                <div>
                    <span class="bg-primary-container/10 text-primary-container font-label-sm text-xs px-3 py-1 rounded-full uppercase tracking-wider border border-primary-container/20 inline-block mb-3">
                        ${product.category ? product.category.toUpperCase() : 'QUANTUM HARDWARE'}
                    </span>
                    <h1 class="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface mb-3">${product.name}</h1>
                    <p class="font-body-md text-on-surface-variant text-sm leading-relaxed mb-4">${product.description}</p>
                    ${priceHtml}
                </div>

                <div class="glass-panel p-4 rounded-xl flex items-center gap-3 border border-white/5">
                    <span class="material-symbols-outlined text-green-400">check_circle</span>
                    <div>
                        <div class="font-label-md text-xs text-on-surface font-semibold">In Stock & Verified</div>
                        <div class="text-[11px] text-on-surface-variant">${product.stock || 45} units available at Central Distribution Hub</div>
                    </div>
                </div>

                <!-- Quantity & Add to Cart -->
                <div class="flex flex-col gap-3">
                    <div class="flex items-center gap-4">
                        <div class="flex items-center bg-surface-container rounded-lg border border-white/10 p-1">
                            <button id="qty-minus" class="px-3 py-2 text-on-surface-variant hover:text-white transition-colors"><span class="material-symbols-outlined text-[16px]">remove</span></button>
                            <input id="product-qty" type="number" value="1" min="1" max="99" class="w-12 bg-transparent text-center font-bold text-on-surface border-none focus:ring-0 p-0 text-sm">
                            <button id="qty-plus" class="px-3 py-2 text-on-surface-variant hover:text-white transition-colors"><span class="material-symbols-outlined text-[16px]">add</span></button>
                        </div>
                        <button id="detail-add-btn" class="flex-grow bg-primary-container text-on-primary-container font-label-md py-3.5 px-6 rounded-xl hover:brightness-110 active:scale-95 transition-all font-bold flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,240,255,0.25)]">
                            <span class="material-symbols-outlined text-[20px]">shopping_cart</span>
                            Add to Cart
                        </button>
                    </div>
                </div>

                <!-- Technical Specs -->
                <div class="border-t border-white/10 pt-6 mt-2">
                    <h3 class="font-headline-md text-sm uppercase tracking-wider text-primary-container font-semibold mb-3">Specifications</h3>
                    <dl class="divide-y divide-white/5 text-xs">
                        <div class="py-2 flex justify-between">
                            <dt class="text-on-surface-variant">Interface Protocol</dt>
                            <dd class="text-on-surface font-medium">PCIe 6.0 / Quantum Bus</dd>
                        </div>
                        <div class="py-2 flex justify-between">
                            <dt class="text-on-surface-variant">Latency</dt>
                            <dd class="text-on-surface font-medium">&lt; 0.1ms Zero-Jitter</dd>
                        </div>
                        <div class="py-2 flex justify-between">
                            <dt class="text-on-surface-variant">Warranty</dt>
                            <dd class="text-on-surface font-medium">Lifetime Performance Guarantee</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>`;

        // Wire quantity selectors and Add to Cart
        const qtyInput = document.getElementById('product-qty');
        document.getElementById('qty-minus').onclick = () => {
            let val = parseInt(qtyInput.value) || 1;
            if (val > 1) qtyInput.value = val - 1;
        };
        document.getElementById('qty-plus').onclick = () => {
            let val = parseInt(qtyInput.value) || 1;
            qtyInput.value = val + 1;
        };
        document.getElementById('detail-add-btn').onclick = () => {
            const qty = parseInt(qtyInput.value) || 1;
            window.addToCart(product.id, qty);
        };

    } catch (err) {
        console.error('Error loading product details:', err);
    }
};

// --- Shopping Cart & Checkout (cart.html) ---
const renderCart = () => {
    const container = document.getElementById('cart-container');
    if (!container) return;

    const summaryContainer = document.getElementById('cart-summary');
    const emptyState = document.getElementById('cart-empty-state');

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                <span class="material-symbols-outlined text-6xl text-on-surface-variant/40 mb-4">remove_shopping_cart</span>
                <h3 class="font-headline-md text-xl text-on-surface mb-2">Your Cart is Empty</h3>
                <p class="font-body-md text-on-surface-variant text-sm mb-6 max-w-sm">You haven't added any quantum components to your rig yet.</p>
                <a href="index.html#products-container" class="bg-primary-container text-on-primary-container font-label-md px-6 py-3 rounded-lg font-bold hover:brightness-110 transition-all">
                    Explore Latest Drops
                </a>
            </div>`;
        if (summaryContainer) summaryContainer.style.display = 'none';
        return;
    }

    if (summaryContainer) summaryContainer.style.display = 'block';

    let subtotal = 0;
    let html = '<div class="space-y-4">';

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        html += `
        <div class="glass-panel rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 border border-white/5 cart-item" data-id="${item.product_id}">
            <div class="w-20 h-20 bg-[#0d1114] rounded-lg flex-shrink-0 flex items-center justify-center p-2 border border-white/5">
                <img src="${item.image_url}" alt="${item.name}" class="w-full h-full object-contain" onerror="this.src='assets/keyboard_2K.jpeg'">
            </div>
            <div class="flex-grow text-center sm:text-left">
                <h3 class="font-headline-md text-on-surface text-base font-semibold mb-1">${item.name}</h3>
                <div class="text-xs text-primary-container font-medium">$${item.price.toFixed(2)} each</div>
                <div class="flex items-center justify-center sm:justify-start gap-2 mt-2">
                    <button class="bg-surface-container hover:bg-white/10 text-on-surface p-1 rounded transition-colors minus" data-id="${item.product_id}">
                        <span class="material-symbols-outlined text-[14px]">remove</span>
                    </button>
                    <span class="font-label-md text-xs px-2 min-w-[24px] text-center">${item.quantity}</span>
                    <button class="bg-surface-container hover:bg-white/10 text-on-surface p-1 rounded transition-colors plus" data-id="${item.product_id}">
                        <span class="material-symbols-outlined text-[14px]">add</span>
                    </button>
                </div>
            </div>
            <div class="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                <div class="font-headline-md text-primary-container font-bold text-lg">$${itemTotal.toFixed(2)}</div>
                <button class="text-error/80 hover:text-error transition-colors p-1 remove-btn" data-id="${item.product_id}" title="Remove Item">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>
            </div>
        </div>`;
    });

    html += '</div>';
    container.innerHTML = html;

    // Financial calculations
    const shipping = subtotal > 500 || subtotal === 0 ? 0 : 25;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    const subtotalEl = document.getElementById('cart-subtotal');
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;

    const shippingEl = document.getElementById('cart-shipping');
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Free (Sub-orbital)' : `$${shipping.toFixed(2)}`;

    const taxEl = document.getElementById('cart-tax');
    if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;

    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

    // Quantity events
    container.querySelectorAll('.plus').forEach(btn => {
        btn.onclick = () => {
            const id = parseInt(btn.dataset.id);
            const item = cart.find(i => i.product_id === id);
            if (item) {
                item.quantity++;
                saveCart();
                renderCart();
                updateCartCount();
            }
        };
    });

    container.querySelectorAll('.minus').forEach(btn => {
        btn.onclick = () => {
            const id = parseInt(btn.dataset.id);
            const item = cart.find(i => i.product_id === id);
            if (item) {
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    cart = cart.filter(i => i.product_id !== id);
                }
                saveCart();
                renderCart();
                updateCartCount();
            }
        };
    });

    container.querySelectorAll('.remove-btn').forEach(btn => {
        btn.onclick = () => {
            const id = parseInt(btn.dataset.id);
            cart = cart.filter(i => i.product_id !== id);
            saveCart();
            renderCart();
            updateCartCount();
            showToast('Item removed from cart');
        };
    });

    // Checkout submission
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.onclick = async () => {
            if (!currentUser) {
                showToast('Please log in to complete your checkout', true);
                setTimeout(() => window.location.href = 'login.html?redirect=cart.html', 1200);
                return;
            }

            if (cart.length === 0) {
                showToast('Your cart is empty', true);
                return;
            }

            try {
                checkoutBtn.disabled = true;
                checkoutBtn.innerHTML = '<span class="material-symbols-outlined animate-spin mr-2">sync</span> Processing...';

                const res = await fetch(`${API_URL}/orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentToken}`
                    },
                    body: JSON.stringify({
                        items: cart,
                        total_price: total
                    })
                });

                const data = await res.json();
                if (res.ok) {
                    cart = [];
                    saveCart();
                    updateCartCount();
                    showToast(`Order #${data.orderNumber || data.orderId} placed successfully!`);
                    setTimeout(() => window.location.href = 'dashboard.html', 1500);
                } else {
                    showToast(data.error || 'Failed to place order', true);
                    checkoutBtn.disabled = false;
                    checkoutBtn.innerHTML = '<span class="material-symbols-outlined">lock</span> Complete Purchase';
                }
            } catch (err) {
                showToast('Network error while processing order', true);
                checkoutBtn.disabled = false;
                checkoutBtn.innerHTML = '<span class="material-symbols-outlined">lock</span> Complete Purchase';
            }
        };
    }
};

// --- User Dashboard (dashboard.html) ---
const loadDashboard = async () => {
    const ordersContainer = document.getElementById('orders-stream-container');
    const userNameEl = document.getElementById('user-name');
    const activeOrdersEl = document.getElementById('active-orders-count');
    const qPointsEl = document.getElementById('user-points');

    if (!currentUser) {
        if (userNameEl) userNameEl.textContent = 'Welcome, Guest';
        if (ordersContainer) {
            ordersContainer.innerHTML = `
                <div class="glass-card rounded-xl p-8 text-center">
                    <span class="material-symbols-outlined text-5xl text-primary-container mb-3">lock</span>
                    <h3 class="font-headline-md text-lg text-on-surface mb-2">Authentication Required</h3>
                    <p class="text-on-surface-variant text-sm mb-4">Please log in with your Quantum credentials to track your orders and telemetry.</p>
                    <a href="login.html" class="inline-block bg-primary-container text-on-primary-container px-6 py-2.5 rounded-lg font-bold text-sm hover:brightness-110 transition-all">Sign In</a>
                </div>`;
        }
        return;
    }

    if (userNameEl) userNameEl.textContent = `Welcome back, ${currentUser.username}`;

    try {
        // Fetch user profile metrics
        const meRes = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        if (meRes.ok) {
            const meData = await meRes.json();
            if (activeOrdersEl) activeOrdersEl.textContent = meData.activeOrders || '0';
            if (qPointsEl) qPointsEl.textContent = meData.qPoints ? `${(meData.qPoints / 1000).toFixed(1)}k` : '1.2k';
        }

        // Fetch user real orders
        if (ordersContainer) {
            const ordersRes = await fetch(`${API_URL}/orders`, {
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });
            if (ordersRes.ok) {
                const orders = await ordersRes.json();
                if (!orders || orders.length === 0) {
                    ordersContainer.innerHTML = `
                        <div class="glass-card rounded-xl p-8 text-center">
                            <span class="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2">package_2</span>
                            <h4 class="text-on-surface font-semibold mb-1">No Orders Yet</h4>
                            <p class="text-on-surface-variant text-xs mb-4">Your order stream is currently synchronized and idle.</p>
                            <a href="index.html#products-container" class="text-primary-container text-xs hover:underline">Browse Products &rarr;</a>
                        </div>`;
                } else {
                    let ordersHtml = '';
                    orders.forEach(order => {
                        const dateFormatted = new Date(order.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                        });

                        const itemsList = order.items && order.items.length > 0 ? order.items.map(i => `
                            <div class="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                                <img src="${i.product_image || 'assets/keyboard_2K.jpeg'}" class="w-10 h-10 object-contain rounded bg-[#0b0f12] p-1 border border-white/5" onerror="this.src='assets/keyboard_2K.jpeg'">
                                <div class="flex-grow">
                                    <div class="text-xs font-medium text-on-surface">${i.product_name || 'Quantum Component'}</div>
                                    <div class="text-[11px] text-on-surface-variant">Qty: ${i.quantity} &times; $${i.price.toFixed(2)}</div>
                                </div>
                            </div>
                        `).join('') : '<div class="text-xs text-on-surface-variant">Standard Quantum Kit</div>';

                        ordersHtml += `
                        <div class="glass-card rounded-xl p-5 mb-4 border border-white/5 hover:border-primary-container/30 transition-all">
                            <div class="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-white/5">
                                <div>
                                    <span class="font-headline-md text-sm font-bold text-on-surface">Order #QX-${order.id.toString().padStart(5, '0')}</span>
                                    <span class="text-on-surface-variant text-xs ml-2">• ${dateFormatted}</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="text-primary-container font-bold text-sm">$${order.total_price.toFixed(2)}</span>
                                    <span class="bg-primary-container/10 text-primary-container border border-primary-container/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1">
                                        <span class="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
                                        ${order.status || 'Processing'}
                                    </span>
                                </div>
                            </div>
                            <div class="space-y-1">
                                ${itemsList}
                            </div>
                        </div>`;
                    });
                    ordersContainer.innerHTML = ordersHtml;
                }
            }
        }
    } catch (e) {
        console.error('Failed to load dashboard telemetry:', e);
    }
};

// --- Authentication Pages (login.html, register.html) ---
const handleAuth = () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
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
                    showToast(`Welcome back, ${data.user.username}!`);

                    const params = new URLSearchParams(window.location.search);
                    const redirect = params.get('redirect') || 'dashboard.html';
                    setTimeout(() => window.location.href = redirect, 900);
                } else {
                    showToast(data.error || 'Invalid credentials', true);
                }
            } catch (err) {
                showToast('Network connection failed', true);
            }
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            try {
                const res = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await res.json();
                if (res.ok) {
                    showToast('Node registered successfully! Please log in.');
                    setTimeout(() => window.location.href = 'login.html', 1100);
                } else {
                    showToast(data.error || 'Registration failed', true);
                }
            } catch (err) {
                showToast('Network error during registration', true);
            }
        });
    }
};

// --- Support Ticket Submission (support.html) ---
const handleSupport = () => {
    const supportForm = document.querySelector('form[action="#"]') || document.querySelector('section.glass-panel form');
    if (supportForm) {
        supportForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = supportForm.querySelector('button[type="submit"]');
            const serialInput = supportForm.querySelector('input[placeholder*="QNT"]');
            const categorySelect = supportForm.querySelector('select');
            const descInput = supportForm.querySelector('textarea');
            const prioritySelect = document.querySelector('select:has(option:contains("Urgent"))') || document.querySelector('main select');

            const serial_number = serialInput ? serialInput.value.trim() : '';
            const category = categorySelect ? categorySelect.value : 'Diagnostics';
            const description = descInput ? descInput.value.trim() : '';
            const priority = prioritySelect ? prioritySelect.value : 'Standard';

            if (!description) {
                showToast('Please describe your issue or anomaly', true);
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Transmitting...';
            }

            try {
                const res = await fetch(`${API_URL}/support/ticket`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ serial_number, category, description, priority })
                });

                const data = await res.json();
                if (res.ok) {
                    showToast(`Ticket ${data.ticketId || ''} Synchronized! Engineers notified.`);
                    supportForm.reset();
                    if (submitBtn) {
                        submitBtn.textContent = 'Ticket Synchronized';
                        setTimeout(() => {
                            submitBtn.textContent = 'Submit Ticket';
                            submitBtn.disabled = false;
                        }, 2500);
                    }
                } else {
                    showToast(data.error || 'Submission failed', true);
                    if (submitBtn) submitBtn.disabled = false;
                }
            } catch (err) {
                showToast('Network error transmitting ticket', true);
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }
};

// --- Initialize Everything ---
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    setupAuthUI();

    if (document.getElementById('products-container')) {
        loadProducts();
    }
    if (document.getElementById('product-details-container')) {
        loadProductDetails();
    }
    if (document.getElementById('cart-container')) {
        renderCart();
    }
    if (document.getElementById('orders-stream-container') || document.getElementById('user-name')) {
        loadDashboard();
    }

    handleAuth();
    handleSupport();

    // GSAP page transitions if library is available
    if (typeof gsap !== 'undefined') {
        gsap.from('nav', { y: -30, opacity: 0, duration: 0.5, ease: "power2.out" });
    }
});
