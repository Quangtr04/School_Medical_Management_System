// src/pages/NursePage/MedicalSuppliesPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Select,
  Tag,
  Modal,
  Form,
  message,
  Typography,
  Tooltip,
  Spin,
  Empty,
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  MinusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import {
  FiBox, // For Total Items icon
  FiAlertTriangle, // For Low Stock icon
  FiClock, // For Expired Soon icon
  FiClipboard, // Header icon for Medical Supplies
  FiPlusCircle, // Stock In icon
  FiMinusCircle, // Stock Out icon
  // Các icon mới cho overview statistics theo yêu cầu
  FiUsers, // Total Students
  FiHeart, // Students with Health Issues
  FiAlertCircle, // Medical Incidents (thay thế cho WarningOutlined)
} from "react-icons/fi";
import { format, parseISO } from "date-fns";
import api from "../../configs/config-axios";
import moment from "moment";

const { Option } = Select;
const { Title, Text } = Typography;

// Component PercentageChange tái sử dụng
const PercentageChange = ({ value }) => {
  if (value === undefined || value === null) return null; // Handle cases where value might not be available

  const isPositive = value >= 0;
  const colorClass = isPositive ? "text-green-500" : "text-red-500";
  const sign = isPositive ? "+" : "";
  return (
    <p className={`text-sm ${colorClass} mt-1`}>
      {sign}
      {value}% so với tháng trước
    </p>
  );
};

