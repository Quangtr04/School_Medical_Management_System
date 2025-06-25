const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");
const sendNotification = require("../../Utils/sendNotification");

const saveCheckupResult = async (req, res) => {
  const pool = await sqlServerPool;
  const { id } = req.params;

  const {
    height_cm,
    weight_kg,
    vision_left,
    vision_right,
    hearing_left,
    hearing_right,
    blood_pressure,
    notes,
    abnormal_signs,
    needs_counseling,
  } = req.body;

  try {
    // 🔍 Kiểm tra bản ghi tồn tại
    const checkExist = await pool.request().input("id", sql.Int, id).query(`
        SELECT id, student_id FROM Checkup_Participation
        WHERE id = @id
      `);

    if (checkExist.recordset.length === 0) {
      return res.status(404).json({ message: "Checkup record not found" });
    }

    // ✅ Thực hiện cập nhật
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("checked_at", sql.DateTime, new Date())
      .input("height_cm", sql.Float, height_cm)
      .input("weight_kg", sql.Float, weight_kg)
      .input("vision_left", sql.Float, vision_left)
      .input("vision_right", sql.Float, vision_right)
      .input("hearing_left", sql.NVarChar, hearing_left)
      .input("hearing_right", sql.NVarChar, hearing_right)
      .input("blood_pressure", sql.NVarChar, blood_pressure)
      .input("notes", sql.NVarChar, notes || null)
      .input("abnormal_signs", sql.NVarChar, abnormal_signs || null)
      .input("needs_counseling", sql.Bit, needs_counseling ? 1 : 0).query(`
        UPDATE Checkup_Participation
        SET
          checked_at = @checked_at,
          height_cm = @height_cm,
          weight_kg = @weight_kg,
          vision_left = @vision_left,
          vision_right = @vision_right,
          hearing_left = @hearing_left,
          hearing_right = @hearing_right,
          blood_pressure = @blood_pressure,
          notes = @notes,
          abnormal_signs = @abnormal_signs,
          needs_counseling = @needs_counseling
        WHERE id = @id 
      `);
    const getParent = await pool.request().input("student_id", sql.Int, checkExist.recordset[0].student_id).query(`
    SELECT parent_id FROM Student_Information
    WHERE student_id = @student_id
  `);

    if (getParent.recordset.length > 0) {
      const parentId = getParent.recordset[0].parent_id;

      await sendNotification(
        pool,
        parentId,
        "Kết quả khám sức khỏe",
        "Kết quả khám sức khỏe của con bạn đã được cập nhật."
      );
    }

    res.status(200).json({ message: "Checkup result saved successfully" });
  } catch (error) {
    console.error("Error saving checkup result:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateCheckup = async (req, res) => {
  const { checkup_id, student_id } = req.params;
  const { note, needs_counseling } = req.body;

  try {
    const pool = await sqlServerPool;

    // 🔍 Kiểm tra bản ghi tồn tại
    const checkExist = await pool
      .request()
      .input("checkup_id", sql.Int, checkup_id)
      .input("student_id", sql.Int, student_id).query(`
        SELECT id FROM Checkup_Participation
        WHERE checkup_id = @checkup_id AND student_id = @student_id
      `);

    if (checkExist.recordset.length === 0) {
      return res.status(404).json({ message: "Checkup record not found" });
    }

    const newNeedsCounseling = needs_counseling ? 1 : 0;

    // ✅ Cập nhật ghi chú
    await pool
      .request()
      .input("checkup_id", sql.Int, checkup_id)
      .input("student_id", sql.Int, student_id)
      .input("needs_counseling", sql.Bit, newNeedsCounseling)
      .input("note", sql.NVarChar, note).query(`
        UPDATE Checkup_Participation
        SET notes = @note AND needs_counseling = @needs_counseling
        WHERE checkup_id = @checkup_id AND student_id = @student_id
      `);
    const getParent = await pool.request().input("student_id", sql.Int, student_id).query(`
    SELECT parent_id FROM Student_Information
    WHERE student_id = @student_id
  `);

    if (getParent.recordset.length > 0) {
      const parentId = getParent.recordset[0].parent_id;

      await sendNotification(
        pool,
        parentId,
        "Kết quả khám sức khỏe",
        "Kết quả khám sức khỏe của con bạn đã được cập nhật."
      );
    }

    res.status(200).json({ message: "Note updated successfully" });
  } catch (error) {
    console.error("Update failed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCheckupParticipation = async (req, res, next) => {
  try {
    const pool = await sqlServerPool;
    const checkupList = await pool.request().query(`SELECT * FROM Checkup_Participation`);
    res.status(200).json({ checkups: checkupList.recordset });
  } catch (error) {
    console.error("Error fetching checkup list:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCheckupParticipationById = async (req, res, next) => {
  const id = req.params;
  try {
    const pool = await sqlServerPool;
    const checkupList = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`SELECT * FROM Checkup_Participation WHERE id = @id`);
    res.status(200).json({ checkups: checkupList.recordset });
  } catch (error) {
    console.error("Error fetching checkup list:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { saveCheckupResult, updateCheckup, getCheckupParticipation, getCheckupParticipationById };
