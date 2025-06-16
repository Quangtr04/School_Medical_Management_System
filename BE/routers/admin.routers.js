const express = require("express");
const registerController = require("../Controller/Login/registerController");
const validateInput = require("../Utils/validateInput");
const Schemas = require("../Schemas/Schemas");
const { getUserByRole, getUserById } = require("../Controller/getInfo/getUser");

const adminRouter = express.Router();

adminRouter.post("/register", validateInput(Schemas, "Information"), registerController);

adminRouter.get("/parents", getUserByRole);

adminRouter.get("/managers", getUserByRole);

adminRouter.get("/nurses", getUserByRole);

adminRouter.get("/parents/:user_id", getUserById);

adminRouter.get("/managers/:user_id", getUserById);

adminRouter.get("/nurses/:user_id", getUserById);

module.exports = adminRouter;