export default function MedicalSuppliesPage() {
  const [loading, setLoading] = useState(false);
  const [supplies, setSupplies] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({
    totalItems: 0,
    lowStock: 0,
    expiredSoon: 0,
    // Thêm các trường giả định cho % change để khớp với UI mới
    totalItemsChange: 5, // giả định
    lowStockChange: -2, // giả định
    expiredSoonChange: 10, // giả định
  });
  const [isStockModalVisible, setIsStockModalVisible] = useState(false);
  const [stockModalType, setStockModalType] = useState("in"); // 'in' or 'out' or 'edit'
  const [selectedSupplyForStock, setSelectedSupplyForStock] = useState(null);
  const [stockForm] = Form.useForm();

  const fetchSummary = useCallback(async () => {
    try {
      const res = await api.get("/api/nurse/medical-supplies-summary");
      setSummary({
        ...res.data.data,
        // Giả lập dữ liệu % change nếu API không trả về
        totalItemsChange: 5,
        lowStockChange: -2,
        expiredSoonChange: 10,
      });
    } catch (error) {
      console.error("Error fetching medical supplies summary:", error);
      message.error("Tải tóm tắt vật tư y tế thất bại.");
    }
  }, []);

  const fetchSupplies = useCallback(async () => {
    setLoading(true); // Set loading to true when fetching starts
    try {
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchQuery,
        category: categoryFilter,
      };
      const res = await api.get("/api/nurse/medical-supplies-inventory", {
        params,
      });
      setSupplies(res.data.data.records);
      setPagination((prev) => ({
        ...prev,
        total: res.data.data.total,
      }));
      message.success("Vật tư y tế đã được tải!");
    } catch (error) {
      console.error("Error fetching medical supplies:", error);
      message.error("Tải vật tư y tế thất bại.");
    } finally {
      setLoading(false); // Set loading to false when fetching ends
    }
  }, [pagination.current, pagination.pageSize, searchQuery, categoryFilter]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("/api/nurse/supply-categories");
      setCategories(res.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    fetchSupplies();
    fetchCategories();
  }, [fetchSummary, fetchSupplies, fetchCategories]);

  const handleTableChange = (newPagination) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleCategoryFilterChange = (value) => {
    setCategoryFilter(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const showStockModal = (type, supply = null) => {
    setStockModalType(type);
    setSelectedSupplyForStock(supply);
    stockForm.resetFields();
    if (supply) {
      if (type === "edit") {
        stockForm.setFieldsValue({
          itemId: supply.itemId,
          itemName: supply.name,
          category: supply.category,
          quantity: supply.quantity,
          expiryDate: supply.expiryDate ? moment(supply.expiryDate) : null,
        });
      } else {
        stockForm.setFieldsValue({
          itemId: supply.itemId,
          itemName: supply.name,
        });
      }
    }
    setIsStockModalVisible(true);
  };

  const handleStockModalOk = async () => {
    try {
      const values = await stockForm.validateFields();
      setLoading(true);

      let endpoint = "";
      let payload = {};

      if (stockModalType === "in") {
        if (selectedSupplyForStock) {
          endpoint = `/api/nurse/medical-supplies/stock-in`;
          payload = {
            id: selectedSupplyForStock.id,
            quantity: values.quantity,
            reason: values.reason,
          };
        } else {
          endpoint = "/api/nurse/medical-supplies/stock-in-new";
          payload = {
            itemId: values.itemId,
            name: values.itemName,
            category: values.category,
            quantity: values.quantity,
            expiryDate: values.expiryDate
              ? values.expiryDate.format("YYYY-MM-DD")
              : null,
            reason: values.reason,
          };
        }
      } else if (stockModalType === "out") {
        endpoint = "/api/nurse/medical-supplies/stock-out";
        payload = {
          id: selectedSupplyForStock.id,
          quantity: values.quantity,
          reason: values.reason,
        };
      } else if (stockModalType === "edit") {
        endpoint = `/api/nurse/medical-supplies/${selectedSupplyForStock.id}`;
        payload = {
          itemId: values.itemId,
          name: values.itemName,
          category: values.category,
          quantity: values.quantity,
          expiryDate: values.expiryDate
            ? values.expiryDate.format("YYYY-MM-DD")
            : null,
        };
        await api.put(endpoint, payload);
        message.success("Vật tư y tế đã được cập nhật thành công!");
        setIsStockModalVisible(false);
        fetchSummary();
        fetchSupplies();
        return;
      }

      await api.post(endpoint, payload);
      message.success(
        `Thao tác ${
          stockModalType === "in" ? "nhập kho" : "xuất kho"
        } thành công!`
      );
      setIsStockModalVisible(false);
      fetchSummary();
      fetchSupplies();
    } catch (error) {
      console.error(`Failed to stock ${stockModalType}:`, error);
      message.error(`Thao tác ${stockModalType} thất bại.`);
    } finally {
      setLoading(false);
    }
  };

  const handleStockModalCancel = () => {
    setIsStockModalVisible(false);
    setSelectedSupplyForStock(null);
    stockForm.resetFields();
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "OK":
        return <Tag color="green">OK</Tag>;
      case "Low Stock":
        return <Tag color="orange">Thiếu hàng</Tag>;
      case "Expired":
      case "Expired Soon":
        return <Tag color="red">Sắp hết hạn</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: "Mã vật tư",
      dataIndex: "itemId",
      key: "itemId",
      sorter: (a, b) => a.itemId.localeCompare(b.itemId),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      sorter: (a, b) => a.category.localeCompare(b.category),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
      className: "!font-semibold !text-gray-700",
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (date) => (date ? format(parseISO(date), "yyyy-MM-dd") : "N/A"),
      sorter: (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
      sorter: (a, b) => a.status.localeCompare(b.status),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: "Cập nhật lần cuối",
      dataIndex: "lastUpdated",
      key: "lastUpdated",
      render: (date) => (date ? format(parseISO(date), "yyyy-MM-dd") : "N/A"),
      sorter: (a, b) => new Date(a.lastUpdated) - new Date(b.lastUpdated),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => console.log("View", record.id)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa vật tư">
            <Button
              icon={<EditOutlined />}
              onClick={() => showStockModal("edit", record)}
            />
          </Tooltip>
          <Tooltip title="Xóa vật tư">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
      className: "!font-semibold !text-gray-700",
    },
  ];

  const handleDelete = async (supplyId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa vật tư y tế này không?",
      okText: "Xóa",
      okType: "danger",
      onOk: async () => {
        try {
          setLoading(true);
          await api.delete(`/api/nurse/medical-supplies/${supplyId}`);
          message.success("Vật tư y tế đã được xóa thành công!");
          fetchSummary();
          fetchSupplies();
        } catch (error) {
          console.error("Failed to delete medical supply:", error);
          message.error("Xóa vật tư y tế thất bại.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

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
              <FiClipboard className={`w-10 h-10 text-3xl text-yellow-600`} />
            </div>
            <div>
              <h1 className={`text-gray-900 font-bold text-3xl mb-2`}>
                Kho vật tư y tế
              </h1>
              <p className={`text-gray-500 flex items-center gap-2 text-sm`}>
                <span>✨</span>
                Quản lý thuốc và vật tư y tế
              </p>
            </div>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<FiPlusCircle />}
              onClick={() => showStockModal("in")}
              className="flex items-center gap-1 px-4 py-2 !rounded-lg !bg-green-500 hover:!bg-green-600 !transition-colors"
            >
              Nhập kho
            </Button>
            <Button
              type="default"
              icon={<FiMinusCircle />}
              onClick={() => showStockModal("out")}
              className="flex items-center gap-1 px-4 py-2 !rounded-lg !border !border-red-500 !text-red-500 hover:!bg-red-50 !transition-colors"
            >
              Xuất kho
            </Button>
          </Space>
        </header>

        {loading ? (
          renderLoadingState()
        ) : (
          <>
            {/* Overview Statistics */}
            <Row gutter={[16, 16]} className="mb-6">
              {/* Total Items Card */}
              <Col xs={24} sm={8}>
                <Card className="!rounded-lg !shadow-md !border !border-gray-200">
                  <div className="flex items-center gap-4">
                    {" "}
                    {/* Use gap-4 for spacing */}
                    {/* Icon Section - Màu nền đậm hơn và icon màu trắng */}
                    <div className="flex-shrink-0 p-3 rounded-lg bg-green-600 flex items-center justify-center">
                      <FiBox className="text-white text-3xl" />
                    </div>
                    {/* Statistic Content */}
                    <div>
                      <div className="text-gray-700 text-base font-medium mb-1">
                        {" "}
                        {/* Changed to text-base */}
                        Tổng số vật tư
                      </div>
                      <div className="text-gray-900 text-3xl font-bold leading-none">
                        {summary.totalItems}
                      </div>
                      <PercentageChange value={summary.totalItemsChange} />{" "}
                      {/* Sử dụng PercentageChange component */}
                    </div>
                  </div>
                </Card>
              </Col>

              {/* Low Stock Card */}
              <Col xs={24} sm={8}>
                <Card className="!rounded-lg !shadow-md !border !border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 p-3 rounded-lg bg-orange-500/[.85] flex items-center justify-center">
                      {" "}
                      {/* bg-orange-500 for low stock */}
                      <FiAlertTriangle className="text-white text-3xl" />{" "}
                      {/* FiAlertTriangle for low stock */}
                    </div>
                    <div>
                      <div className="text-gray-700 text-base font-medium mb-1">
                        {" "}
                        {/* Changed to text-base */}
                        Vật tư thiếu
                      </div>
                      <div className="text-gray-900 text-3xl font-bold leading-none">
                        {summary.lowStock}
                      </div>
                      <PercentageChange value={summary.lowStockChange} />
                    </div>
                  </div>
                </Card>
              </Col>

              {/* Expired Soon Card */}
              <Col xs={24} sm={8}>
                <Card className="!rounded-lg !shadow-md !border !border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 p-3 rounded-lg bg-red-600/[.85] flex items-center justify-center">
                      {" "}
                      {/* bg-red-600 for expired soon */}
                      <FiClock className="text-white text-3xl" />{" "}
                      {/* FiClock for expired soon */}
                    </div>
                    <div>
                      <div className="text-gray-700 text-base font-medium mb-1">
                        {" "}
                        {/* Changed to text-base */}
                        Sắp hết hạn
                      </div>
                      <div className="text-gray-900 text-3xl font-bold leading-none">
                        {summary.expiredSoon}
                      </div>
                      <PercentageChange value={summary.expiredSoonChange} />
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Filters and Search */}
            <Card className="mb-6 !rounded-lg !shadow-md !border !border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <Input
                  placeholder="Tìm kiếm vật tư..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  className="flex-grow max-w-sm rounded-lg h-10"
                  onPressEnter={(e) => handleSearch(e.target.value)}
                  onBlur={(e) => handleSearch(e.target.value)}
                />
                <Button
                  icon={<FilterOutlined />}
                  className="flex items-center gap-1 px-4 py-2 !border !border-gray-300 !rounded-lg hover:!bg-gray-100 !transition-colors !text-gray-900 h-10"
                >
                  Lọc
                </Button>
                <Select
                  placeholder="Tất cả danh mục"
                  onChange={handleCategoryFilterChange}
                  allowClear
                  className="w-40 rounded-lg h-10"
                >
                  {categories.map((cat) => (
                    <Option key={cat.id} value={cat.name}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </Card>

            {/* Medical Supplies Table */}
            <Card className="!rounded-lg !shadow-md !border !border-gray-200">
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

        {/* Stock In/Out/Edit Modal */}
        <Modal
          title={
            stockModalType === "in"
              ? selectedSupplyForStock
                ? "Nhập kho vật tư"
                : "Nhập kho vật tư mới"
              : stockModalType === "out"
              ? "Xuất kho vật tư"
              : "Chỉnh sửa vật tư y tế"
          }
          visible={isStockModalVisible}
          onOk={handleStockModalOk}
          onCancel={handleStockModalCancel}
          okText={
            stockModalType === "in"
              ? selectedSupplyForStock
                ? "Xác nhận nhập kho"
                : "Thêm & Nhập kho"
              : stockModalType === "out"
              ? "Xác nhận xuất kho"
              : "Cập nhật"
          }
          confirmLoading={loading}
        >
          <Form form={stockForm} layout="vertical" name="stock_form">
            {(stockModalType === "in" && !selectedSupplyForStock) ||
            stockModalType === "edit" ? (
              <>
                <Form.Item
                  name="itemId"
                  label="Mã vật tư"
                  rules={[
                    { required: true, message: "Vui lòng nhập Mã vật tư!" },
                  ]}
                >
                  <Input disabled={stockModalType === "edit"} />
                </Form.Item>
                <Form.Item
                  name="itemName"
                  label="Tên vật tư"
                  rules={[
                    { required: true, message: "Vui lòng nhập Tên vật tư!" },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="category"
                  label="Danh mục"
                  rules={[
                    { required: true, message: "Vui lòng chọn Danh mục!" },
                  ]}
                >
                  <Select placeholder="Chọn một danh mục">
                    {categories.map((cat) => (
                      <Option key={cat.id} value={cat.name}>
                        {cat.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="expiryDate"
                  label="Ngày hết hạn"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày hết hạn!" },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                </Form.Item>
                <Form.Item
                  name="quantity"
                  label="Số lượng"
                  rules={[
                    { required: true, message: "Vui lòng nhập số lượng!" },
                    {
                      type: "number",
                      min: 1,
                      message: "Số lượng phải lớn hơn hoặc bằng 1!",
                    },
                  ]}
                >
                  <Input type="number" />
                </Form.Item>
                {stockModalType === "in" && !selectedSupplyForStock && (
                  <Form.Item name="reason" label="Lý do (Tùy chọn)">
                    <Input.TextArea rows={2} />
                  </Form.Item>
                )}
              </>
            ) : null}

            {(stockModalType === "in" && selectedSupplyForStock) ||
            stockModalType === "out" ? (
              <>
                <Form.Item label="Mã vật tư">
                  <Input value={selectedSupplyForStock?.itemId} disabled />
                </Form.Item>
                <Form.Item label="Tên vật tư">
                  <Input value={selectedSupplyForStock?.name} disabled />
                </Form.Item>
                <Form.Item label="Số lượng hiện tại">
                  <Input value={selectedSupplyForStock?.quantity} disabled />
                </Form.Item>
                <Form.Item
                  name="quantity"
                  label={`Số lượng để ${
                    stockModalType === "in" ? "Nhập kho" : "Xuất kho"
                  }`}
                  rules={[
                    { required: true, message: "Vui lòng nhập số lượng!" },
                    {
                      type: "number",
                      min: 1,
                      message: "Số lượng phải lớn hơn hoặc bằng 1!",
                    },
                  ]}
                >
                  <Input type="number" />
                </Form.Item>
                <Form.Item name="reason" label="Lý do (Tùy chọn)">
                  <Input.TextArea rows={2} />
                </Form.Item>
              </>
            ) : null}
          </Form>
        </Modal>
      </div>
    </div>
  );
}
