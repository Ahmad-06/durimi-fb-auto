const express = require('express');

const posts = express.Router();
module.exports = posts;

posts.get('/', (req, res) => {
    res.render('posts/posts');
});

posts.use('/re-order', require('./re-order/re-order'));
