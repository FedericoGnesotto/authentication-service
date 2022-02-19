const express = require('express');
const router = express.Router({ mergeParams: true });
const { body } = require("express-validator");

const auth = require('../middlewares/user_authentication')
const User = require('../models/user_model');
const userController = require('../controllers/user_controller');

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please Enter a valid email ID")
      .custom((value, req) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email already Exist");
          }
        });
      })
      .normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Your password whould be at least 6 characters long"),
  ],
  userController.onSignup
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please Enter a valid email ID")
      .normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Please Enter a Valid Password!"),
  ],
  userController.onLogin
);

router.delete("/", auth.loginAuthorization, userController.onUserDelete);

module.exports = router;