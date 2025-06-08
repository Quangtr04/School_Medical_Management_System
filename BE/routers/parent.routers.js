const express = require("express");
const { getAllStudentByParentId, getStudentInfoById } = require("../Controller/getInfo/getInformation");

const parentRouter = express.Router();

parentRouter.get("/home/:user_id", getAllStudentByParentId);

parentRouter.get("/InformationStudent/:student_id", getStudentInfoById);

parentRouter.get("/viewProfile", async (req, res) => {});

module.exports = parentRouter;
