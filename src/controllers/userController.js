import User from "../models/User";
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
    console.log(userdata);
    const emaildata = await (
      await fetch(`${apiUri}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    console.log(emaildata);

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
    req.session.loggedIn = true;
    req.session.user = user;
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
export const edit = (req, res) => res.send("Edit User");
export const see = (req, res) => res.send("See User");
