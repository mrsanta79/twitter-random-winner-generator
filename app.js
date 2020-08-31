const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');
require('dotenv').config();
const routes = require('./app/routes');

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

// View engine setup
app.engine('ejs', ejs.renderFile);
app.set('views', path.join(__dirname, '/public/views'));
app.set('view engine', 'ejs');

// Serve static CSS JS files for views
app.use('/assets', express.static(path.join(__dirname, '/public/assets')));
 
// Add routes
app.use('/', routes);

app.listen(process.env.APP_PORT || 8080);

// Listen app
if(process.env.APP_ENV === 'production') {
    
    // SSL Config
    const sslConfig = {
        key: fs.readFileSync("/etc/letsencrypt/live/www.meetsantanu.in/privkey.pem"),
        cert: fs.readFileSync("/etc/letsencrypt/live/www.meetsantanu.in/fullchain.pem")
    }
    https.createServer(sslConfig, app).listen(process.env.APP_PORT_SECURED || 8080);
}
