const express = require('express');

const login = express.Router();
module.exports = login;

const username = process.env.FB_USERNAME;
const password = process.env.FB_PASSWORD;

const processLogin = require('../../../../../automaton/login');

const { loggedIn } = require('../../../../../utils/loggedIn');

login.get('/', loggedIn, async (req, res) => {
    const { success, error } = await processLogin(username, password);

    if (!success) {
        return res.status(500).json({
            success: false,
            data: null,
            error,
        });
    }

    res.json({
        success: true,
        data: null,
        error: null,
    });
});
