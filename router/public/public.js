const express = require('express');

const public = express.Router();
module.exports = public;

const homeRouter = require('./home/home');
const postsRouter = require('./posts/posts');
const timesheetRouter = require('./timesheet/timesheet');

public.use('/', homeRouter);
public.use('/posts', postsRouter);
public.use('/timesheet', timesheetRouter);
