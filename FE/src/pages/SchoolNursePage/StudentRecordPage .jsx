/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Tooltip,
  Avatar,
  Spin,
  Empty,
  Card,
  Select,
  Divider,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  LoadingOutlined,
  UserOutlined,
  IdcardOutlined,
  TeamOutlined,
  CalendarOutlined,
  SolutionOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { FiClipboard } from "react-icons/fi";
import { differenceInYears, format, parseISO } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllStudentHealthRecords,
  createStudentHealthRecord,
  updateStudentHealthRecord,
  deleteStudentHealthRecord,
  clearHealthRecordsError,
  clearHealthRecordsSuccess,
} from "../../redux/nurse/studentRecords/studentRecord";
import { useNavigate } from "react-router-dom";

const { Option } = Input;
const fontFamily = { fontFamily: "Poppins, Roboto, sans-serif" };
const cardNeumorph = {
  borderRadius: 24,
  boxShadow: "8px 8px 24px #e0f0ff, -8px -8px 24px #fff",
  background: "#fff",
  border: "1.5px solid #e0f0ff",
  transition: "box-shadow 0.2s, transform 0.2s",
};
const statIconStyle = {
  borderRadius: "50%",
  background: "#E0F0FF",
  boxShadow: "0 2px 8px #e0f0ff",
  width: 56,
  height: 56,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 28,
};

function RenderLoadingState() {
  return (
    <div className="text-center py-8 flex flex-col items-center justify-center gap-4" style={fontFamily}>
      <Spin indicator={<LoadingOutlined style={{ fontSize: 30, color: '#007BFF' }} spin />} />
      <p className="text-gray-500 text-lg">Đang tải dữ liệu</p>
    </div>
  );
}

