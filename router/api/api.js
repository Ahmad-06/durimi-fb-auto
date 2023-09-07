const express = require('express');

const api = express.Router();
module.exports = api;

api.use('/v1', require('./v1/v1'));
