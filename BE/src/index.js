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
  origin: ["http://localhost:5173", "http://192.168.1.145:3000"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 204,
  credentials: false,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use("/api/login", loginRouter);

app.use("/parent", parentRouter);

app.use("/admin", adminRouter);

app.use("/nurse", nurseRouter);

app.use("/manager", managerRouter);

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`FE can connect from : ${corsOptions.origin.join(", ")}`);
});
