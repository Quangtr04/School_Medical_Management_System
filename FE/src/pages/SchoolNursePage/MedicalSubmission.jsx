import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CiPill } from "react-icons/ci";
import {
  FaUserNurse,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { MdOutlineDateRange, MdNotes } from "react-icons/md";
import { BsCalendar2DateFill } from "react-icons/bs";
import { Table, Modal, Button, Spin, Tag, Tooltip, Form, Input, Select } from "antd";
import { EyeOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import {
  fetchAllMedicationSubmissions,
  updateMedicationSubmissionReq,
} from "../../redux/nurse/medicalSubmission/medicalSubmisstionSlice";
import { fetchAllStudentHealthRecords } from "../../redux/nurse/studentRecords/studentRecord";
import { toast } from "react-toastify";

// Đưa style ra ngoài
const tagStyle = {
  display: "flex",
  alignItems: "center",
  gap: "4px",
  fontSize: "16px",
};

const statusMap = {
  pending: { icon: <FaExclamationCircle />, color: "warning", text: "Đang chờ" },
  accepted: { icon: <FaCheckCircle />, color: "success", text: "Đã duyệt" },
  declined: { icon: <FaTimesCircle />, color: "error", text: "Từ chối" },
};

const renderStatusTag = (status) => {
  const s = (status || "").toLowerCase();
  const map = statusMap[s];
  if (map) {
    return (
      <Tag icon={map.icon} color={map.color} style={tagStyle}>
        {map.text}
      </Tag>
    );
  }
  return (
    <Tag color="default" style={tagStyle}>
      Không xác định
    </Tag>
  );
};

const renderDate = (text, icon) => (
  <div className="flex items-center gap-2">
    {icon}
    <span>{text ? new Date(text).toLocaleDateString("vi-VN") : "N/A"}</span>
  </div>
);

const renderNote = (text) => (
  <div className="flex items-center gap-2">
    📝
    <span className="truncate max-w-[150px]">{text || "Không có"}</span>
  </div>
);

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
  const token = localStorage.getItem("accessToken");

  const [isStudentModalVisible, setIsStudentModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState();
  const [requestDetailModalVisisble, setRequestDetailModalVisisble] = useState(false);

  useEffect(() => {
    dispatch(fetchAllMedicationSubmissions());
    dispatch(fetchAllStudentHealthRecords());
  }, [dispatch]);

  useEffect(() => {
    if (error) {      
      toast.error(error);
    }
  }, [error, data, loading]);

  const handleStudentModalCancel = useCallback(() => {
    setIsStudentModalVisible(false);
  }, []);

  const handleViewDetailRequest = useCallback((record) => {
    setSelectedRequest(record);
    setRequestDetailModalVisisble(true);
  }, []);

  
  const handleRespondRequest = useCallback((record, action) => {
    const reqId = record.id_req;
    const payload = { reqId, status: action, token };
    dispatch(updateMedicationSubmissionReq(payload))
      .unwrap()
      .then(() => {
        toast.success("Xét duyệt đơn thuốc thành công");
        dispatch(fetchAllMedicationSubmissions());
      })
      .catch(() => {
        toast.error("Cập nhật thất bại");
      });
  }, [dispatch, token]);

  const columns = useMemo(() => [
    {
      title: <span><MdNotes className="inline text-blue-500 mr-1" />ID Yêu Cầu</span>,
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
      title: <span>👦 Học Sinh</span>,
      dataIndex: "student",
      key: "student",
      render: (text) => <span>👦 {text}</span>,
    },
    {
      title: <span>👨‍👩‍👧 Phụ Huynh</span>,
      dataIndex: "fullname",
      key: "parent",
      render: (text) => <span>👨‍👩‍👧 {text}</span>,
    },
    {
      title: <span><FaUserNurse className="inline text-green-500 mr-1" />Y Tá</span>,
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
      title: <span><FaCalendarAlt className="inline text-gray-500 mr-1" />Ngày Gửi</span>,
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => renderDate(text, <FaCalendarAlt className="text-gray-500" />),
    },
    {
      title: <span><MdOutlineDateRange className="inline text-indigo-500 mr-1" />Ngày Bắt Đầu</span>,
      dataIndex: "start_date",
      key: "start_date",
      render: (text) => renderDate(text, <MdOutlineDateRange className="text-indigo-500" />),
    },
    {
      title: <span><BsCalendar2DateFill className="inline text-red-500 mr-1" />Ngày Kết Thúc</span>,
      dataIndex: "end_date",
      key: "end_date",
      render: (text) => renderDate(text, <BsCalendar2DateFill className="text-red-500" />),
    },
    {
      title: <span>📌 Ghi Chú</span>,
      dataIndex: "note",
      key: "note",
      render: renderNote,
    },
    {
      title: <span>📦 Trạng Thái</span>,
      dataIndex: "status",
      key: "status",
      render: renderStatusTag,
    },
    {
      title: <span>⚡ Hành Động</span>,
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetailRequest(record)}
            />
          </Tooltip>
          {record.status?.toLowerCase() === "pending" && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                onClick={() => handleRespondRequest(record, "ACCEPTED")}
              >
                Duyệt
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => handleRespondRequest(record, "DECLINED")}
              >
                Từ chối
              </Button>
            </>
          )}
        </div>
      ),
    },
  ], [handleViewDetailRequest, handleRespondRequest]);

  return (
    <div className="min-h-screen bg-white p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCcgdmlld0JveD0nMCAwIDQwIDQwJz48ZyBmaWxsPSdyZ2JhKDEzLDExMCwyNTMsMC4xKScgZmlsbC1ydWxlPSdldmVub2RkJz48Y2lyY2xlIGN4PScyMCcgY3k9JzIwJyByPScyJy8+PC9nPjwvc3ZnPg==')] bg-fixed">
      <div className="max-w-7xl mx-auto">
        <header className="mb-5 p-4 rounded-lg bg-blue-600/[.10] to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-600/[.10] rounded-full border border-blue-600">
              <CiPill className="w-10 h-10 text-3xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-gray-900 font-semibold text-3xl mb-2">Đơn thuốc</h1>
              <p className="text-gray-500 flex items-center gap-2 text-sm">
                <span>💊</span>
                Xét duyệt đơn thuốc từ phụ huynh gửi cho con cái
              </p>
            </div>
          </div>
        </header>
        <div className="bg-white p-4 rounded-lg shadow-md">
       
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
            Lỗi khi tải thông tin học sinh: {studentDetailsError.message || "Đã xảy ra lỗi."}
          </p>
        ) : currentStudentDetails ? (
          <div>
            <p>
              <strong>Mã học sinh:</strong> {currentStudentDetails._id || currentStudentDetails.student_id}
            </p>
            <p>
              <strong>Tên học sinh:</strong> {currentStudentDetails.name}
            </p>
            <p>
              <strong>Ngày sinh:</strong> {currentStudentDetails.dateOfBirth ? new Date(currentStudentDetails.dateOfBirth).toLocaleDateString("vi-VN") : "N/A"}
            </p>
            <p>
              <strong>Giới tính:</strong> {currentStudentDetails.gender || "N/A"}
            </p>
            <p>
              <strong>Lớp:</strong> {currentStudentDetails.class_id?.name || currentStudentDetails.class_id || "N/A"}
            </p>
            {currentStudentDetails.parent_id && (
              <>
                <h4 className="font-semibold mt-4">Thông tin phụ huynh:</h4>
                <p>
                  <strong>Tên phụ huynh:</strong> {currentStudentDetails.parent_id.name || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {currentStudentDetails.parent_id.email || "N/A"}
                </p>
                <p>
                  <strong>Số điện thoại:</strong> {currentStudentDetails.parent_id.phone || "N/A"}
                </p>
              </>
            )}
          </div>
        ) : (
          <p>Không có thông tin học sinh.</p>
        )}
      </Modal>
      <Modal
        title={<span>📝 Chi tiết đơn thuốc</span>}
        open={requestDetailModalVisisble}
        onCancel={() => setRequestDetailModalVisisble(false)}
        footer={[
          <Button key="close" onClick={() => setRequestDetailModalVisisble(false)}>
            Đóng
          </Button>,
        ]}
      >
        {selectedRequest ? (
          <div className="grid grid-cols-1 gap-4 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span className="font-medium w-40">💊 Tên thuốc:</span>
              <span>{selectedRequest.medicine_name || "Không rõ"}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium w-40">💉 Liều dùng:</span>
              <span>{selectedRequest.dosage || "Không rõ"}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium w-40">⏱️ Số lần / ngày:</span>
              <span>{selectedRequest.frequency || "Không rõ"}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium w-40">🗓️ Thời gian sử dụng:</span>
              <span>
                {selectedRequest.start_date ? new Date(selectedRequest.start_date).toLocaleDateString("vi-VN") : "N/A"} - {selectedRequest.end_date ? new Date(selectedRequest.end_date).toLocaleDateString("vi-VN") : "N/A"}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium w-40">📌 Ghi chú:</span>
              <span>{selectedRequest.note || "Không có"}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium w-40">👨‍👩‍👧 Người gửi:</span>
              <span>{selectedRequest.fullname || "Không rõ"}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium w-40">📦 Trạng thái:</span>
              <span>{renderStatusTag(selectedRequest.status)}</span>
            </div>
          </div>
        ) : (
          <p className="text-red-500 text-center">Không có dữ liệu.</p>
        )}
      </Modal>
    </div>
  );
}
