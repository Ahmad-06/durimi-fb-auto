const express = require('express');

const posts = express.Router();
module.exports = posts;

posts.use('/', require('./routes/posts.get'));
posts.use('/create', require('./routes/posts.create'));
posts.use('/update', require('./routes/posts.update'));
posts.use('/delete', require('./routes/posts.delete'));
posts.use('/publish', require('./routes/posts.publish'));

posts.use('/re-order', require('./re-order/re-order'));
