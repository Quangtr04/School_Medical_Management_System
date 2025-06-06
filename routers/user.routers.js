const express = require("express");

const parentRouter = express.Router();

parentRouter.post("/home", async (req, res) => {
  const { user_id, role_id } = req.body;
  try {
  } catch {
    res.status(400).json({ status: "fail", message: err });
  }
});

parentRouter.get("/viewProfile", async (req, res) => {});

module.exports = parentRouter;
