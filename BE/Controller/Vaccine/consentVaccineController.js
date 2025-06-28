const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");
const sendNotification = require("../../Utils/sendNotification");

const getConsentVaccineByParentId = async (req, res) => {
  try {
    const parentId = req.user?.user_id;
    if (!parentId) {
      return res.status(400).json({ message: "Parent ID is required" });
    }
    const pool = await sqlServerPool;
    // Fetch all students associated with the parent
    const ListVaccineConsent = await pool
      .request()
      .input("parentId", sql.Int, parentId)
      .query(`SELECT * FROM Vaccination_Consent_Form WHERE parent_id = @parentId`);

    if (ListVaccineConsent.recordset.length === 0) {
      return res.status(404).json({ message: "No students found for this parent" });
    }

    // Fetch the latest consent form for each student
    res.status(200).json({
      status: "success",
      data: ListVaccineConsent.recordset,
    });
  } catch (error) {
    console.error("Error in getConsentVaccineByParentId:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getConsentVaccineApproveByParentId = async (req, res, next) => {
  try {
    const parentId = req.user?.user_id;
    if (!parentId) {
      return res.status(400).json({ message: "Parent ID is required" });
    }
    const pool = await sqlServerPool;
    // Fetch all students associated with the parent
    const ListVaccineConsent = await pool
      .request()
      .input("parentId", sql.Int, parentId)
      .query(`SELECT * FROM Vaccination_Consent_Form WHERE parent_id = @parentId AND status = 'APPROVED'`);

    if (ListVaccineConsent.recordset.length === 0) {
      return res.status(404).json({ message: "No students found for this parent" });
    }

    // Fetch the latest consent form for each student
    res.status(200).json({
      status: "success",
      data: ListVaccineConsent.recordset,
    });
  } catch (error) {
    console.error("Error in getConsentVaccineByParentId:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getConsentVaccineDeclineByParentId = async (req, res, next) => {
  try {
    const parentId = req.user?.user_id;
    if (!parentId) {
      return res.status(400).json({ message: "Parent ID is required" });
    }
    const pool = await sqlServerPool;
    // Fetch all students associated with the parent
    const ListVaccineConsent = await pool
      .request()
      .input("parentId", sql.Int, parentId)
      .query(`SELECT * FROM Vaccination_Consent_Form WHERE parent_id = @parentId AND status = 'DECLINED'`);

    if (ListVaccineConsent.recordset.length === 0) {
      return res.status(404).json({ message: "No students found for this parent" });
    }

    // Fetch the latest consent form for each student
    res.status(200).json({
      status: "success",
      data: ListVaccineConsent.recordset,
    });
  } catch (error) {
    console.error("Error in getConsentVaccineByParentId:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getConsentVaccineByIdAndParentId = async (req, res, next) => {
  try {
    const parentId = req.user?.user_id;
    const { id } = req.params;
    if (!parentId || !id) {
      return res.status(400).json({ message: "Parent ID and Consent ID are required" });
    }
    const pool = await sqlServerPool;
    // Fetch the consent form by ID and parent ID
    const consentVaccine = await pool
      .request()
      .input("parentId", sql.Int, parentId)
      .input("id", sql.Int, id)
      .query(`SELECT * FROM Vaccination_Consent_Form WHERE parent_id = @parentId AND consent_id = @id`);
    if (consentVaccine.recordset.length === 0) {
      return res.status(404).json({ message: "Consent form not found for this parent" });
    }
    // Return the consent form details
    res.status(200).json({
      status: "success",
      data: consentVaccine.recordset[0],
    });
  } catch (error) {
    console.error("Error in getConsentVaccineByIdAndParentId:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getResponseConsentVaccineParent = async (req, res, next) => {
  try {
    const parentId = req.user?.user_id;
    const { status } = req.body; // Assuming status is passed as a query parameter
    const { id } = req.params; // Assuming id is the consent ID
    if (!parentId) {
      return res.status(400).json({ message: "Parent ID is required" });
    }
    if (!id) {
      return res.status(400).json({ message: "Consent ID is required" });
    }
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    if (!["AGREED", "DECLINED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be AGREED or DECLINED." });
    }

    const pool = await sqlServerPool;

    const formResult = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`SELECT student_id, campaign_id FROM Vaccination_Consent_Form WHERE form_id = @id`);

    if (formResult.recordset.length === 0) {
      return res.status(404).json({ message: "Student not found for this consent" });
    }

    const { campaign_id, student_id } = formResult.recordset[0];

    const consentVaccine = await pool
      .request()
      .input("parentId", sql.Int, parentId)
      .input("id", sql.Int, id)
      .input("status", sql.VarChar, status).query(`UPDATE Vaccination_Consent_Form 
                SET status = @status 
                WHERE parent_id = @parentId AND form_id = @id`);

    if (consentVaccine.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Consent form not found for this parent" });
    }

    const nurseId = await pool
      .request()
      .input("id", sql.Int, campaign_id)
      .query(`SELECT created_by FROM Vaccination_Campaign WHERE campaign_id = @id`);

    if (nurseId.recordset.length === 0) {
      return res.status(404).json({ message: "Nurse not found for this consent" });
    }

    if (status === "AGREED") {
      await pool
        .request()
        .input("campaign_id", sql.Int, campaign_id)
        .input("student_id", sql.Int, student_id)
        .input("consent_form_id", sql.Int, id).query(`
                IF NOT EXISTS (
                  SELECT 1 FROM Vaccination_Result
                  WHERE campaign_id = @campaign_id AND student_id = @student_id
                )
                BEGIN
                  INSERT INTO Vaccination_Result (campaign_id, student_id, consent_form_id)
                  VALUES (@campaign_id, @student_id, @consent_form_id)
                END
              `);

      // Notify the parent about the approval
      sendNotification(
        pool,
        nurseId.recordset[0].created_by,
        "Phụ huynh đã duyệt phiếu đồng ý tiêm chủng",
        `Đơn tiêm chủng ${id} của bạn đã được phê duyệt bởi phụ huynh`
      );
      res.status(200).json({
        status: "success",
      });
    }

    if (status === "DECLINED") {
      // Notify the parent about the decline
      sendNotification(
        pool,
        nurseId.recordset[0].created_by,
        "Phụ huynh đã từ chối phiếu đồng ý tiêm chủng",
        `Đơn tiêm chủng ${id} của bạn đã bị từ chối bởi phụ huynh`
      );

      res.status(200).json({
        status: "success",
      });
    }
  } catch (error) {
    console.error("Error in getResponseConsentVaccineParent:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getConsentVaccineByParentId,
  getConsentVaccineApproveByParentId,
  getConsentVaccineDeclineByParentId,
  getConsentVaccineByIdAndParentId,
  getResponseConsentVaccineParent,
};
