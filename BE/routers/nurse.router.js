const express = require("express");
const { createSchedule, responseSchedule, getPending } = require("../Controller/CheckUp/checkupController");
const auth = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const { listPendingConsent, respondConsent } = require("../Controller/CheckUp/consentController");
const { getAttendanceList, markAttendance } = require("../Controller/CheckUp/attendanceController");
const authenticateToken = require("../middlewares/authMiddlewares");
const validateInput = require("../Utils/validateInput");
const { Checkup_Result, HealthDeclaration } = require("../Schemas/Schemas");
const healthDeclarationController = require("../Controller/Health/healthDeclaration");
const { saveCheckupResult } = require("../Controller/CheckUp/saveCheckupResult");

const nurseRouter = express.Router();
// Nurse tạo lịch
// nurse.post("/", auth, authorize("nurse"), createSchedule);
nurseRouter.post("/", authenticateToken, createSchedule);

// nurseRouter điểm danh
// nurseRouter.get("/:schedule_id/attendance", auth, authorize("nurseRouter"), getAttendanceList);
nurseRouter.get("/:schedule_id/listStudent", getAttendanceList);
nurseRouter.post("/:schedule_id/listStudent/:student_id", markAttendance);
nurseRouter.post(
  "/checkup/:checkup_id/student/:student_id/result",
  validateInput(Checkup_Result.Constructors),
  saveCheckupResult
);

module.exports = nurseRouter;
