const webRoutes = require('express').Router();
const redirectSSL = require('redirect-ssl');
const fs = require('fs');
const TwitterLogin = require('twitter-login');
const Twitter = require('twitter');

const helper = require('../helper');
const { appUrl } = require('../helper');

// Force HTTPS if SSL file is available
if (fs.existsSync(process.env.SSL_PRIVKEY) && fs.existsSync(process.env.SSL_FULLCHAIN)) {
    webRoutes.use(redirectSSL.create({
        enabled: process.env.APP_ENV === 'production',
        redirectPort: process.env.APP_PORT_SECURED
    }));
}

// Twitter config
const twt = new TwitterLogin({
    consumerKey: process.env.TWITTER_API_KEY,
    consumerSecret: process.env.TWITTER_API_SECRET,
    callbackUrl: process.env.APP_URL + (process.env.APP_URL.endsWith('/') ? 'login/status' : '/login/status')
});

// Web Routes
webRoutes.get(appUrl('/'), (req, res) => {
    const data = {
        is_cookie_accepted: Boolean(req.cookies.cookie_accepted) || false,
        user: req.session.user,
    }
    res.status(200).render('index', data);
});

webRoutes.get(appUrl('/competition'), (req, res) => {
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

webRoutes.all(appUrl('/winners'), async (req, res) => {
    if(typeof(req.session.user) === 'undefined' || req.session.user === null) {
        res.redirect('/');
        return;
    }
    if(typeof(req.body.winner_type) === 'undefined' && req.body.winner_type === null) {
        res.redirect('/competition');
        return;
    }
    if(typeof(req.body.max_winners) === 'undefined' && req.body.max_winners === null) {
        res.redirect('/competition');
        return;
    }
    if(req.body.winner_type === 'retweets' && req.body.tweet_url === null) {
        res.redirect('/competition');
        return;
    }
    
    const winner_type = req.body.winner_type;
    const max_winners = req.body.max_winners;
    const tweet_url = req.body.tweet_url;
    const tweet_id = tweet_url.substring(tweet_url.lastIndexOf('/') + 1);

    const twtClient = new Twitter({
        consumer_key: process.env.TWITTER_API_KEY,
        consumer_secret: process.env.TWITTER_API_SECRET,
        access_token_key: req.session.user.userToken,
        access_token_secret: req.session.user.userTokenSecret,
    });

    switch(winner_type) {
        case 'followers':
            url = 'followers/list';
            break;
        case 'tweets':
            url = 'statuses/user_timeline';
            break;
        case 'retweets':
            url = 'statuses/retweets/' + tweet_id;
            break;
    }

    twtClient.get(url, async function (error, twitter, response) {
        if (error) {
            console.log(error);
        }
        let data = null;
        switch(winner_type) {
            case 'followers':
                data = await JSON.parse(response.body).users;
                break;
            case 'tweets':
                data =  await JSON.parse(response.body);
                break;
            case 'retweets':
                data = await JSON.parse(response.body);
                break;
        }
        const result = {
            is_cookie_accepted: Boolean(req.cookies.cookie_accepted) || false,
            user: req.session.user,
            winner_type: req.body.winner_type,
            response: helper.generateRandomWinners(data, parseInt(max_winners)),
        }
    
        res.status(200).render('winners', result);
    });
});

// Auth
webRoutes.get(appUrl('/login'), async (req, res, next) => {
    try {
        const response = await twt.login();

        req.session.tokenSecret = response.tokenSecret;
        res.redirect(response.url);
    } catch(err) {
        res.send('Twitter login error: ' + err);
    }
});

webRoutes.get(appUrl('/login/status'), async (req, res) => {
    try {
        const oAuthParam = {
            oauth_token: req.query.oauth_token,
            oauth_verifier: req.query.oauth_verifier,
        }
        const userInfo = await twt.callback(oAuthParam, req.session.tokenSecret);
        
        delete req.session.tokenSecret;
        
        req.session.user = userInfo;
        res.redirect('/competition');
    } catch (err) {
        res.send('Twitter login error: ' + err);
    }
});

module.exports = webRoutes;