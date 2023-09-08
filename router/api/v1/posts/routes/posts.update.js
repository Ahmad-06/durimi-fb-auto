const express = require('express');

const UPDATE = express.Router();
module.exports = UPDATE;

const openDB = require('../../../../../data/openDB');

const {
    isValidURL,
    isJSONParsable,
    isValidDateTime,
    saveBase64MediaToFileSystem,
} = require('../../../../../utils/utils');

UPDATE.put('/', async (req, res) => {
    // Connect to the database.
    const db = await openDB();

    // Get user submission.
    const id = req?.body?.id ? parseInt(req?.body?.id) : null;
    const type = req?.body?.type ? req?.body?.type : null;
    const message = req?.body?.message ? req?.body?.message : null;
    const link = req?.body?.link ? req?.body?.link : null;
    let media = req?.body?.media && req?.body?.media !== '[]' ? req?.body?.media : null;
    const mediaChanged = req?.body?.mediaChanged ? req?.body?.mediaChanged : null;
    const context = req?.body?.context ? req?.body?.context : null;
    const publisher = req?.body?.publisher ? req?.body?.publisher : null;
    let time = req?.body?.time ? req?.body?.time : null;
    let priority = req?.body?.priority ? req?.body?.priority : null;

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

    // Verify the post type.
    const types = ['automated', 'scheduled'];
    if (type === null || !types.includes(type)) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/posts/update',
                moment: 'Validating post type submitted by the user.',
                message:
                    "The post type you submitted is invalid. Make sure it's one of the two types: automated OR scheduled.",
            },
        });
    }

    // Verify if at least one of the following is submitted: message, link, media.
    if (link === null && media === null && message === null) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/posts/update',
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
                route: '/api/v1/posts/update',
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
                route: '/api/v1/posts/update',
                moment: 'Validating media submitted by the user.',
                message: "The media you submitted is invalid. Make sure it's a stringified array of Base64 Image URLs.",
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
                route: '/api/v1/posts/update',
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
                route: '/api/v1/posts/update',
                moment: 'Validating publisher submitted by the user.',
                message:
                    "The publisher you submitted is invalid. Make sure it's one of the following two: page OR user.",
            },
        });
    }

    // Verify the time.
    if (time !== null && !isValidDateTime(time)) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/posts/update',
                moment: 'Validating time submitted by the user.',
                message:
                    "The time you submitted is invalid. Make sure it's of the following format: YYYY-MM-DDTHH:MM, e.g. 2022-01-01T12:00.",
            },
        });
    }

    // Verify if the time is present based on the type.
    if (type === 'scheduled' && time === null) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/posts/update',
                moment: 'Validating time by type submitted by the user.',
                message:
                    "Posts of type 'scheduled' must have a time attached to them. Make sure it's of the following format: YYYY-MM-DDTHH:MM, e.g. 2022-01-01T12:00.",
            },
        });
    }

    // Derive the remaining data items from user input.
    time = type === 'scheduled' ? time : null;
    const timestamp = time !== null ? new Date(time).getTime() : null;
    if (priority === null) {
        priority = timestamp ? timestamp : new Date().getTime();
    }

    const status = 'inactive';

    let images;

    if (mediaChanged === 'true') {
        media = media !== null ? JSON.parse(media) : null;
        images = media !== null ? saveBase64MediaToFileSystem(media) : null;
    } else {
        images = media !== null ? JSON.parse(media) : null;
    }

    // Create post object.
    const post = {
        type,
        message,
        link,
        media: JSON.stringify(images),
        context,
        publisher,
        time,
        timestamp,
        priority,
        status,
        id,
    };

    try {
        const query = 'SELECT * FROM posts WHERE id = ?';
        const params = [id];

        const post = await db.get(query, params);

        if (!post) {
            await db.close();

            res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: 404,
                    type: 'Resource not found.',
                    route: '/api/v1/posts/update',
                    moment: 'Checking if the post exists in the database.',
                    message: 'A post with the id you submitted does not exist in the database.',
                },
            });
        }
    } catch (err) {
        if (err) {
            await db.close();

            return res.status(500).json({
                success: false,
                data: null,
                error: {
                    code: 500,
                    type: 'Internal server error.',
                    route: '/api/v1/posts/update',
                    moment: 'Checking if the post exists in the database.',
                    message: err.toString(),
                },
            });
        }
    }

    try {
        const query = `
            UPDATE posts
            SET
                type = ?,
                message = ?,
                link = ?,
                media = ?,
                context = ?,
                publisher = ?,
                time = ?,
                timestamp = ?,
                priority = ?,
                status = ?
            WHERE
                id = ?;
        `;
        const params = [
            post.type,
            post.message,
            post.link,
            post.media,
            post.context,
            post.publisher,
            post.time,
            post.timestamp,
            post.priority,
            post.status,
            post.id,
        ];

        await db.run(query, params);

        res.json({
            success: true,
            data: null,
            error: null,
        });

        await db.close();
    } catch (err) {
        if (err) {
            await db.close();

            return res.status(500).json({
                success: false,
                data: null,
                error: {
                    code: 500,
                    type: 'Internal server error.',
                    route: '/api/v1/posts/update',
                    moment: 'Publishing the updated post into the database.',
                    message: err.toString(),
                },
            });
        }
    }
});
