const express = require('express');

const GET = express.Router();
module.exports = GET;

const openDB = require('../../../../../data/openDB');

const { loggedIn } = require('../../../../../utils/loggedIn');

GET.get('/all', loggedIn, async (req, res) => {
    // Connect with the database.
    const db = await openDB();

    try {
        const query = 'SELECT * FROM groups;';

        const groups = await db.all(query);

        res.json({
            success: true,
            data: {
                groups,
            },
            error: null,
        });

        await db.close();
    } catch (err) {
        if (err) {
            await db.close();

            return res.status(500).json({
                success: false,
                data: null,
                error: {
                    code: 500,
                    type: 'Internal server error.',
                    route: '/api/v1/groups/all',
                    moment: 'Echoing all groups from the database.',
                    message: err.toString(),
                },
            });
        }
    }
});
