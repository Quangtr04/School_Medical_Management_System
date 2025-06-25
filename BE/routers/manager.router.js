const express = require("express");
const { getPending, responseSchedule, deleteSchedule } = require("../Controller/CheckUp/checkupController");

const { UpdateStatusCheckupByManager } = require("../Controller/CheckUp/UpdateStatusCheckup");
const {
  getCheckupList,
  getCheckupById,
  getCheckupListApproved,
  getCheckupApprovedById,
  getCheckupListDeclined,
  getCheckupDeclinedById,
} = require("../Controller/CheckUp/getCheckup");
const { getNotifications } = require("../Controller/Notification/getNotification");
const authenticateToken = require("../middlewares/authMiddlewares");

const managerRouter = express.Router();

// 📌 Lấy danh sách lịch khám đang chờ duyệt
managerRouter.get("/checkups/pending", getPending);

// 📌 Phản hồi chấp nhận hay từ chối lịch khám (tự động tạo phiếu đồng ý nếu approved)
managerRouter.post("/checkups/:id/respond", responseSchedule);

// 📌 Cập nhật trạng thái (APPROVED / DECLINED) thủ công
managerRouter.patch("/checkups/:checkup_id/status", UpdateStatusCheckupByManager);

// Lấy tất cả lịch khám
managerRouter.get("/checkups", getCheckupList);

// Lấy lịch khám theo ID
managerRouter.get("/checkups/:id", getCheckupById);

// Lấy lịch khám đã duyệt
managerRouter.get("/checkups-approved", getCheckupListApproved);
managerRouter.get("/checkups-approved/:id", getCheckupApprovedById);

// Lấy lịch khám bị từ chối
managerRouter.get("/checkups-declined", getCheckupListDeclined);
managerRouter.get("/checkups-declined/:id", getCheckupDeclinedById);


// 📌 Xóa một lịch khám theo ID
managerRouter.delete("/checkups/:id", deleteSchedule);

//lấy thông báo
managerRouter.get("/notifications", authenticateToken, getNotifications);

module.exports = managerRouter;
