const sql = require("mssql");
const db = require("../Utils/connectMySql");

const saveCheckupResult = async (req, res) => {
  const { checkup_id, student_id } = req.params;
  const { Checkup_Result } = req.body;

  await db
    .request()
    .input("checkup_id", sql.Int, checkup_id)
    .input("student_id", sql.Int, student_id)
    .input("checked_at", sql.DateTime, new Date())
    .input("height_cm", sql.Float, height_cm)
    .input("weight_kg", sql.Float, weight_kg)
    .input("vision_left", sql.NVarChar, vision_left)
    .input("vision_right", sql.NVarChar, vision_right)
    .input("hearing_left", sql.NVarChar, hearing_left)
    .input("hearing_right", sql.NVarChar, hearing_right)
    .input("blood_pressure", sql.NVarChar, blood_pressure)
    .input("notes", sql.NVarChar, notes)
    .input("abnormal_signs", sql.NVarChar, abnormal_signs)
    .input("needs_counseling", sql.Bit, needs_counseling ? 1 : 0).query(`
      INSERT INTO Checkup_Result (
        checkup_id, student_id, checked_at,
        height_cm, weight_kg, vision_left, vision_right,
        hearing_left, hearing_right, blood_pressure,
        notes, abnormal_signs, needs_counseling
      ) VALUES (
        @checkup_id, @student_id, @checked_at,
        @height_cm, @weight_kg, @vision_left, @vision_right,
        @hearing_left, @hearing_right, @blood_pressure,
        @notes, @abnormal_signs, @needs_counseling
      )
    `);

  res.status(201).json({ message: "Checkup result saved successfully" });
};

module.exports = { saveCheckupResult };
