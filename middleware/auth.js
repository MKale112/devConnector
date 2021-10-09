const jwt = require("jsonwebtoken");
const config = require("config");

// does the middleware need to be ASYNC?
module.exports = async function (req, res, next) {
  // get the token from the header
  const token = req.header("x-auth-token");

  // check if no token
  if (!token) {
    return res.status(401).json({ msg: "No token. Authorization denied" });
  }

  try {
    // verify the token
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    // decoded = {user: {id: users_id.}}
    // add the decoded info to the req
    // NB: req.user appears in the req only after we do the line below, before that there is no "user" in the "req" object
    req.user = decoded.user;

    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid." });
  }
};
