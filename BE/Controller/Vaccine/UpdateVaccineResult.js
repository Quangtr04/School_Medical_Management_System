const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");
const sendNotification = require("../../Utils/sendNotification");

const updateResultVaccine = async (req, res, next) => {
  try {
    const vaccine_id = req.params.vaccine_id;
    const { vaccinated_at, vaccine_name, dose_number, reaction, follow_up_required, note } = req.body;

    const pool = await sqlServerPool;

    // 🔍 Kiểm tra bản ghi tồn tại
    const checkExist = await pool
      .request()
      .input("id", sql.Int, vaccine_id)
      .query(`SELECT student_id FROM Vaccination_Result WHERE id = @id`);

    if (checkExist.recordset.length === 0) {
      return res.status(404).json({ message: "Vaccine record not found" });
    }

    const student_id = checkExist.recordset[0].student_id;

    // ✅ Cập nhật bản ghi
    await pool
      .request()
      .input("id", sql.Int, vaccine_id)
      .input("vaccinated_at", sql.DateTime, vaccinated_at || null)
      .input("vaccine_name", sql.VarChar(255), vaccine_name || null)
      .input("dose_number", sql.Int, dose_number || null)
      .input("reaction", sql.NVarChar(255), reaction || null)
      .input("follow_up_required", sql.NVarChar(255), follow_up_required || null)
      .input("note", sql.NVarChar(255), note || null).query(`
        UPDATE Vaccination_Result
        SET
          vaccinated_at = @vaccinated_at,
          vaccine_name = @vaccine_name,
          dose_number = @dose_number,
          reaction = @reaction,
          follow_up_required = @follow_up_required,
          note = @note
        WHERE id = @id
      `);

    // 🔁 Lấy parent_id
    const getParent = await pool
      .request()
      .input("student_id", sql.Int, student_id)
      .query("SELECT parent_id FROM Student_Information WHERE student_id = @student_id");

    if (getParent.recordset.length > 0) {
      const parent_id = getParent.recordset[0].parent_id;

      // 🔔 Gửi thông báo
      await sendNotification(
        pool,
        parent_id,
        "Thông báo tiêm chủng",
        "Tình trạng của học sinh sau khi tiêm chủng đã được cập nhật"
      );
    }

    return res.status(200).json({ message: "Vaccination result updated successfully." });
  } catch (error) {
    console.error("Error in updateResultVaccine:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getStudentVaccineList = async (req, res, next) => {
  try {
    const parent_id = req.user?.user_id;
    const pool = await sqlServerPool;
    const result = await pool
      .request()
      .input("parent_id", sql.Int, parent_id)
      .query(
        `SELECT VR.*, SI.full_name, SI.address, SI.class_name, SI.student_code, SI.gender, SI.date_of_birth 
        FROM Vaccination_Result VR JOIN Student_Information SI ON VR.student_id = SI.student_id
        WHERE SI.parent_id = @parent_id`
      );
    res.status(200).json({
      status: "success",
      data: result.recordset,
    });
  } catch (error) {
    console.error("Error in getStudentVaccineList:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getStudentVaccineListByCampaignIdByParentId = async (req, res, next) => {
  try {
    const campaign_id = req.params.campaign_id;
    const parent_id = req.user?.user_id;
    const pool = await sqlServerPool;
    const result = await pool
      .request()
      .input("id", sql.Int, campaign_id)
      .input("parent_id", sql.Int, parent_id)
      .query(
        `SELECT VR.*, SI.full_name, SI.address, SI.class_name, SI.student_code, SI.gender, SI.date_of_birth 
        FROM Vaccination_Result VR JOIN Student_Information SI ON VR.student_id = SI.student_id
        WHERE VR.campaign_id = @id AND SI.parent_id = @parent_id`
      );
    res.status(200).json({
      status: "success",
      data: result.recordset,
    });
  } catch (error) {
    console.error("Error in getStudentVaccineList:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getStudentVaccineListByCampaignId = async (req, res, next) => {
  try {
    const campaign_id = req.params.campaign_id;
    const pool = await sqlServerPool;
    const result = await pool
      .request()
      .input("id", sql.Int, campaign_id)
      .query(
        `SELECT VR.*, SI.full_name, SI.address, SI.class_name, SI.student_code, SI.gender, SI.date_of_birth 
        FROM Vaccination_Result VR JOIN Student_Information SI ON VR.student_id = SI.student_id
        WHERE VR.campaign_id = @id`
      );
    res.status(200).json({
      status: "success",
      data: result.recordset,
    });
  } catch (error) {
    console.error("Error in getStudentVaccineList:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getStudentVaccineListById = async (req, res, next) => {
  const { student_id, campaing_id } = req.params;
  try {
    const pool = await sqlServerPool;
    const result = await pool
      .request()
      .input("campaign_id", sql.Int, campaing_id)
      .input("student_id", sql.Int, student_id)
      .query(
        `SELECT VR.*, SI.full_name, SI.address, SI.class_name, SI.student_code, SI.gender, SI.date_of_birth 
        FROM Vaccination_Result VR JOIN Student_Information SI ON VR.student_id = SI.student_id 
        WHERE VR.student_id = @student_id AND VR.campaign_id = @campaign_id`
      );
    res.status(200).json({
      status: "success",
      data: result.recordset,
    });
  } catch (error) {
    console.error("Error in getStudentVaccineList:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  updateResultVaccine,
  getStudentVaccineListById,
  getStudentVaccineList,
  getStudentVaccineListByCampaignId,
  getStudentVaccineListByCampaignIdByParentId,
};
