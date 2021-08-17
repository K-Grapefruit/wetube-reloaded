import User from "../models/User";
import Video from "../models/Video";
import bcrypt from "bcrypt";
import fetch from "node-fetch";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });

export const postJoin = async (req, res) => {
  console.log(req.body);
  const { name, username, email, password, password2, location } = req.body;

  if (password !== password2) {
    {
      return res.status(400).render("join", {
        pageTitle: "join",
        errorMessage: "Password confirmation does not match",
      });
    }
  }

  const exists = await User.exists({ $or: [{ username }, { email }] }); //두 조건 중에 하나라도 참이면 실행
  if (exists) {
    return res.status(400).render("join", {
      pageTitle: "join",
      errorMessage: "username/email is already taken",
    });
  }
  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    console.log(error);
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, socialonly: false });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle: "Login",
      errorMessage: "an account with this username does not exists.",
    });
  }

  const ok = await bcrypt.compare(password, user.password);
  {
    if (!ok) {
      return res.status(400).render("login", {
        pageTitle: "Login",
        errorMessage: "Wrong password",
      });
    }
  }
  req.session.loggedIn = true;
  req.session.user = user;
  //check if account exists
  //check if password correct
  console.log(user);
  return res.redirect("/");
};

//Github Login
export const startGithubLogin = (req, res) => {
  const BaseUrl = `https://github.com/login/oauth/authorize`;
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const FinalUrl = `${BaseUrl}?${params}`;
  return res.redirect(FinalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseURL = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString(); //오브젝트 전체를 문자열로 바꿈
  const finalUrl = `${baseURL}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();

  if ("access_token" in tokenRequest) {
    //access api
    const { access_token } = tokenRequest;
    const apiUri = "https://api.github.com";
    const userdata = await (
      await fetch(`${apiUri}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    console.log("userdata", userdata);
    const emaildata = await (
      await fetch(`${apiUri}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    console.log("emaildata", emaildata);

    const emailObj = emaildata.find(
      (email) => email.primary === true && email.verified === true
    );

    if (!emailObj) {
      return res.redirect("/login");
    }

    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      const user = await User.create({
        avatarUrl: userdata.avatar_url,
        name: userdata.name,
        username: userdata.login,
        email: emailObj.email,
        password: "",
        socialonly: true,
        location: userdata.location,
      });
    }
    req.session.user = user;
    req.session.loggedIn = true;

    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }

  // console.log(json);
  // res.send(JSON.stringify(json));
};
export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, email, username, location },
    file,
  } = req;

  // if (tnf && email === edituser.email && username === edituser.username) {
  //   console.log("username or email already exist ");
  //   return res.redirect("Edit");
  // }

  const foundUser = await User.findOne({
    $or: [{ email: email }, { username: username }],
  });
  console.log(foundUser);
  if (foundUser && foundUser._id.toString() !== _id) {
    return res.status(400).render("edit-profile", {
      errorMessage: "already exist name or email",
      pageTitle: "Edit Profile",
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      name: name,
      email: email,
      username: username,
      location: location,
    },
    {
      new: true,
    }
  );
  req.session.user = updatedUser;
  return res.redirect("/users/edit");
};

export const getEdit = (req, res) => {
  console.log("오긴오니 시발");
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};

export const getChangePassword = (req, res) => {
  return res.render("users/change-password", { pageTitle: "Change Password" });
};
export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPassword1 },
  } = req;
  const user = await User.findById(_id);
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect",
    });
  }
  if (newPassword !== newPassword1) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The password does not match",
    });
  }

  user.password = newPassword;
  await user.save(); // 코드 실행시 User.js에 있는 pre save가 작동함 , 새로운 비밀번호를 hash하기 위함

  return res.redirect("/users/logout");
};
export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate("videos");
  if (!user) {
    return res.status(404).render("404", { pageTitle: `User not Found` });
  }

  return res.render("profile", {
    pageTitle: `${user.name}의 Profile`,
    user,
  });
};
