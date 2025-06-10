const express = require("express");
const loginController = require("../Controller/Login/loginController");
const registerController = require("../Controller/Login/registerController");
const {
  forgotPasswordByEmailController,
  forgotPasswordByPhoneController,
  newPassword,
} = require("../Controller/Login/forgot_password_Controller");
const generateToken = require("../Utils/jwt");
const loginRouter = express.Router();

loginRouter.post("/login", loginController);

loginRouter.post("/forgot-password", forgotPasswordByEmailController);

loginRouter.post("/reset-password", newPassword);

module.exports = loginRouter;
