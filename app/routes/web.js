const webRoutes = require('express').Router();
const redirectSSL = require('redirect-ssl');
const fs = require('fs');

// Force HTTPS if SSL file is available
if(fs.existsSync(process.env.SSL_PRIVKEY) && fs.existsSync(process.env.SSL_FULLCHAIN)) {
    webRoutes.use(redirectSSL.create({
        enabled: process.env.APP_ENV === 'production',
        redirectPort: process.env.APP_PORT_SECURED
    }));
}

// Web Routes
webRoutes.get('/', function (req, res) {
	res.status(200).render('index');
});

module.exports = webRoutes;