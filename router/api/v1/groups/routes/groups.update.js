const express = require('express');

const UPDATE = express.Router();
module.exports = UPDATE;

const openDB = require('../../../../../data/openDB');

const { isValidURL } = require('../../../../../utils/utils');

const { loggedIn } = require('../../../../../utils/loggedIn');

UPDATE.put('/', loggedIn, async (req, res) => {
    // Connect to the database.
    const db = await openDB();

    // Get user input.
    const id = req?.body?.id ? parseInt(req?.body?.id) : null;
    const name = req?.body?.name ? req?.body?.name : null;
    const link = req?.body?.link ? req?.body?.link : null;

    // Check if the user has submitted all the required fields.
    if (name === null || link === null || id === null) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/groups/update',
                moment: 'Checking if user submitted all required fields.',
                message:
                    'The id, name, or link are missing from your request. Please make sure to provide all details.',
            },
        });
    }

    // Verify the id submitted by the user is valid.
    if (isNaN(id) || id <= 0) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/groups/update',
                moment: 'Validating time slot id submitted by the user.',
                message: "The time slot id you submitted is invalid. Make sure it's an integer greater than 0.",
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
                route: '/api/v1/groups/update',
                moment: 'Validating link submitted by the user.',
                message:
                    "The link you submitted is invalid. Make sure it's of the following format: http(s)://(www.)example.org",
            },
        });
    }

    const group = { id, name, link };

    // Check if the group id exists in the database.
    try {
        const query = 'SELECT * FROM groups WHERE id = ?;';
        const params = [group.id];

        const existing_group = await db.get(query, params);

        if (!existing_group) {
            await db.close();

            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: 404,
                    type: 'Resource not found.',
                    route: '/api/v1/groups/update',
                    moment: 'Checking if the group exists in the database.',
                    message: 'A group with the id you submitted does not exist in the database.',
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
                    route: '/api/v1/group/update',
                    moment: 'Checking if the group exists in the database.',
                    message: err.toString(),
                },
            });
        }
    }

    // Check if the group already exists in the database.
    try {
        const query = 'SELECT * FROM groups WHERE id <> ? AND (name = ? OR link = ?);';
        const params = [group.id, group.name, group.link];

        const existing_groups = await db.all(query, params);

        if (existing_groups.length !== 0) {
            await db.close();

            return res.status(409).json({
                success: false,
                data: null,
                error: {
                    code: 409,
                    type: 'Duplicate content.',
                    route: '/api/v1/groups/update',
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
                    route: '/api/v1/groups/update',
                    moment: 'Checking to see if the group already exist in the database.',
                    error: err.toString(),
                },
            });
        }
    }

    // Update the group in the database.
    try {
        const query = `
            UPDATE groups
            SET
                name = ?,
                link = ?
            WHERE
                id = ?;
        `;
        const params = [group.name, group.link, group.id];

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
                    route: '/api/v1/groups/update',
                    moment: 'Updating the group in the database.',
                    error: err.toString(),
                },
            });
        }
    }
});
