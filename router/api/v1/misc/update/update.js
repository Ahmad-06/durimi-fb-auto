const express = require('express');

const update = express.Router();
module.exports = update;

const getUpdate = require('../../../../../utils/update');

update.get('/', async (req, res) => {
    try {
        const canUpdate = await getUpdate();

        res.json({
            success: true,
            data: {
                update: canUpdate,
            },
            error: null,
        });
    } catch (err) {
        if (err) {
            return res.status(500).json({
                success: false,
                data: null,
                error: {
                    code: 500,
                    type: 'Internal server error',
                    route: '/api/v1/misc/update',
                    moment: 'Checking if a new update is available.',
                    message: err.toString(),
                },
            });
        }
    }
});
