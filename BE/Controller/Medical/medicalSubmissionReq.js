const sql = require("mssql");
const sqlServerPool = require("../../Utils/connectMySql");
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

// API tạo yêu cầu uống thuốc từ phụ huynh
const medicationSubmissionReq = async (req, res, next) => {
  const medicationSubmissionReqData = req.body; // Dữ liệu yêu cầu từ body
  const parent_id = req.user?.user_id;
  const pool = await sqlServerPool;

  try {
    const imageUrls = medicationSubmissionReqData.image_urls; // mảng ảnh từ middleware
    const imageUrlsString = JSON.stringify(imageUrls); // hoặc imageUrls.join(",") nếu bạn thích đơn giản
    // Thêm bản ghi mới vào bảng Medication_Submisstion_Request
    const result = await pool
      .request()
      .input("parent_id", sql.Int, parent_id)
      .input("student_id", sql.Int, medicationSubmissionReqData.student_id)
      .input("status", sql.NVarChar, medicationSubmissionReqData.status)
      .input("created_at", sql.DateTime, normalizeDateVN(new Date())) // Thời gian tạo yêu cầu
      .input("note", sql.NVarChar, medicationSubmissionReqData.note)
      .input("image_url", sql.NVarChar, imageUrlsString)
      .input("start_date", sql.Date, medicationSubmissionReqData.start_date)
      .input("end_date", sql.Date, medicationSubmissionReqData.end_date).query(`
        INSERT INTO Medication_Submisstion_Request 
        (parent_id, student_id, status, created_at, note, image_url, start_date, end_date, nurse_id)
        VALUES (@parent_id, @student_id, @status, @created_at, @note, @image_url, @start_date, @end_date, null)
      `);

    if (result.rowsAffected[0] > 0) {
      // Nếu thêm thành công => gửi thông báo đến tất cả y tá (role_id = 3)
      const nurses = await pool.request().query("SELECT user_id FROM Users WHERE role_id = 3");

      for (const nurse of nurses.recordset) {
        await sendNotification(
          pool,
          nurse.user_id,
          "Yêu cầu uống thuốc mới",
          `Phụ huynh đã gửi yêu cầu uống thuốc cho học sinh có ID: ${medicationSubmissionReqData.student_id}`
        );
      }

      return res.status(200).json({
        status: "success",
        message: "medicationSubmissionReq added successfully",
      });
    } else {
      // Nếu thêm thất bại
      return res.status(400).json({
        status: "fail",
        message: "Failed to add medicationSubmissionReq",
      });
    }
  } catch (error) {
    console.error("Error creating medicationSubmissionReq:", error);
    // Lỗi server khi thêm yêu cầu
    res.status(500).json({
      status: "error",
      message: "Server error while creating medicationSubmissionReq",
    });
  }
};

//API hủy đơn yêu cầu gửi thuốc từ phụ huynh
const cancelMedicationSubmissionReq = async (req, res, next) => {
  const id_req = req.params.id_req;
  const user_id = req.user?.user_id;
  const pool = await sqlServerPool;

  try {
    //  Kiểm tra trạng thái hiện tại
    const checkStatus = await pool.request().input("id_req", sql.Int, id_req).input("user_id", sql.Int, user_id).query(`
        SELECT status, student_id
        FROM Medication_Submisstion_Request 
        WHERE id_req = @id_req AND parent_id = @user_id
      `);

    if (checkStatus.recordset.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "medicationSubmissionReq not found",
      });
    }

    const { status: currentStatus } = checkStatus.recordset[0];
    const { student_id } = checkStatus.recordset[0];

    if (currentStatus !== "PENDING") {
      return res.status(400).json({
        status: "fail",
        message: "Only pending requests can be cancelled",
      });
    }

    //  Cập nhật trạng thái thành "CANCELLED"
    await pool.request().input("id_req", sql.Int, id_req).input("updated_at", sql.DateTime, normalizeDateVN(new Date()))
      .query(`
        UPDATE Medication_Submisstion_Request
        SET status = 'CANCELLED'
        WHERE id_req = @id_req
      `);

    //  Gửi thông báo đến tất cả y tá (role_id = 3)
    const nurses = await pool.request().query("SELECT user_id FROM Users WHERE role_id = 3");

    for (const nurse of nurses.recordset) {
      await sendNotification(
        pool,
        nurse.user_id,
        "Yêu cầu bị hủy",
        `Phụ huynh đã hủy yêu cầu uống thuốc cho học sinh có ID: ${student_id}`
      );
    }

    return res.status(200).json({
      status: "success",
      message: "medicationSubmissionReq cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling medicationSubmissionReq:", error);
    res.status(500).json({
      status: "error",
      message: "Server error while cancelling medicationSubmissionReq",
    });
  }
};

