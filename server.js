require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) return res.status(401).json({ error: "No token provided" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
};

// --- Routes ---

// Register
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const stmt = db.prepare("INSERT INTO Users (username, email, password_hash) VALUES (?, ?, ?)");
        stmt.run([username, email, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: "Username or email already exists" });
                }
                return res.status(500).json({ error: "Database error" });
            }
            res.status(201).json({ id: this.lastID, message: "User registered successfully" });
        });
        stmt.finalize();
    } catch (e) {
        res.status(500).json({ error: "Server error" });
    }
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    db.get("SELECT * FROM Users WHERE email = ?", [email], async (err, user) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!user) return res.status(400).json({ error: "User not found" });

        try {
            const match = await bcrypt.compare(password, user.password_hash);
            if (match) {
                const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
                res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
            } else {
                res.status(400).json({ error: "Invalid credentials" });
            }
        } catch (e) {
            res.status(500).json({ error: "Server error" });
        }
    });
});

// Get all products
app.get('/api/products', (req, res) => {
    const category = req.query.category;
    let query = "SELECT * FROM Products";
    let params = [];
    
    if (category) {
        query += " WHERE category = ?";
        params.push(category);
    }
    
    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get single product
app.get('/api/products/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM Products WHERE id = ?", [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) return res.status(404).json({ error: "Product not found" });
        res.json(row);
    });
});

// Health check endpoint for cloud deployment & monitoring
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Current authenticated user profile
app.get('/api/auth/me', authenticateToken, (req, res) => {
    db.get("SELECT id, username, email FROM Users WHERE id = ?", [req.user.id], (err, user) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!user) return res.status(404).json({ error: "User not found" });

        db.get("SELECT COUNT(*) AS order_count, COALESCE(SUM(total_price), 0) AS total_spent FROM Orders WHERE user_id = ?", [user.id], (err, stats) => {
            const orderCount = stats ? stats.order_count : 0;
            const totalSpent = stats ? stats.total_spent : 0;
            res.json({
                ...user,
                activeOrders: orderCount,
                qPoints: Math.round(totalSpent * 10) + 120
            });
        });
    });
});

// Create order
app.post('/api/orders', authenticateToken, (req, res) => {
    const { items, total_price, shipping_address } = req.body; 
    const user_id = req.user.id;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: "Order must contain items" });
    }

    db.run("BEGIN TRANSACTION");

    const orderStmt = db.prepare("INSERT INTO Orders (user_id, total_price, status) VALUES (?, ?, 'processing')");
    orderStmt.run([user_id, total_price], function(err) {
        if (err) {
            db.run("ROLLBACK");
            return res.status(500).json({ error: "Failed to create order" });
        }
        
        const orderId = this.lastID;
        const itemStmt = db.prepare("INSERT INTO OrderItems (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
        
        let hasError = false;
        items.forEach(item => {
            itemStmt.run([orderId, item.product_id, item.quantity, item.price], (err) => {
                if (err) hasError = true;
            });
        });

        itemStmt.finalize(() => {
            if (hasError) {
                db.run("ROLLBACK");
                return res.status(500).json({ error: "Failed to save order items" });
            }
            db.run("COMMIT");
            res.status(201).json({ 
                message: "Order placed successfully", 
                orderId, 
                orderNumber: `QX-${Math.floor(10000 + Math.random() * 90000)}` 
            });
        });
    });
    orderStmt.finalize();
});

// Get user orders with items & product details
app.get('/api/orders', authenticateToken, (req, res) => {
    const userId = req.user.id;
    db.all("SELECT * FROM Orders WHERE user_id = ? ORDER BY created_at DESC", [userId], (err, orders) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!orders || orders.length === 0) return res.json([]);

        const orderIds = orders.map(o => o.id);
        const placeholders = orderIds.map(() => '?').join(',');

        db.all(`SELECT oi.*, p.name AS product_name, p.image_url AS product_image 
                FROM OrderItems oi 
                LEFT JOIN Products p ON oi.product_id = p.id 
                WHERE oi.order_id IN (${placeholders})`, orderIds, (itemErr, items) => {
            if (itemErr) {
                return res.json(orders.map(o => ({ ...o, items: [] })));
            }

            const itemsByOrder = {};
            items.forEach(item => {
                if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
                itemsByOrder[item.order_id].push(item);
            });

            const enrichedOrders = orders.map(order => ({
                ...order,
                items: itemsByOrder[order.id] || []
            }));

            res.json(enrichedOrders);
        });
    });
});

// Submit support ticket
app.post('/api/support/ticket', (req, res) => {
    const { serial_number, category, description, priority } = req.body;
    if (!description) {
        return res.status(400).json({ error: "Description is required" });
    }

    const stmt = db.prepare("INSERT INTO Tickets (serial_number, category, description, priority) VALUES (?, ?, ?, ?)");
    stmt.run([serial_number || 'N/A', category || 'General Inquiry', description, priority || 'Standard'], function(err) {
        if (err) return res.status(500).json({ error: "Failed to submit ticket" });
        res.status(201).json({ 
            message: "Ticket submitted successfully", 
            ticketId: `TICK-${this.lastID.toString().padStart(4, '0')}` 
        });
    });
    stmt.finalize();
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
