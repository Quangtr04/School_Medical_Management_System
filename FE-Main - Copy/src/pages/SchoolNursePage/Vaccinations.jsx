/* eslint-disable no-unused-vars */
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
  List,
  Checkbox,
  InputNumber,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  RightOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  EditOutlined,
  CalendarOutlined,
  BarcodeOutlined,
  ContainerOutlined,
  CommentOutlined,
  ScheduleOutlined,
  TeamOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { FiFeather, FiPlusCircle, FiCalendar, FiHeart } from "react-icons/fi";
import { format, parseISO, isWithinInterval, isAfter, isToday } from "date-fns"; // Thêm isAfter, isToday
import api from "../../configs/config-axios";
import moment from "moment";
import dayjs from "dayjs";
// Import Redux hooks và thunk
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllVaccineCampaigns,
  createVaccinationCampaign,
  fetchApprovedStudentVaccineDetailById,
  clearImmunizationsError,
  clearImmunizationsSuccess,
  clearApprovedStudentDetail,
  fetchApprovedStudentsForVaccineCampaigns,
  updateStudentVaccineDetail,
} from "../../redux/nurse/vaccinations/vaccinationSlice"; // Đã sửa đường dẫn slice
import { useForm } from "antd/es/form/Form";

const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function Vaccination() {
  const dispatch = useDispatch();
  const { campaigns, approvedStudentDetail, loading, error, success } =
    useSelector((state) => state.vaccination); // Đã sửa tên state từ immunizations sang vaccination

  const token = localStorage.getItem("accessToken");

  const [upcomingVaccinations, setUpcomingVaccinations] = useState([]);
  const [upcomingCheckups, setUpcomingCheckups] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [scheduleTypeFilter, setScheduleTypeFilter] = useState(null);
  const [createdDateRange, setCreatedDateRange] = useState(null);
  const [isCreateNewScheduleModalVisible, setCreateNewScheduleModal] =
    useState(false);
  const [isUpdateStatusModalVisible, setIsUpdateStatusModalVisible] =
    useState(false);

  // Modal hiển thị danh sách học sinh đc chấp thuận tiêm chủng với status APPROVE
  const [isStudentListModalVisible, setIsStudentListModalVisible] =
    useState(false);
  const [approvedStudents, setApprovedStudents] = useState([]);

  const [currentStudentVaccinationId, setCurrentStudentVaccinationId] =
    useState(null);

  //Modal này hiển thị khi bấm xem chi tiết học sinh ở modal StudentListModal(danh sách học sinh đc chấp thuận)
  const [isViewStudentModalVisible, setIsViewStudentModalVisible] =
    useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleViewStudentDetail = (student) => {
    setSelectedStudent(student);
    setIsViewStudentModalVisible(true);
    setIsStudentListModalVisible(false);
  };

  const [formUpdateApprovedStudent] = Form.useForm();
  const [createNewSchedule] = Form.useForm();
  const [updateStatusForm] = Form.useForm();

  // KHÔNG CẦN HARDCODE VACCINE/CHECKUP TYPES NỮA, SẼ FETCH TỪ API NẾU CẦN
  const [fetchedVaccineTypes, setFetchedVaccineTypes] = useState([
    // Hardcode tạm thời hoặc fetch từ API riêng cho các loại vaccine
    { id: "influenza", name: "Cúm" },
    { id: "hepatitisB", name: "Viêm gan B" },
    { id: "mmr", name: "Sởi, quai bị, rubella (MMR)" },
  ]);

  const fetchData = useCallback(async () => {
    dispatch(fetchAllVaccineCampaigns());
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (campaigns && campaigns.length > 0) {
      const now = new Date();
      const nextVaccinations = [];
      const nextCheckups = [];

      campaigns.forEach((campaign) => {
        const scheduledDate = campaign.scheduled_date
          ? parseISO(campaign.scheduled_date)
          : null;

        // Kiểm tra nếu ngày dự kiến hợp lệ và là ngày hiện tại hoặc trong tương lai
        if (
          scheduledDate &&
          (isAfter(scheduledDate, now) || isToday(scheduledDate))
        ) {
          if (campaign.scheduleType === "vaccination") {
            nextVaccinations.push({
              id: campaign.campaign_id,
              type: campaign.vaccineType || "Không xác định", // Sử dụng vaccineType
              grade: campaign.targetClass,
              class: "...", // Có thể cần thêm thông tin lớp cụ thể hơn từ API
              students: "N/A", // Thông tin học sinh cần được tính toán hoặc lấy từ API khác
              dueDate: campaign.scheduled_date,
            });
          } else if (campaign.scheduleType === "checkup") {
            nextCheckups.push({
              id: campaign.campaign_id,
              type: campaign.checkupType || "Không xác định", // Sử dụng checkupType
              grade: campaign.targetClass,
              class: "...", // Có thể cần thêm thông tin lớp cụ thể hơn từ API
              students: "N/A", // Thông tin học sinh cần được tính toán hoặc lấy từ API khác
              dueDate: campaign.scheduled_date,
            });
          }
        }
      });

      // Sắp xếp theo ngày dự kiến gần nhất
      nextVaccinations.sort(
        (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
      );
      nextCheckups.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

      setUpcomingVaccinations(nextVaccinations);
      setUpcomingCheckups(nextCheckups);
    } else {
      setUpcomingVaccinations([]);
      setUpcomingCheckups([]);
    }
  }, [campaigns]); // Chỉ chạy lại khi campaigns thay đổi

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearImmunizationsError());
    }
    if (success) {
      message.success("Thao tác thành công!");
      dispatch(clearImmunizationsSuccess());
      fetchData(); // Fetch lại dữ liệu sau khi có thao tác thành công
    }
  }, [error, success, dispatch, fetchData]);

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      total: (campaigns || []).length,
    }));
  }, [campaigns]);

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

  const handleScheduleTypeFilterChange = (value) => {
    setScheduleTypeFilter(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const showNewScheduleModal = () => {
    createNewSchedule.resetFields();
    setCreateNewScheduleModal(true);
  };

  const handleCreateNewScheduleModalOk = async () => {
    try {
      const values = await createNewSchedule.validateFields();
      console.log(values);

      const payload = {
        title: values.title,
        description: values.description,
        scheduled_date: values.scheduled_date
          ? values.scheduled_date.format("YYYY-MM-DD")
          : null,
        sponsor: values.sponsor,
        className: values.className, // Updated to className
      };

      await dispatch(
        createVaccinationCampaign({
          token,
          campaignData: payload,
        })
      ).unwrap();
      setCreateNewScheduleModal(false);
    } catch (err) {
      console.error("Lỗi khi tạo lịch trình mới:", err);
    }
  };

  const handleCancelCreateNewScheduleModal = () => {
    setCreateNewScheduleModal(false);
    createNewSchedule.resetFields();
  };

  useEffect(() => {
    if (approvedStudentDetail && isUpdateStatusModalVisible) {
      updateStatusForm.resetFields();
      const initialValues = {};
      for (const vaccine of fetchedVaccineTypes || []) {
        const vaccinationDate =
          approvedStudentDetail.vaccinations?.[vaccine.id];
        if (vaccinationDate && vaccinationDate !== "Not vaccinated") {
          initialValues[vaccine.id] = moment(vaccinationDate);
        }
      }
      updateStatusForm.setFieldsValue(initialValues);
    }
  }, [
    approvedStudentDetail,
    isUpdateStatusModalVisible,
    updateStatusForm,
    fetchedVaccineTypes,
  ]);

  useEffect(() => {
    if (selectedStudent && isViewStudentModalVisible) {
      formUpdateApprovedStudent.resetFields(); // reset toàn bộ field
      formUpdateApprovedStudent.setFieldsValue({
        full_name: selectedStudent.full_name,
        student_code: selectedStudent.student_code,
        class_name: selectedStudent.class_name,
        date_of_birth: selectedStudent.date_of_birth
          ? dayjs(selectedStudent.date_of_birth)
          : null,
        vaccinated_at: selectedStudent.vaccinated_at
          ? dayjs(selectedStudent.vaccinated_at)
          : null,
        campaign_id: selectedStudent.campaign_id,
        vaccine_name: selectedStudent.vaccine_name,
        dose_number: selectedStudent.dose_number
          ? Number(selectedStudent.dose_number)
          : null,
        follow_up_required:
          selectedStudent.follow_required === true
            ? "Có"
            : selectedStudent.follow_required === false
            ? "Không"
            : undefined,
        reaction: selectedStudent.reaction,
        note: selectedStudent.note,
      });
    }
  }, [selectedStudent, isViewStudentModalVisible, formUpdateApprovedStudent]);

  const handleUpdateStatusModalOk = async () => {
    try {
      const values = await updateStatusForm.validateFields();
      const updatedVaccinations = {};
      for (const vaccine of fetchedVaccineTypes || []) {
        updatedVaccinations[vaccine.id] = values[vaccine.id]
          ? values[vaccine.id].format("YYYY-MM-DD")
          : "Not vaccinated";
      }

      const payload = { vaccinations: updatedVaccinations };
      await dispatch(
        updateStudentVaccineDetail({
          studentId: currentStudentVaccinationId,
          resultData: payload,
        })
      ).unwrap();
      setIsUpdateStatusModalVisible(false);
      dispatch(clearApprovedStudentDetail());
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái tiêm chủng:", err);
      message.error(
        "Cập nhật trạng thái thất bại: " + (err.message || "Lỗi không xác định")
      );
    }
  };

  const handleUpdateStatusModalCancel = () => {
    setIsUpdateStatusModalVisible(false);
    setCurrentStudentVaccinationId(null);
    updateStatusForm.resetFields();
    dispatch(clearApprovedStudentDetail());
  };

  const handleFinishUpdateApprovedStudent = async (values) => {
    if (!selectedStudent?.student_id) {
      message.error("Không tìm thấy học sinh.");
      return;
    }

    const studentId = selectedStudent.id;
    console.log("studentId:", studentId);

    // Chuẩn bị dữ liệu gửi lên API
    const formData = {
      vaccinated_at: values.vaccinated_at
        ? values.vaccinated_at.format("YYYY-MM-DD")
        : null,
      vaccine_name: values.vaccine_name || "",
      dose_number: values.dose_number || null,
      follow_up_required: values.follow_up_required || "Không", // giữ string
      note: values.note || "",
      reaction: values.reaction || "",
    };

    try {
      await dispatch(
        updateStudentVaccineDetail({ studentId, values: formData })
      ).unwrap();

      message.success("Cập nhật thông tin học sinh thành công!");
      setIsViewStudentModalVisible(false);
    } catch (error) {
      message.error("Cập nhật thất bại: " + error);
    }
  };

  const columns = [
    {
      title: (
        <Space>
          <BarcodeOutlined style={{ color: "#1890ff" }} />
          <span className="text-blue-600 font-semibold">Mã lịch trình</span>
        </Space>
      ),
      dataIndex: "campaign_id",
      key: "campaign_id",
      align: "center",
      sorter: (a, b) => (a.campaign_id || 0) - (b.campaign_id || 0),
      className: "!text-gray-700 !font-medium",
    },
    {
      title: (
        <Space>
          <ContainerOutlined style={{ color: "#52c41a" }} />
          <span className="text-green-600 font-semibold">Tiêu đề</span>
        </Space>
      ),
      dataIndex: "title",
      key: "title",
      align: "left",
      className: "!text-gray-700 !font-medium",
    },
    {
      title: (
        <Space>
          <UserOutlined style={{ color: "#722ed1" }} />
          <span className="text-purple-600 font-semibold">Được tạo bởi</span>
        </Space>
      ),
      dataIndex: "created_by",
      key: "created_by",
      align: "center",
      className: "!text-gray-700 !font-medium",
    },
    {
      title: (
        <Space>
          <CommentOutlined style={{ color: "#bfbfbf" }} />
          <span className="text-gray-600 font-semibold">Mô tả</span>
        </Space>
      ),
      dataIndex: "description",
      key: "description",
      align: "left",
      render: (text) => (
        <Tooltip title={text}>
          <Text ellipsis={{ tooltip: true }}>{text}</Text>
        </Tooltip>
      ),
      className: "!text-gray-700 !font-medium",
    },
    {
      title: (
        <Space>
          <CalendarOutlined style={{ color: "#fa8c16" }} />
          <span className="text-orange-500 font-semibold">Ngày tạo</span>
        </Space>
      ),
      dataIndex: "created_at",
      key: "created_at",
      align: "center",
      render: (date) =>
        date ? format(parseISO(date), "dd/MM/yyyy HH:mm") : "N/A",
      className: "!text-gray-700 !font-medium",
    },
    {
      title: (
        <Space>
          <ScheduleOutlined style={{ color: "#13c2c2" }} />
          <span className="text-cyan-600 font-semibold">Ngày dự kiến</span>
        </Space>
      ),
      dataIndex: "scheduled_date",
      key: "scheduled_date",
      align: "center",
      render: (date) => (date ? format(parseISO(date), "dd/MM/yyyy") : "N/A"),
      className: "!text-gray-700 !font-medium",
    },
    {
      title: (
        <Space>
          <TeamOutlined style={{ color: "#eb2f96" }} />
          <span className="text-pink-600 font-semibold">Nhà tài trợ</span>
        </Space>
      ),
      dataIndex: "sponsor",
      key: "sponsor",
      align: "left",
      className: "!text-gray-700 !font-medium",
    },
    {
      title: (
        <Space>
          <TeamOutlined style={{ color: "#eb2f96" }} />
          <span className="text-pink-600 font-semibold">Trạng thái</span>
        </Space>
      ),
      dataIndex: "approval_status",
      key: "approval_status",
      align: "center",
      render: (status) => {
        let color = "default";
        if (status === "APPROVED") color = "green";
        else if (status === "PENDING") color = "orange";
        else if (status === "REJECTED") color = "red";

        return <Tag color={color}>{status || "Chưa xác định"}</Tag>;
      },
      className: "!text-gray-700 !font-medium",
    },
    {
      title: (
        <Space>
          <EditOutlined style={{ color: "#1890ff" }} />
          <span className="text-blue-600 font-semibold">Hành động</span>
        </Space>
      ),
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Tooltip title="Xem danh sách học sinh">
          <EyeOutlined
            className="text-blue-600 border border-black p-1 rounded cursor-pointer text-[18px]"
            onClick={async () => {
              if (record.approval_status === "APPROVED") {
                try {
                  const result = await dispatch(
                    fetchApprovedStudentsForVaccineCampaigns()
                  ).unwrap();
                  console.log(result);

                  setApprovedStudents(result); // lưu danh sách học sinh
                  setIsStudentListModalVisible(true); // hiển thị modal
                } catch (err) {
                  message.error(err || "Tải danh sách thất bại.");
                }
              } else {
                message.warning("Lịch trình này chưa được duyệt.");
              }
            }}
          />
        </Tooltip>
      ),
      className: "!text-gray-700 !font-medium",
    },
  ];

  const renderLoadingState = () => (
    <div className="text-center py-8 flex flex-col items-center justify-center gap-4">
      <Spin indicator={<LoadingOutlined style={{ fontSize: 30 }} spin />} />
      <p className="text-gray-500 text-lg">Đang tải dữ liệu chiến dịch...</p>
    </div>
  );

  const filteredAndPaginatedCampaigns = (campaigns || [])
    .filter(
      (campaign) =>
        (campaign.title &&
          campaign.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (campaign.description &&
          campaign.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (campaign.campaign_id &&
          campaign.campaign_id
            .toString()
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (campaign.sponsor &&
          campaign.sponsor.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter((campaign) => {
      if (scheduleTypeFilter && campaign.scheduleType !== scheduleTypeFilter) {
        return false;
      }
      return true;
    })
    .slice(
      (pagination.current - 1) * pagination.pageSize,
      pagination.current * pagination.pageSize
    );

  return (
    <div
      className={`min-h-screen bg-white p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCcgdmlld0JveD0nMCAwIDQwIDQwJz48ZyBmaWxsPSdyZ2JhKDEzLDExMCwyNTMsMC4xKScgZmlsbC1ydWxlPSdldmVub2RkJz48Y2lyY2xlIGN4PScyMCcgY3k9JzIwJyByPScyJy8+PC9zdmc+')] bg-fixed`}
    >
      <div className="max-w-7xl mx-auto">
        <header
          className={`mb-5 p-4 rounded-lg bg-green-600/[.10] to-transparent flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-3 bg-green-600/[.10] rounded-full border border-green-600`}
            >
              <FiFeather className={`w-10 h-10 text-3xl text-green-600`} />{" "}
            </div>
            <div>
              <h1 className={`text-gray-900 font-semibold text-3xl mb-2`}>
                Lịch tiêm chủng
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

        {loading && !campaigns.length ? (
          renderLoadingState()
        ) : (
          <>
            {/* chỗ hiện thị lịch tiêm chủng và khám sức khỏe sắp tới */}
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <div className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2 text-gray-800 font-medium">
                        <FiCalendar className="text-blue-600" />
                        Tiêm chủng sắp tới
                      </span>
                      <Button
                        type="link"
                        className="!text-blue-600 !p-0 !h-auto font-medium"
                      >
                        Xem tất cả lịch trình <RightOutlined />
                      </Button>
                    </div>
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
                                {item.type} (Lớp {item.grade})
                              </Text>
                            }
                            description={
                              <div className="text-gray-600">
                                <p>
                                  Ngày:{" "}
                                  <Text className="font-semibold text-blue-600">
                                    {item.dueDate
                                      ? format(
                                          parseISO(item.dueDate),
                                          "dd/MM/yyyy"
                                        )
                                      : "N/A"}
                                  </Text>
                                </p>
                              </div>
                            }
                          />
                          <div className="text-right">
                            {/* Bạn có thể thêm các thông tin khác ở đây nếu muốn */}
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
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card
                  variant={false}
                  title={
                    <div className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2 text-gray-800 font-medium">
                        <FiCalendar className="text-green-600" />
                        Lịch khám sức khỏe sắp tới
                      </span>
                      <Button
                        type="link"
                        className="!text-blue-600 !p-0 !h-auto font-medium"
                      >
                        Xem tất cả lịch khám sức khỏe <RightOutlined />
                      </Button>
                    </div>
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
                                {item.type} (Lớp {item.grade})
                              </Text>
                            }
                            description={
                              <div className="text-gray-600">
                                <p>
                                  Ngày:{" "}
                                  <Text className="font-semibold text-green-600">
                                    {item.dueDate
                                      ? format(
                                          parseISO(item.dueDate),
                                          "dd/MM/yyyy"
                                        )
                                      : "N/A"}
                                  </Text>
                                </p>
                              </div>
                            }
                          />
                          <div className="text-right">
                            {/* Bạn có thể thêm các thông tin khác ở đây nếu muốn */}
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
                </Card>
              </Col>
            </Row>

            {/* chỗ hiển thị dữ liệu về các lịch tiêm chủng */}
            <Card className="!rounded-lg !shadow-md !border !border-gray-200">
              {/* thanh tìm kiếm */}
              <div
                className="flex flex-wrap items-center gap-4 mb-6"
                style={{ overflowX: "auto" }}
              >
                <Input
                  placeholder="Tìm kiếm lịch trình..."
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
                  placeholder="Loại lịch trình"
                  onChange={handleScheduleTypeFilterChange}
                  allowClear
                  className="w-40 rounded-lg h-10"
                >
                  <Option value="vaccination">Tiêm chủng</Option>
                  <Option value="checkup">Khám sức khỏe</Option>
                </Select>
              </div>
              {/* thanh tìm kiếm */}

              {/* Table */}
              <Table
                columns={columns}
                dataSource={filteredAndPaginatedCampaigns}
                rowKey="campaign_id"
                scroll={{ x: "max-content" }}
                pagination={{
                  ...pagination,
                  total: campaigns?.length,
                  showSizeChanger: true,
                  showTotal: (total, range) =>
                    `Hiển thị ${range[0]}-${range[1]} trên tổng số ${total} lịch trình`,
                  className: "ant-pagination-custom",
                }}
                onChange={handleTableChange}
                className="custom-table"
                locale={{
                  emptyText: (
                    <Empty
                      description="Không tìm thấy dữ liệu lịch trình nào"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ),
                }}
              />
              <div className="text-sm text-gray-600 mt-4">
                Hiển thị {(pagination.current - 1) * pagination.pageSize + 1} -{" "}
                {Math.min(
                  pagination.current * pagination.pageSize,
                  (campaigns || []).length
                )}{" "}
                trên tổng số {(campaigns || []).length} lịch trình
              </div>
            </Card>
          </>
        )}

        {/* Modal Tạo lịch trình mới */}
        <Modal
          title="Tạo lịch trình mới"
          open={isCreateNewScheduleModalVisible}
          onOk={handleCreateNewScheduleModalOk}
          onCancel={handleCancelCreateNewScheduleModal}
          okText="Tạo lịch trình"
          cancelText="Hủy"
          confirmLoading={loading}
        >
          <Form
            form={createNewSchedule}
            layout="vertical"
            name="new_schedule_form"
          >
            <Form.Item
              name="title" // Thêm trường title
              label="Tiêu đề"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
            >
              <Input placeholder="Nhập tiêu đề lịch tiêm chủng" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
            >
              <Input placeholder="Mô tả nội dung lịch tiêm chủng" />
            </Form.Item>

            <Form.Item
              name="scheduled_date"
              label="Ngày tiêm chủng"
              rules={[
                { required: true, message: "Vui lòng chọn ngày tiêm chủng!" },
              ]}
            >
              <DatePicker
                placeholder="Chọn ngày tiêm chủng"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              name="sponsor"
              label="Nhà tài trợ"
              rules={[
                { required: true, message: "Vui lòng chọn nhà tài trợ !" },
              ]}
            >
              <Input placeholder="Chọn nhà tài trợ" />
            </Form.Item>

            <Form.Item
              name="className"
              label="Lớp"
              rules={[{ required: true, message: "Vui lòng chọn lớp!" }]}
            >
              <Select placeholder="Chọn lớp">
                <Option value={1}>1</Option>
                <Option value={2}>2</Option>
                <Option value={3}>3</Option>
                <Option value={4}>4</Option>
                <Option value={5}>5</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal Cập nhật trạng thái tiêm chủng */}
        <Modal
          title={`Cập nhật trạng thái tiêm chủng cho ${
            approvedStudentDetail?.name || "học sinh"
          }`}
          open={isUpdateStatusModalVisible}
          onOk={handleUpdateStatusModalOk}
          onCancel={handleUpdateStatusModalCancel}
          okText="Cập nhật trạng thái"
          confirmLoading={loading}
        >
          {approvedStudentDetail ? (
            <Form
              form={updateStatusForm}
              layout="vertical"
              name="update_status_form"
            >
              <Form.Item label="Mã học sinh">
                <Input value={approvedStudentDetail?.studentId} disabled />
              </Form.Item>
              <Form.Item label="Tên học sinh">
                <Input value={approvedStudentDetail?.name} disabled />
              </Form.Item>
              <Form.Item label="Lớp">
                <Input value={approvedStudentDetail?.class} disabled />
              </Form.Item>

              <Typography.Title level={5} className="mt-4 mb-2">
                Ngày tiêm chủng
              </Typography.Title>
              {(fetchedVaccineTypes || []).map((v) => {
                const vaccinationDate =
                  approvedStudentDetail.vaccinations?.[v.id];
                return (
                  <Form.Item key={v.id} name={v.id} label={v.name}>
                    <DatePicker
                      style={{ width: "100%" }}
                      format="YYYY-MM-DD"
                      allowClear
                      defaultValue={
                        vaccinationDate && vaccinationDate !== "Not vaccinated"
                          ? moment(vaccinationDate)
                          : null
                      }
                    />
                  </Form.Item>
                );
              })}
              {fetchedVaccineTypes.length === 0 && (
                <p className="text-red-500">
                  (Không có loại vắc xin nào được tải. Vui lòng tải dữ liệu vắc
                  xin.)
                </p>
              )}
            </Form>
          ) : (
            <div className="text-center py-4">
              <Spin /> <p>Đang tải chi tiết học sinh...</p>
            </div>
          )}
        </Modal>

        {/* Modal hiển thị danh sách thông tin học sinh đc phê duyệt */}
        <Modal
          title={
            <div className="text-xl font-semibold text-gray-800">
              🎓 Danh sách học sinh đã duyệt
            </div>
          }
          open={isStudentListModalVisible}
          onCancel={() => setIsStudentListModalVisible(false)}
          footer={null}
          centered
          maskClosable
          width={900}
          styles={{
            backgroundColor: "#f9fafe",
            padding: "24px",
            borderRadius: "12px",
          }}
          style={{
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
          }}
        >
          <Table
            dataSource={approvedStudents}
            rowKey="student_id"
            pagination={{
              pageSize: 6,
              showSizeChanger: false,
              className: "pt-4 text-sm",
            }}
            bordered={false}
            className="custom-soft-table"
            columns={[
              {
                title: "🧾 Mã lịch khám",
                dataIndex: "campaign_id",
                key: "campaign_id",
              },
              {
                title: "🎓 Mã học sinh",
                dataIndex: "student_code",
                key: "student_code",
              },
              {
                title: "👤 Họ và tên học sinh",
                dataIndex: "full_name",
                key: "student_id",
              },
              {
                title: "🏫 Lớp",
                dataIndex: "class_name",
                key: "class_name",
              },
              {
                title: "🎂 Ngày sinh",
                dataIndex: "date_of_birth",
                key: "dob",
                render: (dob) =>
                  dob ? format(parseISO(dob), "dd/MM/yyyy") : "N/A",
              },
              {
                title: "💉 Tiêm vào ngày",
                dataIndex: "vaccinated_at",
                key: "vaccinated_at",
                render: (date) =>
                  date ? format(parseISO(date), "dd/MM/yyyy") : "N/A",
              },
              {
                title: "👁️ Hành động",
                key: "action",
                render: (_, record) => (
                  <Tooltip title="Xem chi tiết học sinh">
                    <Button
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewStudentDetail(record)}
                      className="!text-blue-600 hover:!text-blue-700"
                    >
                      {/* Ẩn chữ, chỉ hiển thị tooltip khi hover */}
                    </Button>
                  </Tooltip>
                ),
              },
            ]}
          />
        </Modal>

        <Modal
          title="Chi tiết học sinh"
          open={isViewStudentModalVisible}
          onCancel={() => setIsViewStudentModalVisible(false)} // 👈 Thêm dòng nàyp
          centered
          width={600}
          footer={[
            <Button
              key="cancel"
              onClick={() => setIsViewStudentModalVisible(false)}
            >
              Hủy
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={() => formUpdateApprovedStudent.submit()}
            >
              Cập nhật
            </Button>,
          ]}
        >
          <Form
            layout="vertical"
            form={formUpdateApprovedStudent}
            onFinish={handleFinishUpdateApprovedStudent}
            initialValues={{
              full_name: selectedStudent?.full_name,
              student_code: selectedStudent?.student_code,
              class_name: selectedStudent?.class_name,
              date_of_birth: selectedStudent?.date_of_birth
                ? dayjs(selectedStudent.date_of_birth)
                : null,
              vaccinated_at: selectedStudent?.vaccinated_at
                ? dayjs(selectedStudent.vaccinated_at)
                : null,
              campaign_id: selectedStudent?.campaign_id,
              vaccine_name: selectedStudent?.vaccine_name,
              dose_number: selectedStudent?.dose_number
                ? Number(selectedStudent.dose_number)
                : null,
              follow_up_required:
                selectedStudent?.follow_required === true
                  ? "Có"
                  : selectedStudent?.follow_required === false
                  ? "Không"
                  : undefined, // fallback nếu null
              reaction: selectedStudent?.reaction,
              note: selectedStudent?.note,
            }}
          >
            {/* Trường chỉ xem */}
            <Form.Item label="👤 Họ và tên" name="full_name">
              <Input disabled />
            </Form.Item>

            <Form.Item label="🎓 Mã học sinh" name="student_code">
              <Input disabled />
            </Form.Item>

            <Form.Item label="🏫 Lớp" name="class_name">
              <Input disabled />
            </Form.Item>

            <Form.Item label="🎂 Ngày sinh" name="date_of_birth">
              <DatePicker
                disabled
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item label="🧾 Mã lịch khám" name="campaign_id">
              <Input disabled />
            </Form.Item>

            {/* Trường cho phép cập nhật */}
            <Form.Item label="💉 Tiêm vào ngày" name="vaccinated_at">
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item label="💊 Tên vắc xin" name="vaccine_name">
              <Input placeholder="Nhập tên vắc xin..." />
            </Form.Item>

            <Form.Item
              label="💉 Số mũi tiêm"
              name="dose_number"
              rules={[
                { required: true, message: "Vui lòng nhập số mũi tiêm!" },
              ]}
            >
              <InputNumber
                min={1}
                style={{ width: "100%" }}
                placeholder="Nhập số mũi tiêm..."
              />
            </Form.Item>

            <Form.Item
              label="📋 Yêu cầu theo dõi sau tiêm"
              name="follow_required"
              rules={[
                { required: true, message: "Vui lòng chọn yêu cầu theo dõi!" },
              ]}
            >
              <Select placeholder="Chọn yêu cầu theo dõi">
                <Select.Option value="Có">Có</Select.Option>
                <Select.Option value="Không">Không</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="🤔 Trạng thái sau tiêm" name="reaction">
              <Input.TextArea
                rows={3}
                placeholder="Nhập phản ứng sau tiêm..."
              />
            </Form.Item>

            <Form.Item label="🧑‍⚕️ Ghi chú của Y tá" name="note">
              <Input.TextArea rows={4} placeholder="Nhập ghi chú..." />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
