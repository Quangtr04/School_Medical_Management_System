const express = require("express");
const loginController = require("../Controller/Login/loginController");
const registerController = require("../Controller/Login/registerController");
const { Information } = require("../Schemas/Schemas");
const {
  forgotPasswordByEmailController,
  forgotPasswordByPhoneController,
  newPassword,
} = require("../Controller/Login/forgot_password_Controller");
const generateToken = require("../Utils/jwt");
const validateInput = require("../Utils/validateInput");
const loginRouter = express.Router();

loginRouter.post("/login", validateInput(Information.Constructors), loginController);

loginRouter.post("/forgot-password", forgotPasswordByEmailController);

loginRouter.post("/reset-password", newPassword);

module.exports = loginRouter;
