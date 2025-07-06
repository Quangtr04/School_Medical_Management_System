const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");

const getCheckupList = async (req, res, next) => {
  try {
    const pool = await sqlServerPool;

    // Lấy danh sách lịch khám sức khỏe
    const checkupList = await pool
      .request()
      .query(`SELECT MS.*, U.fullname FROM Medical_Checkup_Schedule MS JOIN Users U ON MS.created_by = U.user_id`);

    res.status(200).json({ checkups: checkupList.recordset });
  } catch (error) {
    console.error("Error fetching checkup list:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCheckupById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const pool = await sqlServerPool;

    // Lấy danh sách lịch khám sức khỏe
    const checkupList = await pool.request().input("id", sql.Int, id)
      .query(`SELECT MS.*, U.fullname FROM Medical_Checkup_Schedule MS JOIN Users U ON MS.created_by = U.user_id 
               WHERE MS.checkup_id = @id`);

    res.status(200).json({ checkups: checkupList.recordset });
  } catch (error) {
    console.error("Error fetching checkup list:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCheckupListByIdAndParentId = async (req, res, next) => {
  const { id } = req.params;
  const parentId = req.user?.user_id;
  try {
    const pool = await sqlServerPool;
    // Lấy danh sách lịch khám sức khỏe theo id và parentId
    const checkupList = await pool.request().input("id", sql.Int, id).input("parentId", sql.Int, parentId)
      .query(`SELECT MS.*, U.fullname FROM Medical_Checkup_Schedule MS JOIN Users U ON MS.created_by = U.user_id 
              WHERE MS.checkup_id = @id AND MS.parent_id = @parentId`);
    if (checkupList.recordset.length === 0) {
      return res.status(404).json({ message: "Checkup not found for this parent" });
    }
    res.status(200).json({ checkups: checkupList.recordset });
  } catch (error) {
    console.error("Error fetching checkup list by ID and parent ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCheckupListByParentId = async (req, res, next) => {
  const parentId = req.user?.user_id;
  try {
    const pool = await sqlServerPool;
    // Lấy danh sách lịch khám sức khỏe theo parentId
    const checkupList = await pool.request().input("parentId", sql.Int, parentId)
      .query(`SELECT MS.*, U.fullname FROM Medical_Checkup_Schedule MS JOIN Users U ON MS.created_by = U.user_id 
              WHERE MS.parent_id = @parentId`);
    if (checkupList.recordset.length === 0) {
      return res.status(404).json({ message: "No checkups found for this parent" });
    }
    res.status(200).json({ checkups: checkupList.recordset });
  } catch (error) {
    console.error("Error fetching checkup list by parent ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCheckupListApproved = async (req, res, next) => {
  try {
    const pool = await sqlServerPool;

    // Lấy danh sách lịch khám sức khỏe
    const checkupList = await pool.request()
      .query(`SELECT MS.*, U.fullname FROM Medical_Checkup_Schedule MS JOIN Users U ON MS.created_by = U.user_id 
              WHERE approval_status = 'APPROVED' `);

    res.status(200).json({ checkups: checkupList.recordset });
  } catch (error) {
    console.error("Error fetching checkup list:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCheckupListDeclined = async (req, res, next) => {
  try {
    const pool = await sqlServerPool;

    // Lấy danh sách lịch khám sức khỏe
    const checkupList = await pool.request()
      .query(`SELECT MS.*, U.fullname FROM Medical_Checkup_Schedule MS JOIN Users U ON MS.created_by = U.user_id 
              WHERE approval_status = 'DECLINED' `);

    res.status(200).json({ checkups: checkupList.recordset });
  } catch (error) {
    console.error("Error fetching checkup list:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCheckupListPending = async (req, res, next) => {
  try {
    const pool = await sqlServerPool;

    // Lấy danh sách lịch khám sức khỏe
    const checkupList = await pool.request()
      .query(`SELECT MS.*, U.fullname FROM Medical_Checkup_Schedule MS JOIN Users U ON MS.created_by = U.user_id 
              WHERE approval_status = 'PENDING' `);

    res.status(200).json({ checkups: checkupList.recordset });
  } catch (error) {
    console.error("Error fetching checkup list:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getCheckupList,
  getCheckupListApproved,
  getCheckupListDeclined,
  getCheckupById,
  getCheckupListByIdAndParentId,
  getCheckupListByParentId,
  getCheckupListPending,
};
