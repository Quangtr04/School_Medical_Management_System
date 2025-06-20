const sqlServerPool = require("../../Utils/connectMySql");
const sql = require("mssql");

const healthDeclarationController = async (req, res, next) => {
  const student_id = req.params.studentId;
  const healthDeclarationData = req.body;
  const pool = await sqlServerPool;

  const result = await pool
    .request()
    .input("student_id", sql.Int, student_id)
    .input("height_cm", sql.Int, healthDeclarationData.height_cm)
    .input("weight_kg", sql.Int, healthDeclarationData.weight_kg)
    .input("blood_type", sql.NVarChar, healthDeclarationData.blood_type)
    .input("allergy", sql.NVarChar, healthDeclarationData.allergy)
    .input(
      "chronic_disease",
      sql.NVarChar,
      healthDeclarationData.chronic_disease
    )
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

const getHealthDeclarationOfStudentByParent = async (req, res, next) => {
  const parentId = req.params.parentId;
  const pool = await sqlServerPool;

  const result = await pool.request().input("parent_id", sql.Int, parentId)
    .query(`
      SELECT 
        sh.student_id, 
        si.student_code, 
        si.full_name,
        si.class_name,
        sh.height_cm,
        sh.weight_kg, 
        sh.blood_type,
        sh.allergy,
        sh.chronic_disease,
        sh.vision_left, 
        sh.vision_right,
        sh.hearing_left,
        sh.hearing_right,
        sh.health_status,
        sh.created_at,
        sh.updated_at
      FROM 
        Student_Health sh
      JOIN 
        Student_Information si ON sh.student_id = si.student_id
      WHERE 
        si.parent_id = @parent_id
    `);

  if (result.recordset.length > 0) {
    res.status(200).json({
      status: "success",
      data: result.recordset,
    });
  } else {
    res.status(400).json({
      status: "fail",
      message: "No health records found for this parent",
    });
  }
};

const updateHealthDeclarationByStudentId = async (req, res, next) => {
  const studentId = req.params.studentId;
  const healthDeclarationData = req.body;
  const pool = await sqlServerPool;

  const result = await pool
    .request()
    .input("height_cm", sql.Int, healthDeclarationData.height_cm)
    .input("weight_kg", sql.Int, healthDeclarationData.weight_kg)
    .input("allergy", sql.NVarChar, healthDeclarationData.allergy)
    .input("vision_left", sql.Float, healthDeclarationData.vision_left)
    .input("vision_right", sql.Float, healthDeclarationData.vision_right)
    .input("hearing_left", sql.NVarChar, healthDeclarationData.hearing_left)
    .input("hearing_right", sql.NVarChar, healthDeclarationData.hearing_right)
    .input("health_status", sql.NVarChar, healthDeclarationData.health_status)
    .query(
      `UPDATE Student_Health 
         SET height_cm = @height_cm, weight_kg = @weight_kg, allergy = @allergy,
             vision_left = @vision_left, vision_right = @vision_right,
             hearing_left = @hearing_left, hearing_right = @hearing_right, health_status = @health_status,
             updated_at = GETDATE()
         WHERE student_id = @student_id`
    );

  if (result.rowsAffected.length > 0) {
    res.status(200).json({
      status: "success",
      message: "Health declaration updated successfully",
    });
  } else {
    res.status(400).json({
      status: "fail",
      message: "Failed to update health declaration",
    });
  }
};

module.exports = {
  healthDeclarationController,
  getHealthDeclarationOfStudentByParent,
  updateHealthDeclarationByStudentId,
};
