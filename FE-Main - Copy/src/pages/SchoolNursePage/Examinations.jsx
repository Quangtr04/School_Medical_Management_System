// src/pages/NursePage/ExaminationsPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Select,
  Modal,
  Form,
  message,
  Typography,
  Tooltip,
  Spin,
  Empty,
  Card,
  DatePicker,
  InputNumber, // For Height, Weight, BMI
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LoadingOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import {
  FiFileText, // Header icon for Examinations (or FiActivity, FiSearch)
  FiPlusCircle, // New Examination button icon
} from "react-icons/fi";
import { format, parseISO } from "date-fns";
import api from "../../configs/config-axios";
import moment from "moment";

const { Option } = Select;
const { Title, Text } = Typography;

export default function ExaminationsPage() {
  const [loading, setLoading] = useState(true);
  const [examinations, setExaminations] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentExamination, setCurrentExamination] = useState(null); // Dùng cho chỉnh sửa
  const [form] = Form.useForm();

  // Danh sách lớp học giả lập cho dropdown
  const availableClasses = [
    { id: "1a", name: "1A" },
    { id: "1b", name: "1B" },
    { id: "2a", name: "2A" },
    { id: "2b", name: "2B" },
    { id: "3a", name: "3A" },
    { id: "3b", name: "3B" },
  ];

  const fetchExaminations = useCallback(async () => {
    setLoading(true); // Đặt loading về true khi bắt đầu fetch
    try {
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchQuery,
        class: classFilter,
      };
      // Giả lập dữ liệu từ API
      const res = await api.get("/api/nurse/health-examinations", { params });
      setExaminations(res.data.data.records);
      setPagination((prev) => ({
        ...prev,
        total: res.data.data.total,
      }));
      message.success("Tải dữ liệu khám sức khỏe thành công!");
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu khám sức khỏe:", error);
      message.error("Tải dữ liệu khám sức khỏe thất bại.");
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchQuery, classFilter]);

  useEffect(() => {
    fetchExaminations();
  }, [fetchExaminations]);

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

  const handleClassFilterChange = (value) => {
    setClassFilter(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const showModal = (examination = null) => {
    setCurrentExamination(examination);
    form.resetFields();
    if (examination) {
      form.setFieldsValue({
        ...examination,
        date: examination.date ? moment(examination.date) : null,
      });
    }
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        ...values,
        date: values.date ? values.date.format("YYYY-MM-DD") : null,
      };

      if (currentExamination) {
        // Cập nhật thông tin khám hiện có
        await api.put(
          `/api/nurse/health-examinations/${currentExamination.id}`,
          payload
        );
        message.success("Cập nhật thông tin khám sức khỏe thành công!");
      } else {
        // Tạo mới thông tin khám
        await api.post("/api/nurse/health-examinations", payload);
        message.success("Ghi nhận thông tin khám sức khỏe mới thành công!");
      }
      setIsModalVisible(false);
      fetchExaminations();
    } catch (error) {
      console.error(
        "Không thể ghi nhận/cập nhật thông tin khám sức khỏe:",
        error
      );
      message.error("Không thể ghi nhận/cập nhật thông tin khám sức khỏe.");
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setCurrentExamination(null);
    form.resetFields();
  };

  const handleDeleteExamination = async (examinationId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa bản ghi khám sức khỏe này không?",
      okText: "Xóa",
      okType: "danger",
      onOk: async () => {
        try {
          setLoading(true);
          await api.delete(`/api/nurse/health-examinations/${examinationId}`);
          message.success("Xóa thông tin khám sức khỏe thành công!");
        } catch (error) {
          console.error("Không thể xóa thông tin khám sức khỏe:", error);
          message.error("Không thể xóa thông tin khám sức khỏe.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const getBMIStatus = (bmi) => {
    if (bmi < 18.5)
      return (
        <span className="text-orange-500 font-medium">
          {bmi} <Tooltip title="Thiếu cân">(TC)</Tooltip>
        </span>
      );
    if (bmi >= 18.5 && bmi < 24.9)
      return (
        <span className="text-green-600 font-medium">
          {bmi} <Tooltip title="Bình thường">(BT)</Tooltip>
        </span>
      );
    if (bmi >= 25 && bmi < 29.9)
      return (
        <span className="text-orange-600 font-medium">
          {bmi} <Tooltip title="Thừa cân">(TC)</Tooltip>
        </span>
      );
    if (bmi >= 30)
      return (
        <span className="text-red-600 font-medium">
          {bmi} <Tooltip title="Béo phì">(BP)</Tooltip>
        </span>
      );
    return bmi;
  };

  const columns = [
    {
      title: "Mã học sinh",
      dataIndex: "studentId",
      key: "studentId",
      sorter: (a, b) => a.studentId.localeCompare(b.studentId),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: "Tên học sinh",
      dataIndex: "studentName",
      key: "studentName",
      sorter: (a, b) => a.studentName.localeCompare(b.studentName),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: "Lớp",
      dataIndex: "class",
      key: "class",
      sorter: (a, b) => a.class.localeCompare(b.class),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      render: (date) => (date ? format(parseISO(date), "yyyy-MM-dd") : "N/A"),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: "Chiều cao (cm)",
      dataIndex: "height",
      key: "height",
      render: (height, record) => (
        <span className="flex items-center gap-1">
          {height}{" "}
          {record.heightChange > 0 ? (
            <ArrowUpOutlined className="text-green-500" />
          ) : record.heightChange < 0 ? (
            <ArrowDownOutlined className="text-red-500" />
          ) : null}
        </span>
      ),
      sorter: (a, b) => a.height - b.height,
      className: "!font-semibold !text-gray-700",
    },
    {
      title: "Cân nặng (kg)",
      dataIndex: "weight",
      key: "weight",
      render: (weight, record) => (
        <span className="flex items-center gap-1">
          {weight}{" "}
          {record.weightChange > 0 ? (
            <ArrowUpOutlined className="text-green-500" />
          ) : record.weightChange < 0 ? (
            <ArrowDownOutlined className="text-red-500" />
          ) : null}
        </span>
      ),
      sorter: (a, b) => a.weight - b.weight,
      className: "!font-semibold !text-gray-700",
    },
    {
      title: "BMI",
      dataIndex: "bmi",
      key: "bmi",
      render: (bmi) => getBMIStatus(bmi),
      sorter: (a, b) => a.bmi - b.bmi,
      className: "!font-semibold !text-gray-700",
    },
    {
      title: "Thị lực",
      dataIndex: "vision",
      key: "vision",
      render: (vision) => vision || "N/A", // Hiển thị 'N/A' nếu trống
      className: "!font-semibold !text-gray-700",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => showModal(record)}
        >
          Chỉnh sửa
        </Button>
      ),
      className: "!font-semibold !text-gray-700",
    },
  ];

  const renderLoadingState = () => (
    <div className="text-center py-8 flex flex-col items-center justify-center gap-4">
      <Spin indicator={<LoadingOutlined style={{ fontSize: 30 }} spin />} />
      <p className="text-gray-500 text-lg">Đang tải dữ liệu khám sức khỏe...</p>
    </div>
  );

  return (
    <div
      className={`min-h-screen bg-white p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCcgdmlld0JveD0nMCAwIDQwIDQwJz48ZyBmaWxsPSdyZ2JhKDEzLDExMCwyNTMsMC4xKScgZmlsbC1ydWxlPSdldmVub2RkJz48Y2lyY2xlIGN4PScyMCcgY3k9JzIwJyByPScyJy8+PC9nPjwvc3ZnPg==')] bg-fixed`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header
          className={`mb-5 p-4 rounded-lg bg-indigo-600/[.10] to-transparent flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-3 bg-indigo-600/[.10] rounded-full border border-indigo-600`}
            >
              <FiFileText className={`w-10 h-10 text-3xl text-indigo-600`} />{" "}
              {/* Changed icon to FiFileText or FiSearch for examinations */}
            </div>
            <div>
              <h1 className={`text-gray-900 font-semibold text-3xl mb-2`}>
                Khám sức khỏe
              </h1>
              <p className={`text-gray-500 flex items-center gap-2 text-sm`}>
                <span>✨</span>
                Ghi nhận và quản lý thông tin khám sức khỏe học sinh
              </p>
            </div>
          </div>
          <Button
            type="primary"
            icon={<FiPlusCircle />}
            onClick={() => showModal(null)} // Call showModal with null for new examination
            className="flex items-center gap-1 px-4 py-2 !rounded-lg !bg-blue-600 hover:!bg-blue-700 !transition-colors"
          >
            Khám mới
          </Button>
        </header>

        {loading ? (
          renderLoadingState()
        ) : (
          <>
            {/* Filters and Search */}
            <Card className="mb-6 !rounded-lg !shadow-md !border !border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <Input
                  placeholder="Tìm kiếm khám sức khỏe..."
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
                  placeholder="Tất cả các lớp"
                  onChange={handleClassFilterChange}
                  allowClear
                  className="w-40 rounded-lg h-10"
                  options={availableClasses.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                />
              </div>
            </Card>

            {/* Health Examinations Table */}
            <Card className="!rounded-lg !shadow-md !border !border-gray-200">
              <Table
                columns={columns}
                dataSource={examinations}
                rowKey="id"
                pagination={{
                  ...pagination,
                  showSizeChanger: true,
                  showTotal: (total, range) =>
                    `Hiển thị ${range[0]}-${range[1]} trên tổng số ${total} lượt khám`,
                  className: "ant-pagination-custom",
                }}
                onChange={handleTableChange}
                className="custom-table"
                locale={{
                  emptyText: (
                    <Empty
                      description="Không tìm thấy bản ghi khám sức khỏe nào"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ),
                }}
              />
              <div className="text-sm text-gray-600 mt-4">
                Hiển thị{" "}
                {pagination.current * pagination.pageSize -
                  pagination.pageSize +
                  1}
                -
                {Math.min(
                  pagination.current * pagination.pageSize,
                  pagination.total
                )}{" "}
                trên tổng số {pagination.total} lượt khám
              </div>
            </Card>
          </>
        )}

        {/* Record/Edit Examination Modal */}
        <Modal
          title={
            currentExamination
              ? "Chỉnh sửa thông tin khám sức khỏe"
              : "Ghi nhận thông tin khám sức khỏe mới"
          }
          visible={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText={currentExamination ? "Cập nhật khám" : "Ghi nhận khám"}
          confirmLoading={loading}
        >
          <Form form={form} layout="vertical" name="examination_form">
            <Form.Item
              name="studentId"
              label="Mã học sinh"
              rules={[
                { required: true, message: "Vui lòng nhập Mã học sinh!" },
              ]}
            >
              <Input disabled={!!currentExamination} />{" "}
              {/* Vô hiệu hóa nếu đang chỉnh sửa */}
            </Form.Item>
            <Form.Item
              name="studentName"
              label="Tên học sinh"
              rules={[
                { required: true, message: "Vui lòng nhập Tên học sinh!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="class"
              label="Lớp"
              rules={[{ required: true, message: "Vui lòng nhập Lớp!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="date"
              label="Ngày khám"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn Ngày khám!",
                },
              ]}
            >
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item
              name="height"
              label="Chiều cao (cm)"
              rules={[
                { required: true, message: "Vui lòng nhập Chiều cao!" },
                {
                  type: "number",
                  min: 0,
                  message: "Chiều cao phải là số dương!",
                },
              ]}
            >
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
            <Form.Item
              name="weight"
              label="Cân nặng (kg)"
              rules={[
                { required: true, message: "Vui lòng nhập Cân nặng!" },
                {
                  type: "number",
                  min: 0,
                  message: "Cân nặng phải là số dương!",
                },
              ]}
            >
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
            <Form.Item
              name="bmi"
              label="BMI"
              // BMI có thể được tính tự động từ height và weight, hoặc nhập thủ công
              // Để đơn giản, ở đây ta sẽ cho phép nhập, hoặc backend tính toán
              rules={[
                { required: true, message: "Vui lòng nhập BMI!" },
                { type: "number", min: 0, message: "BMI phải là số dương!" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                step={0.1}
                precision={1}
              />
            </Form.Item>
            <Form.Item
              name="vision"
              label="Thị lực"
              rules={[{ required: true, message: "Vui lòng nhập Thị lực!" }]}
            >
              <Input placeholder="Ví dụ: 6/6, 6/12" />
            </Form.Item>
            <Form.Item name="notes" label="Ghi chú (Tùy chọn)">
              <Input.TextArea rows={2} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
