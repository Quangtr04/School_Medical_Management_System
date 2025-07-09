/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Card,
  Modal,
  Form,
  DatePicker,
  Select,
  Tooltip,
  message,
  Tag,
  Empty,
  Spin,
  Row,
  Col,
  List,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  // FilterOutlined, // Không cần thiết nếu bạn dùng Select thay cho nút lọc tĩnh
  EyeOutlined,
  LoadingOutlined,
  // === Các Icon Mới Thêm Vào ===
  IdcardOutlined, // For ID
  FileTextOutlined, // For Tiêu đề (Title) and Mô tả (Description)
  CalendarOutlined, // For Ngày khám (Scheduled Date) and Ngày tạo (Created At)
  CheckCircleOutlined, // For Trạng thái (Status)
  DollarCircleOutlined, // For Nhà tài trợ (Sponsor)
  SettingOutlined, // For Hành động (Actions)
  UserOutlined,
  ManOutlined,
  WomanOutlined,
  TeamOutlined,
  RightOutlined,
} from "@ant-design/icons";
import moment from "moment";
import {
  format,
  parseISO,
  isWithinInterval,
  addDays,
  startOfDay,
} from "date-fns";
import { FiCalendar, FiFeather, FiFilePlus, FiUserCheck } from "react-icons/fi";
import { toast } from "react-toastify";

import { useDispatch, useSelector } from "react-redux";
import {
  createHealthExaminationSchedule,
  fetchAllHealthExaminations,
  updateHealthExaminationSchedule,
  deleteHealthExaminationSchedule,
  clearHealthExaminationsError,
  clearHealthExaminationsSuccess,
  fetchHealthExaminationById,
} from "../../redux/nurse/heathExaminations/heathExamination"; // <-- ĐÃ SỬA LỖI CHÍNH TẢ Ở ĐÂY
import { Typography } from "antd";
import { differenceInCalendarDays } from "date-fns";

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

