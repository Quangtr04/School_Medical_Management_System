const express = require("express");
const cors = require("cors");
const parentRouter = require("../routers/parent.routers");
const loginRouter = require("../routers/login.routers");
const adminRouter = require("../routers/admin.routers");
const authorize = require("../middlewares/user_middlewares");
const nurseRouter = require("../routers/nurse.router");
const managerRouter = require("../routers/manager.router");
const app = express();
const port = 3000;

// require("dotenv").config();

const corsOptions = {
  origin: ["http://localhost:5173", "http://192.168.1.96:5173"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 204,
  credentials: false,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use("/api/login", loginRouter);

app.use("/api/parent", parentRouter);

app.use("/api/admin", adminRouter);

app.use("/api/nurse", nurseRouter);

app.use("/api/manager", managerRouter);

app.listen(port, "0.0.0.0", () => {
  // Thay đổi dòng này để hiển thị đúng hơn
  console.log(`Server is running on http://0.0.0.0:${port}`);

  // Hoặc, để hiển thị địa chỉ IP thực tế của máy (cần lấy IP động)
  // Lưu ý: Lấy IP động trong Node.js có thể hơi phức tạp hơn một chút,
  // nhưng nếu bạn chỉ muốn in ra để dễ kiểm tra, bạn có thể hardcode IP tĩnh của máy Backend (nếu có)
  // hoặc sử dụng một module để lấy IP.

  // Ví dụ đơn giản nếu bạn biết IP của máy Backend (ví dụ: 10.87.15.148)
  console.log(`FE should connect to : http://10.87.15.148:${port}`);
  // Hoặc, nếu muốn tự động lấy IP (cần cài thêm 'os' module nếu chưa có)
  /*
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  let ipAddress = 'localhost'; // Fallback
  for (const interfaceName in networkInterfaces) {
    const networkInterface = networkInterfaces[interfaceName];
    for (const config of networkInterface) {
      if (config.family === 'IPv4' && !config.internal) {
        ipAddress = config.address;
        break;
      }
    }
    if (ipAddress !== 'localhost') break;
  }
  console.log(`Server is accessible at http://${ipAddress}:${port}`);
  */

  console.log(`FE can connect from : ${corsOptions.origin.join(", ")}`);
});
