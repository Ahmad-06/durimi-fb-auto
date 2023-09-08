const express = require('express');

const posts = express.Router();
module.exports = posts;

const openDB = require('../../../data/openDB');

posts.get('/', async (req, res) => {
    const db = await openDB();

    let automated, scheduled;

    try {
        const query = "SELECT * FROM posts WHERE type = 'automated' ORDER BY priority;";

        automated = await db.all(query);
    } catch (err) {
        if (err) {
            await db.close();

            return res.send('There was an error trying to get the automated posts from the database.');
        }
    }

    try {
        const query = "SELECT * FROM posts WHERE type = 'scheduled' ORDER BY priority;";

        scheduled = await db.all(query);
    } catch (err) {
        if (err) {
            await db.close();

            return res.send('There was an error trying to get the scheduled posts from the database.');
        }
    }

    res.render('posts/posts', {
        posts: {
            automated,
            scheduled,
        },
    });

    await db.close();
});

posts.use('/re-order', require('./re-order/re-order'));
