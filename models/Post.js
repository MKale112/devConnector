const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  text: { type: String, required: true },
  name: { type: String },
  avatar: { type: String },
  likes: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, // we'll be able to see users which have commented (their id)
    },
  ],
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, // we'll be able to see users which have commented (their id)
      text: {
        type: String,
        required: true,
      },
      name: { type: String },
      avatar: { type: String },
      date: { type: Date, default: Date.now }, // the date of each comment on the post
    },
  ],
  date: { type: Date, default: Date.now }, // the date of the actual post (when it was posted)
});

// To use our schema definition, we need to convert our PostSchema into a Model we can work with.
// To do so, we pass it into mongoose.model(modelName, schema):

module.exports = Post = mongoose.model("post", PostSchema);
