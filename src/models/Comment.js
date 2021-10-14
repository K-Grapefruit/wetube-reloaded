import mongoose from "mongoose";

const comments = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  createdAt: { type: Date, required: true, default: Date.now },
  video: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Video" },
  text: { type: String, required: true },
});

const model = mongoose.model("Comment", comments);

export default model;
