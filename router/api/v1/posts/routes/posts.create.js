const express = require('express');

const CREATE = express.Router();
module.exports = CREATE;

const openDB = require('../../../../../data/openDB');

const { isValidURL } = require('../../../../../utils/utils');

CREATE.post('/', async (req, res) => {
    // Create a database connection.
    const db = await openDB();

    // Get user submission.
    const type = req?.body?.type ? req?.body?.type : null;
    const message = req?.body?.message ? req?.body?.message : null;
    const link = req?.body?.link ? req?.body?.link : null;

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

    // Create the post object.
    const post = {
        type,
        message,
        link,
        //     media,
        //     context,
        //     publisher,
        //     time,
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
