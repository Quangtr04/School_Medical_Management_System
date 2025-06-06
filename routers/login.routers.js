const express = require("express");
const loginController = require("../Controller/loginController");
const registerController = require("../Controller/registerController");
const {
  forgotPasswordByEmailController,
  forgotPasswordByPhoneController,
  newPassword,
} = require("../Controller/forgot_password_Controller");
const loginRouter = express();

loginRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await loginController(username, password);
    res.status(200).json({ status: "success", user });
  } catch (err) {
    res.status(401).json({ status: "fail", message: err });
  }
});

loginRouter.post("/register", async (req, res) => {
  const Infomation = req.body;
  try {
    const result = await registerController(Infomation);
    res.status(201).json({ status: "success", data: result });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
});

loginRouter.post("/forgot-password", async (req, res) => {
  const { email, phone } = req.body;
  try {
    if (email && !phone) {
      const result = await forgotPasswordByEmailController(email);
      res.status(200).json({ status: "success", message: result });
    } else if (phone && !email) {
      const result = await forgotPasswordByPhoneController(phone);
      res.status(200).json({ status: "success", message: result });
    } else {
      res.status(400).json({ status: "fail", message: "Email or phone number is required." });
    }
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
});

loginRouter.post("/reset-password", async (req, res) => {
  const { username, newPass } = req.body;
  try {
    const result = await newPassword(username, newPass);
    res.status(200).json({ status: "success", message: result });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
});

module.exports = loginRouter;
