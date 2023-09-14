function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/auth/login');
    }
}

function loggedOut(req, res, next) {
    if (!req.user) {
        next();
    } else {
        res.redirect('/');
    }
}

module.exports = { loggedIn, loggedOut };
