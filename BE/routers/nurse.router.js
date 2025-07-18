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
const {
  getNotifications,
} = require("../Controller/Notification/getNotification");
const {
  createMedicalIncident,
  getAllIncidents,
  getIncidentById,
  getIncidentsByUserId,
  getIncidentByStudentId,
  updateIncident,
} = require("../Controller/Medical/medical_Incident");
const {
  getAllMedicalSupplies,
  getMedicalSupplyByID,
  updateMedicalSupply,
  medicalSupply,
} = require("../Controller/Medical/medicalSupply");
const {
  getVaccinationCampaign,
  getVaccinationCampaignById,
  getVaccinationCampaignPending,
  getVaccinationCampaignApprove,
  getVaccinationCampaignDeclined,
} = require("../Controller/Vaccine/getVaccineCampaign");
const {
  createVaccinationCampaign,
} = require("../Controller/Vaccine/VaccineController");
const {
  getStudentVaccineList,
  getStudentVaccineListById,
  updateResultVaccine,
  getStudentVaccineListByCampaignId,
} = require("../Controller/Vaccine/UpdateVaccineResult");
const {
  getAllStudentInfo,
  getStudentInfoById,
} = require("../Controller/Infomation/getInformation");
const {
  updateHealthDeclarationByStudentId,
} = require("../Controller/Health/healthDeclaration");
const { getProfileByUserId } = require("../Controller/Infomation/getUser");
const { parentUpdateUserById } = require("../Controller/Login/account_status");
const {
  getAllMedicationSubmissionReq,
  getMedicationSubmissionReqByID,
  updateMedicationSubmissionReqByNurse,
} = require("../Controller/Medical/medicalSubmissionReq");
const {
  updateStatusMedicationDailyLog,
  getLogsByRequestIdAndUserId,
  getLogsByRequestIdAndUserIdAndStudentId,
} = require("../Controller/Medical/medicationDailyLog");

const {
  getLogByLogId,
  getLogsByDateAndNurse,
} = require("../Controller/Medical/medicationDailyLog");

const nurseRouter = express.Router();

// Lấy thông tin cá nhân
nurseRouter.get("/profile", authenticateToken, getProfileByUserId);

// Cập nhật thông tin
nurseRouter.patch("/profile", authenticateToken, parentUpdateUserById);

// 📌 Tạo lịch khám sức khỏe (nurse)
nurseRouter.post("/checkups/create", authenticateToken, createSchedule);

// 📌 Xem danh sách tất cả lịch khám
nurseRouter.get("/checkups", getCheckupList);

// 📌 Xem chi tiết một lịch khám theo ID
nurseRouter.get("/checkups/:id", getCheckupById);

// 📌 Lấy danh sách học sinh đã được duyệt (để thực hiện khám)
nurseRouter.get(
  "/checkups-approved/students/:checkup_id",
  getCheckupParticipation
);

// Lấy danh học sinh đã được duyệt
nurseRouter.get(
  "/checkups-approved/:id/students/:student_id",
  getCheckupParticipationById
);

// 📌 Lấu kết quả khám sức khỏe cho học sinh
nurseRouter.post(
  "/checkups/:checkup_id/students/:student_id/result",
  validateInput(Schemas, "Checkup_Result"),
  saveCheckupResult
);

// 📌 Cập nhật ghi chú (note) cho học sinh trong lịch khám
nurseRouter.patch(
  "/checkups/:checkup_id/students/:student_id/note",
  updateCheckup
);

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

// Cập nhật sự cố y tế
nurseRouter.patch(
  "/incidents/student/:event_id/update",
  authenticateToken,
  updateIncident
);

// Thêm vật tư y tế
nurseRouter.post(
  "/medical-supplies/create",
  authenticateToken,
  validateInput(Schemas, "MedicalSupply"),
  medicalSupply
);

// Lấy danh sách vật tư y tế
nurseRouter.get("/medical-supplies", getAllMedicalSupplies);

