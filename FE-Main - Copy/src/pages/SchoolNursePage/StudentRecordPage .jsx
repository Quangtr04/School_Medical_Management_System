// src/pages/NursePage/StudentRecordsPage.jsx

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
  Avatar,
  Spin,
  Empty,
  Card,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  LoadingOutlined,
  UserOutlined,
  // Thêm các icon mới cho tiêu đề cột
  IdcardOutlined, // For Student ID
  TeamOutlined, // For Class
  CalendarOutlined, // For Age (có thể dùng thay thế cho Birthday, hoặc riêng cho tuổi)
  SolutionOutlined, // For Medical Conditions (giải pháp, y tế)
  HistoryOutlined, // For Last Visit
  // Actions icon đã có sẵn trong render
} from "@ant-design/icons";
import { FiUsers, FiClipboard, FiPlus } from "react-icons/fi"; // Thêm FiClipboard cho header icon
import api from "../../configs/config-axios";
import { format, parseISO } from "date-fns";

const { Option } = Select;
const { Title, Text } = Typography;

export default function StudentRecordPage() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState(null);
  const [classes, setClasses] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form] = Form.useForm();

  const fetchStudents = useCallback(async () => {
    setLoading(false);
    try {
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchQuery,
        class: classFilter,
      };
      const res = await api.get("/api/nurse/students-health-records", {
        params,
      });
      setStudents(res.data.data.records);
      setPagination((prev) => ({
        ...prev,
        total: res.data.data.total,
      }));
      message.success("Student records loaded!");
    } catch (error) {
      console.error("Error fetching student records:", error);
      message.error("Failed to load student records.");
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchQuery, classFilter]);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await api.get("/api/nurse/classes");
      setClasses(res.data.data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleTableChange = (newPagination) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPagination((prev) => ({ ...prev, current: 1 })); // Reset to first page on search
  };

  const handleClassFilterChange = (value) => {
    setClassFilter(value);
    setPagination((prev) => ({ ...prev, current: 1 })); // Reset to first page on filter change
  };

  const showAddEditModal = (student = null) => {
    setEditingStudent(student);
    if (student) {
      form.setFieldsValue(student);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      if (editingStudent) {
        await api.put(`/api/nurse/students/${editingStudent.id}`, values);
        message.success("Student updated successfully!");
      } else {
        await api.post("/api/nurse/students", values);
        message.success("Student added successfully!");
      }
      setIsModalVisible(false);
      fetchStudents(); // Refresh data
    } catch (error) {
      console.error("Failed to save student:", error);
      message.error("Failed to save student.");
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingStudent(null);
    form.resetFields();
  };

  const handleDelete = async (studentId) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this student record?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          setLoading(true);
          await api.delete(`/api/nurse/students/${studentId}`);
          message.success("Student deleted successfully!");
          fetchStudents(); // Refresh data
        } catch (error) {
          console.error("Failed to delete student:", error);
          message.error("Failed to delete student.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const columns = [
    {
      title: (
        <Space>
          <IdcardOutlined style={{ color: "#1890ff" }} /> {/* Blue */}
          Student ID
        </Space>
      ),
      dataIndex: "studentId",
      key: "studentId",
      sorter: (a, b) => a.studentId.localeCompare(b.studentId),
    },
    {
      title: (
        <Space>
          <UserOutlined style={{ color: "#52c41a" }} /> {/* Green */}
          Họ và tên
        </Space>
      ),
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          {text}
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <TeamOutlined style={{ color: "#faad14" }} /> {/* Orange/Yellow */}
          Lớp
        </Space>
      ),
      dataIndex: "class",
      key: "class",
      sorter: (a, b) => a.class.localeCompare(b.class),
    },
    {
      title: (
        <Space>
          <CalendarOutlined style={{ color: "#eb2f96" }} /> {/* Magenta */}
          Tuổi
        </Space>
      ),
      dataIndex: "age",
      key: "age",
      sorter: (a, b) => a.age - b.age,
    },
    {
      title: (
        <Space>
          <SolutionOutlined style={{ color: "#722ed1" }} /> {/* Purple */}
          Điều kiện y tế
        </Space>
      ),
      dataIndex: "medicalConditions",
      key: "medicalConditions",
      render: (conditions) => (
        <Space wrap>
          {conditions &&
            conditions.map(
              (
                condition,
                index // Thêm kiểm tra 'conditions' để tránh lỗi nếu là null/undefined
              ) => (
                <Tag
                  key={index}
                  color={condition.type === "Allergies" ? "orange" : "blue"}
                >
                  {condition.name}
                </Tag>
              )
            )}
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <HistoryOutlined style={{ color: "#08979c" }} /> {/* Cyan */}
          Lần khám gần nhất
        </Space>
      ),
      dataIndex: "lastVisit",
      key: "lastVisit",
      render: (date) => (date ? format(parseISO(date), "MMM dd, yyyy") : "N/A"),
    },
    {
      title: (
        <Space>
          <EditOutlined style={{ color: "#bfbfbf" }} /> {/* Màu tím */}
          Hành động
        </Space>
      ),
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => console.log("View", record.id)}
            />
          </Tooltip>
          <Tooltip title="Edit Record">
            <Button
              icon={<EditOutlined />}
              onClick={() => showAddEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const renderLoadingState = () => (
    <div className="text-center py-8 flex flex-col items-center justify-center gap-4">
      <Spin indicator={<LoadingOutlined style={{ fontSize: 30 }} spin />} />
      <p className="text-gray-500 text-lg">Loading student records...</p>
    </div>
  );

  return (
    <div
      className={`min-h-screen bg-white p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCcgdmlld0JveD0nMCAwIDQwIDQwJz48ZyBmaWxsPSdyZ2JhKDEzLDExMCwyNTMsMC4xKScgZmlsbC1ydWxlPSdldmVub2RkJz48Y2lyY2xlIGN4PScyMCcgY3k9JzIwJyByPScyJy8+PC9nPjwvc3ZnPg==')] bg-fixed`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header
          className={`mb-5 p-4 rounded-lg bg-blue-600/[.10] to-transparent flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-3 bg-blue-600/[.10] rounded-full border border-blue-600`}
            >
              <FiClipboard className={`w-10 h-10 text-3xl text-blue-600`} />
            </div>
            <div>
              <h1 className={`text-gray-900 font-bold text-3xl mb-2`}>
                Hồ sơ sức khỏe học sinh
              </h1>
              <p className={`text-gray-500 flex items-center gap-2 text-sm`}>
                <span>✨</span>
                Quản lý và xem thông tin sức khỏe của học sinh
              </p>
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showAddEditModal()}
            className="flex items-center gap-1 px-4 py-2 !rounded-lg !bg-blue-600 hover:!bg-blue-700 !transition-colors"
          >
            Thêm học sinh
          </Button>
        </header>

        {/* Student Records Table */}
        <Card className="!rounded-lg !shadow-md">
          {loading ? (
            renderLoadingState()
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <Input
                  placeholder="Tìm kiếm thông tin học sinh"
                  prefix={<SearchOutlined className="text-gray-400" />}
                  className="flex-grow max-w-sm rounded-lg h-10"
                  onPressEnter={(e) => handleSearch(e.target.value)}
                  onBlur={(e) => handleSearch(e.target.value)}
                />
                <Button
                  icon={<FilterOutlined />}
                  className="flex items-center gap-1 px-4 py-2 !border !border-gray-300 !rounded-lg hover:!bg-gray-100 !transition-colors !text-gray-900"
                >
                  Lọc
                </Button>
                <Select
                  placeholder="All Classes"
                  onChange={handleClassFilterChange}
                  allowClear
                  className="w-40 rounded-lg h-10"
                >
                  {classes.map((cls) => (
                    <Option key={cls.id} value={cls.name}>
                      {cls.name}
                    </Option>
                  ))}
                </Select>
              </div>
              <Table
                columns={columns}
                dataSource={students}
                rowKey="id"
                pagination={{
                  ...pagination,
                  showSizeChanger: true,
                  showTotal: (total, range) =>
                    `Showing ${range[0]}-${range[1]} of ${total} students`,
                }}
                onChange={handleTableChange}
                className="custom-table" // Thêm className để custom CSS nếu cần
                locale={{
                  emptyText: (
                    <Empty
                      description="No student records found"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ),
                }}
              />
              <div className="text-sm text-gray-600 mt-4">
                Showing{" "}
                {pagination.current * pagination.pageSize -
                  pagination.pageSize +
                  1}
                -
                {Math.min(
                  pagination.current * pagination.pageSize,
                  pagination.total
                )}{" "}
                of {pagination.total} students
              </div>
            </>
          )}
        </Card>

        {/* Add/Edit Student Modal */}
        <Modal
          title={editingStudent ? "Edit Student Record" : "Add New Student"}
          visible={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText={editingStudent ? "Update" : "Add"}
          confirmLoading={loading}
        >
          <Form form={form} layout="vertical" name="student_form">
            <Form.Item
              name="studentId"
              label="Student ID"
              rules={[{ required: true, message: "Please enter Student ID!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="name"
              label="Student Name"
              rules={[
                { required: true, message: "Please enter Student Name!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="class"
              label="Class"
              rules={[{ required: true, message: "Please select a Class!" }]}
            >
              <Select placeholder="Select a class">
                {classes.map((cls) => (
                  <Option key={cls.id} value={cls.name}>
                    {cls.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="age"
              label="Age"
              rules={[{ required: true, message: "Please enter Age!" }]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item
              name="medicalConditions"
              label="Medical Conditions (e.g., Allergies, Asthma)"
              rules={[
                { required: true, message: "Please enter medical conditions!" },
              ]}
            >
              <Select
                mode="tags"
                style={{ width: "100%" }}
                placeholder="Add medical conditions"
              >
                {/* Options can be pre-defined or let users type new ones */}
              </Select>
            </Form.Item>
            <Form.Item
              name="lastVisit"
              label="Last Visit Date"
              // No 'required' for last visit as it might be new student
            >
              <Input type="date" /> {/* Use type="date" for date input */}
            </Form.Item>
            {/* Thêm các trường khác nếu cần, ví dụ: contact details, guardian info, etc. */}
          </Form>
        </Modal>
      </div>
    </div>
  );
}
