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
import MongoStore from "connect-mongo";

const app = express();
const logger = morgan("dev");
// const handleListening = () => console.log("Server listening on port 4000");

app.set("view engine", "pug"); //뷰 엔진을 pug로 세팅 , Express는 HTML리턴을 위해 PUG사용
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({ extended: true })); // HTML form을 이해하고 그 form을 사용할 수 있는 javascript object형식으로 통역해준다 , 순서대로 실행되기 때문에 router앞에 먼저 작성해줘야함
// app.get("/", () => console.log("야 이게 뭐야"));

console.log(process.env.COOKIE_SECRET);
app.use(
  session({
    //비밀로 해야하는 String 을 proceess.env(환경변수)로 바꾸기
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,

    store: MongoStore.create({ mongoUrl: process.env.DB_URL }), //이 부분 지우면 세션이 서버의 메모리에 저장됨
  })
);

app.use((req, res, next) => {
  req.sessionStore.all((error, sessions) => {
    // console.log(sessions);
    next();
  });
});

app.use(localsMiddleware);
app.use("/uploads", express.static("uploads")); //express에게 누군가 uploads로 가려고 한다면 uploads폴더의 내용을 보여주게 함
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

//정리하자면 app.use()는 모든 요청을 받아들이고
//app.get()은 Only get 요청만 처리한다 !

export default app;
