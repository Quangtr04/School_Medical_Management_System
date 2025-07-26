const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");
const { getStudentIdByName } = require("../../Utils/getStudentIdByName");
const { getSupplyByName, getSupplyById } = require("../../Utils/Supply");
const { getServerityIdByName } = require("../../Utils/serverity");
const sendNotification = require("../../Utils/sendNotification");
const sendEmail = require("../../Utils/mailer");

// Hàm chuẩn hóa ngày về múi giờ Việt Nam (GMT+7)
function normalizeDateVN(dateInput) {
  let date;
  if (dateInput instanceof Date) {
    date = new Date(dateInput.getTime());
  } else if (typeof dateInput === "string") {
    date = new Date(dateInput);
  } else {
    throw new Error("Invalid date input");
  }
  const offset = 7 * 60 * 60 * 1000; // Cộng thêm 7 tiếng
  return new Date(date.getTime() + offset);
}

const createMedicalIncident = async (req, res) => {
  const IncidentData = req.body;
  const nurse_id = req.user.user_id;
  console.log(IncidentData);

  try {
    const pool = await sqlServerPool;

    // Lấy parent_id
    const parentQuery = await pool
      .request()
      .input("student_id", sql.Int, IncidentData.student_id)
      .query(`SELECT parent_id FROM Student_Information WHERE student_id = @student_id`);

    if (parentQuery.recordset.length === 0) return res.status(404).json({ error: "Parent not found for the student" });

    const subject_info_id = parentQuery.recordset[0].parent_id;

    // Lấy serverity_id
    const serverity_id = await getServerityIdByName(IncidentData.severity_level);

    // Insert sự kiện vào bảng Medical_Incident

    // Chuẩn hóa thời gian xảy ra và thời gian giải quyết (nếu có)
    const occurredAtVN = normalizeDateVN(IncidentData.occurred_at);
    const resolvedAtVN = IncidentData.resolved_at ? normalizeDateVN(IncidentData.resolved_at) : null;

    const insertIncident = await pool
      .request()
      .input("serverity_id", sql.Int, serverity_id)
      .input("subject_info_id", sql.Int, subject_info_id)
      .input("student_id", sql.Int, IncidentData.student_id)
      .input("description", sql.NVarChar(sql.MAX), IncidentData.description)
      .input("occurred_at", sql.DateTime, occurredAtVN)
      .input("nurse_id", sql.Int, nurse_id)
      .input("status", sql.VarChar(50), IncidentData.status)
      .input("resolution_notes", sql.NVarChar(sql.MAX), IncidentData.resolution_notes || null)
      .input("resolved_at", sql.DateTime, resolvedAtVN).query(`
        INSERT INTO Medical_Incident (
          serverity_id, subject_info_id, student_id, description,
          occurred_at, reported_at, nurse_id, status,
          resolution_notes, resolved_at
        )
        OUTPUT INSERTED.event_id
        VALUES (
          @serverity_id, @subject_info_id, @student_id, @description,
          @occurred_at, GETDATE(), @nurse_id, @status,
          @resolution_notes, @resolved_at
        );
      `);

    const event_id = insertIncident.recordset[0].event_id;

    // Duyệt qua từng thuốc được sử dụng
    for (const med of IncidentData.medication_used) {
      const { supply_name, quantity_used } = med;

      const supply_id = await getSupplyByName(supply_name);
      const SupplyById = await getSupplyById(supply_id);

      if (!SupplyById) {
        return res.status(404).json({ error: `Supply not found: ${supply_name}` });
      }

      //lấy và chuyển giá trị về thập phân
      const quantity = parseInt(SupplyById.quantity, 10);
      const used = parseInt(quantity_used, 10);
      const remaining = quantity - used;

      if (remaining < 0) {
        return res.status(400).json({ error: `Not enough '${supply_name}' in stock` });
      }

      // Ghi log sử dụng thuốc
      await pool
        .request()
        .input("event_id", sql.Int, event_id)
        .input("supply_id", sql.Int, supply_id)
        .input("quantity_used", sql.Int, used).query(`
          INSERT INTO Incident_Medication_Log (event_id, supply_id, quantity_used)
          VALUES (@event_id, @supply_id, @quantity_used);
        `);

      // Cập nhật số lượng còn lại trong kho
      await pool.request().input("supply_id", sql.Int, supply_id).input("quantity", sql.Int, remaining).query(`
          UPDATE Medical_Supply
          SET quantity = @quantity
          WHERE supply_id = @supply_id;
        `);
      if (remaining === 0) {
        await pool.request().input("supply_id", sql.Int, supply_id).query(`
          UPDATE Medical_Supply
          SET is_active = 0
          WHERE supply_id = @supply_id;
        `);
      }
    }

    // Gửi thông báo cho phụ huynh
    await sendNotification(
      pool,
      subject_info_id,
      "Medical Incident Reported",
      `A medical incident has been reported for your child ${IncidentData.student_id}. Please check the details in the system.`
    );
    // Gửi email cho phụ huynh
    const parentEmailResult = await pool
      .request()
      .input("parent_id", sql.Int, subject_info_id)
      .query(`SELECT email FROM Users WHERE user_id = @parent_id`);

    const parentEmail = parentEmailResult.recordset[0]?.email;

    if (parentEmail) {
      await sendEmail(
        parentEmail,
        "Thông báo sự cố y tế của học sinh",
        `Kính gửi quý phụ huynh,

Hệ thống vừa ghi nhận một sự cố y tế liên quan đến con của quý phụ huynh (Mã học sinh: ${IncidentData.student_id}).

Quý phụ huynh vui lòng đăng nhập vào hệ thống để xem chi tiết và theo dõi tình hình sức khỏe của học sinh.

Trân trọng,
Ban Y Tế Trường`
      );
    }

    return res.status(201).json({
      message: "Medical incident and medication log created successfully",
      event_id,
    });
  } catch (error) {
    console.error("Error creating medical incident:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const updateIncident = async (req, res) => {
  const nurse_id = req.user?.user_id;
  const { event_id } = req.params;
  const { status } = req.body;

  try {
    const pool = await sqlServerPool;

    // 1. Lấy dữ liệu cũ
    const existingIncident = await pool
      .request()
      .input("event_id", sql.Int, event_id)
      .input("nurse_id", sql.Int, nurse_id)
      .query("SELECT * FROM Medical_incident WHERE event_id = @event_id AND nurse_id = @nurse_id");

    if (existingIncident.recordset.length === 0) {
      return res.status(404).json({ error: "Incident not found" });
    }

    const oldData = existingIncident.recordset[0];

    // 2. Giữ lại dữ liệu cũ nếu không truyền
    const newStatus = status ?? oldData.status;

    await pool.request().input("event_id", sql.Int, event_id).input("status", sql.VarChar(50), newStatus).query(`
        UPDATE Medical_incident
        SET status = @status
        WHERE event_id = @event_id
      `);
    await sendNotification(
      pool,
      oldData.subject_info_id,
      "Cập nhật sự cố y tế",
      `Sự cố y tế cho con của bạn (Mã học sinh: ${oldData.student_id}) đã được cập nhật. Vui lòng kiểm tra hệ thống để biết thêm chi tiết.`
    );
    // Gửi email thông báo cập nhật
    const parentEmailResult = await pool
      .request()
      .input("parent_id", sql.Int, oldData.subject_info_id)
      .query(`SELECT email FROM Users WHERE user_id = @parent_id`);

    const parentEmail = parentEmailResult.recordset[0]?.email;

    if (parentEmail) {
      await sendEmail(
        parentEmail,
        "Thông báo cập nhật sự cố y tế của học sinh",
        `Kính gửi quý phụ huynh,

        Sự cố y tế cho con của quý phụ huynh (Mã học sinh: ${oldData.student_id}) đã được cập nhật. Quý phụ huynh vui lòng đăng nhập vào hệ thống để xem chi tiết.

        Trân trọng,
        Ban Y Tế Trường`
      );
    }

    return res.status(200).json({ message: "Incident updated successfully." });
  } catch (error) {
    console.error("Error updating incident:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getAllIncidents = async (req, res) => {
  try {
    const pool = await sqlServerPool;

    const result = await pool.request().query(`
      SELECT 
        MI.event_id,

        -- Thông tin học sinh
        S.full_name AS student_name,
        S.student_code,
        S.gender AS student_gender,
        S.date_of_birth AS student_dob,
        S.class_name,

        -- Phụ huynh báo cáo
        P.fullname AS parent_name,
        P.email AS parent_email,
        P.phone AS parent_phone,

        -- Y tá phụ trách
        N.fullname AS nurse_name,

        -- Mức độ
        SE.serverity AS severity_level,

        -- Nội dung sự cố
        MI.description,
        MI.status,
        MI.occurred_at,
        MI.reported_at,
        MI.resolution_notes,
        MI.resolved_at,

        -- Danh sách thuốc/vật tư sử dụng
        STUFF((
          SELECT ', ' + MS.name + ' (x' + CAST(IML.quantity_used AS VARCHAR) + ')'
          FROM Incident_Medication_Log IML
          JOIN Medical_Supply MS ON IML.supply_id = MS.supply_id
          WHERE IML.event_id = MI.event_id
          FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, ''
        ) AS medication_used

      FROM Medical_incident MI
      JOIN Severity_Of_Incident SE ON MI.serverity_id = SE.serverity_id
      JOIN Student_Information S ON MI.student_id = S.student_id
      JOIN Users P ON MI.subject_info_id = P.user_id
      LEFT JOIN Users N ON MI.nurse_id = N.user_id
      ORDER BY MI.reported_at DESC
    `);

    return res.status(200).json({
      status: "success",
      data: result.recordset,
    });
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getIncidentsByUserId = async (req, res) => {
  const user_id = req.user?.user_id;

  try {
    const pool = await sqlServerPool;

    const result = await pool.request().input("user_id", sql.Int, user_id).query(`
        SELECT 
          MI.event_id,

          -- Thông tin học sinh
          S.full_name AS student_name,
          S.student_code,
          S.gender AS student_gender,
          S.date_of_birth AS student_dob,
          S.class_name,

          -- Phụ huynh báo cáo
          P.fullname AS parent_name,
          P.email AS parent_email,
          P.phone AS parent_phone,

          -- Y tá phụ trách
          N.fullname AS nurse_name,

          -- Mức độ
          SE.serverity AS severity_level,

          -- Nội dung sự cố
          MI.description,
          MI.status,
          MI.occurred_at,
          MI.reported_at,
          MI.resolution_notes,
          MI.resolved_at,

          -- Danh sách thuốc/vật tư sử dụng
          STUFF((
            SELECT ', ' + MS.name + ' (x' + CAST(IML.quantity_used AS VARCHAR) + ')'
            FROM Incident_Medication_Log IML
            JOIN Medical_Supply MS ON IML.supply_id = MS.supply_id
            WHERE IML.event_id = MI.event_id
            FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, ''
          ) AS medication_used

        FROM Medical_incident MI
        JOIN Severity_Of_Incident SE ON MI.serverity_id = SE.serverity_id
        JOIN Student_Information S ON MI.student_id = S.student_id
        JOIN Users P ON MI.subject_info_id = P.user_id
        LEFT JOIN Users N ON MI.nurse_id = N.user_id

        WHERE 
          MI.subject_info_id = @user_id OR
          MI.nurse_id = @user_id OR
          S.parent_id = @user_id 

        ORDER BY MI.reported_at DESC
      `);

    return res.status(200).json({
      status: "success",
      data: result.recordset,
    });
  } catch (error) {
    console.error("Error fetching incidents by user_id:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getIncidentByStudentId = async (req, res) => {
  const user_id = parseInt(req.params.user_id);

  try {
    const pool = await sqlServerPool;

    const result = await pool.request().input("user_id", sql.Int, user_id).query(`
        SELECT 
          MI.event_id,

          -- Thông tin học sinh
          S.full_name AS student_name,
          S.student_code,
          S.gender AS student_gender,
          S.date_of_birth AS student_dob,
          S.class_name,

          -- Phụ huynh báo cáo
          P.fullname AS parent_name,
          P.email AS parent_email,
          P.phone AS parent_phone,

          -- Y tá phụ trách
          N.fullname AS nurse_name,

          -- Mức độ
          SE.serverity AS severity_level,

          -- Nội dung sự cố
          MI.description,
          MI.status,
          MI.occurred_at,
          MI.reported_at,
          MI.resolution_notes,
          MI.resolved_at,

          -- Danh sách thuốc/vật tư sử dụng
          STUFF((
            SELECT ', ' + MS.name + ' (x' + CAST(IML.quantity_used AS VARCHAR) + ')'
            FROM Incident_Medication_Log IML
            JOIN Medical_Supply MS ON IML.supply_id = MS.supply_id
            WHERE IML.event_id = MI.event_id
            FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, ''
          ) AS medication_used

        FROM Medical_incident MI
        JOIN Severity_Of_Incident SE ON MI.serverity_id = SE.serverity_id
        JOIN Student_Information S ON MI.student_id = S.student_id
        JOIN Users P ON MI.subject_info_id = P.user_id
        LEFT JOIN Users N ON MI.nurse_id = N.user_id

        WHERE 
          P.user_id = @user_id 

        ORDER BY MI.reported_at DESC
      `);

    return res.status(200).json({
      status: "success",
      data: result.recordset,
    });
  } catch (error) {
    console.error("Error fetching incidents by user_id:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getIncidentById = async (req, res) => {
  const { event_id } = req.params;
  try {
    const pool = await sqlServerPool;

    const result = await pool.request().input("event_id", sql.Int, event_id).query(`
        SELECT 
          MI.event_id,

          -- Thông tin học sinh
          S.full_name AS student_name,
          S.student_code,
          S.gender AS student_gender,
          S.date_of_birth AS student_dob,
          S.class_name,

          -- Phụ huynh báo cáo
          P.fullname AS parent_name,
          P.email AS parent_email,
          P.phone AS parent_phone,

          -- Y tá phụ trách
          N.fullname AS nurse_name,

          -- Mức độ
          SE.serverity AS severity_level,

          -- Nội dung sự cố
          MI.description,
          MI.status,
          MI.occurred_at,
          MI.reported_at,
          MI.resolution_notes,
          MI.resolved_at,

          -- Danh sách thuốc/vật tư sử dụng
          STUFF((
            SELECT ', ' + MS.name + ' (x' + CAST(IML.quantity_used AS VARCHAR) + ')'
            FROM Incident_Medication_Log IML
            JOIN Medical_Supply MS ON IML.supply_id = MS.supply_id
            WHERE IML.event_id = MI.event_id
            FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, ''
          ) AS medication_used

        FROM Medical_incident MI
        JOIN Severity_Of_Incident SE ON MI.serverity_id = SE.serverity_id
        JOIN Student_Information S ON MI.student_id = S.student_id
        JOIN Users P ON MI.subject_info_id = P.user_id
        LEFT JOIN Users N ON MI.nurse_id = N.user_id

        WHERE MI.event_id = @event_id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Incident not found" });
    }

    return res.status(200).json({
      status: "success",
      data: result.recordset[0],
    });
  } catch (error) {
    console.error("Error fetching incident by ID:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createMedicalIncident,
  updateIncident,
  getAllIncidents,
  getIncidentsByUserId,
  getIncidentById,
  getIncidentByStudentId,
};
