const UpdateResponseByManager = async (req, res, next) => {
  try {
    const { campaign_id } = req.params;
    const { status } = req.body;

    if (!["APPROVED", "DECLINED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'APPROVED' or 'DECLINED'." });
    }

    const pool = await sqlServerPool;

    const campaign = await pool
      .request()
      .input("campaign_id", sql.Int, campaign_id)
      .query("SELECT * FROM Vaccination_Campaign WHERE campaign_id = @campaign_id");

    if (campaign.recordset.length === 0) {
      return res.status(404).json({ message: "Vaccination campaign not found." });
    }

    const { approval_status, created_by, class: className } = campaign.recordset[0];

    if (approval_status === "APPROVED" && status === "APPROVED") {
      return res.status(400).json({ message: "Campaign already approved." });
    }

    // ✅ Cập nhật trạng thái
    await pool
      .request()
      .input("campaign_id", sql.Int, campaign_id)
      .input("status", sql.VarChar, status)
      .query("UPDATE Vaccination_Campaign SET approval_status = @status WHERE campaign_id = @campaign_id");

    if (status === "DECLINED") {
      await pool.request().input("campaign_id", sql.Int, campaign_id).query(`
        DELETE FROM Vaccination_Result WHERE campaign_id = @campaign_id;
        DELETE FROM Vaccination_Consent_Form WHERE campaign_id = @campaign_id;
      `);

      await sendNotification(
        pool,
        created_by,
        "Chiến dịch tiêm chủng bị từ chối",
        "Chiến dịch tiêm bạn tạo đã bị từ chối bởi quản lý."
      );
    }

    if (status === "APPROVED") {
      await sendNotification(
        pool,
        created_by,
        "Chiến dịch tiêm chủng được duyệt",
        `Chiến dịch tiêm chủng cho lớp ${className} đã được duyệt.`
      );

      const students = await pool
        .request()
        .input("class_name", sql.NVarChar, className)
        .query("SELECT student_id, parent_id FROM Student_Information WHERE class_name = @class_name");

      for (let stu of students.recordset) {
        await pool
          .request()
          .input("campaign_id", sql.Int, campaign_id)
          .input("student_id", sql.Int, stu.student_id)
          .input("parent_id", sql.Int, stu.parent_id).query(`
            INSERT INTO Vaccination_Consent_Form (campaign_id, student_id, parent_id, status)
            VALUES (@campaign_id, @student_id, @parent_id, 'PENDING')
          `);

        await sendNotification(
          pool,
          stu.parent_id,
          "Xác nhận tiêm chủng",
          `Vui lòng xác nhận chiến dịch tiêm chủng cho học sinh lớp ${className}.`
        );
      }
    }

    res.status(200).json({ message: "Campaign response updated successfully." });
  } catch (error) {
    console.error("UpdateResponseByManager error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const UpdateResponseByParent = async (req, res, next) => {
  try {
    const parent_id = req.user_id?.user_id;
    const { campaign_id } = req.params;
    const { status } = req.body;

    if (!["APPROVED", "DECLINED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value. Must be 'APPROVED' or 'DECLINED'." });
    }

    const pool = await sqlServerPool;

    const vaccineExist = await pool
      .request()
      .input("campaign_id", sql.Int, campaign_id)
      .input("parent_id", sql.Int, parent_id).query(`
        SELECT * FROM Vaccination_Consent_Form
        WHERE campaign_id = @campaign_id AND parent_id = @parent_id
      `);

    if (vaccineExist.recordset.length === 0) {
      return res.status(404).json({ message: "Consent form not found." });
    }

    const consentForm = vaccineExist.recordset[0];

    if (consentForm.status === "APPROVED" && status === "APPROVED") {
      return res.status(400).json({ message: "Already approved." });
    }

    await pool
      .request()
      .input("status", sql.NVarChar, status)
      .input("campaign_id", sql.Int, campaign_id)
      .input("parent_id", sql.Int, parent_id).query(`
        UPDATE Vaccination_Consent_Form
        SET status = @status
        WHERE campaign_id = @campaign_id AND parent_id = @parent_id
      `);

    const nurseId = consentForm.approved_by;
    const className = await pool
      .request()
      .input("campaign_id", sql.Int, campaign_id)
      .query(`SELECT class FROM Vaccination_Campaign WHERE campaign_id = @campaign_id`);

    const classValue = className.recordset[0]?.class;

    if (status === "DECLINED") {
      await pool.request().input("campaign_id", sql.Int, campaign_id).input("parent_id", sql.Int, parent_id).query(`
          DELETE VR
          FROM Vaccination_Result VR
          INNER JOIN Vaccination_Consent_Form VC ON VR.consent_form_id = VC.form_id
          WHERE VC.campaign_id = @campaign_id AND VC.parent_id = @parent_id
        `);

      if (nurseId) {
        await sendNotification(
          pool,
          nurseId,
          "Lịch tiêm chủng bị từ chối",
          "Lịch tiêm chủng đã bị từ chối bởi phụ huynh."
        );
      }
    }

    if (status === "APPROVED") {
      const students = await pool.request().input("class", sql.NVarChar, classValue).query(`
          SELECT student_id, parent_id, fullname FROM Student_Information
          WHERE class_name LIKE CAST(@class AS NVARCHAR) + '%'
        `);

      for (let stu of students.recordset) {
        await pool
          .request()
          .input("campaign_id", sql.Int, campaign_id)
          .input("student_id", sql.Int, consentForm.student_id)
          .input("consent_form_id", sql.Int, consentForm.form_id).query(`
            IF NOT EXISTS (
                SELECT 1 FROM Checkup_Participation
                WHERE checkup_id = @campaign_id AND student_id = @student_id
            )
            BEGIN
                INSERT INTO Checkup_Participation (checkup_id, student_id, consent_form_id)
                VALUES (@campaign_id, @student_id, @consent_form_id)
            END
            `);

        // Gửi thông báo cho y tá
        await sendNotification(
          pool,
          nurseId,
          "Xác nhận tiêm chủng",
          `Phụ huynh đã chấp nhận tiêm chủng cho học sinh ${stu.fullname}.`
        );
      }
    }

    res.status(200).json({ message: "Phản hồi của phụ huynh đã được cập nhật." });
  } catch (error) {
    console.error("Error in UpdateResponseByParent:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  UpdateResponseByManager,
  UpdateResponseByParent,
};
