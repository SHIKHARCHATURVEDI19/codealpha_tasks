require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
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

// Create order
app.post('/api/orders', authenticateToken, (req, res) => {
    const { items, total_price } = req.body; 
    // items should be an array of { product_id, quantity, price }
    const user_id = req.user.id;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: "Order must contain items" });
    }

    db.run("BEGIN TRANSACTION");

    const orderStmt = db.prepare("INSERT INTO Orders (user_id, total_price) VALUES (?, ?)");
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
            res.status(201).json({ message: "Order placed successfully", orderId });
        });
    });
    orderStmt.finalize();
});

// Get user orders
app.get('/api/orders', authenticateToken, (req, res) => {
    db.all("SELECT * FROM Orders WHERE user_id = ? ORDER BY created_at DESC", [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
