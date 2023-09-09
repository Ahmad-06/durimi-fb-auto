const express = require('express');

const login = express.Router();
module.exports = login;

login.get('/', (req, res) => {
    res.json({
        success: false,
        data: null,
        error: {
            code: 500,
            type: 'Internal server error.',
            route: '/api/v1/misc/login',
            moment: 'Logging in to Facebook.',
            message: 'There was an error when trying to login to your Facebook account.',
        },
    });
});
