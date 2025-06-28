// src/pages/NursePage/MedicalSuppliesPage.jsx

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
// Không cần Navigate, Outlet nếu component này chỉ hiển thị danh sách
// import { Navigate, Outlet } from "react-router-dom";

import {
  Table,
  Input,
  Button,
  Space,
  Select, // Có thể bỏ nếu không có filter category
  Tag,
  Modal, // Chỉ dùng cho Confirm Delete (nếu giữ) hoặc View Details
  Form, // Có thể bỏ nếu không có form nhập/sửa
  message,
  Typography,
  Tooltip,
  Spin,
  Empty,
  Card,
  Row,
  Col,
  Statistic, // Có thể bỏ nếu không có summary
  DatePicker, // Có thể bỏ nếu không có form nhập/sửa
} from "antd";
import {
  SearchOutlined,
  EyeOutlined, // Chỉ giữ icon xem
  LoadingOutlined,
  // Import các icon bạn muốn sử dụng
  BarcodeOutlined, // Mã vật tư
  TagOutlined, // Tên
  FolderOutlined, // Thể loại
  MinusSquareOutlined, // Đơn vị (biểu tượng cho sự chia nhỏ)
  ContainerOutlined, // Số lượng (thùng chứa)
  FileTextOutlined, // Mô tả
  CalendarOutlined, // Ngày hết hạn
  CheckCircleOutlined, // Trạng thái
  ToolOutlined,
  EditOutlined, // Hành động
  CloseCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  // Chỉ giữ icon cho header và table, bỏ các icon thống kê
  FiClipboard, // Header icon for Medical Supplies
  // Các icon thống kê và thao tác kho sẽ bỏ
  // FiBox, FiAlertTriangle, FiClock, FiPlusCircle, FiMinusCircle, FiUsers, FiHeart, FiAlertCircle,
} from "react-icons/fi";
import { format, parseISO } from "date-fns";

// Import các thunks và actions từ slice (đã điều chỉnh)
import {
  fetchMedicalSupplies,
  getMedicalSupplyByID, // Giữ lại nếu muốn xem chi tiết
  setMedicalSuppliesPagination,
  clearMedicalSuppliesError,
  // Bỏ clearMedicalSuppliesSuccess vì không còn thao tác CUD
  // clearMedicalSuppliesSuccess,
} from "../../redux/nurse/medicalSupplies/medicalSupplies";
import { IoStorefront } from "react-icons/io5";

const { Option } = Select; // Có thể bỏ nếu không dùng Select cho danh mục
const { Title, Text } = Typography;

// Component PercentageChange tái sử dụng - Sẽ bỏ nếu không hiển thị summary
// const PercentageChange = ({ value }) => {
//     // ... (code không thay đổi)
// };

