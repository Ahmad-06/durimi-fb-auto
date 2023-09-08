const express = require('express');

const timesheet = express.Router();
module.exports = timesheet;

timesheet.get('/', (req, res) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    res.render('timesheet/timesheet', { days });
});
