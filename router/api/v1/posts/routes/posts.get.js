const express = require('express');

const GET = express.Router();
module.exports = GET;

const openDB = require('../../../../../data/openDB');

GET.get('/all', async (req, res) => {
    // Connect to the database.
    const db = await openDB();

    try {
        const query = 'SELECT * FROM posts ORDER BY priority';

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

GET.get('/:type', async (req, res) => {
    // Connect to the database.
    const db = await openDB();

    const type = req.params.type;
    const types = ['automated', 'scheduled'];

    if (!types.includes(type)) {
        await db.close();

        return res.status(404).json({
            success: false,
            data: null,
            error: {
                code: 404,
                type: 'Resource not found.',
                route: `/api/v1/posts/${type}`,
                moment: `Trying to get posts of type '${type}' from the database.`,
                message: 'No such route or post type exists.',
            },
        });
    }

    try {
        const query = 'SELECT * FROM posts WHERE type = ? ORDER BY priority';
        const params = [type];

        const posts = await db.all(query, params);

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
                    route: `/api/v1/posts/${type}`,
                    moment: `Echoing all posts of '${type}' type from the database.`,
                    message: err.toString(),
                },
            });
        }
    }
});
