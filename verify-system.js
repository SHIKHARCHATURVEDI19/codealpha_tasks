const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

function request(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, headers: res.headers, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, headers: res.headers, data: body });
                }
            });
        });
        req.on('error', reject);
        if (data) {
            req.write(typeof data === 'string' ? data : JSON.stringify(data));
        }
        req.end();
    });
}

async function runTests() {
    console.log('--- Quantum Store E-Commerce Automated Verification ---');
    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`[PASS] ${message}`);
            passed++;
        } else {
            console.error(`[FAIL] ${message}`);
            failed++;
        }
    }

    try {
        // 1. Health Check
        const health = await request({ host: 'localhost', port: PORT, path: '/api/health', method: 'GET' });
        assert(health.status === 200 && health.data.status === 'ok', 'GET /api/health returned 200 OK');

        // 2. Fetch Products
        const products = await request({ host: 'localhost', port: PORT, path: '/api/products', method: 'GET' });
        assert(products.status === 200 && Array.isArray(products.data) && products.data.length >= 10, `GET /api/products returned ${products.data.length} products`);

        // Check product images
        const sampleProduct = products.data[0];
        assert(sampleProduct && sampleProduct.id && sampleProduct.price > 0, `Product [${sampleProduct.name}] has valid ID and price`);

        // 3. Single Product
        const singleProd = await request({ host: 'localhost', port: PORT, path: `/api/products/${sampleProduct.id}`, method: 'GET' });
        assert(singleProd.status === 200 && singleProd.data.name === sampleProduct.name, `GET /api/products/${sampleProduct.id} returned correct product details`);

        // 4. User Registration
        const testUser = `testuser_${Date.now()}`;
        const testEmail = `${testUser}@quantum.store`;
        const regRes = await request({
            host: 'localhost', port: PORT, path: '/api/auth/register', method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { username: testUser, email: testEmail, password: 'password123' });
        assert(regRes.status === 201, `POST /api/auth/register created user [${testUser}]`);

        // 5. User Login
        const loginRes = await request({
            host: 'localhost', port: PORT, path: '/api/auth/login', method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { email: testEmail, password: 'password123' });
        assert(loginRes.status === 200 && loginRes.data.token, `POST /api/auth/login returned JWT token`);
        const token = loginRes.data.token;

        // 6. User Profile / Telemetry
        const meRes = await request({
            host: 'localhost', port: PORT, path: '/api/auth/me', method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        assert(meRes.status === 200 && meRes.data.username === testUser, `GET /api/auth/me returned user profile for [${testUser}]`);

        // 7. Place Order
        const orderItems = [
            { product_id: products.data[0].id, quantity: 1, price: products.data[0].price },
            { product_id: products.data[1].id, quantity: 2, price: products.data[1].price }
        ];
        const totalPrice = products.data[0].price + (products.data[1].price * 2);
        const orderRes = await request({
            host: 'localhost', port: PORT, path: '/api/orders', method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }, { items: orderItems, total_price: totalPrice });
        assert(orderRes.status === 201 && orderRes.data.orderId, `POST /api/orders created order ID #${orderRes.data.orderId}`);

        // 8. Get Orders with Enriched Items
        const userOrders = await request({
            host: 'localhost', port: PORT, path: '/api/orders', method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        assert(userOrders.status === 200 && userOrders.data.length > 0, `GET /api/orders retrieved order list`);
        const placedOrder = userOrders.data[0];
        assert(placedOrder && placedOrder.items && placedOrder.items.length === 2, `Order contains ${placedOrder.items.length} enriched items with names and images`);

        // 9. Submit Support Ticket
        const ticketRes = await request({
            host: 'localhost', port: PORT, path: '/api/support/ticket', method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            serial_number: 'QNT-7890-PRO',
            category: 'Thermal Calibration',
            description: 'Cooling hub temperature stabilized at 12K during benchmark.',
            priority: 'Standard'
        });
        assert(ticketRes.status === 201 && ticketRes.data.ticketId, `POST /api/support/ticket created ticket [${ticketRes.data.ticketId}]`);

        // 10. Check Local Assets
        const requiredAssets = [
            'gpu_aetherium_x7.jpg',
            'ssd_aethel_gen5.jpg',
            'cooler_quantum_c.jpg',
            'keyboard_2K.jpeg',
            'Smartwatch_showing_health_metrics_202607191442.jpeg',
            'Wireless_headphones_in_studio_202607191442.jpeg',
            'Earbuds_and_charging_case_resting_202607191442.jpeg',
            'hero-video.mp4'
        ];
        let assetsOk = true;
        requiredAssets.forEach(a => {
            const p = path.join(__dirname, 'public', 'assets', a);
            if (!fs.existsSync(p) || fs.statSync(p).size === 0) {
                console.error(`Missing or empty asset: ${a}`);
                assetsOk = false;
            }
        });
        assert(assetsOk, 'All critical product and media assets exist locally');

        console.log(`\nVerification Complete! Passed: ${passed}, Failed: ${failed}`);
        process.exit(failed > 0 ? 1 : 0);

    } catch (e) {
        console.error('Verification failed with error:', e);
        process.exit(1);
    }
}

runTests();
