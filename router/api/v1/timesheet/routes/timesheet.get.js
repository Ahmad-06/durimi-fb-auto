const express = require('express');

const GET = express.Router();
module.exports = GET;

const openDB = require('../../../../../data/openDB');

const { isValidDay } = require('../../../../../utils/utils');

GET.get('/all', async (req, res) => {
    // Connect with the database.
    const db = await openDB();

    try {
        const query = 'SELECT * FROM timesheet ORDER BY day, priority';

        const timeslots = await db.all(query);

        res.json({
            success: true,
            data: {
                timeslots,
            },
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
                    route: '/api/v1/timesheet/all',
                    moment: 'Echoing all time slots from the database.',
                    message: err.toString(),
                },
            });
        }
    }
});

GET.get('/:day', async (req, res) => {
    // Connect to the database.
    const db = await openDB();

    let day = req.params.day;

    // Verify if the day submitted by the user is correct.
    if (!isValidDay(day)) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: `/api/v1/timesheet/${day}`,
                moment: 'Validating the day submitted by the user.',
                message:
                    "The day you submitted is not a valid day! Make sure it's in the following format: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.",
            },
        });
    }

    // Get the actual day.
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

    try {
        const query = 'SELECT * FROM timesheet WHERE day = ? ORDER BY priority';
        const params = [day];

        const timeslots = await db.all(query, params);

        const data = timeslots && timeslots.length > 0 ? timeslots : null;

        res.json({
            success: true,
            data,
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
                    route: `/api/v1/day/${req.params.day}`,
                    moment: `Echoing all time slots for '${day}' from the database.`,
                    message: err.toString(),
                },
            });
        }
    }
});
