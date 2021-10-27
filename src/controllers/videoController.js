import User from "../models/User";
import Video from "../models/Video";
import Comment from "../models/Comment";
import { async } from "regenerator-runtime";
//find({비어 있으면 모든 형식을 찾음 } , callback)

// Video.find({}, (error, videos) => {});

export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner"); // database에게 결과 값을 받을 때까지 기다려준다.
  //sort({ createAt: "desc" }) 내림차순
  console.log(videos);
  return res.render("home", { pageTitle: "Home", videos }); // ({뷰 이름} , {템플릿에 보낼 변수})
};
export const watch = async (req, res) => {
  const { id } = req.params; // const id = req.params.id
  const video = await Video.findById(id).populate("owner").populate("comments"); //populate는 owner부분을 실제 User 데이터로 채워준다.

  console.log(video);

  if (video) {
    return res.render("watch", { pageTitle: video.title, video });
  } else {
    return res.render("404", { pageTitle: "video not found" });
  }
};
export const getedit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "video not found" });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  return res.render("edit", { pageTitle: `Editing `, video });
};
export const postEdit = async (req, res) => {
  const { id } = req.params;
  // const video = await Video.findById(id);
  const video = await Video.exists({ _id: id });
  const { title, description, hashtags } = req.body;
  if (!video === null) {
    return res.status(400).render("404", { pageTitle: "video not found" });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "You are not the owner of the video ");
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    title: title,
    description: description,
    hashtags: Video.formatHashtags(hashtags),
  });

  await video.save();
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

const isHeroku = process.env.NODE_ENV === "production";

export const postUpload = async (req, res) => {
  // 이곳에서 비디오를 videos array에 추가할 예정
  const {
    user: { _id },
  } = req.session;
  const { file } = req;
  const { title, description, hashtags } = req.body;
  console.log("file", file);
  // const video = new Video({
  //   title: title,
  //   description: description,
  //   createdAt: Date.now(),
  //   hashtags: hashtags.split(",").map((word) => `#${word}`),
  //   meta: {
  //     views: 0,
  //     rating: 0,
  //   },
  // });
  // await video.save();
  //mongoose가 자동적으로 id를 부여함 , object는 document처럼 ID가 있어야하기때문
  try {
    const newVideo = await Video.create({
      title: title,
      description: description,
      fileUrl: isHeroku ? file.location : file.path,
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  //delete video
  const video = await Video.findById(id);
  if (!Video) {
    return res.status(400).render("404", { pageTitle: "video not found" });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    //search
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"),
      },
    }).populate("owner");
  }
  console.log(videos);
  return res.render("search", { pageTitle: "Search", videos });
};

//조회수
export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);

  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;

  const video = await Video.findById(id);

  if (!video) {
    return res.sendStatus(404);
  }

  const comment = await Comment.create({
    text: text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  video.save();
  return res.status(201).json({ newCommentId: comment._id });
};

export const deleteComment = async (req, res) => {
  const { id } = req.params;
  const user = req.session.user._id;

  const comment = await Comment.findById(id);

  if (!comment) {
    res.sendStatus(404);
  }

  if (String(comment.owner) !== String(user)) {
    res.sendStatus(404);
  }

  await Comment.findByIdAndDelete(id);
  res.sendStatus(201);
};
