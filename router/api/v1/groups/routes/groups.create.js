const express = require('express');

const CREATE = express.Router();
module.exports = CREATE;
const openDB = require('../../../../../data/openDB');

const { isValidURL } = require('../../../../../utils/utils');

const { loggedIn } = require('../../../../../utils/loggedIn');

CREATE.post('/', loggedIn, async (req, res) => {
    // Connect to the database.
    const db = await openDB();

    // Get user input.
    const name = req?.body?.name ? req?.body?.name : null;
    const link = req?.body?.link ? req?.body?.link : null;

    // Check if the user has submitted all the required fields.
    if (name === null || link === null) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/groups/create',
                moment: 'Checking if user submitted all required fields.',
                message:
                    'The name or link are missing from your request. Please make sure to provide both a Group name and a Group link.',
            },
        });
    }

    // Verify if the link submitted by the user is valid.
    if (!isValidURL(link)) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/groups/create',
                moment: 'Validating link submitted by the user.',
                message:
                    "The link you submitted is invalid. Make sure it's of the following format: http(s)://(www.)example.org",
            },
        });
    }

    const group = { name, link };

    // Check if the Group already exists in the database.
    try {
        const query = 'SELECT * FROM groups WHERE name = ? OR link = ?;';
        const params = [group.name, group.link];

        const existing_groups = await db.all(query, params);

        console.log(existing_groups.length);

        if (existing_groups.length !== 0) {
            await db.close();

            return res.status(409).json({
                success: false,
                data: null,
                error: {
                    code: 409,
                    type: 'Duplicate content.',
                    route: '/api/v1/groups/create',
                    moment: 'Checking to see if the group already exist in the database.',
                    error: `The group you submitted already exists in the database.`,
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
                    route: '/api/v1/groups/create',
                    moment: 'Checking to see if the group already exist in the database.',
                    error: err.toString(),
                },
            });
        }
    }

    // Save the Group into the database.
    try {
        const query = `
            INSERT INTO groups
            (
                name,
                link
            ) VALUES (?, ?);
        `;
        const params = [group.name, group.link];

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
                    route: '/api/v1/groups/create',
                    moment: 'Storing the group in the database.',
                    error: err.toString(),
                },
            });
        }
    }
});
