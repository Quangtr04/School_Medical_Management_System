const sql = require("mssql");
const sqlServerPool = require("./connectMySql");

const medicalSupplies = async (req, res, next) => {
    const { parent_id } = req.params.parent_id;
    const medicalSupplyData = req.body;
    const pool = await sqlServerPool;
    
        
        const result = await pool
        .request()
        .input("parent_id", sql.Int, parent_id)
        .input("name", sql.NVarChar, medicalSupplyData.name)
        .input("quantity", sql.Int, medicalSupplyData.quantity)
        .input("type", sql.NVarChar, medicalSupplyData.type)
        .input("unit", sql.NVarChar, medicalSupplyData.unit)
        .input("quantity", sql.Int, medicalSupplyData.quantity)
        .input("description", sql.NVarChar, medicalSupplyData.description)
        .input("expired_date", sql.DateTime, new Date(medicalSupplyData.expired_date))
        .input("is_active", sql.Int, medicalSupplyData.is_active)
        .input("nurse_id", sql.Int, nurse_id)
        .input("usage_note", sql.NVarChar, medicalSupplyData.usage_note)
        .query(
            `INSERT INTO Medical_Supply (name, quantity, type, unit, description, expired_date, is_active, nurse_id, usage_note) 
            VALUES (@name, @quantity, @type, @unit, @description, @expired_date, @is_active, @nurse_id, @usage_note)`
        );
    
        if (result.rowsAffected.length > 0) {
        res.status(200).json({
            status: "success",
            message: "Medical supply added successfully",
        });
        } else {
        res.status(400).json({
            status: "fail",
            message: "Failed to add medical supply",
        });
        }
    } 



module.exports = medicalSupplies;