const express = require("express");
const authenticateToken = require("../middlewares/authMiddlewares");
const validateInput = require("../Utils/validateInput");
const Schemas = require("../Schemas/Schemas");

// --- Import Controllers ---
// Thông tin học sinh
const {
  getAllStudentByParentId,
  getStudentInfoById,
} = require("../Controller/Infomation/getInformation");

// Khám sức khỏe / Đồng ý khám sức khỏe
const {
  listPendingConsent,
  respondConsent,
  listAgreeConsent,
  listDeclineConsent,
} = require("../Controller/CheckUp/consentController");
const {
  UpdateStatusCheckupParent,
} = require("../Controller/CheckUp/UpdateStatusCheckup");
const {
  getCheckupListByIdAndParentId,
  getCheckupListByParentId,
} = require("../Controller/CheckUp/getCheckup");

// Khai báo y tế
const {
  getHealthDeclarationOfStudentById,
  updateHealthDeclarationByStudentId,
} = require("../Controller/Health/healthDeclaration");

// Sự cố y tế
const {
  getIncidentsByUserId,
  getIncidentById,
} = require("../Controller/Medical/medical_Incident");

// Yêu cầu gửi thuốc
const {
  medicationSubmissionReq,
  cancelMedicationSubmissionReq,
  getAllMedicationSubmissionReqByParentId,
  getAllMedicationSubmissionReqByParentIdAndId,
} = require("../Controller/Medical/medicalSubmissionReq");

// Thông báo
const {
  getNotifications,
} = require("../Controller/Notification/getNotification");
const {
  getConsentVaccineByParentId,
  getConsentVaccineApproveByParentId,
  getConsentVaccineDeclineByParentId,
  getConsentVaccineByIdAndParentId,
  getResponseConsentVaccineParent,
  getConsentVaccinePendingByParentId,
} = require("../Controller/Vaccine/consentVaccineController");
const {
  UpdateResponseByParent,
} = require("../Controller/Vaccine/UpdateResponseVaccine");
const { getProfileByUserId } = require("../Controller/Infomation/getUser");
const { parentUpdateUserById } = require("../Controller/Login/account_status");
const {
  getStudentVaccineList,
  getStudentVaccineListById,
  getStudentVaccineListByCampaignIdByParentId,
} = require("../Controller/Vaccine/UpdateVaccineResult");
const {
  getCheckupParticipation,
  getCheckupParticipationById,
  getAllCheckupParticipation,
} = require("../Controller/CheckUp/saveCheckupResult");
const upload = require("../middlewares/multerConfig");
const {
  getLogsByRequestIdAndUserIdAndStudentId,
  getLogByLogId,
} = require("../Controller/Medical/medicationDailyLog");
const { sendRequest } = require("../Controller/Request/sendRequest");

const parentRouter = express.Router();

// --- Nhóm các API liên quan đến Học sinh (Students) ---
/**
 * 🔍 Xem danh sách con cái của phụ huynh
 */
parentRouter.get("/students", authenticateToken, getAllStudentByParentId); //done

// Lấy thông tin cá nhân
parentRouter.get("/profile", authenticateToken, getProfileByUserId);

// Cập nhật thông tin
parentRouter.patch("/profile", authenticateToken, parentUpdateUserById);

/**
 * 🔍 Xem thông tin chi tiết của 1 học sinh
 */
parentRouter.get(
  "/students/:student_id",
  authenticateToken,
  getStudentInfoById
); //done

// --- Nhóm các API liên quan đến Khám sức khỏe (Checkups) và Đồng ý khám sức khỏe (Consents) ---

/** * 📋 Danh sách phiếu đồng ý khám sức khỏe đã duyệt (hoặc danh sách phiếu khám sức khỏe đã duyệt)
 */
parentRouter.get(
  "/consents-checkups",
  authenticateToken,
  getCheckupListByParentId
); // đã sửa
/** * 📋 Chi tiết phiếu khám sức khỏe
 */
parentRouter.get(
  "/consents-checkups/:id",
  authenticateToken,
  getCheckupListByIdAndParentId
); //đã sửa

/**
 * 📋 Danh sách phiếu đồng ý khám sức khỏe chưa phản hồi
 */
parentRouter.get(
  "/consents-checkups-pending",
  authenticateToken,
  listPendingConsent
); //đã sửa

/**
 * 📋 Danh sách phiếu đồng ý khám sức khỏe đã chấp thuận
 */
parentRouter.get(
  "/consents-checkups-agree",
  authenticateToken,
  listAgreeConsent
); //đã sửa

/**
 * 📋 Danh sách phiếu đồng ý khám sức khỏe đã từ chối
 */
parentRouter.get(
  "/consents-checkups-declined",
  authenticateToken,
  listDeclineConsent
); //đã sửa

/**
 * ✅ Phản hồi phiếu đồng ý khám sức khỏe (AGREED / DECLINED)
 */
parentRouter.post(
  "/consents-checkup/:form_id/respond",
  authenticateToken,
  respondConsent
); //done

/**
 * 📝 Phụ huynh cập nhật lại trạng thái đồng ý/từ chối cho 1 lịch khám cụ thể
 */
parentRouter.patch(
  "/checkups/:checkup_id/consent",
  authenticateToken,
  UpdateStatusCheckupParent
); //done

parentRouter.get(
  "/consents-checkup/students",
  authenticateToken,
  getAllCheckupParticipation
); // đã sửa

