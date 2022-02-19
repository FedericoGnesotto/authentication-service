const tokenHelper = require('../helpers/token-helper')

module.exports.loginAuthorization = (req, res, next) => {

    let token = tokenHelper.getToken(req);
    if (!token) {
        const err = new Error("unable to authenticate");
        err.statusCode = 401;
        throw err;
    }

    req.userId = token.userId;
    next();
};