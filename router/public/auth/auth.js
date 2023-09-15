const bcrypt = require('bcryptjs');
const express = require('express');
const passport = require('passport');

const auth = express.Router();
module.exports = auth;

const openDB = require('../../../data/openDB');

const { loggedIn, loggedOut } = require('../../../utils/loggedIn');

auth.get('/login', loggedOut, (req, res) => {
    res.render('auth/auth');
});

auth.get('/pass', loggedIn, async (req, res) => {
    const db = await openDB();

    const id = req.user.id;

    const user = await db.get('SELECT * FROM Users WHERE id = ?', [id]);

    res.render('auth/change', { user });
});

auth.post('/pass', loggedIn, async (req, res) => {
    const db = await openDB();

    const userID = req.user.id;

    const id = parseInt(req.body.id);
    const username = req.body.username;
    const password = req.body.password;
    const passwordHash = bcrypt.hashSync(password, 12);

    if (!userID === id)
        return res.render('errorpage', { message: "Error! Unauthorized to change someone else's password." });

    if (!username || !password) return res.render('errorpage', { message: 'Error! Username or password is missing.' });

    await db.run('UPDATE Users SET username = ?, password = ? WHERE id = ?', [username, passwordHash, id]);

    res.redirect('/auth/pass');
});

auth.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/auth/login' }));
