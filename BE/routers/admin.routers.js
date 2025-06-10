const express = require("express");
const { getAllStudentInfo, getStudentInfoById } = require("../Controller/getInfo/getInformation");
const registerController = require("../Controller/Login/registerController");
const validateInput = require("../Utils/validateInput");
const { Information } = require("../Schemas/Schemas");

const adminRouter = express.Router();

adminRouter.post("/register", validateInput(Information.Constructors), registerController);

adminRouter.get("/InformationStudent", getAllStudentInfo);

adminRouter.get("/InformationStudent/:user_id", getStudentInfoById);

module.exports = adminRouter;
