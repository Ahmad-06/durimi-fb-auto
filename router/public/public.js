const express = require('express');

const public = express.Router();
module.exports = public;

public.use('/', require('./home/home'));
public.use('/posts', require('./posts/posts'));
public.use('/timesheet', require('./timesheet/timesheet'));
