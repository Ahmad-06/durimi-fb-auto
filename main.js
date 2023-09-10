require('dotenv').config();

// TODO: get rid of this
const cors = require('cors');
const njk = require('nunjucks');
const express = require('express');
const bodyParser = require('body-parser');

require('./data/seedDB')();

const app = express();
const PORT = process.env.PORT || 49500;
const HOST = process.env.HOST || '127.0.0.1';

njk.configure('./views', {
    express: app,
    autoescape: true,
});
app.set('view engine', 'html');

// TODO: get rid of this
app.use(cors());

app.use(express.static('./public'));

app.use(bodyParser.json({ limit: '512mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '512mb' }));

app.use(require('./router/router'));

app.listen(PORT, () => {
    console.log(`The API is running at http://${HOST}:${PORT}`);
});

require('./cronjobs');
