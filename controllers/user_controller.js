const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");

const User = require('../models/user_model');
const { APP_KEY } = require('../config/app.config');
const tokenHelper = require('../helpers/token-helper')

// Helper functions

/**
 * @param {*} result result of pswd comparison
 * @param {*} user user model
 * @returns token for authentication
 */
const setToken = (user) => {
  const token = jwt.sign(
    { userId: user._id.toString(), email: user.email },
    APP_KEY,
    { expiresIn: "90d" }
  );

  user.token = token;
  user.save();

  return token;
};

/**
 * Generates hash for password and saves to DB.
 * @param {*} email email string
 * @param {*} psw string for password
 * @param {*} it number of hashing iterations
 * @returns promise for saving to db
 */
async function hashAndSave(reqBody, it) {
  let hash = await bcrypt.hash(reqBody.password, it);
  if (!hash) {
    throw Error("No hash returned");
  }

  const user = new User({
    email: reqBody.email,
    password: hash,
    name: reqBody.name,
  });

  let ok = await user.save();
  if (!ok) {
    throw Error("Could not save to DB");
  }

  return user;
};

async function comparePswd(user, password) {
  if (!user) {
    const err = new Error("No User found with the provided email address.");
    err.statusCode = 401;
    throw err;
  }

  let ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    const err = new Error("Password not matching.");
    err.statusCode = 401;
    throw err;
  }

  return user;
};

/**
 * Handler executing signup logic.
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next handler
 * @returns response
 */
exports.onSignup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  hashAndSave(req.body, 12)
    .then((user) => {
      const token = setToken(user);
      res.status(200).json(token);
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

/**
 * Handler executing login logic.
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next handler
 * @returns response
 */
exports.onLogin = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const token = "";
  try {
    token = tokenHelper.getToken(req);
  }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  } // TODO: this does not work as there is no authorization on first login

  if (!token.isEmpty()) {
    User.findByToken(token,
      (err, user) => {
        if (err) return res(err);
        if (user) return res.status(400).json({
          error: true,
          message: "You are already logged in"
        })
      }
    );
  }

  User.findOne({ email: req.body.email })
    .then((user) => comparePswd(user, req.body.password))
    .then((user) => setToken(user))
    .then((token) => res.status(200).json({ token: token }))
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
exports.onUserDelete = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  User.findOneAndRemove({
    _id: req.body.userId
  })
    .then((deletedUser) => { res.json(deletedUser) })
    .catch(err => next(err))
};

// TODO: implement logout i.e. remove token