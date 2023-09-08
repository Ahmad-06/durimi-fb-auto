const express = require('express');

const timesheet = express.Router();
module.exports = timesheet;

timesheet.use('/', require('./routes/timesheet.get'));
timesheet.use('/create', require('./routes/timesheet.create'));
timesheet.use('/update', require('./routes/timesheet.update'));
timesheet.use('/delete', require('./routes/timesheet.delete'));
