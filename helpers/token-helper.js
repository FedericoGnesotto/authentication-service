
const jwt = require("jsonwebtoken");
const { APP_KEY } = require("../config/app.config");

module.exports.getToken = (req) => {
    const authorization = req.get("Authorization");
    if (!authorization) {
        const err = new Error("Authorization error");
        err.statusCode = 401;
        throw err;
    }

    const token = authorization.split(" ")[1];
    let decodedToken = null;
    try {
        decodedToken = jwt.verify(token, APP_KEY);
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }

    return decodedToken;
}