require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');

require('./data/seedDB')();

const app = express();
const PORT = process.env.PORT || 49500;
const HOST = process.env.HOST || '127.0.0.1';

app.use(bodyParser.json({ limit: '512mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '512mb' }));

app.use(require('./router/router'));

app.listen(PORT, () => {
    console.log(`The API is running at http://${HOST}:${PORT}`);
});
