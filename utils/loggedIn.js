function loggedIn(req, res, next) {
    if(process.env.ENABLE_USER_PASS === "false") return next();

    if (req.user) {
        next();
    } else {
        res.redirect('/auth/login');
    }
}

function loggedOut(req, res, next) {
    if(process.env.ENABLE_USER_PASS === "false") return res.redirect("/");

    if (!req.user) {
        next();
    } else {
        res.redirect('/');
    }
}

module.exports = { loggedIn, loggedOut };
