const express = require('express');

const duplink = express.Router();
module.exports = duplink;

duplink.post('/', async (req, res) => {
    res.json({
        success: true,
        data: null,
        error: null,
    });
});