function filterRecords(healthRecords, searchQuery, classFilter) {
  let filteredData = Array.isArray(healthRecords) ? healthRecords : [];
  if (searchQuery) {
    const lowerCaseQuery = searchQuery.trim().toLowerCase();
    filteredData = filteredData.filter(
      (record) =>
        (record?.student_code?.toLowerCase?.() || "").includes(lowerCaseQuery) ||
        (record?.student_name?.toLowerCase?.() || "").includes(lowerCaseQuery) ||
        (record?.class_name?.toLowerCase?.() || "").includes(lowerCaseQuery)
    );
  }
  if (classFilter) {
    filteredData = filteredData.filter(
      (record) => record?.class_name === classFilter
    );
  }
  return filteredData;
}

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
      dispatch(fetchAllStudentHealthRecords());
    }
  }, [success, dispatch, form]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearHealthRecordsError());
    }
  }, [error, dispatch]);

  const filteredHealthRecords = useMemo(
    () => filterRecords(healthRecords, searchQuery, classFilter),
    [healthRecords, searchQuery, classFilter]
  );

  useEffect(() => {
    setPagination((prev) => ({ ...prev, total: filteredHealthRecords.length }));
  }, [filteredHealthRecords.length]);

  const paginatedHealthRecords = useMemo(() => {
    const startIdx = (pagination.current - 1) * pagination.pageSize;
    return filteredHealthRecords.slice(startIdx, startIdx + pagination.pageSize);
  }, [filteredHealthRecords, pagination.current, pagination.pageSize]);

  const handleTableChange = useCallback((newPagination) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  }, []);

  const handleSearch = useCallback((value) => {
    setSearchQuery(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  const showAddEditModal = useCallback((student = null) => {
    setEditingStudent(student);
    if (student) {
      const formattedDob = student.date_of_birth
        ? format(parseISO(student.date_of_birth), "yyyy-MM-dd")
        : undefined;
      form.setFieldsValue({
        ...student,
        date_of_birth: formattedDob,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  }, [form]);

  const handleModalCancel = useCallback(() => {
    setIsModalVisible(false);
    setEditingStudent(null);
    form.resetFields();
  }, [form]);

  const handleModalOk = useCallback(async () => {
    try {
      const values = await form.validateFields();
      if (values.date_of_birth) {
        values.date_of_birth = new Date(values.date_of_birth).toISOString();
      }
      if (editingStudent) {
        await dispatch(
          updateStudentHealthRecord({
            studentId: editingStudent.student_id,
            healthData: values,
          })
        );
        message.success("Cập nhật hồ sơ học sinh thành công!");
      } else {
        await dispatch(createStudentHealthRecord({ healthData: values }));
        message.success("Thêm hồ sơ học sinh thành công!");
      }
    } catch (errorInfo) {
      console.error("Failed to save student:", errorInfo);
      message.error(
        "Lưu hồ sơ học sinh thất bại. Vui lòng kiểm tra lại thông tin."
      );
    }
  }, [dispatch, editingStudent, form]);

  const columns = useMemo(() => [
    {
      title: (
        <Space style={fontFamily}>
          <IdcardOutlined style={{ color: "#1890ff" }} /> ID học sinh
        </Space>
      ),
      dataIndex: "student_code",
      key: "student_code",
      sorter: (a, b) => a.student_code.localeCompare(b.student_code),
      width: 120,
      align: "center",
    },
    {
      title: (
        <Space style={fontFamily}>
          <UserOutlined style={{ color: "#52c41a" }} /> Họ và tên
        </Space>
      ),
      dataIndex: "student_name",
      key: "student_name",
      sorter: (a, b) => a.full_name.localeCompare(b.full_name),
      width: 200,
      align: "center",
      render: (text, record) => (
        <div className="flex justify-center items-center gap-2">
          <Avatar src={record.avatar_url} icon={<UserOutlined />} />
          {text}
        </div>
      ),
    },
    {
      title: (
        <Space style={fontFamily}>
          <TeamOutlined style={{ color: "#faad14" }} /> Lớp
        </Space>
      ),
      dataIndex: "class_name",
      key: "class_name",
      sorter: (a, b) => a.class_name.localeCompare(b.class_name),
      width: 100,
      align: "center",
    },
    {
      title: (
        <Space style={fontFamily}>
          <CalendarOutlined style={{ color: "#eb2f96" }} /> Tuổi
        </Space>
      ),
      dataIndex: "student_date_of_birth",
      key: "age",
      align: "center",
      render: (dob) =>
        dob ? differenceInYears(new Date(), parseISO(dob)) : "N/A",
      sorter: (a, b) => {
        const ageA = a.date_of_birth
          ? differenceInYears(new Date(), parseISO(a.date_of_birth))
          : 0;
        const ageB = b.date_of_birth
          ? differenceInYears(new Date(), parseISO(b.date_of_birth))
          : 0;
        return ageA - ageB;
      },
      width: 80,
    },
    {
      title: (
        <Space style={fontFamily}>
          <SolutionOutlined style={{ color: "#1890ff" }} /> Tình trạng sức khỏe
        </Space>
      ),
      dataIndex: "medical_conditions",
      key: "medical_conditions",
      align: "center",
      render: (conditions) =>
        conditions && conditions.length > 0 ? (
          <div className="flex justify-center flex-wrap gap-1">
            {conditions.map((tag) => (
              <Tag color="volcano" key={tag} style={fontFamily}>
                {tag.toUpperCase()}
              </Tag>
            ))}
          </div>
        ) : (
          <Tag color="green" style={fontFamily}>Khỏe mạnh</Tag>
        ),
      width: 250,
    },
    {
      title: (
        <Space style={fontFamily}>
          <EditOutlined style={{ color: "#8c8c8c" }} /> Hành động
        </Space>
      ),
      key: "actions",
      align: "center",
      width: 150,
      render: (_, record) => (
        <div className="flex justify-center items-center gap-2">
          <Tooltip title="Xem chi tiết hồ sơ sức khỏe học sinh">
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/nurse/students-record/${record.student_id}`)}
              className="hover:shadow-lg hover:scale-105 transition-all duration-200 !rounded-full"
            />
          </Tooltip>
        </div>
      ),
    },
  ], [navigate]);

  return (
    <div
      className="min-h-screen p-6 bg-fixed"
      style={{
        background: "#E0F0FF",
        fontFamily: "Poppins, Roboto, sans-serif",
        minHeight: "100vh",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <header
          className="mb-5 p-4 flex items-center justify-between"
          style={{
            borderRadius: 24,
            background: "#fff",
            boxShadow: "8px 8px 24px #e0f0ff, -8px -8px 24px #fff",
            border: "1.5px solid #e0f0ff",
          }}
        >
          <div className="flex items-center gap-3">
            <div style={{ ...statIconStyle, fontSize: 36, background: '#E0F0FF', color: '#007BFF' }}>
              <SmileOutlined />
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-3xl mb-2" style={fontFamily}>
                Hồ sơ sức khỏe học sinh
              </h1>
              <p className="text-gray-500 flex items-center gap-2 text-sm" style={fontFamily}>
                <span>✨</span> Quản lý và xem thông tin sức khỏe của học sinh
              </p>
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showAddEditModal()}
            className="flex items-center gap-1 px-4 py-2 !rounded-lg !bg-blue-600 hover:!bg-blue-700 hover:shadow-lg hover:scale-105 transition-all duration-200"
            style={fontFamily}
          >
            Thêm học sinh
          </Button>
        </header>
        <Divider style={{ borderColor: '#e0f0ff', margin: '24px 0' }} />
        <Card className="!rounded-lg !shadow-md" style={cardNeumorph} bodyStyle={{ padding: 24 }}>
          {loading && !healthRecords.length ? (
            <RenderLoadingState />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <Input
                  placeholder="Tìm kiếm theo ID, tên hoặc lớp"
                  prefix={<SearchOutlined className="text-gray-400" />}
                  className="flex-grow max-w-sm rounded-lg h-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onPressEnter={(e) => handleSearch(e.target.value)}
                  onBlur={(e) => handleSearch(e.target.value)}
                
                />
                <Button icon={<FilterOutlined />} className="" style={{ }}>
                </Button>
              </div>
              <Table
                columns={columns}
                dataSource={paginatedHealthRecords}
                rowKey="student_id"
                pagination={{
                  ...pagination,
                  showSizeChanger: true,
                  showTotal: (total, range) =>
                    `Hiển thị ${range[0]}-${range[1]} của ${total} học sinh`,
                }}
                onChange={handleTableChange}
                locale={{
                  emptyText: (
                    <Empty
                      description="Không tìm thấy hồ sơ học sinh nào"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ),
                }}
                className="rounded-lg"
                style={{
                  borderRadius: 16,
                  boxShadow: "0 2px 8px #e0f0ff",
                  fontFamily: 'Poppins, Roboto, sans-serif',
                  background: '#fff',
                }}
              />
            </>
          )}
        </Card>
        {/* Modal giữ nguyên, không chỉnh sửa */}
        <Modal
          title={
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Poppins, Roboto, sans-serif' }}>
              <span role="img" aria-label="student">🧒</span>
              {editingStudent ? "Chỉnh sửa hồ sơ học sinh" : "Thêm học sinh mới"}
            </span>
          }
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText={editingStudent ? "Cập nhật" : "Thêm"}
          confirmLoading={loading}
        >
          <Form form={form} layout="vertical" name="student_form">
            <Form.Item
              name="student_code"
              label={<span><span role="img" aria-label="id">🆔</span> Mã học sinh</span>}
              rules={[
                { required: true, message: "Vui lòng nhập Mã học sinh!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="full_name"
              label={<span><span role="img" aria-label="student">🧒</span> Họ và tên học sinh</span>}
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập Họ và tên học sinh!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="class_name"
              label={<span><span role="img" aria-label="class">🏫</span> Lớp</span>}
              rules={[{ required: true, message: "Vui lòng nhập Lớp!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="date_of_birth"
              label={<span><span role="img" aria-label="birthday">🎂</span> Ngày sinh</span>}
              rules={[{ required: true, message: "Vui lòng chọn Ngày sinh!" }]}
            >
              <Input type="date" />
            </Form.Item>
            <Form.Item
              name="medical_conditions"
              label={<span><span role="img" aria-label="medicine">💊</span> Tình trạng sức khỏe (ví dụ: Dị ứng, Hen suyễn)</span>}
            >
              <Select
                mode="tags"
                style={{ width: "100%" }}
                placeholder="Thêm tình trạng sức khỏe"
              />
            </Form.Item>
            <Form.Item name="last_visit_date" label="Ngày khám cuối cùng">
              <Form.Item
                name="last_visit_date"
                label={<span><span role="img" aria-label="visit">📅</span> Ngày khám cuối cùng</span>}
              >
                <Input type="date" />
              </Form.Item>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
