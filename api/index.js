let app;
let initError = null;

try {
    app = require('../server');
} catch (e) {
    initError = e;
    console.error('Failed to initialize Express server on Vercel:', e);
}

module.exports = (req, res) => {
    if (initError) {
        return res.status(500).json({
            error: 'Server initialization failed on Vercel',
            details: initError.message,
            stack: initError.stack
        });
    }

    // Preserve original matched path from Vercel edge router if rewritten
    const matchedPath = req.headers['x-matched-path'];
    if (matchedPath && matchedPath.startsWith('/api')) {
        // preserve query string if present
        const queryIndex = req.url.indexOf('?');
        const query = queryIndex !== -1 ? req.url.substring(queryIndex) : '';
        req.url = matchedPath + query;
    }

    return app(req, res);
};