export default function MedicalSuppliesPage() {
  const dispatch = useDispatch();

  // Lấy state từ Redux store
  const {
    supplies,
    loading,
    error,
    pagination, // Giữ lại pagination
    // Bỏ categories, summary, success vì không còn API
    // categories, summary, success,
    selectedSupply, // Thêm để hiển thị chi tiết vật tư
  } = useSelector((state) => state.medicalSupplies);

  const [searchQuery, setSearchQuery] = useState("");
  // const [categoryFilter, setCategoryFilter] = useState(null); // Bỏ filter theo category nếu API không hỗ trợ
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false); // Modal xem chi tiết

  // Effect để hiển thị thông báo lỗi từ Redux
  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearMedicalSuppliesError()); // Xóa lỗi sau khi hiển thị
    }
  }, [error, dispatch]);

  // Effect để fetch dữ liệu ban đầu và khi các bộ lọc/phân trang thay đổi
  useEffect(() => {
    // Chỉ fetch supplies. Bỏ fetchSummary và fetchCategories
    dispatch(
      fetchMedicalSupplies({
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchQuery,
        // category: categoryFilter, // Bỏ nếu API không hỗ trợ
      })
    );
  }, [
    dispatch,
    pagination.current,
    pagination.pageSize,
    searchQuery /*, categoryFilter */,
  ]);

  const handleTableChange = (newPagination) => {
    // Cập nhật pagination state trong Redux
    dispatch(
      setMedicalSuppliesPagination({
        current: newPagination.current,
        pageSize: newPagination.pageSize,
      })
    );
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    dispatch(setMedicalSuppliesPagination({ current: 1 })); // Reset về trang 1 khi tìm kiếm
  };

  // const handleCategoryFilterChange = (value) => { // Bỏ nếu không có filter category
  //   setCategoryFilter(value);
  //   dispatch(setMedicalSuppliesPagination({ current: 1 }));
  // };

  const showDetailModal = async (supplyId) => {
    try {
      await dispatch(getMedicalSupplyByID(supplyId)).unwrap();
      setIsDetailModalVisible(true);
    } catch (err) {
      console.error("Failed to fetch supply details:", err);
      // Lỗi đã được xử lý trong extraReducers và message.error
    }
  };

  const handleDetailModalCancel = () => {
    setIsDetailModalVisible(false);
  };

  const getStatusTag = (status) => {
    if (typeof status === "boolean") {
      return status ? (
        <Tag
          icon={<CheckCircleOutlined />}
          color="green"
          className="!font-semibold !px-3 !py-1"
        >
          Còn nhiều
        </Tag>
      ) : (
        <Tag
          icon={<CloseCircleOutlined />}
          color="red"
          className="!font-semibold !px-3 !py-1"
        >
          Hết hàng
        </Tag>
      );
    }

    switch (status) {
      case "Resolved":
        return (
          <Tag
            icon={<CheckCircleOutlined />}
            color="green"
            className="!font-semibold !px-3 !py-1"
          >
            Đã giải quyết
          </Tag>
        );
      case "In Progress":
        return (
          <Tag
            icon={<SyncOutlined spin />}
            color="orange"
            className="!font-semibold !px-3 !py-1"
          >
            Đang tiến hành
          </Tag>
        );
      case "New":
        return (
          <Tag
            icon={<ClockCircleOutlined />}
            color="blue"
            className="!font-semibold !px-3 !py-1"
          >
            Mới
          </Tag>
        );
      case "Warning":
        return (
          <Tag
            icon={<ExclamationCircleOutlined />}
            color="volcano"
            className="!font-semibold !px-3 !py-1"
          >
            Cảnh báo
          </Tag>
        );
      default:
        return <Tag className="!font-semibold !px-3 !py-1">{status}</Tag>;
    }
  };

  const columns = [
    {
      title: (
        <Space>
          <BarcodeOutlined style={{ color: "#1890ff" }} /> {/* Blue */}
          Mã vật tư
        </Space>
      ),
      dataIndex: "supply_id",
      key: "supply_id",
      sorter: (a, b) => a.supply_id.localeCompare(b.supply_id),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: (
        <Space>
          <TagOutlined style={{ color: "#52c41a" }} /> {/* Green */}
          Tên
        </Space>
      ),
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: (
        <Space>
          <FolderOutlined style={{ color: "#faad14" }} /> {/* Yellow/Orange */}
          Thể loại
        </Space>
      ),
      dataIndex: "type",
      key: "type",
      sorter: (a, b) => a.type.localeCompare(b.type),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: (
        <Space>
          <MinusSquareOutlined style={{ color: "#eb2f96" }} /> {/* Magenta */}
          Đơn vị
        </Space>
      ),
      dataIndex: "unit",
      key: "unit",
      className: "!font-semibold !text-gray-700",
    },
    {
      title: (
        <Space>
          <ContainerOutlined style={{ color: "#722ed1" }} /> {/* Purple */}
          Số lượng
        </Space>
      ),
      dataIndex: "quantity",
      key: "quantity",
      className: "!font-semibold !text-gray-700",
    },
    {
      title: (
        <Space>
          <FileTextOutlined style={{ color: "#d43808" }} /> {/* Red-orange */}
          Mô tả
        </Space>
      ),
      dataIndex: "description",
      key: "description",
      className: "!font-semibold !text-gray-700",
    },
    {
      title: (
        <Space>
          <CalendarOutlined style={{ color: "#08979c" }} /> {/* Cyan */}
          Ngày hết hạn
        </Space>
      ),
      dataIndex: "expired_date",
      key: "expired_date",
      render: (date) => (date ? format(parseISO(date), "yyyy-MM-dd") : "N/A"),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: (
        <Space>
          <CheckCircleOutlined style={{ color: "#13c2c2" }} /> {/* Teal */}
          Trạng thái
        </Space>
      ),
      dataIndex: "is_active",
      key: "status",
      render: (status) => getStatusTag(status),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: (
        <Space>
          <EditOutlined style={{ color: "#bfbfbf" }} /> {/* Màu tím */}
          Hành động
        </Space>
      ),
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => showDetailModal(record.id)} // Gọi hàm xem chi tiết
            />
          </Tooltip>
          {/* Các nút Sửa, Xóa, Xuất kho bị loại bỏ nếu API không hỗ trợ */}
          {/* Nếu có nút sửa và xóa, bạn có thể thêm lại chúng ở đây */}
          {/* <Tooltip title="Chỉnh sửa">
          <Button
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          />
        </Tooltip>
        <Tooltip title="Xóa">
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.id)}
          />
        </Tooltip> */}
        </Space>
      ),
      className: "!font-semibold !text-gray-700",
    },
  ];
  const renderLoadingState = () => (
    <div className="text-center py-8 flex flex-col items-center justify-center gap-4">
      <Spin indicator={<LoadingOutlined style={{ fontSize: 30 }} spin />} />
      <p className="text-gray-500 text-lg">Đang tải dữ liệu vật tư y tế...</p>
    </div>
  );

  return (
    <div
      className={`min-h-screen bg-white p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCcgdmlld0JveD0nMCAwIDQwIDQwJz48ZyBmaWxsPSdyZ2JhKDEzLDExMCwyNTMsMC4xKScgZmlsbC1ydWxlPSdldmVub2RkJz48Y2lyY2xlIGN4PScyMCcgY3k9JzIwJyByPScyJy8+PC9nPjwvc3ZnPg==')] bg-fixed`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header
          className={`mb-5 p-4 rounded-lg bg-yellow-500/[.10] to-transparent flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-3 bg-yellow-500/[.10] rounded-full border border-yellow-500`}
            >
              <IoStorefront className={`w-10 h-10 text-3xl text-yellow-600`} />
            </div>
            <div>
              <h1 className={`text-gray-900 font-bold text-3xl mb-2`}>
                Kho vật tư y tế
              </h1>
              <p className={`text-gray-500 flex items-center gap-2 text-sm`}>
                <span>✨</span>
                Xem thông tin thuốc và vật tư y tế
              </p>
            </div>
          </div>
          {/* Nút "Nhập kho" và các nút hành động khác sẽ bị loại bỏ nếu API không hỗ trợ */}
          {/* <Space>
            <Button
              type="primary"
              icon={<FiPlusCircle />}
              onClick={() => showStockModal("in")}
              className="flex items-center gap-1 px-4 py-2 !rounded-lg !bg-green-500 hover:!bg-green-600 !transition-colors"
            >
              Nhập kho
            </Button>
          </Space> */}
        </header>

        {loading && supplies.length === 0 ? ( // Chỉ hiển thị loading overlay nếu chưa có dữ liệu nào
          renderLoadingState()
        ) : (
          <>
            {/* Overview Statistics - Bị loại bỏ nếu không có API summary */}
            {/* <Row gutter={[16, 16]} className="mb-6">
              ... (Các Card thống kê) ...
            </Row> */}

            {/* Filters and Search */}

            {/* Medical Supplies Table */}
            <Card className="!rounded-lg !shadow-md !border !border-gray-200">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <Input
                  placeholder="Tìm kiếm vật tư..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  className="flex-grow max-w-sm rounded-lg h-10"
                  onPressEnter={(e) => handleSearch(e.target.value)}
                  onBlur={(e) => handleSearch(e.target.value)}
                />
              </div>
              <Table
                columns={columns}
                dataSource={supplies}
                rowKey="id"
                pagination={{
                  ...pagination,
                  showSizeChanger: true,
                  showTotal: (total, range) =>
                    `Hiển thị ${range[0]}-${range[1]} trên ${total} mục`,
                  className: "ant-pagination-custom",
                }}
                onChange={handleTableChange}
                className="custom-table"
                locale={{
                  emptyText: (
                    <Empty
                      description="Không tìm thấy vật tư y tế nào"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ),
                }}
              />
              <div className="text-sm text-gray-600 mt-4">
                Hiển thị{" "}
                {pagination.current * pagination.pageSize -
                  pagination.pageSize +
                  1}{" "}
                -
                {Math.min(
                  pagination.current * pagination.pageSize,
                  pagination.total
                )}{" "}
                trên {pagination.total} mục
              </div>
            </Card>
          </>
        )}

        {/* Stock In/Out/Edit Modal - Thay bằng Modal xem chi tiết */}
        <Modal
          title="Chi tiết vật tư y tế"
          open={isDetailModalVisible}
          onCancel={handleDetailModalCancel}
          footer={[
            <Button key="back" onClick={handleDetailModalCancel}>
              Đóng
            </Button>,
          ]}
        >
          {loading ? (
            <div className="text-center py-4">
              <Spin indicator={<LoadingOutlined />} />
              <p>Đang tải chi tiết...</p>
            </div>
          ) : selectedSupply ? (
            <div className="space-y-4">
              <p>
                <strong>Mã vật tư:</strong> {selectedSupply.supply_id}
              </p>
              <p>
                <strong>Tên vật tư:</strong> {selectedSupply.name}
              </p>
              <p>
                <strong>Thể loại:</strong> {selectedSupply.type}
              </p>
              <p>
                <strong>Đơn vị:</strong> {selectedSupply.unit}
              </p>
              <p>
                <strong>Số lượng:</strong> {selectedSupply.quantity}
              </p>
              <p>
                <strong>Mô tả:</strong> {selectedSupply.description || "N/A"}
              </p>
              <p>
                <strong>Ngày hết hạn:</strong>{" "}
                {selectedSupply.expired_date
                  ? format(parseISO(selectedSupply.expired_date), "yyyy-MM-dd")
                  : "N/A"}
              </p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                {getStatusTag(selectedSupply.is_active)}
              </p>
            </div>
          ) : (
            <Empty
              description="Không tìm thấy chi tiết vật tư."
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Modal>
      </div>
    </div>
  );
}
