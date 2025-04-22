const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === '2') {
        next();
    } else {
        res.status(403).redirect('/profile');
    }
};



module.exports = { isAuthenticated, isAdmin };
