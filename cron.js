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

    if (posts.length > 0) {
        // Standardize the data.
        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            post.message = post.message === null || post.message === 'null' ? null : post.message;
            post.link = post.link === null || post.link === 'null' ? null : post.link;
            post.media = post.media === null || post.media === 'null' ? null : JSON.parse(post.media);
            post.groups = post.groups === null || post.groups === 'null' ? null : JSON.parse(post.groups);

            // Get the group names instead of IDs.
            if (post?.groups !== null && post?.groups?.length > 0) {
                let groups = [];
                for (let i = 0; i < post.groups.length; i++) {
                    const id = post.groups[i];
                    const group = await db.get('SELECT * FROM groups WHERE id = ?', [id]);
                    groups.push(group.name);
                }
                post.groups = groups;
            }

            if (post?.media === null || post?.media?.length < 1) {
                const res = await pub.meta(post, auth);

                if (!res.success)
                    console.error({ message: 'Failed to post to the page.', adapatar: 'Meta', post, res });

                if (res?.success && res?.data?.groups !== null && res?.data?.groups?.length > 0) {
                    const groups = res?.data?.groups;

                    let j = 0;

                    for (let i = 0; i < groups?.length; i++) {
                        const name = groups[i];
                        const group = await db.get('SELECT * FROM groups WHERE name = ?', [name]);
                        auth.context.group = group.link;
                        post.context = 'group';

                        const res = await pub.post(post, auth);

                        if (!res.success) {
                            console.error({ message: 'Failed to post to the group.', adaptor: 'Legacy', post, res });
                            j++;
                        }

                        if (i === groups?.length - 1 && j === 0) {
                            // Delete the post once everything is published.
                            try {
                                const query = `
                                    DELETE
                                        FROM
                                            posts
                                        WHERE
                                            id = ?;
                                `;
                                const params = [post.id];

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
                        } else {
                            if (res.success && i === groups?.length && j === 0) {
                                // Delete the post once everything is published.
                                try {
                                    const query = `
                                    DELETE
                                        FROM
                                            posts
                                        WHERE
                                            id = ?;
                                `;
                                    const params = [post.id];

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
                            }
                        }
                    }
                }
            } else {
                const res = await pub.post(post, auth);

                if (!res.success)
                    console.error({ message: 'Failed to post to the page.', adaptar: 'Legacy', post, res });

                if (post?.groups?.length > 0) {
                    const groups = post?.groups;

                    let j = 0;

                    for (let i = 0; i < groups?.length; i++) {
                        const name = groups[i];
                        const group = await db.get('SELECT * FROM groups WHERE name = ?', [name]);
                        auth.context.group = group.link;
                        post.context = 'group';

                        const res = await pub.post(post, auth);

                        if (!res.success) {
                            console.error({ message: 'Failed to post to the group.', adaptar: 'Legacy', post, res });
                            j++;
                        }

                        if (i === groups?.length - 1 && j === 0) {
                            // Delete the post once everything is published.
                            try {
                                const query = `
                                    DELETE
                                        FROM
                                            posts
                                        WHERE
                                            id = ?;
                                `;
                                const params = [post.id];

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
                        }
                    }
                } else {
                    // Delete the post once everything is published.
                    if (res.success) {
                        try {
                            const query = `
                                DELETE
                                    FROM
                                        posts
                                    WHERE
                                        id = ?;
                            `;
                            const params = [post.id];

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
                    }
                }
            }
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

        const posts = [post];

        if (posts.length > 0) {
            // Standardize the data.
            for (let i = 0; i < posts.length; i++) {
                const post = posts[i];
                post.message = post.message === null || post.message === 'null' ? null : post.message;
                post.link = post.link === null || post.link === 'null' ? null : post.link;
                post.media = post.media === null || post.media === 'null' ? null : JSON.parse(post.media);
                post.groups = post.groups === null || post.groups === 'null' ? null : JSON.parse(post.groups);

                // Get the group names instead of IDs.
                if (post?.groups !== null && post?.groups?.length > 0) {
                    let groups = [];
                    for (let i = 0; i < post.groups.length; i++) {
                        const id = post.groups[i];
                        const group = await db.get('SELECT * FROM groups WHERE id = ?', [id]);
                        groups.push(group.name);
                    }
                    post.groups = groups;
                }

                if (post?.media === null || post?.media?.length < 1) {
                    const res = await pub.meta(post, auth);

                    if (!res.success)
                        console.error({ message: 'Failed to post to the page.', adapatar: 'Meta', post, res });

                    if (res?.success && res?.data?.groups !== null && res?.data?.groups?.length > 0) {
                        const groups = res?.data?.groups;

                        let j = 0;

                        for (let i = 0; i < groups?.length; i++) {
                            const name = groups[i];
                            const group = await db.get('SELECT * FROM groups WHERE name = ?', [name]);
                            auth.context.group = group.link;
                            post.context = 'group';

                            const res = await pub.post(post, auth);

                            if (!res.success) {
                                console.error({
                                    message: 'Failed to post to the group.',
                                    adaptor: 'Legacy',
                                    post,
                                    res,
                                });
                                j++;
                            }

                            if (i === groups?.length - 1 && j === 0) {
                                // Delete the post once everything is published.
                                try {
                                    const query = `
                                        DELETE
                                            FROM
                                                posts
                                            WHERE
                                                id = ?;
                                    `;
                                    const params = [post.id];

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
                            } else {
                                if (res.success && i === groups?.length - 1 && j == 0) {
                                    // Delete the post once everything is published.
                                    try {
                                        const query = `
                                        DELETE
                                            FROM
                                                posts
                                            WHERE
                                                id = ?;
                                    `;
                                        const params = [post.id];

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
                                }
                            }
                        }
                    }
                } else {
                    const res = await pub.post(post, auth);

                    if (!res.success)
                        console.error({ message: 'Failed to post to the page.', adaptar: 'Legacy', post, res });

                    if (post?.groups?.length > 0) {
                        const groups = post?.groups;

                        let j = 0;

                        for (let i = 0; i < groups?.length; i++) {
                            const name = groups[i];
                            const group = await db.get('SELECT * FROM groups WHERE name = ?', [name]);
                            auth.context.group = group.link;
                            post.context = 'group';

                            const res = await pub.post(post, auth);

                            if (!res.success) {
                                console.error({
                                    message: 'Failed to post to the group.',
                                    adaptar: 'Legacy',
                                    post,
                                    res,
                                });
                                j++;
                            }

                            if (i === groups?.length - 1 && j === 0) {
                                // Delete the post once everything is published.
                                try {
                                    const query = `
                                        DELETE
                                            FROM
                                                posts
                                            WHERE
                                                id = ?;
                                    `;
                                    const params = [post.id];

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
                            }
                        }
                    } else {
                        // Delete the post once everything is published.
                        if (res.success) {
                            try {
                                const query = `
                                    DELETE
                                        FROM
                                            posts
                                        WHERE
                                            id = ?;
                                `;
                                const params = [post.id];

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
                        }
                    }
                }
            }
        }
    }
});
