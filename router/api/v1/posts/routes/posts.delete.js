const fs = require('fs');
const path = require('path');

const express = require('express');

const DELETE = express.Router();
module.exports = DELETE;

const openDB = require('../../../../../data/openDB');

DELETE.delete('/', async (req, res) => {
    // Connect to the database.
    const db = await openDB();

    const id = req?.body?.id ? parseInt(req?.body?.id) : null;

    if (id === null || isNaN(id) || id <= 0) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/posts/delete',
                moment: 'Validating post id submitted by the user.',
                message: "The post id you submitted is invalid. Make sure it's an integer greater than 0.",
            },
        });
    }

    let post;

    try {
        const query = 'SELECT * FROM posts WHERE id = ?';
        const params = [id];

        post = await db.get(query, params);

        if (!post) {
            await db.close();

            res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: 404,
                    type: 'Resource not found.',
                    route: '/api/v1/posts/delete',
                    moment: 'Checking if the post exists in the database.',
                    message: 'A post with the id you submitted does not exist in the database.',
                },
            });
        }
    } catch (err) {
        if (err) {
            await db.close();

            return res.status(500).json({
                success: false,
                data: null,
                error: {
                    code: 500,
                    type: 'Internal server error.',
                    route: '/api/v1/posts/delete',
                    moment: 'Checking if the post exists in the database.',
                    message: err.toString(),
                },
            });
        }
    }

    if (post.media !== 'null') {
        try {
            const media = JSON.parse(post.media);

            for (let i = 0; i < media.length; i++) {
                const image = media[i];
                const mediaPath = path.join(__dirname, '..', '..', '..', '..', '..', 'public', 'media');
                const imagePath = path.join(mediaPath, image);

                fs.unlinkSync(imagePath);
            }
        } catch (err) {
            if (err) {
                await db.close();

                return res.status(500).json({
                    success: false,
                    data: null,
                    error: {
                        code: 500,
                        type: 'Internal server error.',
                        route: '/api/v1/posts/delete',
                        moment: 'Removing media files associated with the post to delete.',
                        message: err.toString(),
                    },
                });
            }
        }
    }

    try {
        const query = 'DELETE FROM posts WHERE id = ?';
        const params = [id];

        await db.run(query, params);

        res.json({
            success: true,
            data: null,
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
                    route: '/api/v1/posts/delete',
                    moment: 'Removing the post content from the database.',
                    message: err.toString(),
                },
            });
        }
    }
});
