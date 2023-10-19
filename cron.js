const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const fetch = require('node-fetch');

const openDB = require('./data/openDB');
const pub = {
    post: require('./automaton/post'),
    meta: require('./automaton/post.create'),
};

const auth = {
    publisher: {
        page: process.env.PAGE_NAME,
        user: process.env.PROFILE_NAME,
    },
    context: {
        page: process.env.PAGE_LINK,
        group: process.env.GROUP_LINK,
    },
    meta: {
        composer: process.env.META_COMPOSER_LINK,
    },
};

// Fetch the endpoints from the remote repository every 30 minutes.
cron.schedule('*/30 * * * *', async () => {
    const metaEndpoint = 'https://airy-beaded-caravel.glitch.me/meta-business-suite.json';
    const resp = await fetch(metaEndpoint);
    if (resp.ok) {
        const data = await resp.json();

        if (data?.meta?.selector?.success) {
            const selectors = JSON.stringify(data);
            const selectorsPath = path.join(__dirname, 'data', 'meta-business-suite.json');
            const currentSelectors = JSON.parse(fs.readFileSync(selectorsPath));
            if (currentSelectors.updated !== data.updated) fs.writeFileSync(selectorsPath, selectors);
        }
    }
});

cron.schedule('*/5 * * * *', async () => {
    let enabled = false;

    if (enabled) {
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

        if (posts.length > 0) {
            for (let i = 0; i < posts.length; i++) {
                const post = posts[i];
                post.media = JSON.parse(post.media);
                post.groups = JSON.parse(post.groups);

                console.log(post);
            }
        }
    }
});
