const bcrypt = require('bcryptjs');

const openDB = require('../data/openDB');

const changePass = async (req, res, next) => {
    if (process.env.ENABLE_USER_PASS === 'false') return next();

    const db = await openDB();

    const existing = await db.get("SELECT * FROM Users WHERE username = 'admin'");

    if (!existing) return next();

    const password = existing.password;

    const accept = bcrypt.compareSync('admin', password);

    if (!accept) return next();

    res.redirect('/auth/pass');
};

module.exports = changePass;
