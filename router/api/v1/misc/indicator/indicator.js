const express = require('express');

const indicator = express.Router();
module.exports = indicator;

const { loggedIn } = require('../../../../../utils/loggedIn');

indicator.get('/', loggedIn, (req, res) => {
    try {
        const indicator = process.env.INDICATOR || 'FB-AUTO DEFAULT';
        const link = process.env.INDICATOR_LINK === 'page' ? process.env.PAGE_LINK : process.env.GROUP_LINK;

        res.json({
            success: true,
            data: {
                indicator,
                link,
            },
            error: null,
        });
    } catch (err) {
        if (err) {
            res.status(500).json({
                success: false,
                data: null,
                error: {
                    code: 500,
                    type: 'Internal server error',
                    route: '/api/v1/misc/indicator',
                    moment: 'Publishing the indicator in response to user request.',
                    message: err.toString(),
                },
            });
        }
    }
});
