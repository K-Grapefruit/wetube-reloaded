import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  avatarUrl: String,
  socialonly: { type: Boolean, default: false },
  username: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String, required: true },
  location: String,
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }], //많은 비디오 담기 위해서
});

//유저 컨트롤 페이지에서 USER의 정보가 데이터베이스에 저장되기 전에 먼저 실행함
userSchema.pre("save", async function () {
  // console.log(this.password);
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 5);
  }
  // console.log(this.password);
});

const User = mongoose.model("User", userSchema);
export default User;
