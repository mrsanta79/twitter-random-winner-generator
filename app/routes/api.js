const apiRoutes = require('express').Router();
const Twitter = require('twitter');

const helper = require('../helper');

// API Routes
apiRoutes.get('/accept-cookie', (req, res) => {
    const expiryTime = 2592000000; // in MS = 30 Days
    res.cookie('cookie_accepted', true, {
        expire: expiryTime + Date.now()
    });
    const data = {
        is_cookie_accepted: true
    }
    res.status(200).send(helper.response(true, data, 'Cookies saved'));
});

apiRoutes.post('/winners', async (req, res) => {
    if(typeof(req.body.user) === 'undefined' || req.body.user === '') {
        res.json(helper.response(false, null, 'User info not found!'));
    }
    if(typeof(req.body.user.userId) === 'undefined' || req.body.user.userId === '') {
        res.json(helper.response(false, null, 'User id is missing!'));
    }
    if(typeof(req.body.user.userToken) === 'undefined' || req.body.user.userToekn === '') {
        res.json(helper.response(false, null, 'User token is missing!'));
    }
    if(typeof(req.body.user.userTokenSecret) === 'undefined' || req.body.user.userToeknSecret === '') {
        res.json(helper.response(false, null, 'User token secret is missing!'));
    }
    if(typeof(req.body.winner_type) === 'undefined' && req.body.winner_type === '') {
        res.json(helper.response(false, null, 'Please select winner type'));
    }
    if(typeof(req.body.max_winners) === 'undefined' && req.body.max_winners === '') {
        res.json(helper.response(false, null, 'Please select maximum winners count'));
    }
    if(req.body.winner_type === 'retweets' && req.body.tweet_url === '') {
        res.json(helper.response(false, null, 'Please enter a tweet link'));
    }

    const winner_type = req.body.winner_type;
    const max_winners = req.body.max_winners;
    const tweet_url = req.body.tweet_url;
    const tweet_id = tweet_url.substring(tweet_url.lastIndexOf('/') + 1);

    const twtClient = new Twitter({
        consumer_key: process.env.TWITTER_API_KEY,
        consumer_secret: process.env.TWITTER_API_SECRET,
        access_token_key: req.body.user.userToken,
        access_token_secret: req.body.user.userTokenSecret,
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
            user: req.body.user,
            winner_type: req.body.winner_type,
            response: helper.generateRandomWinners(data, parseInt(max_winners)),
        }
    
        res.status(200).json(helper.response(true, result, 'Winners'));
    });
});

module.exports = apiRoutes;