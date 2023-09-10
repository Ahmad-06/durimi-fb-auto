const cron = require('node-cron');

const openDB = require('./data/openDB');
const publishPost = require('./automaton/post');

const auth = {
    publisher: {
        page: process.env.PAGE_NAME,
        user: process.env.PROFILE_NAME,
    },
    context: {
        page: process.env.PAGE_LINK,
        group: process.env.GROUP_LINK,
    },
};

// The cronjob for scheduled posts.
cron.schedule('*/5 * * * *', async () => {
    // Connect to the database.
    const db = await openDB();

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

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];

        const response = await handlePostPublication(post, auth, db);

        if (response.success === false) {
            console.error(response);
        }
    }
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

        const response = await handlePostPublication(post, auth, db);

        if (response.success === false) {
            console.error(response);
        }
    }
});

const handlePostPublication = async (post, auth, db) => {
    let content = {
        message: post.message === null || post.message === 'null' ? '' : post.message,
        link: post.link === null || post.link === 'null' ? '' : post.link,
        media: post.media === null || post.media === 'null' ? [] : JSON.parse(post.media),
        context: post.context,
        publisher: post.publisher,
    };

    // Set the post as active before handing it over for publication.
    try {
        const query = `
            UPDATE
                posts
            SET
                status = 'active'
            WHERE
                id = ?;
        `;
        const params = [post.id];

        await db.run(query, params);
    } catch (err) {
        if (err) {
            await db.close();

            return {
                success: false,
                data: null,
                error: {
                    code: 500,
                    type: 'Cron runner error.',
                    moment: 'Trying to set post as active for publishing.',
                    error: err.toString(),
                },
            };
        }
    }

    const { success, error } = await publishPost(content, auth);

    if (success) {
        const response = await deletePost(post.id, db);

        return response;
    }

    if (!success) {
        // Set the post as inactive so it can be published again in the next run.
        try {
            const query = `
            UPDATE
                posts
            SET
                status = 'inactive'
            WHERE
                id = ?;
        `;
            const params = [post.id];

            await db.run(query, params);

            return {
                success: false,
                data: null,
                error,
            };
        } catch (err) {
            if (err) {
                await db.close();

                return console.error({
                    success: false,
                    data: null,
                    error: {
                        code: 500,
                        type: 'Cron runner error.',
                        moment: 'Trying to set post as active for publishing.',
                        error: err.toString(),
                    },
                });
            }
        }
    }
};

const deletePost = async (id, db) => {
    try {
        const query = `
            DELETE
                FROM
                    posts
                WHERE
                    id = ?;
        `;
        const params = [id];

        await db.run(query, params);

        return {
            success: true,
            data: null,
            error: null,
        };
    } catch (err) {
        if (err) {
            return {
                success: false,
                data: null,
                error: {
                    code: 500,
                    type: 'Internal server error.',
                    moment: 'Deleting post from the database.',
                    error: err.toString(),
                },
            };
        }
    }
};
