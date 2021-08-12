import mongoose from "mongoose";

console.log(process.env.DB_URL);

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const db = mongoose.connection;
const hanldeOpen = () => console.log("Connected to DB");
db.on("error", (error) => console.log("DB ERROR", error));
db.once("open", hanldeOpen);
