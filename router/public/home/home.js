const express = require('express');

const home = express.Router();
module.exports = home;

const { loggedIn } = require('../../../utils/loggedIn');
const changePass = require('../../../utils/changePass');

home.get('/', loggedIn, changePass, (req, res) => {
    res.render('home/home');
});
