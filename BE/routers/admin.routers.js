const express = require("express");
const registerController = require("../Controller/Login/registerController");
const Schemas = require("../Schemas/Schemas");
const { getUserByRole, getUserByUserId } = require("../Controller/Infomation/getUser");
const { createStudentInformation, updateStudentInfoById } = require("../Controller/Infomation/createStudentInfo");
const { adminUpdateUserById } = require("../Controller/Login/account_status");
const validateInput = require("../middlewares/validateInput");

const adminRouter = express.Router();

adminRouter.post("/register", validateInput(Schemas, "Information"), registerController);

adminRouter.get("/parents", getUserByRole);

adminRouter.get("/managers", getUserByRole);

adminRouter.get("/nurses", getUserByRole);

adminRouter.get("/parents/:user_id", getUserByUserId);

adminRouter.get("/managers/:user_id", getUserByUserId);

adminRouter.get("/nurses/:user_id", getUserByUserId);

adminRouter.post("/student/create", validateInput(Schemas, "StudentInformation"), createStudentInformation);

adminRouter.patch("/student/update/:student_id", updateStudentInfoById);

adminRouter.patch("/parents/:user_id", adminUpdateUserById);

adminRouter.patch("/managers/:user_id", adminUpdateUserById);

adminRouter.patch("/nurses/:user_id", adminUpdateUserById);

module.exports = adminRouter;
