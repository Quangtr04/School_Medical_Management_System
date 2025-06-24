const express = require("express");
const authenticateToken = require("../middlewares/authMiddlewares");
const validateInput = require("../Utils/validateInput");
const Schemas = require("../Schemas/Schemas");

const { getAllStudentByParentId, getStudentInfoById } = require("../Controller/getInfo/getInformation");

const { listPendingConsent, respondConsent } = require("../Controller/CheckUp/consentController");

const {
  healthDeclarationController,
  getHealthDeclarationOfStudentByParent,
  createHealthDeclarationById,
  getHealthDeclarationOfStudentById,
} = require("../Controller/Health/healthDeclaration");

const { UpdateStatusCheckupParent } = require("../Controller/CheckUp/UpdateStatusCheckup");
const { getNotifications } = require("../Controller/Notification/getNotification");
const { getCheckupListApproved } = require("../Controller/CheckUp/getCheckup");
const { getIncidentsByUserId, getIncidentById } = require("../Controller/Medical/medical_Incident");
const { medicationSubmissionReq } = require("../Controller/Medical/medicalSubmissionReq");

const parentRouter = express.Router();

/**
 * 🔍 Xem danh sách con cái của phụ huynh
 */
parentRouter.get("/students", authenticateToken, getAllStudentByParentId); //done

/**
 * 🔍 Xem thông tin chi tiết của 1 học sinh
 */
parentRouter.get("/students/:student_id", authenticateToken, getStudentInfoById); //done

parentRouter.get("/consents/approved", authenticateToken, getCheckupListApproved);

/**
 * 📋 Danh sách phiếu đồng ý khám sức khỏe chưa phản hồi
 */
parentRouter.get("/consents/pending", authenticateToken, listPendingConsent); //done

/**
 * ✅ Phản hồi phiếu đồng ý khám sức khỏe (AGREED / DECLINED)
 */
parentRouter.post("/consents/:form_id/respond", authenticateToken, respondConsent); //done

/**
 * 📝 Phụ huynh cập nhật lại trạng thái đồng ý/từ chối cho 1 lịch khám cụ thể
 */
parentRouter.patch("/checkups/:checkup_id/consent", authenticateToken, UpdateStatusCheckupParent); //done

/**
 * 📄 Lấy thông tin khai báo y tế của học sinh
 */
parentRouter.get("/students/health-declaration", authenticateToken, getHealthDeclarationOfStudentByParent);
parentRouter.get("/students/:student_id/health-declaration", authenticateToken, getHealthDeclarationOfStudentById);

/**
 * 📮 Gửi yêu cầu gửi thuốc
 */
parentRouter.post(
  "/medical-submissions",
  authenticateToken,
  validateInput(Schemas, "MedicalSubmissionRequest"),
  medicationSubmissionReq
);

/**
 * 📝 Tạo khai báo y tế cho học sinh
 */
parentRouter.post(
  "/students/:studentId/health-declarations",
  authenticateToken,
  validateInput(Schemas, "HealthDeclaration"),
  createHealthDeclarationById
);

// Lấy tất cả sự cố y tế liên quan đến một user
parentRouter.get("/incidents/:user_id", authenticateToken, getIncidentsByUserId);

// Lấy sự cố y tế của học sinh theo ID
parentRouter.get("/incidents/view incedent", getIncidentById);

/**
 * 🔔 Lấy danh sách thông báo của phụ huynh (có phân trang)
 * /notifications?page=1&limit=10
 */
parentRouter.get("/notifications", authenticateToken, getNotifications);

module.exports = parentRouter;
