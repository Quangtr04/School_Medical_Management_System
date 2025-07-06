import React, { useEffect, useMemo } from "react"; // Import useMemo
import { useDispatch, useSelector } from "react-redux";
import { CiPill } from "react-icons/ci";
// Import các icon cần thiết cho cột
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
import { Table } from "antd"; // Import Table từ antd

import { fetchAllMedicationSubmissions } from "../../redux/nurse/medicalSubmission/medicalSubmisstionSlice";
// Điều chỉnh đường dẫn này đến file slice của bạn

export default function MedicalSubmission() {
  const dispatch = useDispatch();
  // Lấy dữ liệu, trạng thái loading và error từ Redux store
  const { data, loading, error } = useSelector(
    (state) => state.medicationSubmission // Đảm bảo đúng tên slice trong store của bạn (trước đó là medicationSubmission, giờ là medicationSubmissions)
  );

  useEffect(() => {
    // Khi component được mount, gửi action để lấy dữ liệu
    dispatch(fetchAllMedicationSubmissions());
  }, [dispatch]); // Dependency array chỉ chứa dispatch để tránh re-render không cần thiết

  const columns = useMemo(
    () => [
      // Sử dụng useMemo để định nghĩa columns
      {
        title: "ID Yêu Cầu",
        dataIndex: ["_id"], // Sử dụng _id của MongoDB làm dataIndex chính
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
        dataIndex: ["student_id", "name"], // Antd có thể truy cập nested field trực tiếp
        key: "student",
        render: (text, record) => (
          <div className="flex items-center gap-2">
            <FaUserInjured className="text-purple-500" />
            <span>{record.student_id?.name || "N/A"}</span>
          </div>
        ),
      },
      {
        title: "Phụ Huynh",
        dataIndex: ["parent_id", "name"],
        key: "parent",
        render: (text, record) => (
          <div className="flex items-center gap-2">
            👤
            <span>{record.parent_id?.name || "N/A"}</span>
          </div>
        ),
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
        // Giả định bạn có trường medicationName và dosage trực tiếp trong record hoặc cần một hàm render phức tạp hơn
        dataIndex: "medicationName", // Hoặc bỏ dataIndex nếu không có trường trực tiếp
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
    []
  ); // <-- Dependency array rỗng vì columns không thay đổi

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

        {/* Thay thế phần hiển thị bằng Ant Design Table */}
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
            rowKey={(record) => record._id || record.id_req} // Ant Design yêu cầu một key duy nhất cho mỗi hàng
            pagination={{ pageSize: 10 }} // Thêm phân trang với 10 mục mỗi trang
            scroll={{ x: "max-content" }} // Cho phép cuộn ngang nếu bảng quá rộng
          />
        </div>
      </div>
    </div>
  );
}
