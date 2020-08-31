const routes = require('express').Router();
const helper = require('./helper');
const redirectSSL = require('redirect-ssl');

// Force HTTPS
routes.use(redirectSSL.create({
    enabled: process.env.APP_ENV === 'production',
    redirectPort: process.env.APP_PORT_SECURED
}));

// Web Routes
routes.get('/', function (req, res) {
	res.status(200).render('index');
});


// Error Routes
routes.use(function(req, res, next) {
	res.status(404).render('404');
});

module.exports = routes;