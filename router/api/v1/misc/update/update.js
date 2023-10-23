const express = require('express');

const update = express.Router();
module.exports = update;

update.get('/', (req, res) => {
    res.json({
        success: true,
        data: null,
        error: null,
    });
});