export default function Examination() {
  const dispatch = useDispatch();
  const examinations = useSelector((state) => state.examination.records);
  const loading = useSelector((state) => state.examination.loading);
  const error = useSelector((state) => state.examination.error);
  const success = useSelector((state) => state.examination.success);

  const upcomingExaminations = useMemo(() => {
    const today = startOfDay(new Date());

    return examinations.filter((item) => {
      if (!item || !item.scheduled_date || item.approval_status !== "APPROVED")
        return false;

      const parsedDate = parseISO(item.scheduled_date);
      return isWithinInterval(parsedDate, {
        start: today,
        end: addDays(today, 7),
      });
    });
  }, [examinations]);

  const [isStudentListModalVisible, setIsStudentListModalVisible] =
    useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentExamination, setCurrentExamination] = useState(null);
  const [form] = Form.useForm();

  const [approvedStudent, setApprovedStudents] = useState(null);

  const classOptions = [1, 2, 3, 4, 5].map((classNumber) => ({
    label: `Lớp ${classNumber}`,
    value: classNumber,
  }));

  const fetchExaminations = useCallback(async () => {
    const resultAction = await dispatch(
      fetchAllHealthExaminations({
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchQuery,
        class: classFilter, // Tham số lọc theo lớp
        status: statusFilter, // Tham số lọc theo trạng thái
      })
    );
    if (fetchAllHealthExaminations.fulfilled.match(resultAction)) {
      setPagination((prev) => ({
        ...prev,
        total: resultAction.payload.total || prev.total,
      }));
    }
  }, [
    dispatch,
    pagination.current,
    pagination.pageSize,
    searchQuery,
    classFilter, // Dependency cho classFilter
    statusFilter, // Dependency cho statusFilter
  ]);

  useEffect(() => {
    fetchExaminations();
  }, [fetchExaminations]);

  useEffect(() => {
    console.log("Examinations loaded:", examinations);
  }, [examinations]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearHealthExaminationsError());
    }
    if (success) {
      dispatch(clearHealthExaminationsSuccess());
      fetchExaminations(); // Re-fetch data after a successful operation
    }
  }, [error, success, dispatch, fetchExaminations]); // Added fetchExaminations to dependencies

  const handleTableChange = (newPagination) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPagination((prev) => ({ ...prev, current: 1 })); // Reset về trang 1 khi tìm kiếm
  };

  // Hàm xử lý khi thay đổi filter trạng thái
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, current: 1 })); // Reset về trang 1 khi lọc
  };

  const showModal = (record = null) => {
    setCurrentExamination(record);
    console.log(record);

    if (record) {
      form.setFieldsValue({
        title: record.title,
        description: record.description,
        // Đảm bảo date được chuyển đổi đúng định dạng moment
        scheduled_date: record?.scheduled_date
          ? moment(record?.scheduled_date)
          : null,
        sponsor: record?.sponsor,
        className: record?.className, // Đảm bảo trường này khớp với API
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleFormSubmit = async (values) => {
    console.log(values);

    try {
      const formattedValues = {
        ...values,
        // Định dạng ngày tháng về YYYY-MM-DD trước khi gửi đi
        scheduled_date: values.scheduled_date
          ? values.scheduled_date.format("YYYY-MM-DD")
          : null,
      };

      if (currentExamination) {
        await dispatch(
          updateHealthExaminationSchedule({
            id: currentExamination.id,
            scheduleData: formattedValues,
          })
        ).unwrap();
        // message.success("Cập nhật đơn khám sức khỏe thành công!"); // Message handled by useEffect
      } else {
        await dispatch(
          createHealthExaminationSchedule(formattedValues)
        ).unwrap();
        // toast.success("Tạo đơn khám sức khỏe thành công!"); // Message handled by useEffect
      }
      setIsModalVisible(false);
      toast.success("Tạo lịch khám sức khỏe thành công");
      // fetchExaminations(); // Re-fetch is already triggered by success useEffect
    } catch (error) {
      toast.error(error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentExamination(null);
    form.resetFields();
  };

  const columns = [
    {
      title: (
        <Space>
          <IdcardOutlined style={{ color: "#1890ff" }} /> {/* Blue */}
          ID
        </Space>
      ),
      dataIndex: "checkup_id",
      key: "checkup_id",
      sorter: (a, b) => (a.checkup_id || "").localeCompare(b.checkup_id || ""),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: (
        <Space>
          <FileTextOutlined style={{ color: "#52c41a" }} /> {/* Green */}
          Tiêu đề
        </Space>
      ),
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => (a.title || "").localeCompare(b.title || ""),
      className: "!font-semibold !text-gray-700",
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
      className: "!font-semibold !text-gray-700",
      render: (text) => (
        <Tooltip title={text}>
          <div
            style={{
              maxWidth: "200px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {text}
          </div>
        </Tooltip>
      ),
    },
    {
      title: (
        <Space>
          <CalendarOutlined style={{ color: "#eb2f96" }} /> {/* Magenta */}
          Ngày khám
        </Space>
      ),
      dataIndex: "scheduled_date",
      key: "scheduled_date",
      render: (date) => (date ? format(parseISO(date), "yyyy-MM-dd") : "N/A"),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: (
        <Space>
          <CalendarOutlined style={{ color: "#722ed1" }} /> {/* Purple */}
          Ngày tạo
        </Space>
      ),
      dataIndex: "created_at",
      key: "created_at",
      className: "!font-semibold !text-gray-700",
      render: (created_at) =>
        created_at ? format(parseISO(created_at), "yyyy-MM-dd") : "N/A",
    },
    {
      title: (
        <Space>
          <CheckCircleOutlined style={{ color: "#08979c" }} /> {/* Cyan */}
          Trạng thái
        </Space>
      ),
      dataIndex: "approval_status",
      key: "approval_status",
      className: "!font-semibold !text-gray-700",
      render: (status) => {
        let color = "blue";
        if (status === "APPROVED") {
          color = "green";
        } else if (status === "PENDING") {
          color = "gold";
        } else if (status === "DECLINED") {
          color = "red";
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: (
        <Space>
          <DollarCircleOutlined style={{ color: "#d43808" }} />{" "}
          {/* Red-orange */}
          Nhà tài trợ
        </Space>
      ),
      dataIndex: "sponsor",
      key: "sponsor",
      className: "!font-semibold !text-gray-700",
    },
    {
      title: (
        <Space>
          <SettingOutlined style={{ color: "#bfbfbf" }} /> {/* Grey */}
          Hành động
        </Space>
      ),
      key: "actions",
      align: "center", // Căn giữa nội dung cột
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem danh sách học sinh">
            <Button
              icon={<EyeOutlined />}
              onClick={async () => {
                if (record.approval_status === "APPROVED") {
                  console.log(record.checkup_id);

                  try {
                    const result = await dispatch(
                      fetchHealthExaminationById(record.checkup_id) // truyền campaignId
                    ).unwrap();

                    setApprovedStudents(result); // dùng nếu cần thông tin khác
                    setIsStudentListModalVisible(true); // mở modal

                    // lưu danh sách học sinh theo lịch tiêm cụ thể
                  } catch (err) {
                    message.error(err || "Tải danh sách thất bại.");
                  }
                } else {
                  message.warning("Lịch trình này chưa được duyệt.");
                }
              }}
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
      <p className="text-gray-500 text-lg">
        Đang tải danh sách đơn khám sức khỏe...
      </p>
    </div>
  );

  return (
    <div
      className={`min-h-screen bg-white p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCcgdmlld0JveD0nMCAwIDQwIDQwJz48ZyBmaWxsPSdyZ2JhKDEzLDExMCwyNTMsMC4xKScgZmlsbC1ydWxlPSdldmVub2RkJz48Y2lyY2xlIGN4PScyMCcgY3k9JzIwJyByPScyJy8+PC9nPg==')] bg-fixed`}
    >
      <div className="max-w-7xl mx-auto">
        <header
          className={`mb-5 p-4 rounded-lg bg-blue-500/[.10] to-transparent flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-3 bg-blue-500/[.10] rounded-full border border-blue-500`}
            >
              <FiFilePlus className={`w-10 h-10 text-3xl text-blue-600`} />
            </div>
            <div>
              <h1 className={`text-gray-900 font-bold text-3xl mb-2`}>
                Đơn khám sức khỏe
              </h1>
              <p className={`text-gray-500 flex items-center gap-2 text-sm`}>
                <span>📝</span>
                Quản lý các đợt khám sức khỏe định kỳ của học sinh
              </p>
            </div>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
              className="flex items-center gap-1 px-4 py-2 !rounded-lg !bg-blue-500 hover:!bg-blue-600 !transition-colors"
            >
              Tạo đơn khám sức khỏe định kỳ
            </Button>
          </Space>
        </header>

        {loading && upcomingExaminations.length === 0 ? (
          renderLoadingState()
        ) : (
          <>
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} lg={24}>
                <Card
                  title={
                    <div className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2 text-gray-800 font-medium">
                        <FiCalendar className="text-green-600" />
                        Khám sức khỏe sắp tới
                      </span>
                    </div>
                  }
                  className="!rounded-lg !shadow-md !border !border-gray-200 mt-4"
                >
                  {upcomingExaminations.length > 0 ? (
                    <List
                      itemLayout="horizontal"
                      dataSource={upcomingExaminations}
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
                                <FiUserCheck className="text-green-600 text-xl" />
                              </div>
                            }
                            title={
                              <Text strong className="text-gray-900">
                                {item.title}
                              </Text>
                            }
                            description={
                              <div className="text-gray-600">
                                <p>
                                  Ngày khám:{" "}
                                  <Text className="font-semibold text-green-600">
                                    {item.scheduled_date
                                      ? `${format(
                                          parseISO(item.scheduled_date),
                                          "dd/MM/yyyy"
                                        )} (${differenceInCalendarDays(
                                          parseISO(item.scheduled_date),
                                          new Date()
                                        )} ngày nữa)`
                                      : "N/A"}
                                  </Text>
                                </p>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty
                      description="Không có lịch khám sức khỏe sắp tới"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                </Card>
              </Col>
            </Row>

            <Card className="!rounded-lg !shadow-md !border !border-gray-200">
              <div className="flex flex-wrap items-center gap-4  mb-6">
                <Input
                  placeholder="Tìm kiếm đơn khám (Tiêu đề, Mô tả...)"
                  prefix={<SearchOutlined className="text-gray-400" />}
                  className="flex-grow max-w-sm rounded-lg h-10"
                  onPressEnter={(e) => handleSearch(e.target.value)}
                  onBlur={(e) => handleSearch(e.target.value)}
                />
                {/* Select cho trạng thái */}
                <Select
                  placeholder="Lọc theo trạng thái"
                  onChange={handleStatusFilterChange}
                  allowClear
                  className="w-40 rounded-lg h-10"
                  value={statusFilter} // Đảm bảo hiển thị giá trị đã chọn
                >
                  <Option value="PENDING">Đang chờ</Option>
                  <Option value="APPROVED">Đã duyệt</Option>
                  <Option value="DECLINED">Đã từ chối</Option>
                </Select>
                {/* Select cho lớp áp dụng */}
              </div>
              <Table
                columns={columns}
                dataSource={examinations}
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
                loading={loading}
                locale={{
                  emptyText: (
                    <Empty
                      description="Không tìm thấy đơn khám sức khỏe nào"
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

        {/* Modal tạo lịch khám sức khỏe */}
        <Modal
          title={
            currentExamination
              ? "Chỉnh sửa đơn khám sức khỏe"
              : "Tạo đơn khám sức khỏe định kỳ mới"
          }
          open={isModalVisible}
          onCancel={handleCancel}
          okText={currentExamination ? "Cập nhật" : "Tạo mới"}
          confirmLoading={loading}
          width={600}
          footer={null}
        >
          <Form
            onFinish={handleFormSubmit}
            form={form}
            layout="vertical"
            name="health_campaign_form"
          >
            <Form.Item
              name="title"
              label="Tiêu đề đơn khám"
              rules={[{ required: true, message: "Vui lòng nhập Tiêu đề!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
            >
              <TextArea rows={3} />
            </Form.Item>

            <Form.Item
              name="scheduled_date"
              label="Ngày lên lịch khám"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn Ngày lên lịch khám!",
                },
              ]}
            >
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>

            <Form.Item
              name="sponsor"
              label="Nhà tài trợ"
              rules={[
                { required: true, message: "Vui lòng nhập Nhà tài trợ!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="className"
              label="Lớp áp dụng"
              rules={[
                { required: true, message: "Vui lòng chọn Lớp áp dụng!" },
              ]}
            >
              <Select placeholder="Chọn lớp áp dụng">
                {classOptions.map((cls) => (
                  <Option key={cls.value} value={cls.value}>
                    {cls.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="mt-4"
              >
                {currentExamination ? "Cập nhật" : "Tạo mới"}
              </Button>
              <Button onClick={handleCancel} className="ml-2">
                Hủy
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal hiển thị danh sách học sinh */}
        <Modal
          title={
            <span className="flex items-center gap-2 text-lg font-semibold text-blue-600">
              <TeamOutlined style={{ color: "#1677ff" }} />
              Danh sách học sinh trong đơn khám sức khỏe
            </span>
          }
          open={isStudentListModalVisible}
          onCancel={() => setIsStudentListModalVisible(false)}
          footer={[
            <Button
              key="close"
              onClick={() => setIsStudentListModalVisible(false)}
            >
              Đóng
            </Button>,
          ]}
          width={800}
        >
          {approvedStudent?.length === 0 ? (
            <Empty description="Không có học sinh nào trong đơn khám này" />
          ) : (
            <Table
              dataSource={approvedStudent}
              rowKey="id"
              pagination={false}
              bordered
              columns={[
                {
                  title: (
                    <span className="flex items-center gap-1">
                      <IdcardOutlined style={{ color: "#13c2c2" }} /> Mã học
                      sinh
                    </span>
                  ),
                  dataIndex: "student_code",
                  key: "student_code",
                  className: "!font-medium",
                },
                {
                  title: (
                    <span className="flex items-center gap-1">
                      <UserOutlined style={{ color: "#722ed1" }} /> Họ và tên
                    </span>
                  ),
                  dataIndex: "full_name",
                  key: "full_name",
                  className: "!font-medium",
                },
                {
                  title: (
                    <span className="flex items-center gap-1">
                      <span className="flex gap-1">
                        <ManOutlined style={{ color: "#1890ff" }} />
                        /
                        <WomanOutlined style={{ color: "#eb2f96" }} />
                      </span>
                      Giới tính
                    </span>
                  ),
                  dataIndex: "gender",
                  key: "gender",
                  render: (gender) =>
                    gender === "Nam" ? (
                      <Tag color="blue" icon={<ManOutlined />}>
                        Nam
                      </Tag>
                    ) : (
                      <Tag color="magenta" icon={<WomanOutlined />}>
                        Nữ
                      </Tag>
                    ),
                },
                {
                  title: (
                    <span className="flex items-center gap-1">
                      <CalendarOutlined style={{ color: "#faad14" }} /> Ngày
                      sinh
                    </span>
                  ),
                  dataIndex: "date_of_birth",
                  key: "dob",
                  render: (dob) =>
                    dob ? format(parseISO(dob), "dd/MM/yyyy") : "N/A",
                },
                {
                  title: (
                    <span className="flex items-center gap-1">
                      <TeamOutlined style={{ color: "#52c41a" }} /> Lớp
                    </span>
                  ),
                  dataIndex: "class_name",
                  key: "class_name",
                },
                {
                  title: (
                    <span className="flex items-center gap-1">
                      <EyeOutlined style={{ color: "#1677ff" }} /> Hành động
                    </span>
                  ),
                  key: "action",
                  align: "center",
                  render: (_, record) => (
                    <Tooltip title="Xem chi tiết học sinh">
                      <Button
                        shape="rectangle"
                        icon={<EyeOutlined style={{ color: "#1677ff" }} />}
                        onClick={() => {
                          // TODO: mở modal hoặc console log thông tin học sinh
                          console.log("Chi tiết học sinh:", record);
                          // handleViewStudentDetail(record); <-- bạn có thể dùng modal ở đây
                        }}
                      />
                    </Tooltip>
                  ),
                },
              ]}
            />
          )}
        </Modal>
      </div>
    </div>
  );
}