// API lấy tất cả yêu cầu uống thuốc
const getAllMedicationSubmissionReq = async (req, res, next) => {
  const pool = await sqlServerPool;
  const result = await pool.request()
    .query(`SELECT MSR.*, U.fullname, SI.full_name as student, SI.class_name FROM Medication_Submisstion_Request MSR 
                                              JOIN Users U ON MSR.parent_id = U.user_id
                                              JOIN Student_Information SI ON MSR.student_id = SI.student_id`);

  if (result.recordset.length > 0) {
    // Trả về danh sách các yêu cầu nếu có
    res.status(200).json({
      status: "success",
      data: result.recordset,
    });
  } else {
    // Không có bản ghi nào
    res.status(400).json({
      status: "fail",
      message: "Something went wrong",
    });
  }
};

const getAllMedicationSubmissionReqByParentId = async (req, res, next) => {
  const parent_id = req.user?.user_id;
  const pool = await sqlServerPool;
  const result = await pool.request().input("parent_id", sql.Int, parent_id)
    .query(`SELECT MSR.*, U.fullname, SI.full_name as student, SI.class_name FROM Medication_Submisstion_Request MSR 
          JOIN Users U ON MSR.parent_id = U.user_id
          JOIN Student_Information SI ON MSR.student_id = SI.student_id WHERE MSR.parent_id = @parent_id`);

  if (result.recordset.length > 0) {
    res.status(200).json({
      status: "success",
      data: result.recordset,
    });
  } else {
    // Không có bản ghi nào
    res.status(400).json({
      status: "fail",
      message: "Something went wrong",
    });
  }
};

const getAllMedicationSubmissionReqByParentIdAndId = async (req, res, next) => {
  const parent_id = req.user?.user_id;
  const { id_req } = req.params;
  const pool = await sqlServerPool;
  const result = await pool.request().input("parent_id", sql.Int, parent_id).input("id_req", sql.Int, id_req)
    .query(`SELECT MSR.*, U.fullname, SI.full_name as student, SI.class_name FROM Medication_Submisstion_Request MSR 
          JOIN Users U ON MSR.parent_id = U.user_id
          JOIN Student_Information SI ON MSR.student_id = SI.student_id
          WHERE MSR.parent_id = @parent_id AND MSR.id_req = @id_req`);

  if (result.recordset.length > 0) {
    res.status(200).json({
      status: "success",
      data: result.recordset,
    });
  } else {
    // Không có bản ghi nào
    res.status(400).json({
      status: "fail",
      message: "Something went wrong",
    });
  }
};

// API lấy yêu cầu uống thuốc theo ID
const getMedicationSubmissionReqByID = async (req, res, next) => {
  const ReqId = req.params.ReqId; // Lấy ID từ URL param
  const pool = await sqlServerPool;
  const result = await pool.request().input("id_req", sql.Int, ReqId)
    .query(`SELECT MSR.*, U.fullname, SI.full_name as student, SI.class_name FROM Medication_Submisstion_Request MSR 
            JOIN Users U ON MSR.parent_id = U.user_id
            JOIN Student_Information SI ON MSR.student_id = SI.student_id WHERE MSR.id_req = @id_req`);

  if (result.recordset.length > 0) {
    // Trả về bản ghi nếu tìm thấy
    res.status(200).json({
      status: "success",
      data: result.recordset[0],
    });
  } else {
    // Không tìm thấy bản ghi với ID tương ứng
    res.status(400).json({
      status: "fail",
      message: "medicationSubmissionReq not found",
    });
  }
};

