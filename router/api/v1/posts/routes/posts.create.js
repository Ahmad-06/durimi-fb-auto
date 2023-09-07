const express = require('express');

const CREATE = express.Router();
module.exports = CREATE;

const openDB = require('../../../../../data/openDB');

const { isValidURL, isJSONParsable, isValidDateTime } = require('../../../../../utils/utils');

CREATE.post('/', async (req, res) => {
    // Create a database connection.
    const db = await openDB();

    // Get user submission.
    const type = req?.body?.type ? req?.body?.type : null;
    const message = req?.body?.message ? req?.body?.message : null;
    const link = req?.body?.link ? req?.body?.link : null;
    const media = req?.body?.media ? req?.body?.media : null;
    const context = req?.body?.context ? req?.body?.context : null;
    const publisher = req?.body?.publisher ? req?.body?.publisher : null;
    let time = req?.body?.time ? req?.body?.time : null;

    /**
     * INPUT VALIDATION.
     **/

    // Verify the post type.
    const types = ['automated', 'scheduled'];
    if (type === null || !types.includes(type))
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/posts/create',
                moment: 'Validating post type submitted by the user.',
                message:
                    "The post type you submitted is invalid. Make sure it's one of the two types: automated OR scheduled.",
            },
        });

    // Verify if at least one of the following is submitted: message, link, media.
    if (link === null && media === null && message === null)
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

    // Verify the link.
    if (link !== null && !isValidURL(link))
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

    // Verify the media.
    if (media !== null && !isJSONParsable(media))
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/posts/create',
                moment: 'Validating media submitted by the user.',
                message: "The media you submitted is invalid. Make sure it's a stringified array of Base64 Image URLs.",
            },
        });

    // Verify the context.
    const contexts = ['page', 'group'];
    if (context === null || !contexts.includes(context))
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

    // Verify the publisher.
    const publishers = ['page', 'user'];
    if (publisher === null || !publishers.includes(publisher))
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

    // Verify the time.
    if (time !== null && !isValidDateTime(time))
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/posts/create',
                moment: 'Validating time submitted by the user.',
                message:
                    "The time you submitted is invalid. Make sure it's of the following format: YYYY-MM-DDTHH:MM, e.g. 2022-01-01T12:00.",
            },
        });

    // Verify if the time is present based on the type.
    if (type === 'scheduled' && time === null)
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/posts/create',
                moment: 'Validating time by type submitted by the user.',
                message:
                    "Posts of type 'scheduled' must have a time attached to them. Make sure it's of the following format: YYYY-MM-DDTHH:MM, e.g. 2022-01-01T12:00.",
            },
        });

    // Create the post object.
    const post = {
        type,
        message,
        link,
        media,
        context,
        publisher,
        time,
        //     priority,
        //     status,
    };

    // res.json(post);

    // Close the database connection.
    await db.close();

    res.json({
        success: true,
        data: {
            post,
        },
        error: null,
    });
});
