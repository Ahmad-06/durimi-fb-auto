const express = require('express');

const v1 = express.Router();
module.exports = v1;

v1.use('/misc', require('./misc/misc'));
v1.use('/posts', require('./posts/posts'));
v1.use('/groups', require('./groups/groups'));
v1.use('/timesheet', require('./timesheet/timesheet'));
