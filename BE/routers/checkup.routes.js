const express = require("express");
const router = express.Router();
const { createSchedule, responseSchedule, getPending } = require("../Controller/CheckUp/checkupController");
const auth = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const { listPendingConsent, respondConsent } = require("../Controller/CheckUp/consentController");
const { getAttendanceList, markAttendance } = require("../Controller/CheckUp/attendanceController");
const authenticateToken = require("../middlewares/authMiddlewares");
const validateInput = require("../Utils/validateInput");
const { Checkup_Result } = require("../Schemas/Schemas");
const healthDeclarationController = require("../Controller/Health/healthDeclaration");

// Nurse tạo lịch
// router.post("/", auth, authorize("nurse"), createSchedule);
router.post("/", authenticateToken, createSchedule);

// Manager duyệt lịch
// router.get("/pending", auth, authorize("manager"), getPending);
router.get("/pending", getPending); // lấy các đơn chưa đc chấp nhận ra
router.post("/approve/:id", responseSchedule); // chấp nhận đơn hoặc không

// Parent xác nhận
// router.get("/consent", auth, authorize("parent"), listPendingConsent)
router.get("/consent", listPendingConsent); // Liệt kê tất cả phiếu xin phép khám sức khỏe (consent form) mà phụ huynh chưa phản hồi
router.post("/consent/:form_id/respond", respondConsent); //Cho phép phụ huynh trả lời phiếu đồng ý khám sức khỏe: chọn "AGREED" (đồng ý) hoặc "DECLINED" (từ chối).

// Nurse điểm danh
// router.get("/:schedule_id/attendance", auth, authorize("nurse"), getAttendanceList);
router.get("/:schedule_id/listStudent", getAttendanceList);
router.post("/:schedule_id/listStudent/:student_id", markAttendance);
router.post(
  "/checkup/:checkup_id/student/:student_id/result",
  validateInput(Checkup_Result.Constructors),
  saveCheckupResult
);

router.post("/health-declarations/:studentId", healthDeclarationController);

module.exports = router;
