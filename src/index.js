const express = require("express");
const parentRouter = require("../routers/user.routers");
const loginRouter = require("../routers/login.routers");
const app = express();
const port = 3000;

app.use(express.json());

app.use("/login", loginRouter);

app.use("/parent", parentRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
