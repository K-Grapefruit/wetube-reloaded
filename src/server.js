import "./db";
import "./models/Video";
import "./models/User";
import session from "express-session";
import express, { Router } from "express";
import morgan from "morgan";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import { localsMiddleware } from "./middleware";

const app = express();
const logger = morgan("dev");
// const handleListening = () => console.log("Server listening on port 4000");

app.set("view engine", "pug"); //뷰 엔진을 pug로 세팅 , Express는 HTML리턴을 위해 PUG사용
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({ extended: true })); // HTML form을 이해하고 그 form을 사용할 수 있는 javascript object형식으로 통역해준다 , 순서대로 실행되기 때문에 router앞에 먼저 작성해줘야함
// app.get("/", () => console.log("야 이게 뭐야"));
app.use(
  session({
    secret: "Hello",
    resave: true,
    saveUninitialized: true,
  })
);

app.use((req, res, next) => {
  req.sessionStore.all((error, sessions) => {
    console.log(sessions);
    next();
  });
});

app.use(localsMiddleware);
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

//정리하자면 app.use()는 모든 요청을 받아들이고
//app.get()은 Only get 요청만 처리한다 !

export default app;
