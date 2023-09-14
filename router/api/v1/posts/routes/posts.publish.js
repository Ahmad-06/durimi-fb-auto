const express = require('express');

const publish = express.Router();
module.exports = publish;

const openDB = require('../../../../../data/openDB');

const { isValidURL, isJSONParsable, saveBase64MediaToFileSystem } = require('../../../../../utils/utils');

const publishPost = require('../../../../../automaton/post');

const { loggedIn } = require('../../../../../utils/loggedIn');

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

publish.post('/', loggedIn, async (req, res) => {
    // Create a database connection.
    const db = await openDB();

    const id = req?.body?.id ? req?.body?.id : null;
    const message = req?.body?.message ? req?.body?.message : null;
    const link = req?.body?.link ? req?.body?.link : null;
    let media = req?.body?.media && req?.body?.media !== '[]' ? req?.body?.media : null;
    const context = req?.body?.context ? req?.body?.context : null;
    const publisher = req?.body?.publisher ? req?.body?.publisher : null;

    if (id && id > 0) {
        // Check if the post id is valid.
        if (id === null || isNaN(id) || id <= 0) {
            await db.close();

            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: 400,
                    type: 'Invalid user input.',
                    route: '/api/v1/posts/delete',
                    moment: 'Validating post id submitted by the user.',
                    message: "The post id you submitted is invalid. Make sure it's an integer greater than 0.",
                },
            });
        }

        const post = await db.get('SELECT * FROM posts WHERE id = ?', [id]);

        const response = await handlePostPublication(post, auth, db);

        if (response.success === false) {
            return res.status(500).json(response);
        } else {
            res.json({
                success: true,
                data: null,
                error: null,
            });
        }
    } else {
        // Verify if at least one of the following is submitted: message, link, media.
        if (link === null && media === null && message === null) {
            await db.close();

            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: 400,
                    type: 'Invalid user input.',
                    route: '/api/v1/posts/create',
                    moment: 'Validating content submitted by the user.',
                    message: 'You need to submit at least one of the following: link, media, or message.',
                },
            });
        }

        // Verify the link.
        if (link !== null && !isValidURL(link)) {
            await db.close();

            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: 400,
                    type: 'Invalid user input.',
                    route: '/api/v1/posts/create',
                    moment: 'Validating link submitted by the user.',
                    message:
                        "The link you submitted is invalid. Make sure it's of the following format: http(s)://(www.)example.org",
                },
            });
        }

        // Verify the media.
        if (media !== null && !isJSONParsable(media)) {
            await db.close();

            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: 400,
                    type: 'Invalid user input.',
                    route: '/api/v1/posts/create',
                    moment: 'Validating media submitted by the user.',
                    message:
                        "The media you submitted is invalid. Make sure it's a stringified array of Base64 Image URLs.",
                },
            });
        }

        // Verify the context.
        const contexts = ['page', 'group'];
        if (context === null || !contexts.includes(context)) {
            await db.close();

            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: 400,
                    type: 'Invalid user input.',
                    route: '/api/v1/posts/create',
                    moment: 'Validating context submitted by the user.',
                    message:
                        "The context you submitted is invalid. Make sure it's one of the following two: page OR group.",
                },
            });
        }

        // Verify the publisher.
        const publishers = ['page', 'user'];
        if (publisher === null || !publishers.includes(publisher)) {
            await db.close();

            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: 400,
                    type: 'Invalid user input.',
                    route: '/api/v1/posts/create',
                    moment: 'Validating publisher submitted by the user.',
                    message:
                        "The publisher you submitted is invalid. Make sure it's one of the following two: page OR user.",
                },
            });
        }

        media = media !== null ? JSON.parse(media) : null;
        const images = media !== null ? saveBase64MediaToFileSystem(media) : null;

        const post = {
            message,
            link,
            media: JSON.stringify(images),
            context,
            publisher,
        };

        const response = await handleNakedPostPublication(post, auth, db);

        if (response.success === false) {
            return res.status(500).json(response);
        } else {
            res.json({
                success: true,
                data: null,
                error: null,
            });
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

const handleNakedPostPublication = async (post, auth, db) => {
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
        return {
            success: true,
            data: null,
            error: null,
        };
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
