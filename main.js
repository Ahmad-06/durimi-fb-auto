require('dotenv').config();

// TODO: get rid of this
const cors = require('cors');
const njk = require('nunjucks');
const bcrypt = require('bcryptjs');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

require('./data/seedDB')();

const openDB = require('./data/openDB');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, { id: user.id });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

passport.use(
    new LocalStrategy(async function verify(username, password, cb) {
        const db = await openDB();

        try {
            const user = await db.get('SELECT * FROM Users WHERE username = ?', [username]);

            if (!user) return cb(null, false, { message: 'Incorrect username or password.' });

            bcrypt.compare(password, user.password, (err, accept) => {
                if (err) return cb(err);

                if (!accept) return cb(null, false, { message: 'Incorrect username or password.' });

                return cb(null, user);
            });
        } catch (err) {
            if (err) {
                return cb(err);
            }
        }
    }),
);

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

app.use(cookieParser(process.env.SESSION_SECRET || 'twinkle frinkle littol star, what"s a wonder good you are!'));

app.use(bodyParser.json({ limit: '512mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '512mb' }));

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'twinkle frinkle littol star, what"s a wonder good you are!',
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 3,
        },
    }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use(require('./router/router'));

app.listen(PORT, () => {
    console.log(`The API is running at http://${HOST}:${PORT}`);
});

require('./cronjobs');
