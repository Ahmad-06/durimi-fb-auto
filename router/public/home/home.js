const express = require('express');

const home = express.Router();
module.exports = home;

const openDB = require('../../../data/openDB');

const { loggedIn } = require('../../../utils/loggedIn');
const changePass = require('../../../utils/changePass');

home.get('/', loggedIn, changePass, async (req, res) => {
    const db = await openDB();

    let groups;

    try {
        const query = 'SELECT * FROM groups;';
        groups = await db.all(query);
    } catch (err) {
        if (err) {
            await db.close();

            return res.render('errorpage', {
                message: 'There was an error trying to get the groups from the database.',
            });
        }
    }

    res.render('home/home', { groups });

    await db.close();
});
