const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database_v2.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Initialize tables
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

            // Seed initial mock products
            const seedProducts = [
                ['Quantum Keyboard', 'A mechanical keyboard with quantum switches for zero latency and ultra-crisp tactile actuation.', 99.99, 129.99, 1, 'assets/keyboard_2K.jpeg', 50, 'hardware'],
                ['Aetherium X7 GPU', 'Next-generation neural architecture graphics processor with dedicated ray-tracing and holographic rendering.', 2499.00, null, 0, 'assets/gpu_aetherium_x7.jpg', 15, 'hardware'],
                ['Aethel Gen 5 Quantum Storage 4TB', 'Ultra-fast PCIe Gen 5 NVMe SSD with composite graphene heatsink and 14,000 MB/s read speeds.', 899.00, 999.00, 1, 'assets/ssd_aethel_gen5.jpg', 40, 'hardware'],
                ['Cryo-Link Cooler Pro', 'Paramagnetic cryogenic liquid cooling hub with integrated cyan ring LED and smart thermal regulation.', 420.00, null, 0, 'assets/cooler_quantum_c.jpg', 35, 'hardware'],
                ['Neon Headphones', 'Wireless over-ear headphones with active noise cancellation and neon accents.', 199.99, null, 0, 'assets/Wireless_headphones_in_studio_202607191442.jpeg', 30, 'audio'],
                ['Stellar Smartwatch', 'Track your health and time with the latest stellar-core technology and biometric sensors.', 199.99, 249.99, 1, 'assets/Smartwatch_showing_health_metrics_202607191442.jpeg', 100, 'wearables'],
                ['Aero Mouse', 'Ergonomic wireless mouse designed for long creative sessions.', 59.99, null, 0, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80', 200, 'hardware'],
                ['Zen Desk Lamp', 'Adjustable LED desk lamp with multiple color temperatures.', 35.00, 45.00, 1, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80', 75, 'quantum'],
                ['Echo Speaker', 'Portable bluetooth speaker with 360-degree sound and waterproof design.', 89.99, null, 0, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80', 40, 'audio'],
                ['Astra Audio Earbuds', 'True wireless earbuds with neon accents and an illuminated charging case.', 149.99, null, 0, 'assets/Earbuds_and_charging_case_resting_202607191442.jpeg', 50, 'audio'],
                ['Auroba Over-Ear Headphones', 'Premium over-ear headphones with active noise cancellation and a sleek matte finish.', 249.99, 299.99, 1, 'assets/Wireless_headphones_in_studio_202607191442.jpeg', 30, 'quantum'],
                ['Classic Leather Smartwatch', 'Advanced fitness tracking smartwatch with a premium leather strap.', 199.99, null, 0, 'assets/Smartwatch_showing_health_metrics_202607191442.jpeg', 40, 'wearables'],
                ['Cybertech Split Keyboard', 'Split ergonomic mechanical keyboard with customizable RGB backlighting.', 179.99, 199.99, 1, 'assets/keyboard_2K.jpeg', 20, 'quantum']
            ];

            db.get("SELECT COUNT(*) AS count FROM Products", (err, row) => {
                if (!row || row.count === 0) {
                    const stmt = db.prepare("INSERT INTO Products (name, description, price, original_price, is_sale, image_url, stock, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                    seedProducts.forEach(p => stmt.run(p));
                    stmt.finalize();
                    console.log('Mock products seeded.');
                } else {
                    // Check if new products (like GPU, SSD, Cooler) are in DB, if not add them
                    const checkStmt = db.prepare("SELECT id FROM Products WHERE name = ?");
                    const insertStmt = db.prepare("INSERT INTO Products (name, description, price, original_price, is_sale, image_url, stock, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                    seedProducts.forEach(p => {
                        checkStmt.get([p[0]], (err, r) => {
                            if (!r) {
                                insertStmt.run(p);
                                console.log(`Seeded new product: ${p[0]}`);
                            }
                        });
                    });
                }
            });
        });
    }
});

module.exports = db;