parentRouter.get(
  "/consents-checkup/:id/students",
  authenticateToken,
  getCheckupParticipation
);

parentRouter.get(
  "/consents-checkup/:id/students/:student_id",
  authenticateToken,
  getCheckupParticipationById
); //đã sửa

// --- Nhóm các API liên quan đến Khai báo y tế (Health Declarations) ---
/**
 * 📄 Lấy thông tin khai báo y tế của học sinh
 */
parentRouter.get(
  "/students/:student_id/health-declaration",
  authenticateToken,
  getHealthDeclarationOfStudentById
);

/**
 * 📝 Cập nhật báo y tế cho học sinh
 */

parentRouter.patch(
  "/students/:studentId/health-declaration",
  validateInput(Schemas, "HealthDeclaration"),
  updateHealthDeclarationByStudentId
);

// --- Nhóm các API liên quan đến Sự cố y tế (Medical Incidents) ---
// Lấy tất cả sự cố y tế liên quan đến một user
parentRouter.get("/incidents", authenticateToken, getIncidentsByUserId);

// Lấy sự cố y tế của học sinh theo ID (Lưu ý: "view incedent" có vẻ là lỗi chính tả, nên đổi thành /:incident_id)
parentRouter.get("/incidents/:event_id", getIncidentById); // Thêm authenticateToken nếu cần, và đổi tên parameter cho rõ ràng

// --- Nhóm các API liên quan đến Yêu cầu gửi thuốc (Medical Submissions) ---
/**
 * 📮 Gửi yêu cầu gửi thuốc
 */
parentRouter.post(
  "/medical-submissions",
  authenticateToken,
  upload.array("image", 5), // cho phép tối đa 5 ảnh
  async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "Ảnh là bắt buộc",
      });
    }

    // Gán danh sách đường dẫn ảnh
    const imageUrls = req.files.map(
      (file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
    );
    req.body.image_urls = imageUrls;

    req.body.parent_id = req.user?.user_id;
    req.body.student_id = parseInt(req.body.student_id);
    req.body.nurse_id = req.body.nurse_id
      ? parseInt(req.body.nurse_id)
      : undefined;
    req.body.status = req.body.status || "PENDING";

    console.log("✔️ Trước validate:", req.body);

    return validateInput(Schemas, "MedicalSubmissionRequest")(req, res, next);
  },
  medicationSubmissionReq
);

// Lấy danh sách đơn yêu cầu gửi thuốc
parentRouter.get(
  "/medical-submissions",
  authenticateToken,
  getAllMedicationSubmissionReqByParentId
);

// Xem chi tiết đơn yêu cầu gửi thuốc
parentRouter.get(
  "/medical-submissions/:id_req",
  authenticateToken,
  getAllMedicationSubmissionReqByParentIdAndId
);

// Lấy thông tin các buổi uống thuốc
parentRouter.get(
  "/medical-daily-log/:id_req/students/:student_id",
  authenticateToken,
  getLogsByRequestIdAndUserIdAndStudentId
);

// Xóa đơn đã gửi
parentRouter.patch(
  "/medical-submissions/:id_req/cancel",
  authenticateToken,
  cancelMedicationSubmissionReq
);

// Lấy tất cả lịch tiêm chủng về
parentRouter.get(
  "/vaccine-campaigns",
  authenticateToken,
  getConsentVaccineByParentId
);

// Lấy lịch tiêm chủng dựa trên id
parentRouter.get(
  "/vaccine-campaigns/:id",
  authenticateToken,
  getConsentVaccineByIdAndParentId
);

// Lấy tất cả lịch tiêm chủng đã đang chờ duyệt
parentRouter.get(
  "/vaccine-campaign-pending",
  authenticateToken,
  getConsentVaccinePendingByParentId
);

// Lấy tất cả lịch tiêm chủng đã được chấp thuận
parentRouter.get(
  "/vaccine-campaign-approved",
  authenticateToken,
  getConsentVaccineApproveByParentId
);

// Lấy tất cả lịch tiêm chủng đã bị từ chối
parentRouter.get(
  "/vaccine-campaign-declined",
  authenticateToken,
  getConsentVaccineDeclineByParentId
);

// Phản hồi về trạng thái lịch tiêm chủng
parentRouter.post(
  "/vaccine-campaigns/:id/respond",
  authenticateToken,
  getResponseConsentVaccineParent
);

// Cập nhật về trạng thái lịch tiêm chủng
parentRouter.patch(
  "/vaccine-campaigns/:form_id/status",
  authenticateToken,
  UpdateResponseByParent
);

// Lấy danh sách con có tham gia tiêm chủng
parentRouter.get(
  "/vaccine-campaigns-list-students",
  authenticateToken,
  getStudentVaccineList
);

// Lấy danh sách con có tham gia tiêm chủng dựa trên campaign id
parentRouter.get(
  "/vaccine-campaigns/:campaign_id/students",
  authenticateToken,
  getStudentVaccineListByCampaignIdByParentId
);

// Lấy danh sách con có tham gia tiêm chủng theo id
parentRouter.get(
  "/vaccine-campaigns/:campaing_id/students/:student_id",
  getStudentVaccineListById
);

// --- Nhóm các API liên quan đến Thông báo (Notifications) ---
/**
 * 🔔 Lấy danh sách thông báo của phụ huynh (có phân trang)
 * /notifications?page=1&limit=10
 */
parentRouter.get("/notifications", authenticateToken, getNotifications);

parentRouter.post("/send-request", sendRequest);

module.exports = parentRouter;
