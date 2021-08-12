import User from "../models/User";
import bcrypt from "bcrypt";

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
  const user = await User.findOne({ username });
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
    client_id: "38b05a805db96dc6882c",
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const FinalUrl = `${BaseUrl}?${params}`;
  return res.redirect(FinalUrl);
};

export const finishGithubLogin = (req, res) => {};
export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Delete User");
export const logout = (req, res) => res.send("LogOut");
export const see = (req, res) => res.send("See User");
