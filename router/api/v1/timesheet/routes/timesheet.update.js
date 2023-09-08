const express = require('express');

const UPDATE = express.Router();
module.exports = UPDATE;

const openDB = require('../../../../../data/openDB');

const { isValidDay, isValidTime, convert24HourTimeTo12HourTime } = require('../../../../../utils/utils');

UPDATE.put('/', async (req, res) => {
    // Connect to the database.
    const db = await openDB();

    // Get user input.
    const id = req?.body?.id ? parseInt(req?.body?.id) : null;
    let day = req?.body?.day ? req?.body?.day : null;
    const time = req?.body?.time ? req?.body?.time : null;

    // Verify the id submitted by the user is valid.
    if (id === null || isNaN(id) || id <= 0) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/timesheet/update',
                moment: 'Validating time slot id submitted by the user.',
                message: "The time slot id you submitted is invalid. Make sure it's an integer greater than 0.",
            },
        });
    }

    // Verify if the day submitted by the user is correct.
    if (!isValidDay(day)) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/timesheet/update',
                moment: 'Validating the day submitted by the user.',
                message:
                    "The day you submitted is not a valid day! Make sure it's in the following format: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.",
            },
        });
    }

    // Verify if the time submitted by the user is correct.
    if (!isValidTime(time, 24)) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/timesheet/update',
                moment: 'Validating the time submitted by the user.',
                message:
                    "The time you submitted is not valid! Make sure it's in the 24-hour format: 00:00, 12:00, 18:00, etc.",
            },
        });
    }

    const day_mapping = {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday',
    };

    const day_min_mapping = {
        mon: 'Monday',
        tue: 'Tuesday',
        wed: 'Wednesday',
        thu: 'Thursday',
        fri: 'Friday',
        sat: 'Saturday',
        sun: 'Sunday',
    };

    day = Object.keys(day_mapping).includes(day.toLowerCase())
        ? day_mapping[day.toLowerCase()]
        : day_min_mapping[day.toLowerCase()];

    const time_formatted = convert24HourTimeTo12HourTime(time);
    const priority = parseInt(time.replace(':', ''));

    try {
        const query = 'SELECT * FROM timesheet WHERE id = ?';
        const params = [id];

        const timeslot = await db.get(query, params);

        if (!timeslot) {
            await db.close();

            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: 404,
                    type: 'Resource not found.',
                    route: '/api/v1/timesheet/update',
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
                    route: '/api/v1/timesheet/update',
                    moment: 'Checking if the time slot exists in the database.',
                    message: err.toString(),
                },
            });
        }
    }

    try {
        const query = 'SELECT * FROM timesheet WHERE day = ? AND time = ?';
        const params = [day, time];

        const timeslot = await db.get(query, params);

        if (timeslot) {
            await db.close();

            return res.status(409).json({
                success: false,
                data: null,
                error: {
                    code: 409,
                    type: 'Duplicate content.',
                    route: '/api/v1/timesheet/update',
                    moment: 'Checking to see if the day and time already exist in the database.',
                    error: `${time_formatted} on ${day} already exists in the database.`,
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
                    route: '/api/v1/timesheet/update',
                    moment: 'Checking to see if the day and time already exist in the database.',
                    error: err.toString(),
                },
            });
        }
    }

    try {
        const query = `
            UPDATE timesheet
            SET
                day = ?,
                time = ?,
                time_formatted = ?,
                priority =?
            WHERE
                id = ?;
        `;
        const params = [day, time, time_formatted, priority, id];

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
                    route: '/api/v1/timesheet/update',
                    moment: 'Updating the time slot in the database.',
                    error: err.toString(),
                },
            });
        }
    }
});
