const apiRoutes = require('express').Router();
const { response } = require('../helper');

// API Routes
apiRoutes.get('/accept-cookie', (req, res) => {
    const expiryTime = 2592000000; // in MS = 30 Days
    res.cookie('cookie_accepted', true, { expire: expiryTime + Date.now() });
    const data = {
        is_cookie_accepted: true
    }
    res.status(200).send(response(true, data, 'Cookies saved'));
});

apiRoutes.post('/accept', (req, res, next) => {
    res.send(req.body.email);
});

module.exports = apiRoutes;