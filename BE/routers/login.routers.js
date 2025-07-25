const express = require("express");
const loginController = require("../Controller/Login/loginController");
const { forgotPasswordController, newPassword } = require("../Controller/Login/forgot_password_Controller");

const loginRouter = express.Router();

loginRouter.post("", loginController);

loginRouter.post("/forgot-password", forgotPasswordController);

loginRouter.post("/reset-password", newPassword);

module.exports = loginRouter;
