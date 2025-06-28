const express = require("express");
const { createSchedule } = require("../Controller/CheckUp/checkupController");

const {
  saveCheckupResult,
  updateCheckup,
  getCheckupParticipation,
  getCheckupParticipationById,
} = require("../Controller/CheckUp/saveCheckupResult");

const authenticateToken = require("../middlewares/authMiddlewares");
const validateInput = require("../Utils/validateInput");
const Schemas = require("../Schemas/Schemas");
const {
  getCheckupListApproved,
  getCheckupList,
  getCheckupListDeclined,
  getCheckupById,
  getCheckupListPending,
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
const {
  getVaccinationCampaign,
  getVaccinationCampaignById,
  getVaccinationCampaignPending,
  getVaccinationCampaignApprove,
} = require("../Controller/Vaccine/getVaccineCampaign");
const { createVaccinationCampaign } = require("../Controller/Vaccine/VaccineController");
const {
  getStudentVaccineList,
  getStudentVaccineListById,
  updateResultVaccine,
} = require("../Controller/Vaccine/UpdateVaccineResult");

const nurseRouter = express.Router();

// 📌 Tạo lịch khám sức khỏe (nurse)
nurseRouter.post("/checkups/create", authenticateToken, createSchedule);

// 📌 Xem danh sách tất cả lịch khám
nurseRouter.get("/checkups", getCheckupList);

// 📌 Xem chi tiết một lịch khám theo ID
nurseRouter.get("/checkups/:id", getCheckupById);

// 📌 Lấy danh sách học sinh đã được duyệt (để thực hiện khám)
nurseRouter.get("/checkups-approved/students", getCheckupParticipation);

// Lấy danh học sinh đã được duyệt
nurseRouter.get("/checkups-approved/:checkup_id/students", getCheckupParticipationById);

// 📌 Lưu kết quả khám sức khỏe cho học sinh
nurseRouter.post(
  "/checkups/:checkup_id/students/:student_id/result",
  validateInput(Schemas, "Checkup_Result"),
  saveCheckupResult
);

// 📌 Cập nhật ghi chú (note) cho học sinh trong lịch khám
nurseRouter.patch("/checkups/:checkup_id/students/:student_id/note", updateCheckup);

// Lấy lịch khám đã được duyệt (để thực hiện khám)
nurseRouter.get("/checkups-approved", getCheckupListApproved);

// Lấy lịch khám bị từ chối
nurseRouter.get("/checkups-declined", getCheckupListDeclined);

// Lấy lịch khám bị đang chờ xét duyệt
nurseRouter.get("/checkups-pending", getCheckupListPending);

// Ghi nhận y tế
nurseRouter.post(
  "/create-incident",
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

// Lấy danh sách lịch tiêm chủng
nurseRouter.get("/vaccine-campaigns", getVaccinationCampaign);

// Lấy chi tiết một lịch tiêm chủng theo ID
nurseRouter.get("/vaccine-campaigns/:id", getVaccinationCampaignById);

// Lấy danh sách lịch tiêm chủng đã bị từ chối
nurseRouter.get("/vaccine-campaigns-declined", getVaccinationCampaignPending);

// Lấy danh sách lịch tiêm chủng đã chấp thuận
nurseRouter.get("/vaccine-campaigns-approved", getVaccinationCampaignApprove);

// Tạo lịch tiêm chủng
nurseRouter.post("/vaccine-campaigns/create", authenticateToken, createVaccinationCampaign);

// Lấy danh sách học sinh đã duyệt
nurseRouter.get("/vaccine-campaigns-students", getStudentVaccineList);

// Lấy thông tin chi tiết học sinh được duyệt
nurseRouter.get("/vaccine-campaigns-students/:id", getStudentVaccineListById);

// Cập nhật note của học sinh
nurseRouter.patch("/vaccine-campaigns-students/:id", updateResultVaccine);

//lấy thông báo
nurseRouter.get("/notifications", authenticateToken, getNotifications);

module.exports = nurseRouter;
