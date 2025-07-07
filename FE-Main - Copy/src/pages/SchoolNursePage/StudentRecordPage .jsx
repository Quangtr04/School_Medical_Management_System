/* eslint-disable no-unused-vars */
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
  IdcardOutlined,
  TeamOutlined,
  CalendarOutlined,
  SolutionOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { FiClipboard } from "react-icons/fi";
import { differenceInYears, format, parseISO } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import api from "../../configs/config-axios";
import {
  fetchAllStudentHealthRecords,
  createStudentHealthRecord,
  updateStudentHealthRecord,
  deleteStudentHealthRecord,
  clearHealthRecordsError,
  clearHealthRecordsSuccess,
} from "../../redux/nurse/studentRecords/studentRecord";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

export default function StudentRecordPage() {
  const dispatch = useDispatch();
  const { healthRecords, loading, error, success } = useSelector(
    (state) => state.studentRecord
  );

  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchAllStudentHealthRecords());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setIsModalVisible(false);
      setEditingStudent(null);
      form.resetFields();
      dispatch(clearHealthRecordsSuccess());
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearHealthRecordsError());
    }
  }, [error, dispatch]);

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

  const showAddEditModal = (student = null) => {
    setEditingStudent(student);
    if (student) {
      form.setFieldsValue(student);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingStudent(null);
    form.resetFields();
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingStudent) {
        await dispatch(
          updateStudentHealthRecord({
            studentId: editingStudent.id,
            healthData: values,
          })
        );
        message.success("Student updated successfully!");
      } else {
        await dispatch(createStudentHealthRecord({ healthData: values }));
        message.success("Student added successfully!");
      }
    } catch (error) {
      console.error("Failed to save student:", error);
      message.error("Failed to save student.");
    }
  };

  const handleDelete = async (studentId) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this student record?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await dispatch(deleteStudentHealthRecord({ studentId }));
          message.success("Student deleted successfully!");
        } catch (error) {
          console.error("Failed to delete student:", error);
          message.error("Failed to delete student.");
        }
      },
    });
  };

  const columns = [
    {
      title: (
        <Space>
          <IdcardOutlined style={{ color: "#1890ff" }} /> Student ID
        </Space>
      ),
      dataIndex: "student_code",
      key: "student_code",
      sorter: (a, b) => a.studentId.localeCompare(b.studentId),
    },
    {
      title: (
        <Space>
          <UserOutlined style={{ color: "#52c41a" }} /> Họ và tên
        </Space>
      ),
      dataIndex: "full_name",
      key: "full_name",
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
          <TeamOutlined style={{ color: "#faad14" }} /> Lớp
        </Space>
      ),
      dataIndex: "class_name",
      key: "class_name",
      sorter: (a, b) => a.class.localeCompare(b.class),
    },
    {
      title: (
        <Space>
          <CalendarOutlined style={{ color: "#eb2f96" }} /> Tuổi
        </Space>
      ),
      dataIndex: "date_of_birth",
      key: "age",
      render: (dob) => differenceInYears(new Date(), new Date(dob)),
      sorter: (a, b) =>
        differenceInYears(new Date(), new Date(a.date_of_birth)) -
        differenceInYears(new Date(), new Date(b.date_of_birth)),
    },

    {
      title: (
        <Space>
          <EditOutlined style={{ color: "#bfbfbf" }} /> Hành động
        </Space>
      ),
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết sức khỏe học sinh">
            <Button
              icon={<EyeOutlined />}
              onClick={() =>
                navigate(`/nurse/students-record/${record.student_id}`)
              }
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
      <p className="text-gray-500 text-lg">Đang tải dữ liệu</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-5 p-4 rounded-lg bg-blue-600/[.10] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/[.10] rounded-full border border-blue-600">
              <FiClipboard className="w-10 h-10 text-3xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-3xl mb-2">
                Hồ sơ sức khỏe học sinh
              </h1>
              <p className="text-gray-500 flex items-center gap-2 text-sm">
                <span>✨</span> Quản lý và xem thông tin sức khỏe của học sinh
              </p>
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showAddEditModal()}
            className="flex items-center gap-1 px-4 py-2 !rounded-lg !bg-blue-600 hover:!bg-blue-700"
          >
            Thêm học sinh
          </Button>
        </header>

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
                <Button icon={<FilterOutlined />} className="px-4 py-2">
                  Lọc
                </Button>
                {/* <Select
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
                </Select> */}
              </div>
              <Table
                columns={columns}
                dataSource={Array.isArray(healthRecords) ? healthRecords : []}
                rowKey="id"
                pagination={{
                  ...pagination,
                  showSizeChanger: true,
                  showTotal: (total, range) =>
                    `Showing ${range[0]}-${range[1]} of ${total} students`,
                }}
                onChange={handleTableChange}
                locale={{
                  emptyText: (
                    <Empty
                      description="Không tìm thấy học sinh"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ),
                }}
              />
            </>
          )}
        </Card>

        <Modal
          title={editingStudent ? "Edit Student Record" : "Add New Student"}
          open={isModalVisible}
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
            {/* <Form.Item
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
            </Form.Item> */}
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
              />
            </Form.Item>
            <Form.Item name="lastVisit" label="Last Visit Date">
              <Input type="date" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
