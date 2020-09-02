const webRoutes = require('express').Router();
const redirectSSL = require('redirect-ssl');
const fs = require('fs');
const TwitterLogin = require('twitter-login');

// Force HTTPS if SSL file is available
if (fs.existsSync(process.env.SSL_PRIVKEY) && fs.existsSync(process.env.SSL_FULLCHAIN)) {
    webRoutes.use(redirectSSL.create({
        enabled: process.env.APP_ENV === 'production',
        redirectPort: process.env.APP_PORT_SECURED
    }));
}

// Twitter config
const twitter = new TwitterLogin({
    consumerKey: process.env.TWITTER_API_KEY,
    consumerSecret: process.env.TWITTER_API_SECRET,
    callbackUrl: process.env.APP_URL + (process.env.APP_URL.endsWith('/') ? 'login/status' : '/login/status')
});

// Web Routes
webRoutes.get('/', (req, res) => {
    const data = {
        is_cookie_accepted: Boolean(req.cookies.cookie_accepted) || false,
        user: req.session.user,
    }
    res.status(200).render('index', data);
});

webRoutes.get('/competition', (req, res) => {
    if(typeof(req.session.user) === 'undefined' || req.session.user === null) {
        res.redirect('/');
        return;
    }

    const data = {
        is_cookie_accepted: Boolean(req.cookies.cookie_accepted) || false,
        user: req.session.user,
    }

    res.status(200).render('competition', data);
});

webRoutes.all('/winners', (req, res) => {
    if(typeof(req.session.user) === 'undefined' || req.session.user === null) {
        res.redirect('/');
        return;
    }

    const data = {
        is_cookie_accepted: Boolean(req.cookies.cookie_accepted) || false,
        user: req.session.user,
    }

    res.status(200).render('winners', data);
});

// Auth
webRoutes.get('/login', async (req, res, next) => {
    try {
        const result = await twitter.login();

        req.session.tokenSecret = result.tokenSecret;
        res.redirect(result.url);
    } catch(err) {
        res.send('Twitter login error: ' + err);
    }
});

webRoutes.get('/login/status', async (req, res) => {
    try {
        const oAuthParam = {
            oauth_token: req.query.oauth_token,
            oauth_verifier: req.query.oauth_verifier,
        }
        const userInfo = await twitter.callback(oAuthParam, req.session.tokenSecret);
        
        delete req.session.tokenSecret;
        
        req.session.user = userInfo;
        res.redirect('/competition');
    } catch (err) {
        res.send('Twitter login error: ' + err);
    }
});

module.exports = webRoutes;