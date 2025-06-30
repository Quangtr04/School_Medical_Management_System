// src/pages/NursePage/VaccinationsPage.jsx

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
  DatePicker,
  List, // Thêm List cho phần sắp tới
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  RightOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import {
  FiFeather, // Biểu tượng tiêu đề cho Tiêm chủng (hoặc FiShield, FiHeartbeat cho khám sức khỏe)
  FiPlusCircle, // Biểu tượng nút Lịch trình mới
  FiCalendar, // Biểu tượng cho Tiêm chủng/Khám sức khỏe sắp tới
  FiUser, // Biểu tượng học sinh trong danh sách
  FiHeart, // Biểu tượng cho khám sức khỏe
} from "react-icons/fi";
import { format, parseISO } from "date-fns";
import api from "../../configs/config-axios";
import moment from "moment"; // Cần moment cho DatePicker

const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function Vaccination() {
  const [loading, setLoading] = useState(true);
  const [vaccinations, setVaccinations] = useState([]); // Dữ liệu cho bảng chính
  const [upcomingVaccinations, setUpcomingVaccinations] = useState([]); // Tiêm chủng sắp tới
  const [upcomingCheckups, setUpcomingCheckups] = useState([]); // Khám sức khỏe sắp tới
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [vaccineFilter, setVaccineFilter] = useState(null); // Bộ lọc cho bảng chính
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false); // Modal cho Lịch trình mới
  const [isUpdateStatusModalVisible, setIsUpdateStatusModalVisible] =
    useState(false); // Modal cho Cập nhật trạng thái
  const [currentStudentVaccination, setCurrentStudentVaccination] =
    useState(null); // Học sinh được chọn để cập nhật trạng thái
  const [scheduleForm] = Form.useForm();
  const [updateStatusForm] = Form.useForm();

  // Danh sách giả lập các loại vắc xin và loại khám sức khỏe có sẵn cho dropdown
  const availableVaccines = [
    { id: "influenza", name: "Cúm" },
    { id: "hepatitisB", name: "Viêm gan B" },
    { id: "mmr", name: "Sởi, quai bị, rubella (MMR)" },
    // Thêm khi cần
  ];
  const availableCheckupTypes = [
    { id: "annual", name: "Khám tổng quát hàng năm" },
    { id: "dental", name: "Kiểm tra răng miệng" },
    { id: "vision", name: "Kiểm tra thị lực" },
  ];

  const fetchUpcomingSchedules = useCallback(async () => {
    try {
      // Giả lập dữ liệu cho Tiêm chủng sắp tới
      const vacRes = await api.get("/api/nurse/upcoming-vaccinations-summary");
      setUpcomingVaccinations(vacRes.data.data);

      // Giả lập dữ liệu cho Khám sức khỏe sắp tới
      const checkupRes = await api.get("/api/nurse/upcoming-checkups-summary");
      setUpcomingCheckups(checkupRes.data.data);
    } catch (error) {
      console.error("Lỗi khi tải lịch trình sắp tới:", error);
      message.error("Không thể tải lịch trình sắp tới.");
    }
  }, []);

  const fetchVaccinations = useCallback(async () => {
    setLoading(false);
    try {
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchQuery,
        vaccineType: vaccineFilter,
      };
      // Giả lập dữ liệu cho bảng chính
      const res = await api.get("/api/nurse/student-vaccination-status", {
        params,
      });
      setVaccinations(res.data.data.records);
      setPagination((prev) => ({
        ...prev,
        total: res.data.data.total,
      }));
      message.success("Đã tải dữ liệu tiêm chủng học sinh!");
    } catch (error) {
      console.error("Lỗi khi tải tiêm chủng học sinh:", error);
      message.error("Không thể tải dữ liệu tiêm chủng học sinh.");
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchQuery, vaccineFilter]);

  useEffect(() => {
    fetchUpcomingSchedules();
    fetchVaccinations();
  }, [fetchUpcomingSchedules, fetchVaccinations]);

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

  const handleVaccineFilterChange = (value) => {
    setVaccineFilter(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // --- Logic Modal Lịch trình mới ---
  const showNewScheduleModal = () => {
    scheduleForm.resetFields();
    setIsScheduleModalVisible(true);
  };

  const handleNewScheduleModalOk = async () => {
    try {
      const values = await scheduleForm.validateFields();
      setLoading(true);

      const payload = {
        ...values,
        scheduleType: values.scheduleType, // 'vaccination' hoặc 'checkup'
        scheduledDate: values.scheduledDate
          ? values.scheduledDate.format("YYYY-MM-DD")
          : null,
        // Có thể cần thêm fields như 'vaccineType', 'checkupType', 'targetClass', 'numberOfStudents'
        // Tùy thuộc vào cách backend xử lý
      };

      await api.post("/api/nurse/schedules", payload); // Giả định endpoint
      message.success("Đã tạo lịch trình mới thành công!");
      setIsScheduleModalVisible(false);
      fetchUpcomingSchedules(); // Làm mới danh sách sắp tới
    } catch (error) {
      console.error("Không thể tạo lịch trình mới:", error);
      message.error("Không thể tạo lịch trình mới.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewScheduleModalCancel = () => {
    setIsScheduleModalVisible(false);
    scheduleForm.resetFields();
  };

  // --- Logic Modal Cập nhật trạng thái tiêm chủng ---
  const showUpdateStatusModal = (studentRecord) => {
    setCurrentStudentVaccination(studentRecord);
    updateStatusForm.resetFields();
    // Điền trước form với dữ liệu hiện có (ví dụ: ngày tiêm chủng hiện tại)
    const initialValues = {};
    availableVaccines.forEach((vaccine) => {
      if (
        studentRecord[vaccine.id] &&
        studentRecord[vaccine.id] !== "Not vaccinated"
      ) {
        initialValues[vaccine.id] = moment(studentRecord[vaccine.id]);
      }
    });
    updateStatusForm.setFieldsValue(initialValues);
    setIsUpdateStatusModalVisible(true);
  };

  const handleUpdateStatusModalOk = async () => {
    try {
      const values = await updateStatusForm.validateFields();
      setLoading(true);

      const updatedVaccinations = {};
      availableVaccines.forEach((vaccine) => {
        updatedVaccinations[vaccine.id] = values[vaccine.id]
          ? values[vaccine.id].format("YYYY-MM-DD")
          : "Not vaccinated";
      });

      const payload = {
        studentId: currentStudentVaccination.studentId,
        vaccinations: updatedVaccinations,
        // Có thể thêm lý do cập nhật, người cập nhật...
      };

      await api.put(
        `/api/nurse/student-vaccination-status/${currentStudentVaccination.id}`,
        payload
      ); // Giả định endpoint
      message.success("Đã cập nhật trạng thái tiêm chủng thành công!");
      setIsUpdateStatusModalVisible(false);
      fetchVaccinations(); // Làm mới bảng chính
    } catch (error) {
      console.error("Không thể cập nhật trạng thái tiêm chủng:", error);
      message.error("Không thể cập nhật trạng thái tiêm chủng.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatusModalCancel = () => {
    setIsUpdateStatusModalVisible(false);
    setCurrentStudentVaccination(null);
    updateStatusForm.resetFields();
  };

  const getVaccineStatusRender = (status) => {
    if (status && status !== "Not vaccinated") {
      return (
        <span className="flex items-center gap-1 text-green-600 font-medium">
          <CheckCircleOutlined /> {status}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-red-600 font-medium">
        <CloseCircleOutlined /> Chưa tiêm chủng
      </span>
    );
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
      title: "Tên",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: "Lớp",
      dataIndex: "class",
      key: "class",
      sorter: (a, b) => a.class.localeCompare(b.class),
      className: "!font-semibold !text-gray-700",
    },
    // Thêm động các cột cho từng loại vắc xin
    ...availableVaccines.map((vaccine) => ({
      title: vaccine.name,
      dataIndex: vaccine.id,
      key: vaccine.id,
      render: (status) => getVaccineStatusRender(status),
      sorter: (a, b) => {
        const statusA =
          a[vaccine.id] === "Not vaccinated" ? "Z" : a[vaccine.id];
        const statusB =
          b[vaccine.id] === "Not vaccinated" ? "Z" : b[vaccine.id];
        return statusA.localeCompare(statusB);
      },
      className: "!font-semibold !text-gray-700",
    })),
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Button type="link" onClick={() => showUpdateStatusModal(record)}>
          Cập nhật
        </Button>
      ),
      className: "!font-semibold !text-gray-700",
    },
  ];

  const renderLoadingState = () => (
    <div className="text-center py-8 flex flex-col items-center justify-center gap-4">
      <Spin indicator={<LoadingOutlined style={{ fontSize: 30 }} spin />} />
      <p className="text-gray-500 text-lg">Đang tải dữ liệu tiêm chủng...</p>
    </div>
  );

  return (
    <div
      className={`min-h-screen bg-white p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCcgdmlld0JveD0nMCAwIDQwIDQwJz48ZyBmaWxsPSdyZ2JhKDEzLDExMCwyNTMsMC4xKScgZmlsbC1ydWxlPSdldmVub2RkJz48Y2lyY2xlIGN4PScyMCcgY3k9JzIwJyByPScyJy8+PC9zdmc+')] bg-fixed`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Phần tiêu đề */}
        <header
          className={`mb-5 p-4 rounded-lg bg-green-600/[.10] to-transparent flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-3 bg-green-600/[.10] rounded-full border border-green-600`}
            >
              <FiFeather className={`w-10 h-10 text-3xl text-green-600`} />{" "}
              {/* Đổi biểu tượng thành FiFeather cho chủ đề y tế, hoặc FiShield */}
            </div>
            <div>
              <h1 className={`text-gray-900 font-semibold text-3xl mb-2`}>
                Tiêm chủng & Khám sức khỏe
              </h1>
              <p className={`text-gray-500 flex items-center gap-2 text-sm`}>
                <span>✨</span>
                Quản lý lịch tiêm chủng và khám sức khỏe
              </p>
            </div>
          </div>
          <Button
            type="primary"
            icon={<FiPlusCircle />}
            onClick={showNewScheduleModal}
            className="flex items-center gap-1 px-4 py-2 !rounded-lg !bg-blue-600 hover:!bg-blue-700 !transition-colors"
          >
            Lịch trình mới
          </Button>
        </header>

        {loading ? (
          renderLoadingState()
        ) : (
          <>
            {/* Phần Lịch trình sắp tới */}
            <Row gutter={[16, 16]} className="mb-6">
              {/* Tiêm chủng sắp tới */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <span className="flex items-center gap-2 text-gray-800 font-semibold">
                      <FiCalendar className="text-blue-600" /> Tiêm chủng sắp
                      tới
                    </span>
                  }
                  className="!rounded-lg !shadow-md !border !border-gray-200"
                >
                  {upcomingVaccinations.length > 0 ? (
                    <List
                      itemLayout="horizontal"
                      dataSource={upcomingVaccinations}
                      renderItem={(item) => (
                        <List.Item
                          actions={[
                            <Button type="link" key="view-details">
                              Xem chi tiết
                            </Button>,
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <div className="p-2 rounded-lg bg-blue-100">
                                <FiFeather className="text-blue-600 text-xl" />
                              </div>
                            }
                            title={
                              <Text strong className="text-gray-900">
                                {item.type}
                              </Text>
                            }
                            description={
                              <div className="text-gray-600">
                                <p>
                                  Lớp {item.grade}, {item.class}
                                </p>
                                <p>{item.students} Học sinh</p>
                              </div>
                            }
                          />
                          <div className="text-right">
                            <Text className="text-blue-600 font-semibold">
                              {item.dueDate
                                ? format(parseISO(item.dueDate), "dd MMM, yyyy")
                                : "N/A"}
                            </Text>
                          </div>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty
                      description="Không có lịch tiêm chủng sắp tới"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                  <div className="text-center mt-4">
                    <Button type="link" className="!text-blue-600">
                      Xem tất cả lịch trình <RightOutlined />
                    </Button>
                  </div>
                </Card>
              </Col>

              {/* Khám sức khỏe sắp tới */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <span className="flex items-center gap-2 text-gray-800 font-semibold">
                      <FiCalendar className="text-green-600" /> Khám sức khỏe
                      sắp tới
                    </span>
                  }
                  className="!rounded-lg !shadow-md !border !border-gray-200"
                >
                  {upcomingCheckups.length > 0 ? (
                    <List
                      itemLayout="horizontal"
                      dataSource={upcomingCheckups}
                      renderItem={(item) => (
                        <List.Item
                          actions={[
                            <Button type="link" key="view-details">
                              Xem chi tiết
                            </Button>,
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <div className="p-2 rounded-lg bg-green-100">
                                <FiHeart className="text-green-600 text-xl" />
                              </div>
                            }
                            title={
                              <Text strong className="text-gray-900">
                                {item.type}
                              </Text>
                            }
                            description={
                              <div className="text-gray-600">
                                <p>
                                  Lớp {item.grade}, {item.class}
                                </p>
                                <p>{item.students} Học sinh</p>
                              </div>
                            }
                          />
                          <div className="text-right">
                            <Text className="text-green-600 font-semibold">
                              {item.dueDate
                                ? format(parseISO(item.dueDate), "dd MMM, yyyy")
                                : "N/A"}
                            </Text>
                          </div>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty
                      description="Không có lịch khám sức khỏe sắp tới"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                  <div className="text-center mt-4">
                    <Button type="link" className="!text-green-600">
                      Xem tất cả lịch khám <RightOutlined />
                    </Button>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Bộ lọc và tìm kiếm cho Bảng chính */}
            <Card className="mb-6 !rounded-lg !shadow-md !border !border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <Input
                  placeholder="Tìm kiếm học sinh..."
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
                  placeholder="Tất cả vắc xin"
                  onChange={handleVaccineFilterChange}
                  allowClear
                  className="w-40 rounded-lg h-10"
                  options={availableVaccines.map((v) => ({
                    value: v.id,
                    label: v.name,
                  }))}
                />
              </div>
            </Card>

            {/* Bảng Trạng thái tiêm chủng của học sinh */}
            <Card className="!rounded-lg !shadow-md !border !border-gray-200">
              <Table
                columns={columns}
                dataSource={vaccinations}
                rowKey="id"
                pagination={{
                  ...pagination,
                  showSizeChanger: true,
                  showTotal: (total, range) =>
                    `Hiển thị ${range[0]}-${range[1]} trên tổng số ${total} học sinh`,
                  className: "ant-pagination-custom",
                }}
                onChange={handleTableChange}
                className="custom-table"
                locale={{
                  emptyText: (
                    <Empty
                      description="Không tìm thấy dữ liệu tiêm chủng học sinh nào"
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
                trên tổng số {pagination.total} học sinh
              </div>
            </Card>
          </>
        )}

        {/* Modal Lịch trình mới */}
        <Modal
          title="Tạo lịch trình mới"
          visible={isScheduleModalVisible}
          onOk={handleNewScheduleModalOk}
          onCancel={handleNewScheduleModalCancel}
          okText="Tạo lịch trình"
          confirmLoading={loading}
        >
          <Form form={scheduleForm} layout="vertical" name="new_schedule_form">
            <Form.Item
              name="scheduleType"
              label="Loại lịch trình"
              rules={[
                { required: true, message: "Vui lòng chọn loại lịch trình!" },
              ]}
            >
              <Select placeholder="Chọn một loại">
                <Option value="vaccination">Tiêm chủng</Option>
                <Option value="checkup">Khám sức khỏe</Option>
              </Select>
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.scheduleType !== currentValues.scheduleType
              }
            >
              {({ getFieldValue }) =>
                getFieldValue("scheduleType") === "vaccination" && (
                  <Form.Item
                    name="vaccineType"
                    label="Loại vắc xin"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn loại vắc xin!",
                      },
                    ]}
                  >
                    <Select placeholder="Chọn một loại vắc xin">
                      {availableVaccines.map((v) => (
                        <Option key={v.id} value={v.name}>
                          {v.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                )
              }
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.scheduleType !== currentValues.scheduleType
              }
            >
              {({ getFieldValue }) =>
                getFieldValue("scheduleType") === "checkup" && (
                  <Form.Item
                    name="checkupType"
                    label="Loại khám sức khỏe"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn loại khám sức khỏe!",
                      },
                    ]}
                  >
                    <Select placeholder="Chọn một loại khám sức khỏe">
                      {availableCheckupTypes.map((c) => (
                        <Option key={c.id} value={c.name}>
                          {c.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                )
              }
            </Form.Item>
            <Form.Item
              name="targetClass"
              label="Lớp/Khối mục tiêu"
              rules={[
                { required: true, message: "Vui lòng nhập lớp/khối mục tiêu!" },
              ]}
            >
              <Input placeholder="Ví dụ: Lớp 1A, Khối 2, Tất cả" />
            </Form.Item>
            <Form.Item
              name="scheduledDate"
              label="Ngày dự kiến"
              rules={[
                { required: true, message: "Vui lòng chọn ngày dự kiến!" },
              ]}
            >
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item name="description" label="Mô tả (Tùy chọn)">
              <Input.TextArea rows={2} />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal Cập nhật trạng thái tiêm chủng */}
        <Modal
          title={`Cập nhật trạng thái tiêm chủng cho ${currentStudentVaccination?.name}`}
          visible={isUpdateStatusModalVisible}
          onOk={handleUpdateStatusModalOk}
          onCancel={handleUpdateStatusModalCancel}
          okText="Cập nhật trạng thái"
          confirmLoading={loading}
        >
          <Form
            form={updateStatusForm}
            layout="vertical"
            name="update_status_form"
          >
            <Form.Item label="Mã học sinh">
              <Input value={currentStudentVaccination?.studentId} disabled />
            </Form.Item>
            <Form.Item label="Tên học sinh">
              <Input value={currentStudentVaccination?.name} disabled />
            </Form.Item>
            <Form.Item label="Lớp">
              <Input value={currentStudentVaccination?.class} disabled />
            </Form.Item>

            <Typography.Title level={5} className="mt-4 mb-2">
              Ngày tiêm chủng
            </Typography.Title>
            {availableVaccines.map((vaccine) => (
              <Form.Item
                key={vaccine.id}
                name={vaccine.id}
                label={vaccine.name}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="YYYY-MM-DD"
                  allowClear
                />
              </Form.Item>
            ))}
            <Text type="secondary" className="text-sm">
              Để trống nếu chưa tiêm chủng.
            </Text>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
