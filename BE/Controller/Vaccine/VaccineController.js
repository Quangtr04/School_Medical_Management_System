const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");
const sendNotification = require("../../Utils/sendNotification");

const createVaccinationCampaign = async (req, res) => {
  try {
    const create_by = req.user?.user_id;
    const { title, description, scheduled_date, sponsor, className } = req.body;
    const pool = await sqlServerPool;

    if (className === null) {
      return res.status(400).json({ message: "Class name is required" });
    }

    // Kiểm tra scheduled_date có phải Thứ 7 hoặc Chủ nhật không
    const day = new Date(scheduled_date).getDay(); // 0 = Chủ nhật, 6 = Thứ 7
    if (day === 0 || day === 6) {
      return res.status(400).json({
        status: "fail",
        message: "Ngày khám không được rơi vào Thứ 7 hoặc Chủ Nhật",
      });
    }

    // Insert the vaccination campaign into the database
    const result = await pool
      .request()
      .input("title", sql.NVarChar, title)
      .input("description", sql.NVarChar, description)
      .input("scheduled_date", sql.Date, scheduled_date)
      .input("created_by", sql.Int, create_by)
      .input("sponsor", sql.NVarChar, sponsor)
      .input("class", sql.Int, className).query(`
        INSERT INTO Vaccination_Campaign
          (title, description, scheduled_date, created_by, approval_status, sponsor, class, approved_by)
          OUTPUT INSERTED.campaign_id
        VALUES
          (@title, @description, @scheduled_date, @created_by, 'PENDING', @sponsor, @class, NULL);
      `);
    if (result.rowsAffected[0] === 0) {
      return res.status(400).json({ message: "Failed to create vaccination campaign" });
    }
    const campaignId = result.recordset[0].campaign_id;
    // Notify all managers about the new vaccination campaign
    const managers = await pool.request().query(`SELECT user_id FROM Users WHERE role_id = 2`);
    const managerIds = managers.recordset.map((m) => m.user_id);

    // Respond with the created campaign ID
    sendNotification(
      pool,
      managerIds,
      "New Vaccination Campaign",
      `A new vaccination campaign has been created: "${title}".`
    );

    res.status(201).json({ message: "Vaccination campaign created", id: campaignId });
  } catch (error) {
    console.error("Error creating vaccination campaign:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteVaccinationCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sqlServerPool;
    // Check if the campaign exists
    const check = await pool.request().input("id", sql.Int, id).query(`
      SELECT campaign_id, approval_status FROM Vaccination_Campaign WHERE campaign_id = @id
    `);

    // If the campaign does not exist, return 404
    if (check.recordset.length === 0) {
      return res.status(404).json({ message: "Vaccination campaign not found" });
    }

    // If the campaign is already approved
    const approvalStatus = check.recordset[0].approval_status;
    let parentIds = [];
    if (approvalStatus === "APPROVED") {
      // Get the list of parents who have consented to the campaign
      const consentedParents = await pool.request().input("id", sql.Int, id).query(`
          SELECT DISTINCT parent_id FROM Vaccination_Consent_Form WHERE campaign_id = @id
        `);
      parentIds = consentedParents.recordset.map((p) => p.parent_id);
    }

    // Delete the campaign
    await pool.request().input("id", sql.Int, id).query(`
        DELETE FROM Vaccination_Result WHERE campaign_id = @id;
        DELETE FROM Vaccination_Consent_Form WHERE campaign_id = @id;
        DELETE FROM Vaccination_Campaign WHERE campaign_id = @id;
    `);

    const managers = await pool.request().query(`
      SELECT user_id FROM Users WHERE role_id = 2
    `);
    const managerIds = managers.recordset.map((m) => m.user_id);

    for (let managerId of managerIds) {
      await sendNotification(
        pool,
        managerId,
        "Lịch tiêm chủng cho học sinh bị xóa",
        `Lịch tiêm chủng cho học sinh (ID: ${id}) đã bị xóa.`
      );
    }

    // 5. Gửi thông báo đến các phụ huynh nếu đã duyệt
    if (approvalStatus === "APPROVED") {
      for (let parentId of parentIds) {
        await sendNotification(
          pool,
          parentId,
          "Lịch tiêm chủng cho học sinh bị hủy",
          `Lịch tiêm chủng cho học sinh của bạn đã bị hủy.`
        );
      }
    }

    res.status(200).json({ message: "Vaccination campaign deleted successfully" });
  } catch (error) {
    console.error("Error deleting vaccination campaign:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const responseVaccinationCampaign = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["APPROVED", "DECLINED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value. 'APPROVED' or 'DECLINED'." });
  }
  try {
    const pool = await sqlServerPool;
    const result = await pool.request().input("status", sql.NVarChar, status).input("id", sql.Int, id).query(`
        UPDATE Vaccination_Campaign
        SET approval_status = @status, approved_by = 'principal'
        WHERE campaign_id = @id;
      `);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Vaccination campaign not found" });
    }
    // If the campaign is approved, notify the parents
    if (status === "APPROVED") {
      const campaign = await pool.request().input("id", sql.Int, id).query(`
        SELECT class AS class_name, created_by FROM Vaccination_Campaign WHERE campaign_id = @id
      `);
      const className = campaign.recordset[0].class_name;
      const nurseId = campaign.recordset[0].created_by;

      // Gửi thông báo đến nurse
      await sendNotification(
        pool,
        nurseId,
        "Lịch tiêm chủng được duyệt",
        `Lịch tiêm chủng cho lớp ${className} đã được duyệt.`
      );

      // Get the list of student for the class
      const students = await pool.request().input("class", sql.NVarChar, String(className)) // ép kiểu số thành chuỗi
        .query(`
    SELECT student_id, parent_id FROM Student_Information
    WHERE class_name LIKE @class + '%'
  `);

      for (let stu of students.recordset) {
        await pool
          .request()
          .input("student_id", sql.Int, stu.student_id)
          .input("parent_id", sql.Int, stu.parent_id)
          .input("campaign_id", sql.Int, id).query(`
                  INSERT INTO Vaccination_Consent_Form (student_id, parent_id, campaign_id, status, submitted_at)
                  VALUES (@student_id, @parent_id, @campaign_id, 'PENDING', NULL)
                `);
      }
      // Notify all parents about the approved campaign
      await sendNotification(
        pool,
        stu.parent_id,
        "Cần xác nhận lịch tiêm chủng",
        `Vui lòng xác nhận lịch tiêm chủng cho học sinh lớp ${className}.`
      );
    }
  } catch (error) {
    console.error("Error updating vaccination campaign status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createVaccinationCampaign,
  deleteVaccinationCampaign,
  responseVaccinationCampaign,
};
