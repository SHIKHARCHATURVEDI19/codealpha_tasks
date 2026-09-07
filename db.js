const path = require('path');
const fs = require('fs');

const seedProducts = [
    { id: 1, name: 'Quantum Keyboard', description: 'A mechanical keyboard with quantum switches for zero latency and ultra-crisp tactile actuation.', price: 99.99, original_price: 129.99, is_sale: 1, image_url: 'assets/keyboard_2K.jpeg', stock: 50, category: 'hardware' },
    { id: 2, name: 'Aetherium X7 GPU', description: 'Next-generation neural architecture graphics processor with dedicated ray-tracing and holographic rendering.', price: 2499.00, original_price: null, is_sale: 0, image_url: 'assets/gpu_aetherium_x7.jpg', stock: 15, category: 'hardware' },
    { id: 3, name: 'Aethel Gen 5 Quantum Storage 4TB', description: 'Ultra-fast PCIe Gen 5 NVMe SSD with composite graphene heatsink and 14,000 MB/s read speeds.', price: 899.00, original_price: 999.00, is_sale: 1, image_url: 'assets/ssd_aethel_gen5.jpg', stock: 40, category: 'hardware' },
    { id: 4, name: 'Cryo-Link Cooler Pro', description: 'Paramagnetic cryogenic liquid cooling hub with integrated cyan ring LED and smart thermal regulation.', price: 420.00, original_price: null, is_sale: 0, image_url: 'assets/cooler_quantum_c.jpg', stock: 35, category: 'hardware' },
    { id: 5, name: 'Neon Headphones', description: 'Wireless over-ear headphones with active noise cancellation and neon accents.', price: 199.99, original_price: null, is_sale: 0, image_url: 'assets/Wireless_headphones_in_studio_202607191442.jpeg', stock: 30, category: 'audio' },
    { id: 6, name: 'Stellar Smartwatch', description: 'Track your health and time with the latest stellar-core technology and biometric sensors.', price: 199.99, original_price: 249.99, is_sale: 1, image_url: 'assets/Smartwatch_showing_health_metrics_202607191442.jpeg', stock: 100, category: 'wearables' },
    { id: 7, name: 'Aero Mouse', description: 'Ergonomic wireless mouse designed for long creative sessions.', price: 59.99, original_price: null, is_sale: 0, image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80', stock: 200, category: 'hardware' },
    { id: 8, name: 'Zen Desk Lamp', description: 'Adjustable LED desk lamp with multiple color temperatures.', price: 35.00, original_price: 45.00, is_sale: 1, image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80', stock: 75, category: 'quantum' },
    { id: 9, name: 'Echo Speaker', description: 'Portable bluetooth speaker with 360-degree sound and waterproof design.', price: 89.99, original_price: null, is_sale: 0, image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80', stock: 40, category: 'audio' },
    { id: 10, name: 'Astra Audio Earbuds', description: 'True wireless earbuds with neon accents and an illuminated charging case.', price: 149.99, original_price: null, is_sale: 0, image_url: 'assets/Earbuds_and_charging_case_resting_202607191442.jpeg', stock: 50, category: 'audio' },
    { id: 11, name: 'Auroba Over-Ear Headphones', description: 'Premium over-ear headphones with active noise cancellation and a sleek matte finish.', price: 249.99, original_price: 299.99, is_sale: 1, image_url: 'assets/Wireless_headphones_in_studio_202607191442.jpeg', stock: 30, category: 'quantum' },
    { id: 12, name: 'Classic Leather Smartwatch', description: 'Advanced fitness tracking smartwatch with a premium leather strap.', price: 199.99, original_price: null, is_sale: 0, image_url: 'assets/Smartwatch_showing_health_metrics_202607191442.jpeg', stock: 40, category: 'wearables' },
    { id: 13, name: 'Cybertech Split Keyboard', description: 'Split ergonomic mechanical keyboard with customizable RGB backlighting.', price: 179.99, original_price: 199.99, is_sale: 1, image_url: 'assets/keyboard_2K.jpeg', stock: 20, category: 'quantum' }
];

let db = null;
let useFallback = false;

try {
    const sqlite3 = require('sqlite3').verbose();
    const isVercel = process.env.VERCEL || process.env.NOW_REGION || process.env.AWS_LAMBDA_FUNCTION_NAME;
    const localDbPath = path.resolve(__dirname, 'database_v2.sqlite');
    let dbPath = localDbPath;

    if (isVercel) {
        const tmpDbPath = path.join('/tmp', 'database_v2.sqlite');
        if (!fs.existsSync(tmpDbPath) && fs.existsSync(localDbPath)) {
            try {
                fs.copyFileSync(localDbPath, tmpDbPath);
            } catch (e) {
                console.error('Failed copying database to /tmp', e);
            }
        }
        dbPath = fs.existsSync(tmpDbPath) ? tmpDbPath : localDbPath;
    }

    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('SQLite database initialization error, using fallback store:', err.message);
            useFallback = true;
        } else {
            db.serialize(() => {
                db.run(`CREATE TABLE IF NOT EXISTS Users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE,
                    email TEXT UNIQUE,
                    password_hash TEXT
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS Products (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    description TEXT,
                    price REAL,
                    original_price REAL,
                    is_sale INTEGER DEFAULT 0,
                    image_url TEXT,
                    stock INTEGER,
                    category TEXT
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS Orders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    total_price REAL,
                    status TEXT DEFAULT 'pending',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES Users(id)
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS OrderItems (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    order_id INTEGER,
                    product_id INTEGER,
                    quantity INTEGER,
                    price REAL,
                    FOREIGN KEY (order_id) REFERENCES Orders(id),
                    FOREIGN KEY (product_id) REFERENCES Products(id)
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS Tickets (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    serial_number TEXT,
                    category TEXT,
                    description TEXT,
                    priority TEXT DEFAULT 'Standard',
                    status TEXT DEFAULT 'Open',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`);

                // Seed products
                db.get("SELECT COUNT(*) AS count FROM Products", (err, row) => {
                    if (!row || row.count === 0) {
                        const stmt = db.prepare("INSERT INTO Products (name, description, price, original_price, is_sale, image_url, stock, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                        seedProducts.forEach(p => stmt.run([p.name, p.description, p.price, p.original_price, p.is_sale, p.image_url, p.stock, p.category]));
                        stmt.finalize();
                    } else {
                        const checkStmt = db.prepare("SELECT id FROM Products WHERE name = ?");
                        const insertStmt = db.prepare("INSERT INTO Products (name, description, price, original_price, is_sale, image_url, stock, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                        seedProducts.forEach(p => {
                            checkStmt.get([p.name], (err, r) => {
                                if (!r) {
                                    insertStmt.run([p.name, p.description, p.price, p.original_price, p.is_sale, p.image_url, p.stock, p.category]);
                                }
                            });
                        });
                    }
                });
            });
        }
    });

} catch (nativeError) {
    console.warn('Native sqlite3 module could not be loaded in serverless container, switching to memory store fallback:', nativeError.message);
    useFallback = true;
}

