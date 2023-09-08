const express = require('express');

const GET = express.Router();
module.exports = GET;

const openDB = require('../../../../../data/openDB');

GET.get('/all', async (req, res) => {
    // Connect to the database.
    const db = await openDB();

    try {
        const query = 'SELECT * FROM posts';

        const posts = await db.all(query);

        res.json({
            success: true,
            data: {
                posts,
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
                    route: '/api/v1/posts/all',
                    moment: 'Echoing all posts from the database.',
                    message: err.toString(),
                },
            });
        }
    }
});
