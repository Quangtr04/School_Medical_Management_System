const express = require("express");
const { createSchedule } = require("../Controller/CheckUp/checkupController");
const { getAttendanceList, markAttendance } = require("../Controller/CheckUp/attendanceController");
const authenticateToken = require("../middlewares/authMiddlewares");
const validateInput = require("../Utils/validateInput");
const { Checkup_Result } = require("../Schemas/Schemas");
const { saveCheckupResult } = require("../Controller/CheckUp/saveCheckupResult");
const Schemas = require("../Schemas/Schemas");

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
  validateInput(Schemas, "Checkup_Result"),
  saveCheckupResult
);

module.exports = nurseRouter;
