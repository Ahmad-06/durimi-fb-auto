const express = require('express');

const posts = express.Router();
module.exports = posts;

const openDB = require('../../../data/openDB');

const { loggedIn } = require('../../../utils/loggedIn');
const changePass = require('../../../utils/changePass');

posts.get('/', loggedIn, changePass, async (req, res) => {
    const db = await openDB();

    let groups, automated, scheduled;

    try {
        const query = 'SELECT * FROM groups;';

        groups = await db.all(query);

        let new_groups = {};

        for (let i = 0; i < groups.length; i++) {
            new_groups[groups[i].id] = groups[i].name;
        }

        groups = new_groups;
    } catch (err) {
        if (err) {
            await db.close();

            return res.render('errorpage', {
                message: 'There was an error trying to get the groups from the database.',
            });
        }
    }

    try {
        const query = "SELECT * FROM posts WHERE type = 'automated' ORDER BY priority;";

        automated = await db.all(query);

        for (let i = 0; i < automated.length; i++) {
            if (automated[i].groups !== 'null') {
                let post_groups = JSON.parse(automated[i].groups);
                let post_groups_new = [];

                for (let j = 0; j < post_groups.length; j++) {
                    post_groups_new.push({ id: post_groups[j], name: groups[post_groups[j]] });
                }

                post_groups = post_groups_new;

                automated[i].groups = post_groups;
            }
        }
    } catch (err) {
        if (err) {
            await db.close();

            return res.render('errorpage', {
                message: 'There was an error trying to get the automated posts from the database.',
            });
        }
    }

    try {
        const query = "SELECT * FROM posts WHERE type = 'scheduled' ORDER BY priority;";

        scheduled = await db.all(query);

        for (let i = 0; i < scheduled.length; i++) {
            if (scheduled[i].groups !== 'null') {
                let post_groups = JSON.parse(scheduled[i].groups);
                let post_groups_new = [];

                for (let j = 0; j < post_groups.length; j++) {
                    post_groups_new.push({ id: post_groups[j], name: groups[post_groups[j]] });
                }

                post_groups = post_groups_new;

                scheduled[i].groups = post_groups;
            }
        }
    } catch (err) {
        if (err) {
            await db.close();

            return res.render('errorpage', {
                message: 'There was an error trying to get the scheduled posts from the database.',
            });
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
