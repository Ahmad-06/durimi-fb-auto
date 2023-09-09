const express = require('express');

const login = express.Router();
module.exports = login;

login.get('/', (req, res) => {
    res.json({
        success: true,
        data: null,
        error: null,
    });
});
