const sqlServerPool = require("../../db/sqlServerPool");
const sql = require("mssql");
const sendNotification = require("../../Utils/sendNotification");

const createStudentInformation = async (req, res, next) => {
  const studentInfo = req.body;
  const pool = await sqlServerPool;

  try {
    const { student_code, class_name, parent_id } = studentInfo;

    // check exist
    const studentCodeExists = await pool
      .request()
      .input("student_code", sql.NVarChar, student_code)
      .query(
        "SELECT COUNT(*) AS count FROM Student_Information WHERE student_code = @student_code"
      );

    if (studentCodeExists.recordset[0].count > 0) {
      return res.status(400).json({
        status: "fail",
        message: "Student code already exists",
      });
    }

    const classExists = await pool
      .request()
      .input("class_name", sql.NVarChar, class_name)
      .query(
        "SELECT COUNT(*) AS count FROM Class WHERE class_name = @class_name"
      );

    if (classExists.recordset[0].count === 0) {
      return res.status(400).json({
        status: "fail",
        message: "Class does not exist",
      });
    }

    const parentExists = await pool
      .request()
      .input("parent_id", sql.Int, parent_id)
      .query(
        "SELECT COUNT(*) AS count FROM Users WHERE user_id = @parent_id AND role_id = 4"
      );

    if (parentExists.recordset[0].count === 0) {
      return res.status(400).json({
        status: "fail",
        message: "Parent does not exist or is not a parent",
      });
    }

    const result = await pool
      .request()
      .input("student_code", sql.NVarChar, studentInfo.student_code)
      .input("full_name", sql.NVarChar, studentInfo.full_name)
      .input("gender", sql.NVarChar, studentInfo.gender)
      .input("day_of_birth", sql.Date, studentInfo.day_of_birth)
      .input("class_name", sql.NVarChar, studentInfo.class_name)
      .input("address", sql.NVarChar, studentInfo.address)
      .input("parent_id", sql.Int, studentInfo.parent_id)
      .input("created_at", sql.DateTime, new Date()).query(`
        INSERT INTO Student_Information 
        (student_code, full_name, gender, day_of_birth, class_name, address, parent_id, created_at)
        VALUES 
        (@student_code, @full_name, @gender, @day_of_birth, @class_name, @address, @parent_id, @created_at)
      `);

    if (result.rowsAffected[0] > 0) {
      // Gửi tb cho phụ huynh
      await sendNotification(
        pool,
        parent_id,
        "Thông báo học sinh",
        `Thông tin học sinh mới đã được tạo thành công`
      );

      return res.status(200).json({
        status: "success",
        message: "Student information created successfully",
      });
    } else {
      return res.status(400).json({
        status: "fail",
        message: "Failed to create student information",
      });
    }
  } catch (error) {
    console.error("Error creating student information:", error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while creating student information",
    });
  }
};

  const updateStudentInfoById = async (req, res, next) => {
  const studentId = req.params.studentId;
  const studentInfo = req.body;
  const pool = await sqlServerPool;

  try {
    // check exist class
    const classCheck = await pool
      .request()
      .input("class_name", sql.NVarChar, studentInfo.class_name)
      .query("SELECT COUNT(*) AS count FROM Class WHERE class_name = @class_name");

    if (classCheck.recordset[0].count === 0) {
      return res.status(400).json({
        status: "fail",
        message: "Class does not exist",
      });
    }

    // Lấy parent_id để gửi thông báo
    const parentResult = await pool
      .request()
      .input("student_id", sql.Int, studentId)
      .query("SELECT parent_id FROM Student_Information WHERE student_id = @student_id");

    const parentId = parentResult.recordset[0]?.parent_id || null;

    // update tt hs
    const result = await pool
      .request()
      .input("student_id", sql.Int, studentId)
      .input("class_name", sql.NVarChar, studentInfo.class_name)
      .input("address", sql.NVarChar, studentInfo.address)
      .input("updated_at", sql.DateTime, new Date())
      .query(`
        UPDATE Student_Information
        SET class_name = @class_name, address = @address, updated_at = @updated_at
        WHERE student_id = @student_id
      `);

    if (result.rowsAffected[0] > 0) {
      // tb cho phụ huynh
      if (parentId) {
        await sendNotification(
          pool,
          parentId,
          "Cập nhật thông tin học sinh",
          `Thông tin học sinh đã được cập nhật thành công`
        );
      }

      return res.status(200).json({
        status: "success",
        message: "Student information updated successfully",
      });
    } else {
      return res.status(400).json({
        status: "fail",
        message: "Failed to update student information",
      });
    }
  } catch (error) {
    console.error("Error updating student information:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error while updating student information",
    });
  }
};

      
module.exports = {
  createStudentInformation,
  updateStudentInfoById
};
