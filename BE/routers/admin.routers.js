const express = require("express");
const registerController = require("../Controller/Login/registerController");
const validateInput = require("../Utils/validateInput");
const Schemas = require("../Schemas/Schemas");
const { getUserByRole, getUserByUserId } = require("../Controller/Infomation/getUser");
const { createStudentInformation, updateStudentInfoById } = require("../Controller/Infomation/createStudentInfo");

const adminRouter = express.Router();

adminRouter.post("/register", validateInput(Schemas, "Information"), registerController);

adminRouter.get("/parents", getUserByRole);

adminRouter.get("/managers", getUserByRole);

adminRouter.get("/nurses", getUserByRole);

adminRouter.get("/parents/:user_id", getUserByUserId);

adminRouter.get("/managers/:user_id", getUserByUserId);

adminRouter.get("/nurses/:user_id", getUserByUserId);

adminRouter.post("/student/create", createStudentInformation);

adminRouter.patch("/student/update/:student_id", updateStudentInfoById);

module.exports = adminRouter;
