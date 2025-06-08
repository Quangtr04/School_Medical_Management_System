const sqlServerPool = require("../Utils/connectMySql");
const sql = require("mssql");

const healthDeclarationController = async (req, res, next) => {
  const pool = await sqlServerPool;
  const student_id = req.params.studentId;
  const healthDeclarationData = req.body;

  // Insert health declaration data into the database
  const result = await pool
    .request()
    .input("student_id", sql.Int, student_id)
    .input("height_cm", sql.Int, healthDeclarationData.height_cm)
    .input("weight_kg", sql.Int, healthDeclarationData.weight_kg)
    .input("blood_type", sql.NVarChar, healthDeclarationData.blood_type)
    .input("allergy", sql.NVarChar, healthDeclarationData.allergy)
    .input("chronic_disease", sql.NVarChar, healthDeclarationData.chronic_disease)
    .input("vision_left", sql.Float, healthDeclarationData.vision_left)
    .input("vision_right", sql.Float, healthDeclarationData.vision_right)
    .input("hearing_left", sql.NVarChar, healthDeclarationData.hearing_left)
    .input("hearing_right", sql.NVarChar, healthDeclarationData.hearing_right)
    .input("health_status", sql.NVarChar, healthDeclarationData.health_status)
    .input("created_at", sql.DateTime, new Date())
    .input("updated_at", sql.DateTime, new Date())
    .query(
      `INSERT INTO Student_Health (student_id, height_cm, weight_kg, blood_type, allergy, chronic_disease, vision_left, vision_right, hearing_left, hearing_right, health_status, created_at, updated_at) 
         VALUES (@student_id, @height_cm, @weight_kg, @blood_type, @allergy, @chronic_disease, @vision_left, @vision_right, @hearing_left, @hearing_right, @health_status, @created_at, @updated_at)`
    );

  if (result.rowsAffected.length > 0) {
    res.status(200).json({
      status: "success",
      message: "Health declaration submitted successfully",
    });
  } else {
    res.status(400).json({
      status: "fail",
      message: "Failed to submit health declaration",
    });
  }
};

module.exports = healthDeclarationController;
