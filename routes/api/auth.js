const express = require("express");
const router = express.Router(); // we call Router() with brackets
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator/check");

// @route   GET api/auth
// @desc    Test route
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// @route   POST api/auth
// @desc    Authenticate user and get token (OR: Login)
// @access  Public
router.post(
  "/",
  [
    // check("field name", "error that will come up")
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    // if there are errors then return them formatted in an array
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // WORKFLOW:

      // 1) See if the user exists
      let user = await User.findOne({ email: email });
      // if the user doesn't exist then the password was incorrect
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
      }
      // it is best practice to return the SAME error if the user mistakes either password or email.
      // if we return different errors for email/password then the attaacker can still glean some info about the state of the DB.

      // 4) We are still returning a json-web-token for this "session"
      const payload = {
        user: {
          id: user.id,
        },
      };

      // jwt.sign() takes in: PAYLOAD, a SECRET, ADDITIONAL OPTIONS, CALLBACK FUNCTION(error, token) where we will get
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