// Memory Store Fallback for serverless environments where native C++ binaries are restricted
const memoryData = {
    users: [],
    products: [...seedProducts],
    orders: [],
    orderItems: [],
    tickets: [],
    userIdCounter: 1,
    orderIdCounter: 1,
    ticketIdCounter: 1
};

const fallbackDb = {
    get: (query, params, cb) => {
        if (typeof params === 'function') { cb = params; params = []; }
        params = params || [];

        if (query.includes('FROM Users WHERE email = ?')) {
            const user = memoryData.users.find(u => u.email === params[0]);
            return cb(null, user ? { ...user } : null);
        }
        if (query.includes('FROM Users WHERE id = ?')) {
            const user = memoryData.users.find(u => u.id === params[0]);
            return cb(null, user ? { ...user } : null);
        }
        if (query.includes('FROM Products WHERE id = ?')) {
            const prod = memoryData.products.find(p => p.id === parseInt(params[0]));
            return cb(null, prod ? { ...prod } : null);
        }
        if (query.includes('COUNT(*) AS order_count')) {
            const userOrders = memoryData.orders.filter(o => o.user_id === params[0]);
            const total = userOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
            return cb(null, { order_count: userOrders.length, total_spent: total });
        }
        return cb(null, null);
    },

    all: (query, params, cb) => {
        if (typeof params === 'function') { cb = params; params = []; }
        params = params || [];

        if (query.includes('FROM Products')) {
            if (query.includes('WHERE category = ?')) {
                const filtered = memoryData.products.filter(p => p.category === params[0]);
                return cb(null, filtered);
            }
            return cb(null, [...memoryData.products]);
        }
        if (query.includes('FROM Orders WHERE user_id = ?')) {
            const userOrders = memoryData.orders.filter(o => o.user_id === params[0]);
            return cb(null, [...userOrders].reverse());
        }
        if (query.includes('FROM OrderItems oi')) {
            const orderIds = params.map(id => parseInt(id));
            const items = memoryData.orderItems
                .filter(item => orderIds.includes(item.order_id))
                .map(item => {
                    const prod = memoryData.products.find(p => p.id === item.product_id) || {};
                    return {
                        ...item,
                        product_name: prod.name || 'Component',
                        product_image: prod.image_url || 'assets/keyboard_2K.jpeg'
                    };
                });
            return cb(null, items);
        }
        return cb(null, []);
    },

    run: (query, params, cb) => {
        if (typeof params === 'function') { cb = params; params = []; }
        if (cb) cb.call({ lastID: 1 }, null);
    },

    prepare: (query) => {
        return {
            run: function (params, cb) {
                params = params || [];
                let lastID = 1;

                if (query.includes('INSERT INTO Users')) {
                    const exists = memoryData.users.some(u => u.username === params[0] || u.email === params[1]);
                    if (exists) {
                        const err = new Error('UNIQUE constraint failed: Users.email');
                        if (cb) return cb(err);
                        return;
                    }
                    lastID = memoryData.userIdCounter++;
                    memoryData.users.push({
                        id: lastID,
                        username: params[0],
                        email: params[1],
                        password_hash: params[2]
                    });
                } else if (query.includes('INSERT INTO Orders')) {
                    lastID = memoryData.orderIdCounter++;
                    memoryData.orders.push({
                        id: lastID,
                        user_id: params[0],
                        total_price: params[1],
                        status: 'processing',
                        created_at: new Date().toISOString()
                    });
                } else if (query.includes('INSERT INTO OrderItems')) {
                    memoryData.orderItems.push({
                        id: memoryData.orderItems.length + 1,
                        order_id: params[0],
                        product_id: params[1],
                        quantity: params[2],
                        price: params[3]
                    });
                } else if (query.includes('INSERT INTO Tickets')) {
                    lastID = memoryData.ticketIdCounter++;
                    memoryData.tickets.push({
                        id: lastID,
                        serial_number: params[0],
                        category: params[1],
                        description: params[2],
                        priority: params[3],
                        status: 'Open',
                        created_at: new Date().toISOString()
                    });
                }

                if (cb) cb.call({ lastID }, null);
            },
            get: function(params, cb) {
                fallbackDb.get(query, params, cb);
            },
            finalize: function (cb) {
                if (cb) cb();
            }
        };
    },

    serialize: (fn) => { if (fn) fn(); }
};

// Proxy export to seamlessly use sqlite3 when available or fallback store when serverless
module.exports = new Proxy({}, {
    get: (target, prop) => {
        if (!useFallback && db && typeof db[prop] === 'function') {
            return db[prop].bind(db);
        }
        return fallbackDb[prop] || (() => {});
    }
});
