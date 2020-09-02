const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');
const cookieParser = require('cookie-parser');
const session = require('express-session');

require('dotenv').config();

const webRoutes = require('./app/routes/web');
const apiRoutes = require('./app/routes/api');

// Create app
const app = express();

// Use security headers
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    user: null,
    tokenSecret: null,
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}));

// View engine setup
app.engine('ejs', ejs.renderFile);
app.set('views', path.join(__dirname, '/public/views'));
app.set('view engine', 'ejs');

// Serve static CSS JS files for views
app.use('/assets', express.static(path.join(__dirname, '/public/assets')));
 
// App routes
app.use('/', webRoutes);
app.use('/api', apiRoutes);

// Error Routes
app.use(function(req, res, next) {
	res.status(404).render('404');
});

// Listen app
app.listen(process.env.APP_PORT || 8080);

// Enable SSL on production if available
if(process.env.APP_ENV === 'production') {
    if(fs.existsSync(process.env.SSL_PRIVKEY) && fs.existsSync(process.env.SSL_FULLCHAIN)) {
        // SSL Config
        const sslConfig = {
            key: fs.readFileSync(process.env.SSL_PRIVKEY),
            cert: fs.readFileSync(process.env.SSL_FULLCHAIN)
        }
        https.createServer(sslConfig, app).listen(process.env.APP_PORT_SECURED || 8080);
    }
}
