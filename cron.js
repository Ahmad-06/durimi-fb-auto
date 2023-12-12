const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const fetch = require('node-fetch');

const openDB = require('./data/openDB');

const pubsub = require('./utils/pubsub');

// Fetch the endpoints from the remote repository every 30 minutes.
// cron.schedule('*/30 * * * *', async () => {
//     const metaEndpoint = 'https://airy-beaded-caravel.glitch.me/meta-business-suite.json';
//     const resp = await fetch(metaEndpoint);
//     if (resp.ok) {
//         const data = await resp.json();

//         if (data?.meta?.selector?.success) {
//             const selectors = JSON.stringify(data);
//             const selectorsPath = path.join(__dirname, 'data', 'meta-business-suite.json');
//             const currentSelectors = JSON.parse(fs.readFileSync(selectorsPath));
//             if (currentSelectors.updated !== data.updated) fs.writeFileSync(selectorsPath, selectors);
//         }
//     }
// });

// The cronjob for scheduled posts.
cron.schedule('*/5 * * * *', async () => {
    // Connect to the database.
    const db = await openDB();

    // Get the scheduled posts from the database.
    let posts;
    try {
        const current_time = new Date().getTime();

        const query = `
            SELECT
                *
            FROM
                posts
            WHERE
                type = 'scheduled'
                AND
                status = 'inactive'
                AND
                timestamp <= ?;
        `;

        const params = [current_time];

        posts = await db.all(query, params);
    } catch (err) {
        if (err) {
            await db.close();

            return console.error({
                success: false,
                data: null,
                error: {
                    code: 500,
                    type: 'Cron runner error.',
                    cron: 'scheduled',
                    moment: 'Trying to get posts from the database.',
                    error: err.toString(),
                },
            });
        }
    }

    const resp = await pubsub(posts, db);

    if (!resp.success) console.error(resp);
});

// The cronjob for automated posts.
cron.schedule('*/5 * * * *', async () => {
    // Connect to the database.
    const db = await openDB();

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const current_day = days[new Date().getDay()];

    const hours = new Date().getHours();
    const minutes = new Date().getMinutes();
    const HOURS = `${hours < 10 ? '0' : ''}${hours}`;
    const MINUTES = `${minutes < 10 ? '0' : ''}${minutes}`;
    const current_time = `${HOURS}:${MINUTES}`;

    let timeslot;

    try {
        const query = `
            SELECT
                *
            FROM
                timesheet
            WHERE
                day = ?
                AND
                time = ?;
        `;

        const params = [current_day, current_time];

        timeslot = await db.get(query, params);
    } catch (err) {
        if (err) {
            await db.close();

            console.error({
                success: false,
                data: null,
                error: {
                    code: 500,
                    type: 'Cron runner error.',
                    cron: 'automated',
                    moment: 'Trying to get time slot from the database.',
                    error: err.toString(),
                },
            });
        }
    }

    if (timeslot) {
        // Get the first post that can be published.

        let post;

        try {
            const query = `
                SELECT
                    *
                FROM
                    posts
                WHERE
                    type = 'automated'
                    AND
                    status = 'inactive'
                ORDER BY priority;
            `;

            post = await db.get(query);
        } catch (err) {
            if (err) {
                console.error({
                    success: false,
                    data: null,
                    error: {
                        code: 500,
                        type: 'Cron runner error.',
                        cron: 'automated',
                        moment: 'Trying to get the post from the database.',
                        error: err.toString(),
                    },
                });
            }
        }

        const posts = [post];

        const resp = await pubsub(posts, db);

        if (!resp.success) console.error(resp);
    }
});
