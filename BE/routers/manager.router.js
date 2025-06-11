const express = require("express");
const { getPending, responseSchedule } = require("../Controller/CheckUp/checkupController");

const managerRouter = express.Router();

// Manager duyệt lịch
// managerRouter.get("/pending", auth, authorize("manager"), getPending);
managerRouter.get("/pending", getPending); // lấy các đơn chưa đc chấp nhận ra
managerRouter.post("/approve/:id", responseSchedule); // chấp nhận đơn hoặc không

module.exports = managerRouter;
