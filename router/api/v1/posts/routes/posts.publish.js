const express = require('express');

const publish = express.Router();
module.exports = publish;

const openDB = require('../../../../../data/openDB');

const { isValidURL, isJSONParsable, saveBase64MediaToFileSystem } = require('../../../../../utils/utils');

const { loggedIn } = require('../../../../../utils/loggedIn');

const pubsub = require('../../../../../utils/pubsub');

publish.post('/', loggedIn, async (req, res) => {
    // Create a database connection.
    const db = await openDB();

    const id = req?.body?.id ? req?.body?.id : null;
    const message = req?.body?.message ? req?.body?.message : null;
    const link = req?.body?.link ? req?.body?.link : null;
    let media = req?.body?.media && req?.body?.media !== '[]' ? req?.body?.media : null;
    const groups =
        req?.body?.groups && req?.body?.groups?.length > 0 && req?.body?.groups !== '[]' ? req?.body?.groups : null;
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
        const posts = [post];

        const response = await pubsub(posts, db);

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

        // Verify the groups.
        if (groups !== null && groups.length > 0) {
            let status = false;
            for (let i = 0; i < groups.length; i++) {
                if (!Number.isInteger(groups[i])) {
                    status = true;
                    break;
                }
            }
            if (status) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        code: 400,
                        type: 'Invalid user input.',
                        route: '/api/v1/posts/create',
                        moment: 'Validating groups submitted by the user.',
                        message:
                            "The groups you submitted is invalid. Make sure it's an array of integer IDs representing each group.",
                    },
                });
            }
        }

        media = media !== null ? JSON.parse(media) : null;
        const images = media !== null ? saveBase64MediaToFileSystem(media) : null;

        const post = {
            message,
            link,
            media: JSON.stringify(images),
            groups: JSON.stringify(groups),
            context,
            publisher,
        };

        const posts = [post];

        const response = await pubsub(posts, db);

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
