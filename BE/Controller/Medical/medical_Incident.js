const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");
const { getStudentIdByName } = require("../../Utils/getStudentIdByName");
const { getSupplyByName, getSupplyById } = require("../../Utils/Supply");
const { getServirityIdByName } = require("../../Utils/serverity");
const sendNotification = require("../../Utils/sendNotification");
const { get } = require("http");

const createMedicalIncident = async (req, res) => {
  const IncidentData = req.body;
  const nurse_id = req.user?.user_id;

  try {
    const pool = await sqlServerPool;

    // Get student ID
    const studentId = await getStudentIdByName(IncidentData.student_name);
    if (!studentId) return res.status(404).json({ error: "Student not found" });

    // Get parent_id
    const parentQuery = await pool
      .request()
      .input("student_id", sql.Int, studentId)
      .query(`SELECT parent_id FROM Student_Information WHERE student_id = @student_id`);

    if (parentQuery.recordset.length === 0) return res.status(404).json({ error: "Parent not found for the student" });

    const subject_info_id = parentQuery.recordset[0].parent_id;

    // Get supply_id and serverity_id
    const supply_id = await getSupplyByName(IncidentData.supply_name);
    const serverity_id = await getServirityIdByName(IncidentData.serverity_name);

    const request = pool.request();

    // Insert into Medical_Incident and get event_id
    const insertIncident = await request
      .input("serverity_id", sql.Int, serverity_id)
      .input("subject_info_id", sql.Int, subject_info_id)
      .input("student_id", sql.Int, studentId)
      .input("description", sql.NVarChar(sql.MAX), IncidentData.description)
      .input("occurred_at", sql.DateTime, IncidentData.occurred_at)
      .input("nurse_id", sql.Int, nurse_id)
      .input("status", sql.VarChar(50), IncidentData.status)
      .input("resolution_notes", sql.NVarChar(sql.MAX), IncidentData.resolution_notes || null)
      .input("resolved_at", sql.DateTime, IncidentData.resolved_at || null).query(`
        INSERT INTO Medical_incident (
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

    // Insert log vào Incident_Medication_Log
    await pool
      .request()
      .input("event_id", sql.Int, event_id)
      .input("supply_id", sql.Int, supply_id)
      .input("quantity_used", sql.Int, IncidentData.quantity_used).query(`
        INSERT INTO Incidenct_Medication_Log (event_id, supply_id, quantity_used)
        VALUES (@event_id, @supply_id, @quantity_used);
      `);

    // Trừ số lượng trong kho
    const SupplyById = await getSupplyById(supply_id);
    if (!SupplyById) return res.status(404).json({ error: "Supply not found" });

    const quantity = parseInt(SupplyById.quantity, 10);
    const quantityUsed = parseInt(IncidentData.quantity_used, 10);
    const quantityRemaining = quantity - quantityUsed;

    if (quantityRemaining < 0) return res.status(400).json({ error: "Not enough supply in stock" });

    await pool.request().input("supply_id", sql.Int, supply_id).input("quantity", sql.Int, quantityRemaining).query(`
        UPDATE Medical_Supply
        SET quantity = @quantity
        WHERE supply_id = @supply_id;
      `);
    await sendNotification(
      pool,
      subject_info_id,
      "Medical Incident Reported",
      `A medical incident has been reported for your child ${IncidentData.student_name}. Please check the details in the system.`
    );
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
  const { event_id } = req.params;
  const { status, resolution_notes, resolved_at } = req.body;

  try {
    const pool = await sqlServerPool;

    // 1. Lấy dữ liệu cũ
    const existingIncident = await pool
      .request()
      .input("event_id", sql.Int, event_id)
      .query("SELECT * FROM Medical_incident WHERE event_id = @event_id");

    if (existingIncident.recordset.length === 0) {
      return res.status(404).json({ error: "Incident not found" });
    }

    const oldData = existingIncident.recordset[0];

    // 2. Giữ lại dữ liệu cũ nếu không truyền
    const newStatus = status ?? oldData.status;
    const newResolutionNotes = resolution_notes ?? oldData.resolution_notes;
    const newResolvedAt = resolved_at ?? oldData.resolved_at;

    // 3. Cập nhật lại incident
    await pool
      .request()
      .input("event_id", sql.Int, event_id)
      .input("status", sql.VarChar(50), newStatus)
      .input("resolution_notes", sql.NVarChar(sql.MAX), newResolutionNotes)
      .input("resolved_at", sql.DateTime, newResolvedAt).query(`
        UPDATE Medical_incident
        SET status = @status,
            resolution_notes = @resolution_notes,
            resolved_at = @resolved_at
        WHERE event_id = @event_id
      `);

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
          FROM Incidenct_Medication_Log IML
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
            FROM Incidenct_Medication_Log IML
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
            FROM Incidenct_Medication_Log IML
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
};
