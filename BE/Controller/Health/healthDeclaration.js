const sqlServerPool = require("../../Utils/connectMySql");
const sql = require("mssql");
const sendNotification = require("../../Utils/sendNotification");

const getHealthDeclarationOfStudentById = async (req, res, next) => {
  const studentId = req.params.student_id;
  const parentId = req.user?.user_id;
  const pool = await sqlServerPool;

  const result = await pool.request().input("student_id", sql.Int, studentId).input("parent_id", sql.Int, parentId)
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
        sh.student_id = @student_id AND si.parent_id = @parent_id
    `);

  if (result.recordset.length > 0) {
    res.status(200).json({
      status: "success",
      data: result.recordset[0],
    });
  } else {
    res.status(400).json({
      status: "fail",
      message: "No health record found for this student",
    });
  }
};

const updateHealthDeclarationByStudentId = async (req, res, next) => {
  const { studentId } = req.params;
  const healthDeclarationData = req.body;
  const pool = await sqlServerPool;

  const result = await pool
    .request()
    .input("student_id", sql.Int, studentId) // ✅ sửa đúng tên biến
    .input("height_cm", sql.Int, healthDeclarationData.height_cm)
    .input("weight_kg", sql.Int, healthDeclarationData.weight_kg)
    .input("allergy", sql.NVarChar, healthDeclarationData.allergy)
    .input("chronic_disease", sql.NVarChar, healthDeclarationData.chronic_disease)
    .input("vision_left", sql.Float, healthDeclarationData.vision_left)
    .input("vision_right", sql.Float, healthDeclarationData.vision_right)
    .input("hearing_left", sql.NVarChar, healthDeclarationData.hearing_left)
    .input("hearing_right", sql.NVarChar, healthDeclarationData.hearing_right)
    .input("health_status", sql.NVarChar, healthDeclarationData.health_status)
    .input("updated_at", sql.DateTime, new Date()).query(`
      UPDATE Student_Health 
      SET height_cm = @height_cm, 
          weight_kg = @weight_kg, 
          allergy = @allergy,
          chronic_disease = @chronic_disease,
          vision_left = @vision_left, 
          vision_right = @vision_right,
          hearing_left = @hearing_left, 
          hearing_right = @hearing_right, 
          health_status = @health_status,
          updated_at = @updated_at
      WHERE student_id = @student_id
    `);

  const blood_type = await pool.request().input("student_id", sql.Int, studentId).query(`
        SELECT blood_type FROM Student_Health WHERE student_id = @student_id
        `);
  if (blood_type.recordset[0].blood_type === null) {
    const blood = healthDeclarationData.blood_type;
    if (blood !== null && blood !== "") {
      await pool.request().input("student_id", sql.Int, studentId).input("blood_type", sql.NVarChar, blood).query(`
        UPDATE Student_Health 
        SET blood_type = @blood_type
        WHERE student_id = @student_id
      `);
    }
  }
  if (
    healthDeclarationData.blood_type !== null &&
    healthDeclarationData.blood_type !== "" &&
    healthDeclarationData.blood_type !== blood_type.recordset[0].blood_type
  ) {
    // không cho phép cập nhật blood_type nếu đã tồn tại
    return res.status(400).json({
      status: "fail",
      message: "Health declaration already exists. Cannot update blood type",
    });
  }

  const parent = await pool.request().input("student_id", sql.Int, studentId).query(`
      SELECT parent_id FROM Student_Information WHERE student_id = @student_id
    `);

  if (result.rowsAffected[0] > 0) {
    await sendNotification(
      pool,
      parent.recordset[0].parent_id,
      "Cập nhật khai báo y tế",
      `Khai báo y tế đã được cập nhật thành công`
    );
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
  getHealthDeclarationOfStudentById,
  updateHealthDeclarationByStudentId,
};
