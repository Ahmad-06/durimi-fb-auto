const express = require('express');
const passport = require('passport');

const auth = express.Router();
module.exports = auth;

const { loggedOut } = require('../../../utils/loggedIn');

auth.get('/login', loggedOut, (req, res) => {
    res.render('auth/auth');
});

auth.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/auth/login' }));
