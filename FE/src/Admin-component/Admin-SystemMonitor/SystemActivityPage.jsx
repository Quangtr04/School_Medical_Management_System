// src/pages/AdminPage/SystemActivityPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Popconfirm,
  message,
  Typography,
  Card,
  Tag,
  Spin,
  Select,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  SearchOutlined,
  LoadingOutlined,
  SwapRightOutlined,
  LoginOutlined,
  LogoutOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  FiActivity,
  FiSettings,
  FiUser,
  FiPlusCircle,
  FiEdit3,
  FiTrash2,
  FiLogIn,
  FiLogOut,
  FiUsers,
  FiUserPlus,
  FiUserCheck,
  FiRefreshCcw,
  FiCalendar,
} from "react-icons/fi";
import { format } from "date-fns";
import debounce from "lodash/debounce";
import api from "../../configs/config-axios"; // Đảm bảo đường dẫn này đúng
import { toast } from "react-toastify";

const { Title, Paragraph } = Typography;
const { Option } = Select;

export default function SystemActivityPage() {
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [activitySummary, setActivitySummary] = useState({
    login: 0,
    logout: 0,
    create: 0,
    update: 0,
    delete: 0,
  });
  const [filterType, setFilterType] = useState("all"); // 'all', 'crud', 'login'
  const [filterRole, setFilterRole] = useState("all"); // 'all', 'Admin', 'Manager', 'Parent', 'Nurse', 'Staff'
  const [searchText, setSearchText] = useState("");

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchText(value);
    }, 300),
    []
  );

  const handleSearch = (e) => {
    debouncedSearch(e.target.value);
  };

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/activities", {
        params: {
          type: filterType === "all" ? undefined : filterType,
          role: filterRole === "all" ? undefined : filterRole,
          search: searchText || undefined,
        },
      });
      console.log("Fetched activities:", response.data.data);
      if (response.data && Array.isArray(response.data.data)) {
        const formattedActivities = response.data.data.map((activity) => ({
          ...activity,
          key: activity.activity_id, // Giả sử có activity_id
          timestamp: activity.created_at ? new Date(activity.created_at) : null,
        }));
        setActivities(formattedActivities);
        setFilteredActivities(formattedActivities); // Ban đầu lọc bằng chính dữ liệu fetch về
      } else {
        setActivities([]);
        setFilteredActivities([]);
        message.warn("No activity data found or data format is incorrect.");
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      message.error("Failed to load activity data.");
    } finally {
      setLoading(false);
    }
  }, [filterType, filterRole, searchText]);

  const fetchActivitySummary = useCallback(async () => {
    try {
      const response = await api.get("/admin/activity-summary");
      console.log("Fetched summary:", response.data.data);
      if (response.data && response.data.data) {
        setActivitySummary(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching activity summary:", error);
      // message.error("Failed to load activity summary.");
    }
  }, []);

  useEffect(() => {
    fetchActivities();
    fetchActivitySummary();
  }, [fetchActivities, fetchActivitySummary]);

  // Apply client-side filtering based on searchText if backend search is not sufficient
  useEffect(() => {
    const applyClientSideFilter = () => {
      let tempActivities = activities;

      // Filter by type (if not handled by backend already)
      if (filterType === "crud") {
        tempActivities = tempActivities.filter(
          (activity) =>
            activity.type === "create" ||
            activity.type === "update" ||
            activity.type === "delete"
        );
      } else if (filterType === "login") {
        tempActivities = tempActivities.filter(
          (activity) => activity.type === "login" || activity.type === "logout"
        );
      }

      // Filter by role (if not handled by backend already)
      if (filterRole !== "all") {
        tempActivities = tempActivities.filter(
          (activity) => activity.role === filterRole
        );
      }

      // Filter by search text (client-side)
      if (searchText) {
        tempActivities = tempActivities.filter((activity) =>
          Object.values(activity).some(
            (value) =>
              typeof value === "string" &&
              value.toLowerCase().includes(searchText.toLowerCase())
          )
        );
      }
      setFilteredActivities(tempActivities);
    };

    applyClientSideFilter();
  }, [activities, filterType, filterRole, searchText]);

  const getActivityIcon = (type) => {
    switch (type) {
      case "login":
        return <FiLogIn className={`text-blue-600`} />;
      case "logout":
        return <FiLogOut className={`text-blue-600`} />;
      case "create":
        return <FiPlusCircle className={`text-green-600`} />;
      case "update":
        return <FiEdit3 className={`text-orange-500`} />;
      case "delete":
        return <FiTrash2 className={`text-red-600`} />;
      default:
        return <FiActivity className={`text-gray-500`} />;
    }
  };

  const getActivityDescription = (activity) => {
    const { type, role, user_name, target_user_name, details } = activity;
    let description = "";

    switch (type) {
      case "login":
        description = `Người dùng ${user_name} (${role}) đã đăng nhập hệ thống.`;
        break;
      case "logout":
        description = `Người dùng ${user_name} (${role}) đã đăng xuất hệ thống.`;
        break;
      case "create":
        description = `Admin ${user_name} đã thêm mới tài khoản ${target_user_name} (${details?.target_role}).`;
        break;
      case "update":
        description = `Admin ${user_name} đã cập nhật thông tin tài khoản ${target_user_name} (${details?.target_role}).`;
        break;
      case "delete":
        description = `Admin ${user_name} đã xóa tài khoản ${target_user_name} (${details?.target_role}).`;
        break;
      default:
        description = `Hoạt động không xác định: ${details?.message || ""}`;
    }
    return description;
  };

  const columns = [
    {
      title: (
        <span className={`flex items-center gap-2 text-gray-800`}>
          <FiActivity className={`text-blue-600`} /> Hoạt động
        </span>
      ),
      dataIndex: "description",
      key: "description",
      render: (_, record) => (
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-full ${
              record.type === "login" || record.type === "logout"
                ? `bg-blue-600/[.10]`
                : record.type === "create"
                ? `bg-green-600/[.10]`
                : record.type === "update"
                ? `bg-orange-500/[.10]`
                : record.type === "delete"
                ? `bg-red-600/[.10]`
                : `bg-gray-200`
            }`}
          >
            {getActivityIcon(record.type)}
          </div>
          <div>
            <p className={`font-semibold text-gray-900`}>{record.user_name}</p>
            <p className={`text-gray-700`}>{getActivityDescription(record)}</p>
            <Tag
              className={`!px-2 !py-0.5 !rounded-full !text-xs !mt-1 ${
                record.role === "Admin"
                  ? `!bg-purple-600/[.20] !text-purple-600`
                  : record.role === "Manager"
                  ? `!bg-blue-600/[.20] !text-blue-600`
                  : record.role === "Parent"
                  ? `!bg-yellow-600/[.20] !text-yellow-600`
                  : record.role === "Nurse"
                  ? `!bg-red-600/[.20] !text-red-600`
                  : `!bg-gray-500/[.20] !text-gray-500`
              }`}
            >
              {record.role}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: (
        <span className={`flex items-center gap-2 text-gray-800`}>
          <FiCalendar className={`text-blue-600`} /> Thời gian
        </span>
      ),
      dataIndex: "timestamp",
      key: "timestamp",
      width: 180,
      render: (timestamp) =>
        timestamp ? format(timestamp, "MMM dd, yyyy HH:mm:ss") : "N/A",
    },
  ];

  return (
    <div
      className={`min-h-screen bg-white p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCcgdmlld0JveD0nMCAwIDQwIDQwJz48ZyBmaWxsPSdyZ2JhKDEzLDExMCwyNTMsMC4xKScgZmlsbC1ydWxlPSdldmVub2RkJz48Y2lyY2xlIGN4PScyMCcgY3k9JzIwJyByPScyJy8+PC9nPjwvc3ZnPg==')] bg-fixed`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header
          className={`mb-5 p-4 rounded-lg bg-blue-600/[.10] to-transparent flex items-center gap-3`}
        >
          <div
            className={`p-3 bg-blue-600/[.10] rounded-full border border-blue-600`}
          >
            <FiActivity className={`w-10 h-10 text-3x1 text-blue-600`} />
          </div>
          <div>
            <h1 className={`text-gray-900 font-semibold text-3xl mb-2`}>
              Hoạt động hệ thống
            </h1>
            <p className={`text-gray-500 flex items-center gap-2 text-sm`}>
              <span>📊</span>
              Theo dõi và phân tích các hoạt động người dùng trong hệ thống
            </p>
          </div>
        </header>

        {/* Activity Summary Section */}
        <div className="mb-6">
          <Card
            className={`!bg-white !rounded-lg !shadow-lg !overflow-hidden !border !border-gray-200/[.50]`}
          >
            <Title level={4} className="!text-gray-800 !mb-4">
              Tóm tắt hoạt động
            </Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={4}>
                <Statistic
                  title={
                    <span className="flex items-center gap-1 text-gray-700">
                      <FiLogIn className="text-blue-600" /> Đăng nhập
                    </span>
                  }
                  value={activitySummary.login}
                  valueStyle={{ color: "#3B82F6" }} // Tailwind blue-500/600
                />
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Statistic
                  title={
                    <span className="flex items-center gap-1 text-gray-700">
                      <FiLogOut className="text-blue-600" /> Đăng xuất
                    </span>
                  }
                  value={activitySummary.logout}
                  valueStyle={{ color: "#3B82F6" }}
                />
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Statistic
                  title={
                    <span className="flex items-center gap-1 text-gray-700">
                      <FiPlusCircle className="text-green-600" /> Thêm mới
                    </span>
                  }
                  value={activitySummary.create}
                  valueStyle={{ color: "#22C55E" }} // Tailwind green-500/600
                />
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Statistic
                  title={
                    <span className="flex items-center gap-1 text-gray-700">
                      <FiEdit3 className="text-orange-500" /> Cập nhật
                    </span>
                  }
                  value={activitySummary.update}
                  valueStyle={{ color: "#F97316" }} // Tailwind orange-500
                />
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Statistic
                  title={
                    <span className="flex items-center gap-1 text-gray-700">
                      <FiTrash2 className="text-red-600" /> Xóa
                    </span>
                  }
                  value={activitySummary.delete}
                  valueStyle={{ color: "#EF4444" }} // Tailwind red-500/600
                />
              </Col>
            </Row>
          </Card>
        </div>

        {/* Filters and Search Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          {/* Search */}
          <div className="relative w-full md:w-1/3 mb-4 md:mb-0">
            <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Tìm kiếm hoạt động..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-950"
              onChange={handleSearch}
              allowClear
            />
          </div>

          {/* Filter by Type */}
          <div className="w-full md:w-1/4">
            <Select
              defaultValue="all"
              style={{ width: "100%" }}
              onChange={setFilterType}
              className="!border !border-gray-300 !rounded-md focus:!ring-2 focus:!ring-blue-950 focus:!outline-none hover:!border-blue-600/[.50]"
              dropdownClassName="!rounded-md"
            >
              <Option value="all">Tất cả loại hoạt động</Option>
              <Option value="crud">CRUD tài khoản</Option>
              <Option value="login">Đăng nhập/Đăng xuất</Option>
            </Select>
          </div>

          {/* Filter by Role */}
          <div className="w-full md:w-1/4">
            <Select
              defaultValue="all"
              style={{ width: "100%" }}
              onChange={setFilterRole}
              className="!border !border-gray-300 !rounded-md focus:!ring-2 focus:!ring-blue-950 focus:!outline-none hover:!border-blue-600/[.50]"
              dropdownClassName="!rounded-md"
            >
              <Option value="all">Tất cả vai trò</Option>
              <Option value="Admin">Admin</Option>
              <Option value="Manager">Manager</Option>
              <Option value="Parent">Parent</Option>
              <Option value="Nurse">Nurse</Option>
              <Option value="Staff">Staff</Option>
              {/* Add more roles as needed */}
            </Select>
          </div>
          <Button
            onClick={() => {
              setFilterType("all");
              setFilterRole("all");
              setSearchText("");
              fetchActivities(); // Re-fetch all activities
            }}
            icon={<FiRefreshCcw />}
            className="flex items-center gap-2 px-4 py-2 !bg-gray-200 !text-gray-700 !rounded-lg hover:!bg-gray-300 transition-all transform hover:scale-105 !border-none"
          >
            Reset Filters
          </Button>
        </div>

        {/* Activity Table/Timeline Section */}
        <Card
          className={`!bg-white !rounded-lg !shadow-lg !overflow-hidden !border !border-gray-200/[.50]`}
        >
          {loading ? (
            <div className="text-center py-12 flex flex-col items-center justify-center gap-4">
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
              />
              <p className={`text-gray-500`}>Đang tải dữ liệu hoạt động...</p>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredActivities}
              rowKey="key"
              pagination={{
                pageSize: 10,
                className: `
                  [&_.ant-pagination-prev]:!rounded-md [&_.ant-pagination-prev]:!border [&_.ant-pagination-prev]:!border-gray-300 [&_.ant-pagination-prev]:!text-gray-800 [&_.ant-pagination-prev]:hover:!border-blue-600 [&_.ant-pagination-prev]:hover:!text-blue-600 [&_.ant-pagination-prev]:!transition-colors
                  [&_.ant-pagination-next]:!rounded-md [&_.ant-pagination-next]:!border [&_.ant-pagination-next]:!border-gray-300 [&_.ant-pagination-next]:!text-gray-800 [&_.ant-pagination-next]:hover:!border-blue-600 [&_.ant-pagination-next]:hover:!text-blue-600 [&_.ant-pagination-next]:!transition-colors
                  [&_.ant-pagination-item]:!rounded-md [&_.ant-pagination-item]:!border [&_.ant-pagination-item]:!border-gray-300 [&_.ant-pagination-item]:!text-gray-800 [&_.ant-pagination-item]:hover:!border-blue-600 [&_.ant-pagination-item]:hover:!text-blue-600 [&_.ant-pagination-item]:!transition-colors
                  [&_.ant-pagination-item-active]:!bg-blue-600 [&_.ant-pagination-item-active]:!text-white [&_.ant-pagination-item-active]:!border-blue-600 [&_.ant-pagination-item-active]:hover:!bg-blue-700 [&_.ant-pagination-item-active]:hover:!text-white
                  [&_.ant-pagination-disabled]:!opacity-50 [&_.ant-pagination-disabled]:!cursor-not-allowed
                  p-4 border-t border-gray-200 bg-white
                `,
              }}
              scroll={{ x: "max-content" }}
              locale={{ emptyText: "Không có dữ liệu hoạt động nào." }}
              className={`
                !bg-white
                [&_.ant-table]:!bg-white
                [&_.ant-table-thead_>_tr_>_th]:!bg-gray-100 [&_.ant-table-thead_>_tr_>_th]:!text-gray-800 [&_.ant-table-thead_>_tr_>_th]:!px-6 [&_.ant-table-thead_>_tr_>_th]:!py-3 [&_.ant-table-thead_>_tr_>_th]:!font-semibold
                [&_.ant-table-tbody_>_tr]:!border-b [&_.ant-table-tbody_>_tr]:!border-gray-200
                [&_.ant-table-tbody_>_tr:last-child_>_td]:!border-b-0
                [&_.ant-table-tbody_>_tr:hover]:!bg-gray-100/[.50]
                [&_.ant-table-tbody_>_tr_>_td]:!text-gray-900 [&_.ant-table-tbody_>_tr_>_td]:!px-6 [&_.ant-table-tbody_>_tr_>_td]:!py-4
                !rounded-lg !overflow-hidden
              `}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
