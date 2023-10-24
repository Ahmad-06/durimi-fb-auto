const express = require('express');

const duplink = express.Router();
module.exports = duplink;

const openDB = require('../../../../../data/openDB');

const { isValidURL } = require('../../../../../utils/utils');

duplink.post('/', async (req, res) => {
    const db = await openDB();

    const link = req?.body?.link ? req?.body?.link : null;
    const id = req?.body?.id ? req?.body?.id : 0;

    // Verify user submitted the link
    if (!link) {
        return res.json({
            success: true,
            data: null,
            error: null,
        });
    }

    // Validate the user-submitted link
    if (link !== null && !isValidURL(link)) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/misc/duplink',
                moment: 'Validating link submitted by the user.',
                message:
                    "The link you submitted is invalid. Make sure it's of the following format: http(s)://(www.)example.org",
            },
        });
    }

    try {
        const query = `
            SELECT
                *
            FROM
                Posts
            WHERE
                link = ?
                AND
                id != ?;
        `;
        const params = [link, id];

        const post = await db.get(query, params);

        if (post) {
            return res.json({
                success: false,
                data: null,
                error: null,
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
                    route: '/api/v1/misc/duplink',
                    moment: 'Checking if the link already exists in the database.',
                    message: err.toString(),
                },
            });
        }
    }

    return res.json({
        success: true,
        data: null,
        error: null,
    });
});
