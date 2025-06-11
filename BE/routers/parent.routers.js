const express = require("express");
const { getAllStudentByParentId, getStudentInfoById, getStudentHealthById } = require("../Controller/getInfo/getInformation");
const { listPendingConsent, respondConsent } = require("../Controller/CheckUp/consentController");
const { HealthDeclaration } = require("../Schemas/Schemas");
const healthDeclarationController = require("../Controller/Health/healthDeclaration");
const validateInput = require("../Utils/validateInput");

const parentRouter = express.Router();

parentRouter.get("/home/:user_id", getAllStudentByParentId);

parentRouter.get("/InformationStudent/:student_id", getStudentInfoById);

// Parent xác nhận
// parentRouter.get("/consent", auth, authorize("parent"), listPendingConsent)
parentRouter.get("/consent", listPendingConsent); // Liệt kê tất cả phiếu xin phép khám sức khỏe (consent form) mà phụ huynh chưa phản hồi
parentRouter.post("/consent/:form_id/respond", respondConsent); //Cho phép phụ huynh trả lời phiếu đồng ý khám sức khỏe: chọn "AGREED" (đồng ý) hoặc "DECLINED" (từ chối).

parentRouter.get("/StudentHealth/:student_id", getStudentHealthById);

parentRouter.post(
  "/health-declarations/:studentId",
  validateInput(HealthDeclaration.Constructors),
  healthDeclarationController
);

module.exports = parentRouter;
