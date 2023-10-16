const express = require('express');

const settings = express.Router();
module.exports = settings;

const { loggedIn } = require('../../../utils/loggedIn');
const changePass = require('../../../utils/changePass');

settings.get('/', loggedIn, changePass, (req, res) => {
    res.render('settings/settings');
});
