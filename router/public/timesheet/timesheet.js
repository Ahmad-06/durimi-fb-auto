const express = require('express');

const timesheet = express.Router();
module.exports = timesheet;

const openDB = require('../../../data/openDB');

timesheet.get('/', async (req, res) => {
    // Connect to the database.
    const db = await openDB();

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    let timeslots;

    try {
        const query = 'SELECT * FROM timesheet ORDER BY day, priority';

        timeslots = await db.all(query);
    } catch (err) {
        if (err) {
            await db.close();

            return res.send('There was an error trying to get the time slots from the database.');
        }
    }

    res.render('timesheet/timesheet', { days, timeslots });
});
