const express = require("express");
const cors = require("cors");
const os = require("os");
const parentRouter = require("../routers/parent.routers");
const loginRouter = require("../routers/login.routers");
const adminRouter = require("../routers/admin.routers");
const nurseRouter = require("../routers/nurse.router");
const managerRouter = require("../routers/manager.router");
const { swaggerUi, swaggerSpec } = require("../Utils/swaggerOptions");
const app = express();
const port = 3000;
const path = require("path");
const cron = require("node-cron");
const { checkUnupdatedMedicationLogs } = require("../Controller/Medical/medicationDailyLog");
const router = require("../routers/supply.routers");
const { updateStatusSupplyWhenExpiredDay } = require("../Controller/Medical/medicalSupply");

require("dotenv").config();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://192.168.1.168:5173",
    "http://192.168.1.204:5173",
    "http://172.20.10.4:5173",
    "http://172.20.10.2:5173",
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 204,
  credentials: false,
};

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use(cors(corsOptions));

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/login", loginRouter);

app.use("/api/parent", parentRouter);

app.use("/api/admin", adminRouter);

app.use("/api/nurse", nurseRouter);

app.use("/api/manager", managerRouter);

app.listen(port, "0.0.0.0", () => {
  // Thay đổi dòng này để hiển thị đúng hơn
  console.log(`Server is running on http://0.0.0.0:${port}`);

  const networkInterfaces = os.networkInterfaces();
  Object.values(networkInterfaces)
    .flat()
    .forEach((iface) => {
      if (iface.family === "IPv4" && !iface.internal) {
        console.log(`🌐 Server may be accessible via: http://${iface.address}:${port}`);
      }
    });

  console.log(`FE can connect from : ${corsOptions.origin.join(", ")}`);
  console.log("Swagger docs at http://localhost:3000/api-docs");
});

// Cấu hình cron job chạy vào 18:00 mỗi ngày
cron.schedule("0 18 * * *", () => {
  console.log("🕕 Kiểm tra nhật ký uống thuốc (18:00)");
  checkUnupdatedMedicationLogs(); // Gọi hàm xử lý
});

// Cấu hình cron job để tự động kiểm tra vật tư y tế hết hạn mỗi ngày lúc 0h
cron.schedule("0 0 * * *", () => {
  console.log("🔁 Tự động kiểm tra vật tư y tế hết hạn mỗi ngày lúc 0h");
  updateStatusSupplyWhenExpiredDay();
});
