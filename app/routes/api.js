const apiRoutes = require('express').Router();
const { response } = require('../helper');
const helper = require('../helper');

// API Routes
apiRoutes.get('/', function (req, res) {
	res.status(200).send(helper.response(false, null, 'Test'));
});

module.exports = apiRoutes;