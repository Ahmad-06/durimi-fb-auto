const express = require('express');

const misc = express.Router();
module.exports = misc;

misc.use('/indicator', require('./indicator/indicator'));
