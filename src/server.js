import "./db";
import "./models/Video";
import express, { Router } from "express";
import morgan from "morgan";
import globalRouter from "./routers/globalRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";

const app = express();
const logger = morgan("dev");
// const handleListening = () => console.log("Server listening on port 4000");

app.set("view engine", "pug"); //뷰 엔진을 pug로 세팅 , Express는 HTML리턴을 위해 PUG사용
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({ extended: true })); // HTML form을 이해하고 그 form을 사용할 수 있는 javascript object형식으로 통역해준다 , 순서대로 실행되기 때문에 router앞에 먼저 작성해줘야함
// app.get("/", () => console.log("야 이게 뭐야"));

app.use("/", globalRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

export default app;
