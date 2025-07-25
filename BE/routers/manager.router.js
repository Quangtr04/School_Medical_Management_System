const express = require("express");
const { getPending, responseSchedule, deleteSchedule } = require("../Controller/CheckUp/checkupController");

const { UpdateStatusCheckupByManager } = require("../Controller/CheckUp/UpdateStatusCheckup");
const {
  getCheckupList,
  getCheckupById,
  getCheckupListApproved,
  getCheckupListDeclined,
} = require("../Controller/CheckUp/getCheckup");
const { getNotifications } = require("../Controller/Notification/getNotification");
const authenticateToken = require("../middlewares/authMiddlewares");
const {
  getVaccinationCampaign,
  getVaccinationCampaignById,
  getVaccinationCampaignPending,
  getVaccinationCampaignApprove,
  getVaccinationCampaignDeclined,
} = require("../Controller/Vaccine/getVaccineCampaign");
const { deleteVaccinationCampaign, responseVaccinationCampaign } = require("../Controller/Vaccine/VaccineController");
const { UpdateResponseByManager } = require("../Controller/Vaccine/UpdateResponseVaccine");
const { getProfileByUserId } = require("../Controller/Infomation/getUser");
const { parentUpdateUserById } = require("../Controller/Login/account_status");

const managerRouter = express.Router();

// Lấy thông tin cá nhân
managerRouter.get("/profile", authenticateToken, getProfileByUserId);

// Cập nhật thông tin
managerRouter.patch("/profile", authenticateToken, parentUpdateUserById);

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

// Lấy lịch khám bị từ chối
managerRouter.get("/checkups-declined", getCheckupListDeclined);

// 📌 Xóa một lịch khám theo ID
managerRouter.delete("/checkups/:id", deleteSchedule);

// Lấy danh sách lịch tiêm chủng
managerRouter.get("/vaccine-campaigns", getVaccinationCampaign);

// Lấy chi tiết một lịch tiêm chủng theo ID
managerRouter.get("/vaccine-campaigns/:id", getVaccinationCampaignById);

// Lấy danh sách lịch tiêm chủng chưa xét duyệt
managerRouter.get("/vaccine-campaigns-pending", getVaccinationCampaignPending);

// Lấy danh sách lịch tiêm chủng bị từ chôi
managerRouter.get("/vaccine-campaigns-declined", getVaccinationCampaignDeclined);

// Lấy danh sách lịch tiêm chủng đã chấp thuận
managerRouter.get("/vaccine-campaigns-approved", getVaccinationCampaignApprove);

// Xóa lịch tiêm chủng theo id
managerRouter.delete("/vaccine-campaigns/:id", deleteVaccinationCampaign);

// Phản hồi lịch tiêm chủng được gửi
managerRouter.post("/vaccine-campaigns/:id/respond", responseVaccinationCampaign);

// Cập nhật phản hồi trạng thái tiêm chủng
managerRouter.patch("/vaccine-campaigns/:campaign_id/status", UpdateResponseByManager);

//lấy thông báo
managerRouter.get("/notifications", authenticateToken, getNotifications);

module.exports = managerRouter;
