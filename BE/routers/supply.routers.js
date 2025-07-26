// supplyRouter.js
const express = require("express");
const { updateStatusSupplyWhenExpiredDay } = require("../Controller/Medical/medicalSupply");
const router = express.Router();

// Route test: cập nhật trạng thái vật tư y tế hết hạn
router.get("/test-update-expired-supplies", async (req, res) => {
  try {
    await updateStatusSupplyWhenExpiredDay();
    res.status(200).json({ message: "✅ Đã kiểm tra và cập nhật vật tư hết hạn (nếu có)." });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật vật tư y tế:", error);
    res.status(500).json({ message: "❌ Lỗi server", error: error.message });
  }
});

module.exports = router;
