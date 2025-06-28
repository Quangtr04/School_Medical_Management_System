import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Empty,
  Button,
  Table, // Import Table component
  Tag,
  message,
  Space,
} from "antd";
import {
  FiFileText, // Icon for requests
  FiRefreshCcw,
  FiCheckCircle, // For approve
  FiXCircle, // For reject
  FiInfo, // For details
} from "react-icons/fi";
import {
  LoadingOutlined,
  ExclamationCircleOutlined, // Các icon từ Ant Design
  FileTextOutlined, // Tiêu đề, Mô tả
  UserOutlined, // Người tạo đơn
  CalendarOutlined, // Ngày tạo đơn
  DollarCircleOutlined, // Nhà tài trợ
  TeamOutlined, // Lớp áp dụng
  QuestionCircleOutlined, // Loại yêu cầu (có thể là hình thức chung cho yêu cầu)
  SettingOutlined,
} from "@ant-design/icons";
import { FaSchool } from "react-icons/fa";

import { format, parseISO } from "date-fns";
import api from "../../configs/config-axios"; // Đảm bảo đường dẫn này đúng
import { toast } from "react-toastify";

const { Title, Text } = Typography;

export default function ManagerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);

  const fetchPendingRequests = useCallback(async () => {
    setLoading(true); // Set loading to true when fetching
    try {
      const response = await api.get("/manager/checkups/pending");
      console.log(response.data);

      setPendingRequests(response.data.data);
      message.success("Đã tải danh sách yêu cầu chờ duyệt!");
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      message.error("Không thể tải danh sách yêu cầu chờ duyệt.");
    } finally {
      setLoading(false); // Set loading to false after fetch completes (success or error)
    }
  }, []);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  // Updated handleReviewRequest to correctly send managerNotes
  const handleReviewRequest = async (requestId, action) => {
    console.log(requestId, action);

    try {
      await api.post(`/manager/checkups/${requestId}/respond`, {
        status: action,
      });
      toast.success(
        `Đã ${action === "APPROVE" ? "duyệt" : "từ chối"} yêu cầu thành công!`
      );
      fetchPendingRequests(); // Refresh the list
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      // Check if error response contains a message
      const errorMessage =
        error.response?.data?.message ||
        `Không thể ${action === "approve" ? "duyệt" : "từ chối"} yêu cầu.`;
      message.error(errorMessage);
    }
  };

  const columns = [
    {
      title: (
        <Space>
          <FileTextOutlined style={{ color: "#1890ff" }} /> {/* Blue */}
          Tiêu đề
        </Space>
      ),
      dataIndex: "title",
      key: "title",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: (
        <Space>
          <UserOutlined style={{ color: "#52c41a" }} /> {/* Green */}
          Người tạo đơn
        </Space>
      ),
      dataIndex: "nurseName",
      key: "nurseName",
    },
    {
      title: (
        <Space>
          <FileTextOutlined style={{ color: "#faad14" }} /> {/* Orange */}
          Mô tả
        </Space>
      ),
      dataIndex: "description",
      key: "description",
      ellipsis: true, // Auto-truncate long descriptions
    },
    {
      title: (
        <Space>
          <CalendarOutlined style={{ color: "#eb2f96" }} /> {/* Magenta */}
          Ngày tạo đơn
        </Space>
      ),
      dataIndex: "created_at",
      key: "created_at",
      render: (date) =>
        date ? format(parseISO(date), "dd/MM/yyyy HH:mm") : "N/A",
    },
    {
      title: (
        <Space>
          <DollarCircleOutlined style={{ color: "#722ed1" }} /> {/* Purple */}
          Nhà tài trợ
        </Space>
      ),
      dataIndex: "sponsor",
      key: "sponsor",
    },
    {
      title: (
        <Space>
          <TeamOutlined style={{ color: "#08979c" }} /> {/* Cyan */}
          Lớp áp dụng
        </Space>
      ),
      dataIndex: "class",
      key: "class_name",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: (
        <Space>
          <QuestionCircleOutlined style={{ color: "#d43808" }} />{" "}
          {/* Red-orange */}
          Loại yêu cầu
        </Space>
      ),
      dataIndex: "checkup_id",
      key: "checkup_id",
      render: (checkupIdValue) => {
        const isKham =
          checkupIdValue &&
          String(checkupIdValue).toLowerCase().includes("khám");

        let color = isKham ? "geekblue" : "purple";
        let displayText = isKham ? "Khám Sức Khỏe" : "Tiêm chủng";

        return <Tag color={color}>{displayText}</Tag>;
      },
    },
    {
      title: (
        <Space>
          <SettingOutlined style={{ color: "#bfbfbf" }} /> {/* Grey */}
          Hành động
        </Space>
      ),
      key: "actions",
      render: (text, record) => (
        <div className="flex flex-col gap-2 items-center">
          <Button
            type="primary"
            icon={<FiCheckCircle />}
            onClick={() => handleReviewRequest(record.checkup_id, "APPROVED")} // Pass record.id
            className="!bg-green-500 hover:!bg-green-600"
          >
            Duyệt
          </Button>
          <Button
            type="default"
            icon={<FiXCircle />}
            onClick={() => handleReviewRequest(record.checkup_id, "DECLINED")} // Pass record.id
            danger
          >
            Từ chối
          </Button>
        </div>
      ),
    },
  ];
  return (
    <div className="min-h-screen bg-white p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCcgdmlld0JveD0nMCAwIDQwIDQwJz48ZyBmaWxsPSdyZ2JhKDEzLDExMCwyNTMsMC4xKScgZmlsbC1ydWxlPSdldmVub2RkJz48Y2lyY2xlIGN4PScyMCcgY3k9JzIwJyByPScyJy8+PC9nPjwvc3ZnPg==')] bg-fixed">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-5 p-4 rounded-lg bg-blue-600/[.10] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/[.10] rounded-full border border-blue-600">
              <FiFileText className="w-10 h-10 text-3xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-3xl mb-2">
                Bảng điều khiển quản lý
              </h1>
              <p className="text-gray-500 flex items-center gap-2 text-sm">
                <span>⭐</span>
                Quản lý các yêu cầu y tế từ y tá
              </p>
            </div>
          </div>
          <Button
            type="default"
            icon={<FiRefreshCcw />}
            onClick={fetchPendingRequests}
            loading={loading}
            className="flex items-center gap-1 px-4 py-2 !border !border-gray-300 !rounded-lg hover:!bg-gray-100 !transition-colors !text-gray-900"
          >
            Làm mới dữ liệu
          </Button>
        </header>

        {loading ? (
          <div className="text-center py-8 flex flex-col items-center justify-center gap-4">
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 30 }} spin />}
            />
            <p className="text-gray-500 text-lg">
              Đang tải danh sách yêu cầu...
            </p>
          </div>
        ) : (
          <Card
            title={
              <span className="flex items-center gap-2 text-gray-800 font-semibold">
                <FiFileText className="text-blue-600" />
                Các yêu cầu đang chờ duyệt ({pendingRequests.length})
              </span>
            }
            className="!rounded-lg !shadow-md !border !border-gray-200"
          >
            {pendingRequests.length > 0 ? (
              <Table
                dataSource={pendingRequests}
                columns={columns}
                pagination={{ pageSize: 10 }}
                rowKey="id"
              />
            ) : (
              <Empty
                description="Không có yêu cầu nào đang chờ duyệt"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
