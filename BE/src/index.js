const express = require("express");
const parentRouter = require("../routers/parent.routers");
const loginRouter = require("../routers/login.routers");
const adminRouter = require("../routers/admin.routers");
const authorize = require("../middlewares/user_middlewares");
const nurseRouter = require("../routers/nurse.router.");
const managerRouter = require("../routers/manager.router");
const app = express();
const port = 3000;

// require("dotenv").config();

app.use(express.json());

app.use("/login", loginRouter);

app.use("/parent", parentRouter);

app.use("/admin", adminRouter);

app.use("/nurse", nurseRouter);

app.use("/manager", managerRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
