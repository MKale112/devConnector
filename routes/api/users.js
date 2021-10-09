const express = require("express");
const router = express.Router(); // we call Router() with brackets
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator/check");

// We need to bring in the User model if we are going to access it
const User = require("../../models/User");

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post(
  "/",
  [
    check("name", "Name is required.").not().isEmpty(),
    check("email", "Please include a valid email.").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters."
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    // if there are errors then return them formatted in an array
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // WORKFLOW:

      // 1) See if the user exists
      let user = await User.findOne({ email: email });
      // if the user already exists then return the error msg formated the same way as the errors below (for consistency)
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "user already exists" }] });
      }

      // 2) Get user's gravatar
      // s=size in px, r=rating, d=default
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });

      // we make a ** new ** user
      user = new User({
        name,
        email,
        avatar,
        password,
      });

      // 3) Encrypt the password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      // 4) return json-web-token
      // we make payload a new object
      const payload = {
        user: {
          // user.id is the id of the user object which mongoose automatically assigns when we make a new document in the db
          id: user.id,
        },
      };

      // jwt.sign() takes in: payload, a secret, additional options, callback function (error, token) where we will get
      //  either the error (which we throw) or the token which we send back to the client
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) {
            throw err;
          }
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).json("Server error");
    }
  }
);

module.exports = router;
