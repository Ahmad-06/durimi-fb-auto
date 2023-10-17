const express = require('express');

const groups = express.Router();
module.exports = groups;

groups.use('/', require('./routes/groups.get'));
groups.use('/create', require('./routes/groups.create'));
groups.use('/update', require('./routes/groups.update'));
groups.use('/delete', require('./routes/groups.delete'));
