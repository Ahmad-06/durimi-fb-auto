const express = require('express');

const INSTANT = express.Router();
module.exports = INSTANT;

const openDB = require('../../../../../data/openDB');

const { isValidDay, isValidTime, convert24HourTimeTo12HourTime } = require('../../../../../utils/utils');

const { loggedIn } = require('../../../../../utils/loggedIn');

INSTANT.post('/', loggedIn, async (req, res) => {
    const db = await openDB();

    const days = req?.body?.days && req?.body?.days?.length > 0 ? req?.body?.days : null;
    const time = req?.body?.time ? req?.body?.time : null;

    // Check if user has submitted all required fields.
    if (days === null || time === null) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/timesheet/instant',
                moment: 'Checking if user submitted all required fields.',
                message:
                    'The days or time are missing from your request. Please make sure to provide both days and a time.',
            },
        });
    }

    // Verify if the day submitted by the user is correct.
    let failedDays = false;
    for (let i = 0; i < days.length; i++) {
        const day = days[i];

        if (!isValidDay(day)) {
            failedDays = true;
        }
    }

    if (failedDays) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/timesheet/instant',
                moment: 'Validating the days submitted by the user.',
                message:
                    'The days you submitted are not valid days! Make sure they are in the following format: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.',
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
                route: '/api/v1/timesheet/instant',
                moment: 'Validating the time submitted by the user.',
                message:
                    "The time you submitted is not valid! Make sure it's in the 24-hour format: 00:00, 12:00, 18:00, etc.",
            },
        });
    }

    let errors = {
        system: [],
    };

    for (let i = 0; i < days.length; i++) {
        let day = days[i];

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

            if (!timeslot) {
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
                } catch (err) {
                    if (err) {
                        errors.system.push({
                            success: false,
                            data: null,
                            error: {
                                code: 500,
                                type: 'Internal server error.',
                                route: '/api/v1/timesheet/instant',
                                moment: 'Storing the time slot in the database.',
                                error: err.toString(),
                            },
                        });
                    }
                }
            }
        } catch (err) {
            if (err) {
                errors.system.push({
                    success: false,
                    data: null,
                    error: {
                        code: 500,
                        type: 'Internal server error.',
                        route: '/api/v1/timesheet/instant',
                        moment: 'Checking to see if the day and time already exist in the database.',
                        error: err.toString(),
                    },
                });
            }
        }
    }

    await db.close();

    res.json({
        success: true,
        data: null,
        error:
            errors.system.length === 0
                ? null
                : {
                      code: 699,
                      type: 'System Errors Encountered.',
                      route: '/api/v1/timesheet/instant',
                      moment: 'Adding timeslots to the database.',
                      error: errors.system,
                  },
    });
});
