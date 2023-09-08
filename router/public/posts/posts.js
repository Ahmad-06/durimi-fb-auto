const express = require('express');

const posts = express.Router();
module.exports = posts;

const reOrderRouter = require('./re-order/re-order');

posts.get('/', (req, res) => {
    res.render('posts/posts');
});

posts.use('/re-order', reOrderRouter);
