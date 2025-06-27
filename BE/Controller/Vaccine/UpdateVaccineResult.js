const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");
const sendNotification = require("../../Utils/sendNotification");

const updateResultVaccine = async (req, res, next) => {
  try {
    const id = req.params.id;
    const {
      vaccinated_at,
      vaccine_name,
      dose_number,
      reaction,
      follow_up_required,
      note,
    } = req.body;

    const pool = await sqlServerPool;

    // 🔍 Kiểm tra bản ghi tồn tại
    const checkExist = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`SELECT student_id FROM Vaccination_Result WHERE id = @id`);

    if (checkExist.recordset.length === 0) {
      return res.status(404).json({ message: "Vaccine record not found" });
    }

    const student_id = checkExist.recordset[0].student_id;

    // ✅ Cập nhật bản ghi
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("vaccinated_at", sql.DateTime, vaccinated_at || null)
      .input("vaccine_name", sql.VarChar(255), vaccine_name || null)
      .input("dose_number", sql.Int, dose_number || null)
      .input("reaction", sql.NVarChar(255), reaction || null)
      .input(
        "follow_up_required",
        sql.NVarChar(255),
        follow_up_required || null
      )
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
      .query(
        "SELECT parent_id FROM Student_Information WHERE student_id = @student_id"
      );

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

    return res
      .status(200)
      .json({ message: "Vaccination result updated successfully." });
  } catch (error) {
    console.error("Error in updateResultVaccine:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateVaccine = async (req, res, next) => {
  const { id } = req.params;
  const { reaction, follow_up_required, note } = req.body;
  try {
    const pool = await sqlServerPool;
    const checkExist = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM Vaccination_Result WHERE id = @id");
    if (checkExist.recordset.length === 0) {
      return res.status(404).json({ message: "Vaccine record not found" });
    }
    if (!reaction) {
      reaction = checkExist.recordset[0].reaction;
    }
    if (!follow_up_required) {
      follow_up_required = checkExist.recordset[0].follow_up_required;
    }
    if (!note) {
      note = checkExist.recordset[0].note;
    }
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("reaction", sql.NVarChar(255), reaction)
      .input("follow_up_required", sql.NVarChar(255), follow_up_required)
      .input("note", sql.NVarChar(255), note).query(`
        UPDATE Vaccination_Result
        SET
          reaction = @reaction,
          follow_up_required = @follow_up_required,
          note = @note
        WHERE id = @id
      `);
    return res.status(200).json({
      status: "success",
      data: checkExist.recordset[0],
    });
  } catch (error) {
    console.error("Error in updateVaccine:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getStudentVaccineList = async (req, res, next) => {
  try {
    const pool = await sqlServerPool;
    const result = await pool
      .request()
      .query(
        "SELECT VR.*, SI.full_name, SI.address, SI.class_name, SI.student_code, SI.gender, SI.date_of_birth FROM Vaccination_Result VR JOIN Student_Information SI ON VR.student_id = SI.student_id"
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
  const { id } = req.params;
  try {
    const pool = await sqlServerPool;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(
        "SELECT VR.*, SI.full_name, SI.address, SI.class_name, SI.student_code, SI.gender, SI.date_of_birth FROM Vaccination_Result VR JOIN Student_Information SI ON VR.student_id = SI.student_id WHERE VR.id = @id"
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
  updateVaccine,
};
