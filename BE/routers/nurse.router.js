const express = require("express");
const { createSchedule } = require("../Controller/CheckUp/checkupController");

const { saveCheckupResult, updateCheckupNote } = require("../Controller/CheckUp/saveCheckupResult");

const authenticateToken = require("../middlewares/authMiddlewares");
const validateInput = require("../Utils/validateInput");
const Schemas = require("../Schemas/Schemas");
const {
  getCheckupListApproved,
  getCheckupApprovedById,
  getCheckupList,
  getCheckupListDeclined,
  getCheckupDeclinedById,
  getCheckupById,
} = require("../Controller/CheckUp/getCheckup");
const { getNotifications } = require("../Controller/Notification/getNotification");
const {
  createMedicalIncident,
  getAllIncidents,
  getIncidentById,
  getIncidentsByUserId,
  getIncidentByStudentId,
} = require("../Controller/Medical/medical_Incident");
const { getAllMedicalSupplies, getMedicalSupplyByID } = require("../Controller/Medical/medicalSupply");

const nurseRouter = express.Router();

// 📌 Tạo lịch khám sức khỏe (nurse)
nurseRouter.post("/checkups/create", authenticateToken, createSchedule);

// 📌 Xem danh sách tất cả lịch khám
nurseRouter.get("/checkups", getCheckupList);

// 📌 Xem chi tiết một lịch khám theo ID
nurseRouter.get("/checkups/:id", getCheckupById);

// 📌 Lấy danh sách lịch khám đã được duyệt (để thực hiện khám)

// 📌 Lưu kết quả khám sức khỏe cho học sinh
nurseRouter.post(
  "/checkups/:checkup_id/students/:student_id/result",
  validateInput(Schemas, "Checkup_Result"),
  saveCheckupResult
);

// 📌 Cập nhật ghi chú (note) cho học sinh trong lịch khám
nurseRouter.patch("/checkups/:checkup_id/students/:student_id/note", updateCheckupNote);

// Lấy lịch khám đã được duyệt (để thực hiện khám)
nurseRouter.get("/checkups-approved", getCheckupListApproved);

// Lấy chi tiết một lịch khám đã được duyệt
nurseRouter.get("/checkups-approved/:id", getCheckupApprovedById);

// Lấy lịch khám bị từ chối
nurseRouter.get("/checkups-declined", getCheckupListDeclined);
nurseRouter.get("/checkups-declined/:id", getCheckupDeclinedById);

// Ghi nhận y tế
nurseRouter.post(
  "/Create Incident",
  authenticateToken,
  validateInput(Schemas, "MedicalIncidentSchema"),
  createMedicalIncident
);

// Lấy tất cả các sự cố y tế
nurseRouter.get("/incidents", getAllIncidents);

// Lấy chi tiết sự cố y tế theo event_id
nurseRouter.get("/incidents/:event_id", getIncidentById);

// Lấy tất cả sự cố y tế liên quan đến một user
nurseRouter.get("/incidents/user", authenticateToken, getIncidentsByUserId);

// Lấy tất cả sự cố y tế liên quan đến một học sinh
nurseRouter.get("/incidents/student/:student_id", getIncidentByStudentId);

// Lấy danh sách vật tư y tế
nurseRouter.get("/medical-supplies", getAllMedicalSupplies);

// Lấy danh sách vật tư y tế theo ID
nurseRouter.get("/medical-supplies/:supplyId", getMedicalSupplyByID);

//lấy thông báo
nurseRouter.get("/notifications", authenticateToken, getNotifications);

module.exports = nurseRouter;