// Lấy danh sách vật tư y tế theo ID
nurseRouter.get("/medical-supplies/:supplyId", getMedicalSupplyByID);

// Cập nhật vật tư y tế theo ID
nurseRouter.patch("/medical-supplies/:supplyId/update", updateMedicalSupply);

// Lấy danh sách lịch tiêm chủng
nurseRouter.get("/vaccine-campaigns", getVaccinationCampaign);

// Lấy chi tiết một lịch tiêm chủng theo ID
nurseRouter.get("/vaccine-campaigns/:id", getVaccinationCampaignById);

// Lấy danh sách lịch tiêm chủng đang duyệt
nurseRouter.get("/vaccine-campaigns-pending", getVaccinationCampaignPending);

// Lấy danh sách lịch tiêm chủng đã bị từ chối
nurseRouter.get("/vaccine-campaigns-declined", getVaccinationCampaignDeclined);

// Lấy danh sách lịch tiêm chủng đã chấp thuận
nurseRouter.get("/vaccine-campaigns-approved", getVaccinationCampaignApprove);

// Tạo lịch tiêm chủng
nurseRouter.post(
  "/vaccine-campaigns/create",
  authenticateToken,
  createVaccinationCampaign
);

// Lấy danh sách học sinh đã duyệt theo id campaign
nurseRouter.get(
  "/vaccine-campaigns-list-student/:campaign_id",
  getStudentVaccineListByCampaignId
);

// Lấy thông tin chi tiết học sinh được duyệt
nurseRouter.get(
  "/vaccine-campaigns-students/:campaign_id/students/:vaccine_id",
  getStudentVaccineListById
);

// Cập nhật thÔng tin vaccine của học sinh
nurseRouter.patch(
  "/vaccine-campaigns-students/students/:vaccine_id/update",
  updateResultVaccine
);

// Lấy danh sách sức khỏe học sinh
nurseRouter.get("/students/health-declaration", getAllStudentInfo);

// Lấy danh sách sức khỏe học sinh theo id
nurseRouter.get("/students/health-declaration/:student_id", getStudentInfoById);

// Cập nhật sức khỏe học sinh
nurseRouter.patch(
  "/students/:studentId/health-declaration",
  validateInput(Schemas, "HealthDeclaration"),
  updateHealthDeclarationByStudentId
);

// Lấy danh sách đơn thuốc được gửi
nurseRouter.get("/medication-submissions", getAllMedicationSubmissionReq);

// Lấy danh sách đơn thuốc được gửi theo id
nurseRouter.get(
  "/medication-submissions/:ReqId",
  getMedicationSubmissionReqByID
);

// Cập nhật trạng thái đơn thuốc được gửi
nurseRouter.patch(
  "/medication-submissions/:ReqId/update",
  authenticateToken,
  updateMedicationSubmissionReqByNurse
);

// Cập nhật trạng thái đơn thuốc mỗi ngày
nurseRouter.patch(
  "/medication-daily-logs-submissions/:ReqId/update",
  authenticateToken,
  updateStatusMedicationDailyLog
);

//lấy thông báo
nurseRouter.get("/notifications", authenticateToken, getNotifications);

// Lấy nhật ký uống thuốc theo ID yêu cầu và ID y tá
nurseRouter.get(
  "/logs/by-request/:id_req",
  authenticateToken,
  getLogsByRequestIdAndUserId
);

// Lấy nhật ký uống thuốc theo ID yêu cầu và ID y tá và ID học sinh
nurseRouter.get(
  "/logs/by-request/:id_req/student/:student_id",
  authenticateToken,
  getLogsByRequestIdAndUserIdAndStudentId
);

// Lấy nhật ký uống thuốc theo ID nhật ký
nurseRouter.get("/logs/:log_id", authenticateToken, getLogByLogId);

// Lấy nhật ký uống thuốc theo ngày và ID y tá
nurseRouter.get("/logs/by-date", authenticateToken, getLogsByDateAndNurse);

module.exports = nurseRouter;
