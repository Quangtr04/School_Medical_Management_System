import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CiPill } from "react-icons/ci";
import {
  FaPills,
  FaUserInjured,
  FaUserNurse,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { MdOutlineDateRange, MdNotes } from "react-icons/md";
import { BsCalendar2DateFill } from "react-icons/bs";
import { Table, Modal, Button, Spin } from "antd"; // Import Modal, Button, Spin

import { fetchAllMedicationSubmissions } from "../../redux/nurse/medicalSubmission/medicalSubmisstionSlice";
import { fetchAllStudentHealthRecords } from "../../redux/nurse/studentRecords/studentRecord"; // Đảm bảo đường dẫn này đúng

export default function MedicalSubmission() {
  const dispatch = useDispatch();
  const {
    data,
    loading,
    error,
    currentStudentDetails,
    studentDetailsLoading,
    studentDetailsError,
  } = useSelector((state) => state.medicationSubmission);

  // Lấy dữ liệu học sinh từ studentRecord slice
  const students = useSelector((state) => state.studentRecord.healthRecords);

  const [isStudentModalVisible, setIsStudentModalVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchAllMedicationSubmissions());
    dispatch(fetchAllStudentHealthRecords()); // Fetch tất cả hồ sơ học sinh
  }, [dispatch]);

  const handleStudentModalCancel = () => {
    setIsStudentModalVisible(false);
  };

  const columns = useMemo(
    () => [
      {
        title: "ID Yêu Cầu",
        dataIndex: ["_id"],
        key: "id_req",
        render: (text, record) => (
          <div className="flex items-center gap-2">
            <MdNotes className="text-blue-500" />
            <span>{record.id_req || record._id}</span>
          </div>
        ),
      },
      {
        title: "Học Sinh",
        dataIndex: "full_name", // Vẫn giữ dataIndex là ID
        key: "student",
      },
      {
        title: "Phụ Huynh",
        dataIndex: "fullname", // Chỉ cần dataIndex là ID, không phải đường dẫn lồng nhau
        key: "parent",
      },
      {
        title: "Y Tá",
        dataIndex: ["nurse_id", "name"],
        key: "nurse",
        render: (text, record) => (
          <div className="flex items-center gap-2">
            <FaUserNurse className="text-green-500" />
            <span>{record.nurse_id?.name || "Chưa duyệt"}</span>
          </div>
        ),
      },
      {
        title: "Ngày Gửi",
        dataIndex: "created_at",
        key: "created_at",
        render: (text) => (
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-500" />
            <span>{new Date(text).toLocaleDateString("vi-VN")}</span>
          </div>
        ),
      },
      {
        title: "Ngày Bắt Đầu",
        dataIndex: "start_date",
        key: "start_date",
        render: (text) => (
          <div className="flex items-center gap-2">
            <MdOutlineDateRange className="text-indigo-500" />
            <span>{new Date(text).toLocaleDateString("vi-VN")}</span>
          </div>
        ),
      },
      {
        title: "Ngày Kết Thúc",
        dataIndex: "end_date",
        key: "end_date",
        render: (text) => (
          <div className="flex items-center gap-2">
            <BsCalendar2DateFill className="text-red-500" />
            <span>{new Date(text).toLocaleDateString("vi-VN")}</span>
          </div>
        ),
      },
      {
        title: "Thuốc & Liều lượng",
        dataIndex: "medicationName",
        key: "medication_dosage",
        render: (text, record) => (
          <div className="flex items-center gap-2">
            <FaPills className="text-yellow-600" />
            <span>
              {record.medicationName || "N/A"} - {record.dosage || "N/A"}
            </span>
          </div>
        ),
      },
      {
        title: "Ghi Chú",
        dataIndex: "note",
        key: "note",
        render: (text) => (
          <div className="flex items-center gap-2">
            📝
            <span className="truncate max-w-[150px]">{text || "Không có"}</span>
          </div>
        ),
      },
      {
        title: "Trạng Thái",
        dataIndex: "status",
        key: "status",
        render: (text) => {
          const status = text?.toLowerCase();
          let icon = null;
          let textColor = "text-gray-700";
          let bgColor = "bg-gray-100";

          if (status === "pending") {
            icon = <FaExclamationCircle className="text-yellow-500" />;
            textColor = "text-yellow-800";
            bgColor = "bg-yellow-100";
          } else if (status === "approved") {
            icon = <FaCheckCircle className="text-green-500" />;
            textColor = "text-green-800";
            bgColor = "bg-green-100";
          } else if (status === "rejected") {
            icon = <FaTimesCircle className="text-red-500" />;
            textColor = "text-red-800";
            bgColor = "bg-red-100";
          }

          return (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
            >
              {icon}
              {text || "N/A"}
            </span>
          );
        },
      },
      {
        title: "Hành Động",
        key: "actions",
        render: (
          _,
          record // record là toàn bộ đối tượng dữ liệu của hàng hiện tại
        ) => (
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600">
              Xem
            </button>
            {record.status?.toLowerCase() === "pending" && (
              <>
                <button className="px-3 py-1 rounded-md bg-green-500 text-white hover:bg-green-600">
                  Duyệt
                </button>
                <button className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600">
                  Từ chối
                </button>
              </>
            )}
          </div>
        ),
      },
    ],
    [students] // Thêm studentsData vào dependency array để cột re-render khi studentsData thay đổi
  );

  return (
    <div
      className={`min-h-screen bg-white p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCcgdmlld0JveD0nMCAwIDQwIDQwJz48ZyBmaWxsPSdyZ2JhKDEzLDExMCwyNTMsMC4xKScgZmlsbC1ydWxlPSdldmVubm9kZCc+PGNpcmNsZSBjeD0nMjAnIGN5PScyMCcgcmQ9JzInLz48L2c+PC9zdmc+')] bg-fixed`}
    >
      <div className="max-w-7xl mx-auto">
        <header
          className={`mb-5 p-4 rounded-lg bg-blue-600/[.10] to-transparent flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-3 bg-green-600/[.10] rounded-full border border-blue-600`}
            >
              <CiPill className={`w-10 h-10 text-3xl text-blue-600`} />{" "}
            </div>
            <div>
              <h1 className={`text-gray-900 font-semibold text-3xl mb-2`}>
                Đơn thuốc
              </h1>
              <p className={`text-gray-500 flex items-center gap-2 text-sm`}>
                <span>💊</span>
                Xét duyệt đơn thuốc từ phụ huynh gửi cho con cái
              </p>
            </div>
          </div>
        </header>

        <div className="bg-white p-4 rounded-lg shadow-md">
          {error && (
            <p className="text-red-600 mb-2">
              Lỗi: {error.message || "Đã xảy ra lỗi khi tải đơn thuốc."}
            </p>
          )}
          <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            rowKey={(record) => record._id || record.id_req}
            pagination={{ pageSize: 10 }}
            scroll={{ x: "max-content" }}
          />
        </div>
      </div>

      {/* Modal hiển thị thông tin chi tiết học sinh */}
      <Modal
        title="Thông tin chi tiết học sinh"
        open={isStudentModalVisible}
        onCancel={handleStudentModalCancel}
        footer={[
          <Button key="back" onClick={handleStudentModalCancel}>
            Đóng
          </Button>,
        ]}
      >
        {studentDetailsLoading ? (
          <div className="flex justify-center items-center h-24">
            <Spin size="large" />
          </div>
        ) : studentDetailsError ? (
          <p className="text-red-600">
            Lỗi khi tải thông tin học sinh:{" "}
            {studentDetailsError.message || "Đã xảy ra lỗi."}
          </p>
        ) : currentStudentDetails ? (
          <div>
            <p>
              <strong>Mã học sinh:</strong>{" "}
              {currentStudentDetails._id || currentStudentDetails.student_id}
            </p>
            <p>
              <strong>Tên học sinh:</strong> {currentStudentDetails.name}
            </p>
            <p>
              <strong>Ngày sinh:</strong>{" "}
              {currentStudentDetails.dateOfBirth
                ? new Date(
                    currentStudentDetails.dateOfBirth
                  ).toLocaleDateString("vi-VN")
                : "N/A"}
            </p>
            <p>
              <strong>Giới tính:</strong>{" "}
              {currentStudentDetails.gender || "N/A"}
            </p>
            <p>
              <strong>Lớp:</strong>{" "}
              {currentStudentDetails.class_id?.name ||
                currentStudentDetails.class_id ||
                "N/A"}
            </p>
            {currentStudentDetails.parent_id && (
              <>
                <h4 className="font-semibold mt-4">Thông tin phụ huynh:</h4>
                <p>
                  <strong>Tên phụ huynh:</strong>{" "}
                  {currentStudentDetails.parent_id.name || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  {currentStudentDetails.parent_id.email || "N/A"}
                </p>
                <p>
                  <strong>Số điện thoại:</strong>{" "}
                  {currentStudentDetails.parent_id.phone || "N/A"}
                </p>
              </>
            )}
          </div>
        ) : (
          <p>Không có thông tin học sinh.</p>
        )}
      </Modal>
    </div>
  );
}
