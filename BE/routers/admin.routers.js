const express = require("express");
const { getAllStudentInfo, getStudentInfoById } = require("../Controller/getInfo/getInformation");
const registerController = require("../Controller/Login/registerController");

const adminRouter = express.Router();

adminRouter.post("/register", registerController);

adminRouter.get("/InformationStudent", getAllStudentInfo);

adminRouter.get("/InformationStudent/:user_id", getStudentInfoById);

module.exports = adminRouter;