// API cho y tá cập nhật trạng thái yêu cầu gửi thuốc (ACCEPTED hoặc DECLINED)
const updateMedicationSubmissionReqByNurse = async (req, res, next) => {
  // Lấy ID của yêu cầu và ID của y tá từ request
  const ReqId = req.params.ReqId;
  const nurseId = req.user?.user_id;
  const { status, note } = req.body; // Trạng thái mới: ACCEPTED hoặc DECLINED
  const pool = await sqlServerPool;

  // Kiểm tra xem có phải ngày cuối tuần (Thứ 7 hoặc Chủ nhật) không
  function isWeekend(date) {
    const day = date.getDay(); // 0 = Chủ nhật, 6 = Thứ 7
    return day === 0 || day === 6;
  }

  // Nếu trạng thái không hợp lệ thì trả về lỗi
  if (!["ACCEPTED", "DECLINED"].includes(status)) {
    return res.status(400).json({
      message: "Invalid status value. Must be 'ACCEPTED' or 'DECLINED'.",
    });
  }

  try {
    // Cập nhật trạng thái của yêu cầu trong bảng Medication_Submisstion_Request
    const result = await pool
      .request()
      .input("id_req", sql.Int, ReqId)
      .input("nurse_id", sql.Int, nurseId)
      .input("status", sql.NVarChar, status)
      .input("updated_at", sql.DateTime, normalizeDateVN(new Date())).query(`
        UPDATE Medication_Submisstion_Request
        SET status = @status, nurse_id = @nurse_id, updated_at = @updated_at
        WHERE id_req = @id_req
      `);

    // Nếu cập nhật thành công
    if (result.rowsAffected[0] > 0) {
      // Lấy parent_id (phụ huynh của học sinh)
      const parentResult = await pool.request().input("id_req", sql.Int, ReqId).query(`
          SELECT parent_id FROM Medication_Submisstion_Request 
          WHERE id_req = @id_req
        `);

      const parentId = parentResult.recordset[0]?.parent_id;

      // Lấy email phụ huynh từ bảng Users
      const parentEmailResult = await pool.request().input("id_req", sql.Int, ReqId).query(`
          SELECT u.email
          FROM Medication_Submisstion_Request r
          JOIN Users u ON r.parent_id = u.user_id
          WHERE r.id_req = @id_req
        `);
      const parentEmail = parentEmailResult.recordset[0]?.email;

      // ✅ Nếu yêu cầu được CHẤP NHẬN
      if (status === "ACCEPTED") {
        // Lấy toàn bộ thông tin của yêu cầu
        const medicationReqResult = await pool
          .request()
          .input("id_req", sql.Int, ReqId)
          .query(`SELECT * FROM Medication_Submisstion_Request WHERE id_req = @id_req`);

        const reqData = medicationReqResult.recordset[0];
        if (!reqData) throw new Error("Yêu cầu không tồn tại");

        // Chuẩn hóa ngày bắt đầu và kết thúc
        const startDate = normalizeDateVN(reqData.start_date);
        const endDate = normalizeDateVN(reqData.end_date);

        // Tạo danh sách các truy vấn insert cho từng ngày không phải cuối tuần
        const insertPromises = [];
        let current = new Date(startDate);

        while (current <= endDate) {
          const currentDateOnly = normalizeDateVN(current);

          // Nếu là ngày trong tuần thì tạo log uống thuốc
          if (!isWeekend(currentDateOnly)) {
            insertPromises.push(
              pool
                .request()
                .input("id_req", sql.Int, ReqId)
                .input("nurse_id", sql.Int, reqData.nurse_id)
                .input("date", sql.Date, currentDateOnly)
                .input("note", sql.NVarChar, reqData.note)
                .input("updated_at", sql.DateTime, normalizeDateVN(new Date()))
                .input("image_url", sql.NVarChar, reqData.image_url || null).query(`
                  INSERT INTO Medication_Daily_Log 
                  (id_req, nurse_id, date, status, note, updated_at, image_url) 
                  VALUES (@id_req, @nurse_id, @date, 'PENDING', @note, @updated_at, @image_url)
                `)
            );
          }

          current.setDate(current.getDate() + 1); // Tăng sang ngày tiếp theo
        }

        // Chạy tất cả các truy vấn insert cùng lúc
        await Promise.all(insertPromises);

        // Gửi thông báo cho phụ huynh
        await sendNotification(
          pool,
          parentId,
          "Cập nhật trạng thái yêu cầu gửi thuốc",
          `Trạng thái yêu cầu gửi thuốc đã được cập nhật thành`
        );

        // Gửi email thông báo nếu lấy được email
        if (parentEmail) {
          await sendEmail(
            parentEmail,
            "Cập nhật trạng thái yêu cầu gửi thuốc",
            `Kính gửi quý phụ huynh,

            Trạng thái yêu cầu gửi thuốc của bạn đã được chấp nhận. Vui lòng kiểm tra lại thông tin hoặc liên hệ với nhà trường để biết thêm chi tiết.

            Trân trọng,
            Ban Y Tế Trường`
          );
        }
        // ❌ Nếu yêu cầu BỊ TỪ CHỐI
      } else if (status === "DECLINED") {
        // Xoá các bản ghi trong Medication_Daily_Log nếu đã tồn tại
        await pool
          .request()
          .input("id_req", sql.Int, ReqId)
          .query(`DELETE FROM Medication_Daily_Log WHERE id_req = @id_req`);

        // Gửi thông báo từ chối
        await sendNotification(
          pool,
          parentId,
          "Cập nhật trạng thái yêu cầu gửi thuốc",
          `Trạng thái yêu cầu gửi thuốc đã bị từ chối`
        );

        // Gửi email thông báo nếu lấy được email
        if (parentEmail) {
          await sendEmail(
            parentEmail,
            "Cập nhật trạng thái yêu cầu gửi thuốc",
            `Kính gửi quý phụ huynh,

            Rất tiếc, yêu cầu gửi thuốc của quý phụ huynh đã bị từ chối bởi y tá phụ trách vì lý do ${note}.

            Vui lòng đăng nhập vào hệ thống để xem chi tiết lý do từ chối hoặc liên hệ với nhà trường để biết thêm thông tin.

            Trân trọng,
            Ban Y Tế Trường`
          );
        }
      }

      // Trả về phản hồi thành công
      return res.status(200).json({
        status: "success",
        message: "medicationSubmissionReq updated successfully",
      });
    } else {
      // Không tìm thấy hoặc không cập nhật được
      return res.status(400).json({
        status: "fail",
        message: "Failed to update medicationSubmissionReq",
      });
    }
  } catch (error) {
    // Bắt lỗi nếu có exception
    console.error("Error updating medicationSubmissionReq:", error);
    res.status(500).json({
      status: "error",
      message: "Server error while updating medicationSubmissionReq",
    });
  }
};

// Xuất các hàm để dùng ở nơi khác (route/controller)
module.exports = {
  medicationSubmissionReq,
  getAllMedicationSubmissionReq,
  getMedicationSubmissionReqByID,
  updateMedicationSubmissionReqByNurse,
  cancelMedicationSubmissionReq,
  getAllMedicationSubmissionReqByParentId,
  getAllMedicationSubmissionReqByParentIdAndId,
};
