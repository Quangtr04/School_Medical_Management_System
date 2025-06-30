// src/pages/NursePage/MedicalIncidentsPage.jsx

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
  DatePicker,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import {
  FiAlertTriangle, // Biểu tượng tiêu đề cho Sự kiện y tế
  FiPlusCircle, // Biểu tượng nút Ghi lại sự cố
} from "react-icons/fi";
import { format, parseISO } from "date-fns";
import api from "../../configs/config-axios";
import moment from "moment";

const { Option } = Select;
const { Title, Text } = Typography;

export default function MedicalIncident() {
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentIncident, setCurrentIncident] = useState(null); // Để chỉnh sửa hoặc xem chi tiết
  const [form] = Form.useForm();

  const fetchIncidents = useCallback(async () => {
    setLoading(false);
    try {
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchQuery,
        status: statusFilter,
      };
      // Giả lập dữ liệu từ API
      const res = await api.get("/api/nurse/medical-incidents", { params });
      setIncidents(res.data.data.records);
      setPagination((prev) => ({
        ...prev,
        total: res.data.data.total,
      }));
      message.success("Đã tải sự kiện y tế!");
    } catch (error) {
      console.error("Lỗi khi tải sự kiện y tế:", error);
      message.error("Tải sự kiện y tế thất bại.");
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchQuery, statusFilter]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

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

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const showModal = (incident = null) => {
    setCurrentIncident(incident);
    form.resetFields();
    if (incident) {
      form.setFieldsValue({
        ...incident,
        incidentTime: incident.incidentTime
          ? moment(incident.incidentTime)
          : null,
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
        incidentTime: values.incidentTime
          ? values.incidentTime.format("YYYY-MM-DDTHH:mm:ss") // Định dạng sang chuỗi ISO
          : null,
      };

      if (currentIncident) {
        // Cập nhật sự cố hiện có
        await api.put(
          `/api/nurse/medical-incidents/${currentIncident.id}`,
          payload
        );
        message.success("Đã cập nhật sự kiện y tế thành công!");
      } else {
        // Tạo sự cố mới
        await api.post("/api/nurse/medical-incidents", payload);
        message.success("Đã ghi lại sự kiện y tế thành công!");
      }
      setIsModalVisible(false);
      fetchIncidents();
    } catch (error) {
      console.error("Không thể ghi lại/cập nhật sự kiện y tế:", error);
      message.error("Không thể ghi lại/cập nhật sự kiện y tế.");
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setCurrentIncident(null);
    form.resetFields();
  };

  const handleDeleteIncident = async (incidentId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa bản ghi sự kiện y tế này không?",
      okText: "Xóa",
      okType: "danger",
      onOk: async () => {
        try {
          setLoading(true);
          await api.delete(`/api/nurse/medical-incidents/${incidentId}`);
          message.success("Đã xóa sự kiện y tế thành công!");
          fetchIncidents();
        } catch (error) {
          console.error("Không thể xóa sự kiện y tế:", error);
          message.error("Không thể xóa sự kiện y tế.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "Resolved":
        return <Tag color="green">Đã giải quyết</Tag>;
      case "In Progress":
        return <Tag color="orange">Đang tiến hành</Tag>;
      case "New":
        return <Tag color="blue">Mới</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: "Mã sự cố",
      dataIndex: "incidentId",
      key: "incidentId",
      sorter: (a, b) => a.incidentId.localeCompare(b.incidentId),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: "Học sinh",
      dataIndex: "studentName",
      key: "studentName",
      sorter: (a, b) => a.studentName.localeCompare(b.studentName),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      sorter: (a, b) => a.type.localeCompare(b.type),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: "Ngày & Giờ",
      dataIndex: "incidentTime",
      key: "incidentTime",
      render: (time) =>
        time ? format(parseISO(time), "yyyy-MM-dd HH:mm") : "N/A",
      sorter: (a, b) => new Date(a.incidentTime) - new Date(b.incidentTime),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: "Vị trí",
      dataIndex: "location",
      key: "location",
      sorter: (a, b) => a.location.localeCompare(b.location),
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
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => showModal(record)}>
            Xem chi tiết
          </Button>
          <Tooltip title="Chỉnh sửa sự cố">
            <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          </Tooltip>
          <Tooltip title="Xóa sự cố">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDeleteIncident(record.id)}
            />
          </Tooltip>
        </Space>
      ),
      className: "!font-semibold !text-gray-700",
    },
  ];

  const renderLoadingState = () => (
    <div className="text-center py-8 flex flex-col items-center justify-center gap-4">
      <Spin indicator={<LoadingOutlined style={{ fontSize: 30 }} spin />} />
      <p className="text-gray-500 text-lg">Đang tải dữ liệu sự kiện y tế...</p>
    </div>
  );

  return (
    <div
      className={`min-h-screen bg-white p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCcgdmlld0JveD0nMCAwIDQwIDQwJz48ZyBmaWxsPSdyZ2JhKDEzLDExMCwyNTMsMC4xKScgZmlsbC1ydWxlPSdldmVub2RkJz48Y2lyY2xlIGN4PScyMCcgY3k9JzIwJyByPScyJy8+PC9zdmc+')] bg-fixed`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Phần tiêu đề */}
        <header
          className={`mb-5 p-4 rounded-lg bg-red-600/[.10] to-transparent flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-3 bg-red-600/[.10] rounded-full border border-red-600`}
            >
              <FiAlertTriangle className={`w-10 h-10 text-3xl text-red-600`} />
            </div>
            <div>
              <h1 className={`text-gray-900 font-bold text-3xl mb-2`}>
                Sự kiện y tế
              </h1>
              <p className={`text-gray-500 flex items-center gap-2 text-sm`}>
                <span>✨</span>
                Theo dõi và quản lý các sự kiện y tế tại trường
              </p>
            </div>
          </div>
          <Button
            type="primary"
            icon={<FiPlusCircle />}
            onClick={() => showModal(null)} // Gọi showModal với null cho sự cố mới
            className="flex items-center gap-1 px-4 py-2 !rounded-lg !bg-blue-600 hover:!bg-blue-700 !transition-colors"
          >
            Sự kiện y tế
          </Button>
        </header>

        {loading ? (
          renderLoadingState()
        ) : (
          <>
            {/* Bộ lọc và tìm kiếm */}
            <Card className="mb-6 !rounded-lg !shadow-md !border !border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <Input
                  placeholder="Tìm kiếm sự cố..."
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
                  placeholder="Tất cả trạng thái"
                  onChange={handleStatusFilterChange}
                  allowClear
                  className="w-40 rounded-lg h-10"
                  options={[
                    { value: "Resolved", label: "Đã giải quyết" },
                    { value: "In Progress", label: "Đang tiến hành" },
                    { value: "New", label: "Mới" },
                  ]}
                />
              </div>
            </Card>

            {/* Bảng sự kiện y tế */}
            <Card className="!rounded-lg !shadow-md !border !border-gray-200">
              <Table
                columns={columns}
                dataSource={incidents}
                rowKey="id"
                pagination={{
                  ...pagination,
                  showSizeChanger: true,
                  showTotal: (total, range) =>
                    `Hiển thị ${range[0]}-${range[1]} trên tổng số ${total} sự cố`,
                  className: "ant-pagination-custom",
                }}
                onChange={handleTableChange}
                className="custom-table"
                locale={{
                  emptyText: (
                    <Empty
                      description="Không tìm thấy sự kiện y tế nào"
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
                -{" "}
                {Math.min(
                  pagination.current * pagination.pageSize,
                  pagination.total
                )}{" "}
                trên tổng số {pagination.total} sự cố
              </div>
            </Card>
          </>
        )}

        {/* Modal Ghi lại/Chỉnh sửa sự cố */}
        <Modal
          title={
            currentIncident
              ? "Chỉnh sửa sự kiện y tế"
              : "Ghi lại sự kiện y tế mới"
          }
          visible={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText={currentIncident ? "Cập nhật sự cố" : "Ghi lại sự cố"}
          confirmLoading={loading}
        >
          <Form form={form} layout="vertical" name="incident_form">
            <Form.Item
              name="incidentId"
              label="Mã sự cố"
              rules={[{ required: true, message: "Vui lòng nhập Mã sự cố!" }]}
            >
              <Input disabled={!!currentIncident} />{" "}
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
              name="type"
              label="Loại sự cố"
              rules={[{ required: true, message: "Vui lòng nhập Loại sự cố!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="incidentTime"
              label="Ngày & Giờ"
              rules={[{ required: true, message: "Vui lòng chọn Ngày & Giờ!" }]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              name="location"
              label="Vị trí"
              rules={[{ required: true, message: "Vui lòng nhập Vị trí!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Mô tả (Tùy chọn)">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: "Vui lòng chọn Trạng thái!" }]}
            >
              <Select placeholder="Chọn một trạng thái">
                <Option value="New">Mới</Option>
                <Option value="In Progress">Đang tiến hành</Option>
                <Option value="Resolved">Đã giải quyết</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
