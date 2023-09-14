const express = require('express');

const DELETE = express.Router();
module.exports = DELETE;

const openDB = require('../../../../../data/openDB');

const { loggedIn } = require('../../../../../utils/loggedIn');

DELETE.delete('/', loggedIn, async (req, res) => {
    // Connect to the database.
    const db = await openDB();

    const id = req?.body?.id ? parseInt(req?.body?.id) : null;

    if (id === null || isNaN(id) || id <= 0) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/timesheet/delete',
                moment: 'Validating time slot id submitted by the user.',
                message: "The time slot id you submitted is invalid. Make sure it's an integer greater than 0.",
            },
        });
    }

    let timeslot;

    try {
        const query = 'SELECT * FROM timesheet WHERE id = ?';
        const params = [id];

        timeslot = await db.get(query, params);

        if (!timeslot) {
            await db.close();

            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: 404,
                    type: 'Resource not found.',
                    route: '/api/v1/timesheet/delete',
                    moment: 'Checking if the time slot exists in the database.',
                    message: 'A time slot with the id you submitted does not exist in the database.',
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
                    route: '/api/v1/timesheet/delete',
                    moment: 'Checking if the time slot exists in the database.',
                    message: err.toString(),
                },
            });
        }
    }

    try {
        const query = 'DELETE FROM timesheet WHERE id = ?';
        const params = [id];

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
                    route: '/api/v1/timesheet/delete',
                    moment: 'Removing the time slot from the database.',
                    message: err.toString(),
                },
            });
        }
    }
});
