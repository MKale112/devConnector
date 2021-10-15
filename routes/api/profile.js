const express = require("express");
const router = express.Router(); // we call Router() with brackets
const { check, validationResult } = require("express-validator/check");
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const Post = require("../../models/Post");
const request = require("request");
const config = require("config");

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );

    if (!profile) {
      return res
        .status(400)
        .json({ msg: "There is no profile for this user." });
    }

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error.");
  }
});

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    //build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills;
      // profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    // build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
      // req.user.id comes from the TOKEN
      let profile = await Profile.findOne({ user: req.user.id });

      // if there is a profile already then we will UPDATE
      if (profile) {
        // we match it over the id
        // $set parameter is used to set the new state of the document
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      // if there is no profile then we CREATE a profile
      profile = new Profile(profileFields);
      // save the profile
      await profile.save();
      // we send back the profile
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).json("Server error");
    }
  }
);

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).json("Server error");
  }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by User ID
// @access  Public
router.get("/profile/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({ msg: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    if (error.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile not found." });
    }
    res.status(500).json("Server error");
  }
});

// @route   DELETE api/profile
// @desc    Delete profile, user and posts
// @access  Private
router.delete("/", auth, async (req, res) => {
  try {
    // Remove all user's posts -- we deleteMany, meaning every post that has a user's id from the req (token)
    await Post.deleteMany({ user: req.user.id });

    // Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });

    // Remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "User removed." });
  } catch (err) {
    console.error(err.message);
  }
});

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { title, company, location, from, to, current, description } =
      req.body;

    const newExp = {
      title: title, // we can write this as just: title. We do that for the next variables
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.push(newExp);
      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).json("Server error.");
    }
  }
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete profile experience from profile
// @access  Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // Get remove index --  we do this by taking the "exp_id" in the URL and matching it over all the "_id"s we have in
    // the experience array, and as soon as one matches we return it's index in the array
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    // Removing that experience entry in the array
    profile.experience.splice(removeIndex, 1);

    // Re-saving the document
    await profile.save();

    // Returning the profile
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
});

// @route   PUT api/profile/education
// @desc    Add profile education
// @access  Private
router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("fieldofstudy", "Field of Study is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { school, degree, fieldofstudy, from, to, current, description } =
      req.body;

    const newEdu = {
      school: school, // we can write this as just "school". We do that for the next variables
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.push(newEdu);
      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).json("Server error.");
    }
  }
);

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete profile education from profile
// @access  Private
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // Get remove index --  we do this by taking the "edu_id" in the URL and matching it over all the "_id"s we have in
    // the education array, and as soon as one matches we return it's index in the array
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    // Removing that education entry in the array
    profile.education.splice(removeIndex, 1);

    // Re-saving the document
    await profile.save();

    // Returning the profile
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
});

// @route   GET api/profile/github/:username
// @desc    Get user reop from github
// @access  Public
router.get("/github/:username", async (req, res) => {
  try {
    // we make a request from here in the back end -- that is why in the following lines we make the options ourselves
    // (they look like the ones when we do "fetch()" in the frontend)

    // ok so this is a lot:
    // ${req.params.username} -- we send a username from the request we get from the user on the frontend
    // repos?per_page=5&sort=created:asc -- after the repos link we use "?" to send additional parameters -- "how much per page" and "how should they be sorted"
    // &client_id=${config.get("githubClientId")} -- we add the client's id
    // &client_secret=${config.get("githubSecret")} -- we add the secret
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        "githubClientId"
      )}&client_secret=${config.get("githubSecret")}`,
      method: "get",
      headers: { "user-agent": "node.js" },
    };

    // when we haave the options we make a request
    request(options, (error, response, body) => {
      // check if we got any errors
      if (error) console.error(error);
      // if we got ANY status code other than 200/"OK" then smth went wrong and we send a 404/"Resource not found"
      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: "No github profile found" });
      }

      // return the body
      // the body we send is just going to be a raw string with quotes so we have to parse it before sending it to the frontend
      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error.");
  }
});

module.exports = router;
