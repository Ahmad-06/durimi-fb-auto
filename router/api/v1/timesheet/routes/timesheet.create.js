const express = require('express');

const CREATE = express.Router();
module.exports = CREATE;

const openDB = require('../../../../../data/openDB');

const { isValidDay, isValidTime, convert24HourTimeTo12HourTime } = require('../../../../../utils/utils');

CREATE.post('/', async (req, res) => {
    // Connect to the database.
    const db = await openDB();

    // Get user input.
    let day = req?.body?.day ? req?.body?.day : null;
    const time = req?.body?.time ? req?.body?.time : null;

    // Check if user has submitted all required fields.
    if (day === null || time === null) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/timesheet/create',
                moment: 'Checking if user submitted all required fields.',
                message:
                    'The day or time are missing from your request. Please make sure to provide both a day and a time.',
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
                route: '/api/v1/timesheet/create',
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
                route: '/api/v1/timesheet/create',
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
                    route: '/api/v1/timesheet/create',
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
                    route: '/api/v1/timesheet/create',
                    moment: 'Checking to see if the day and time already exist in the database.',
                    error: err.toString(),
                },
            });
        }
    }

    try {
        const query = `
            INSERT INTO timesheet
            (
                day,
                time,
                time_formatted,
                priority
            ) VALUES (?, ?, ?, ?);
        `;
        const params = [day, time, time_formatted, priority];

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
                    route: '/api/v1/timesheet/create',
                    moment: 'Storing the time slot in the database.',
                    error: err.toString(),
                },
            });
        }
    }
});
