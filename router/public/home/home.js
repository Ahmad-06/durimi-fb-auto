const express = require('express');

const home = express.Router();
module.exports = home;

const { loggedIn } = require('../../../utils/loggedIn');

home.get('/', loggedIn, (req, res) => {
    res.render('home/home');
});
