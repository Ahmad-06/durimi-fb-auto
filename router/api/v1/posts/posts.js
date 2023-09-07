const express = require('express');

const posts = express.Router();
module.exports = posts;

posts.use('/', require('./routes/posts.get'));
posts.use('/create', require('./routes/posts.create'));
posts.use('/update', require('./routes/posts.update'));
posts.use('/delete', require('./routes/posts.delete'));
