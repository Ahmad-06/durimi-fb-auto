const express = require('express');

const reOrder = express.Router();
module.exports = reOrder;

const openDB = require('../../../../../data/openDB');

reOrder.patch('/', async (req, res) => {
    // Connect to the database.
    const db = await openDB();

    const posts = req?.body?.posts ? req?.body?.posts : null;

    if (!posts) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/posts/re-order',
                moment: 'Validating user input.',
                message: 'Please provide an array of posts.',
            },
        });
    }

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];

        try {
            const query = `
                UPDATE
                    posts
                SET
                    priority = ?
                WHERE
                    id = ?;
            `;

            const params = [i, post.id];

            await db.run(query, params);
        } catch (err) {
            if (err) {
                await db.close();

                return res.json({
                    success: false,
                    data: null,
                    error: {
                        code: 500,
                        type: 'Internal server error.',
                        route: '/api/v1/posts/re-order',
                        moment: 'Storing the updated post priority in the database.',
                        message: err.toString(),
                    },
                });
            }
        }
    }

    res.json({
        success: true,
        data: null,
        error: null,
    });

    await db.close();
});
