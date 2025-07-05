const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");

const getVaccinationCampaign = async (req, res) => {
  try {
    const pool = await sqlServerPool;
    // Check if the campaign exists
    const check = await pool.request().query(`SELECT * FROM Vaccination_Campaign`);
    // If the campaign does not exist, return 404
    if (check.recordset.length === 0) {
      return res.status(404).json({ message: "Vaccination campaign not found" });
    }
    // Return the campaign details
    res.status(200).json(check.recordset);
  } catch (error) {
    console.error("Error getting vaccination campaign:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getVaccinationCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sqlServerPool;
    // Check if the campaign exists
    const check = await pool.request().input("id", sql.Int, id).query(`
            SELECT * FROM Vaccination_Campaign WHERE campaign_id = @id
        `);
    // If the campaign does not exist, return 404
    if (check.recordset.length === 0) {
      return res.status(404).json({ message: "Vaccination campaign not found" });
    }
    // Return the campaign details
    res.status(200).json(check.recordset[0]);
  } catch (error) {
    console.error("Error getting vaccination campaign:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getVaccinationCampaignPending = async (req, res) => {
  try {
    const pool = await sqlServerPool;
    // Check if the campaign exists
    const check = await pool.request().query(`
            SELECT * FROM Vaccination_Campaign WHERE approval_status = 'PENDING'
        `);
    // If the campaign does not exist, return 404
    if (check.recordset.length === 0) {
      return res.status(404).json({ message: "No pending vaccination campaigns found" });
    }
    // Return the pending campaigns
    res.status(200).json(check.recordset);
  } catch (error) {
    console.error("Error getting vaccination campaign:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getVaccinationCampaignApprove = async (req, res) => {
  try {
    const pool = await sqlServerPool;
    // Check if the campaign exists
    const check = await pool.request().query(`
            SELECT * FROM Vaccination_Campaign WHERE approval_status = 'APPROVED'
        `);
    // If the campaign does not exist, return 404
    if (check.recordset.length === 0) {
      return res.status(404).json({ message: "No pending vaccination campaigns found" });
    }
    // Return the pending campaigns
    res.status(200).json(check.recordset);
  } catch (error) {
    console.error("Error getting vaccination campaign:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getVaccinationCampaignDeclined = async (req, res) => {
  try {
    const pool = await sqlServerPool;
    // Check if the campaign exists
    const check = await pool.request().query(`
            SELECT * FROM Vaccination_Campaign WHERE approval_status = 'DECLINED'
        `);
    // If the campaign does not exist, return 404
    if (check.recordset.length === 0) {
      return res.status(404).json({ message: "No pending vaccination campaigns found" });
    }
    // Return the pending campaigns
    res.status(200).json(check.recordset);
  } catch (error) {
    console.error("Error getting vaccination campaign:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getVaccinationCampaign,
  getVaccinationCampaignById,
  getVaccinationCampaignPending,
  getVaccinationCampaignApprove,
  getVaccinationCampaignDeclined,
};
