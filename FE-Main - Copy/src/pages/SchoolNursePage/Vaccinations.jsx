/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import {
  format,
  parseISO,
  isWithinInterval,
  isAfter,
  isToday,
  startOfDay,
  addDays,
  differenceInCalendarDays,
} from "date-fns";
import api from "../../configs/config-axios"; // Đảm bảo đường dẫn đúng
import moment from "moment"; // Có thể thay thế bằng dayjs hoặc date-fns nếu muốn nhất quán
import dayjs from "dayjs";
// Import Redux hooks và thunk
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllVaccineCampaigns,
  createVaccinationCampaign,
  updateStudentVaccineDetail,
  fetchApprovedStudentsByCampaignId,
  clearImmunizationsError,
  clearImmunizationsSuccess,
  // Không cần clearApprovedStudentDetail vì nó đã được fetch lại khi đóng modal hoặc cập nhật thành công
} from "../../redux/nurse/vaccinations/vaccinationSlice"; // Đã sửa đường dẫn slice
import { toast } from "react-toastify";
import { values } from "lodash";

const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function Vaccination() {
  const dispatch = useDispatch();
  // Lấy campaigns, loading, error, success từ Redux store
  const { campaigns, loading, error, success } = useSelector(
    (state) => state.vaccination
  );

  const token = localStorage.getItem("accessToken");

  // State cho phân trang và bộ lọc
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [scheduleTypeFilter, setScheduleTypeFilter] = useState(null); // Có vẻ không được sử dụng với `campaigns` hiện tại

  // State cho các Modal
  const [isCreateNewScheduleModalVisible, setCreateNewScheduleModal] =
    useState(false);
  const [isStudentListModalVisible, setIsStudentListModalVisible] =
    useState(false);
  const [isViewStudentModalVisible, setIsViewStudentModalVisible] =
    useState(false);

  // State cho dữ liệu Modal
  const [approvedStudents, setApprovedStudents] = useState([]); // Danh sách học sinh được chấp thuận cho một campaign cụ thể
  const [selectedStudent, setSelectedStudent] = useState(null); // Học sinh được chọn để xem/cập nhật chi tiết

  // Ant Design Forms
  const [formCreateNewSchedule] = Form.useForm();
  const [formUpdateStudentDetail] = Form.useForm(); // Đổi tên để rõ ràng hơn

  // // --- FETCH DỮ LIỆU BAN ĐẦU ---
  const fetchData = useCallback(async () => {
    const resultAction = await dispatch(fetchAllVaccineCampaigns());
    if (fetchAllVaccineCampaigns.fulfilled.match(resultAction)) {
      setPagination((prev) => ({
        ...prev,
        total: resultAction.payload.total || prev.total,
      }));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- XỬ LÝ THÔNG BÁO LỖI/THÀNH CÔNG TỪ REDUX ---
  // useEffect(() => {
  //   if (error) {
  //     message.error(error);
  //     dispatch(clearImmunizationsError()); // Xóa lỗi sau khi hiển thị
  //   }
  //   if (success) {
  //     message.success("Thao tác thành công!");
  //     dispatch(clearImmunizationsSuccess()); // Xóa thành công sau khi hiển thị
  //     fetchData(); // Tải lại danh sách campaigns sau khi có thao tác thành công
  //   }
  // }, [error, success, dispatch, fetchData]);

  const classOptions = [1, 2, 3, 4, 5].map((classNumber) => ({
    label: `Lớp ${classNumber}`,
    value: classNumber,
  }));

  // --- CẬP NHẬT TỔNG SỐ TRANG CHO PHÂN TRANG ---
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      total: (campaigns || []).length,
    }));
  }, [campaigns]);

  // --- LOGIC HIỂN THỊ LỊCH TIÊM CHỦNG SẮP TỚI (trong 7 ngày tới) ---
  const upcomingVaccinations = useMemo(() => {
    const today = startOfDay(new Date());

    return campaigns.filter((item) => {
      // Đảm bảo item tồn tại và có scheduled_date
      if (
        !item ||
        !item.scheduled_date ||
        item.approval_status !== "APPROVED"
      ) {
        return false;
      }
      const parsedDate = parseISO(item.scheduled_date);
      // Kiểm tra xem ngày dự kiến có trong khoảng 7 ngày tới và lớn hơn hoặc bằng ngày hôm nay không
      return (
        isAfter(parsedDate, today) ||
        isToday(parsedDate) ||
        isWithinInterval(parsedDate, {
          start: today,
          end: addDays(today, 7),
        })
      );
    });
  }, [campaigns]);

  // --- XỬ LÝ THAY ĐỔI TRANG BẢNG ---
  const handleTableChange = (newPagination) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  };

  // --- XỬ LÝ TÌM KIẾM BẢNG ---
  const handleSearch = (value) => {
    setSearchQuery(value);
    setPagination((prev) => ({ ...prev, current: 1 })); // Reset về trang 1 khi tìm kiếm
  };

  // --- XỬ LÝ LỌC THEO LOẠI LỊCH TRÌNH (hiện tại không có trong data campaigns) ---
  const handleScheduleTypeFilterChange = (value) => {
    setScheduleTypeFilter(value);
    setPagination((prev) => ({ ...prev, current: 1 })); // Reset về trang 1 khi lọc
  };

  // --- MODAL TẠO LỊCH TRÌNH MỚI ---
  const showNewScheduleModal = () => {
    formCreateNewSchedule.resetFields();
    setCreateNewScheduleModal(true);
  };

  const handleCreateNewScheduleModalOk = async () => {
    try {
      const values = await formCreateNewSchedule.validateFields(); // Validate form
      console.log("Creating new campaign with values:", values.className);

      const payload = {
        title: values.title,
        description: values.description,
        scheduled_date: values.scheduled_date
          ? values.scheduled_date.format("YYYY-MM-DD")
          : null,
        sponsor: values.sponsor,
        className: values.className,
      };

      await dispatch(
        createVaccinationCampaign({
          token,
          campaignData: payload,
        })
      ).unwrap(); // .unwrap() để bắt lỗi từ createAsyncThunk

      setCreateNewScheduleModal(false); // Đóng modal sau khi thành công
      formCreateNewSchedule.resetFields(); // Reset form
    } catch (err) {
      toast.error(err);
    }
  };

  const handleCancelCreateNewScheduleModal = () => {
    setCreateNewScheduleModal(false);
    formCreateNewSchedule.resetFields(); // Reset form khi hủy
  };

  // --- MODAL HIỂN THỊ DANH SÁCH HỌC SINH ĐƯỢC CHẤP THUẬN ---
  const handleViewStudentList = useCallback(
    async (campaignId) => {
      try {
        const result = await dispatch(
          fetchApprovedStudentsByCampaignId(campaignId)
        ).unwrap();
        setApprovedStudents(result); // Lưu danh sách học sinh theo lịch tiêm cụ thể
        setIsStudentListModalVisible(true); // Mở modal danh sách học sinh
      } catch (err) {
        message.error(err.message || "Tải danh sách học sinh thất bại.");
        console.error("Lỗi khi tải danh sách học sinh:", err);
      }
    },
    [dispatch]
  );

  // --- MODAL HIỂN THỊ CHI TIẾT HỌC SINH (ĐỂ CẬP NHẬT) ---
  const handleViewStudentDetail = useCallback((student) => {
    setSelectedStudent(student);
    setIsViewStudentModalVisible(true);
    // Không đóng isStudentListModalVisible ở đây, có thể muốn quay lại danh sách
    // setIsStudentListModalVisible(false); // Tùy thuộc vào UX mong muốn
  }, []);

  // Sync form với selectedStudent khi modal mở hoặc selectedStudent thay đổi
  useEffect(() => {
    if (selectedStudent && isViewStudentModalVisible) {
      formUpdateStudentDetail.resetFields(); // Reset toàn bộ field trước khi set
      formUpdateStudentDetail.setFieldsValue({
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
        // follow_up_required cần được xử lý thành boolean cho payload, nhưng hiển thị "Có"/"Không"
        follow_up_required_display:
          selectedStudent.follow_up_required === true
            ? "Có"
            : selectedStudent.follow_up_required === false
            ? "Không"
            : undefined,
        reaction: selectedStudent.reaction,
        note: selectedStudent.note,
      });
    }
  }, [selectedStudent, isViewStudentModalVisible, formUpdateStudentDetail]);

  const handleFinishUpdateStudentDetail = async (values) => {
    if (!selectedStudent?.id) {
      // Sử dụng selectedStudent.id thay vì student_id
      message.error("Không tìm thấy học sinh để cập nhật.");
      return;
    }

    const studentId = selectedStudent.id; // Lấy ID của học sinh từ selectedStudent

    const formData = {
      vaccinated_at: values.vaccinated_at
        ? values.vaccinated_at.format("YYYY-MM-DD")
        : null,
      vaccine_name: values.vaccine_name || "",
      dose_number: values.dose_number || null,
      // Chuyển đổi "Có"/"Không" thành boolean cho follow_up_required nếu API yêu cầu boolean
      follow_up_required:
        values.follow_up_required_display === "Có" ? true : false,
      note: values.note || "",
      reaction: values.reaction || "",
    };

    try {
      await dispatch(
        updateStudentVaccineDetail({ studentId, values: formData })
      ).unwrap();

      message.success("Cập nhật thông tin học sinh thành công!");
      setIsViewStudentModalVisible(false); // Đóng modal sau khi cập nhật thành công

      // Sau khi cập nhật thành công, cần refresh lại danh sách học sinh
      // để dữ liệu trong bảng danh sách được cập nhật.
      // Gọi lại hàm fetch danh sách học sinh của campaign hiện tại
      if (selectedStudent.campaign_id) {
        handleViewStudentList(selectedStudent.campaign_id);
      }
    } catch (error) {
      message.error(
        "Cập nhật thất bại: " + (error.message || "Lỗi không xác định")
      );
      console.error("Lỗi cập nhật chi tiết học sinh:", error);
    }
  };

  // --- ĐỊNH NGHĨA CÁC CỘT CHO BẢNG LỊCH TRÌNH ---
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
          <CommentOutlined style={{ color: "#bfbfbf" }} />
          <span className="text-gray-600 font-semibold">Lớp</span>
        </Space>
      ),
      dataIndex: "class",
      key: "class",
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
            onClick={() => {
              if (record.approval_status === "APPROVED") {
                handleViewStudentList(record.campaign_id); // Gọi hàm đã bọc trong useCallback
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

  // --- HÀM RENDER TRẠNG THÁI ĐANG TẢI ---
  const renderLoadingState = () => (
    <div className="text-center py-8 flex flex-col items-center justify-center gap-4">
      <Spin indicator={<LoadingOutlined style={{ fontSize: 30 }} spin />} />
      <p className="text-gray-500 text-lg">Đang tải dữ liệu chiến dịch...</p>
    </div>
  );

  // --- LỌC VÀ PHÂN TRANG DỮ LIỆU BẢNG ---
  const filteredAndPaginatedCampaigns = useMemo(() => {
    return (campaigns || [])
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
        // Lọc theo loại lịch trình (nếu có, hiện tại dữ liệu campaigns không có trường scheduleType)
        if (
          scheduleTypeFilter &&
          campaign.scheduleType !== scheduleTypeFilter
        ) {
          return false;
        }
        return true;
      })
      .slice(
        (pagination.current - 1) * pagination.pageSize,
        pagination.current * pagination.pageSize
      );
  }, [campaigns, searchQuery, scheduleTypeFilter, pagination]);

  return (
    <div
      className={`min-h-screen bg-white p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCcgdmlld0JveD0nMCAwIDQwIDQwJz48ZyBmaWxsPSdyZ2JhKDEzLDExMCwyNTMsMC4xKScgZmlsbC1ydWxlPSdldmVubm9kZCc+PGNpcmNsZSBjeD0nMjAnIGN5PScyMCcgcmQ9JzInLz48L2c+PC9zdmc+')] bg-fixed`}
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
              <Col xs={24} lg={24}>
                <Card
                  title={
                    <div className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2 text-gray-800 font-medium">
                        <FiCalendar className="text-blue-600" />
                        Tiêm chủng sắp tới
                      </span>
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
                            <Button
                              type="link"
                              key="view-details"
                              onClick={() =>
                                handleViewStudentList(item.campaign_id)
                              }
                            >
                              Xem danh sách học sinh
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
                                {item.title} (Lớp {item.class}){" "}
                                {/* Sử dụng item.title và item.class_name */}
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
                      description="Không có lịch tiêm chủng sắp tới"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                </Card>
              </Col>
            </Row>

            {/* Card hiển thị dữ liệu về các lịch tiêm chủng */}
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
                {/* Loai lịch trình filter - giữ nguyên nhưng lưu ý nó không khớp với data hiện tại của campaigns */}
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
            form={formCreateNewSchedule}
            layout="vertical"
            name="new_schedule_form"
          >
            <Form.Item
              name="title"
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
              <Input.TextArea
                rows={3}
                placeholder="Mô tả nội dung lịch tiêm chủng"
              />
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
                format="YYYY-MM-DD" // Định dạng ngày tháng
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
              <Select placeholder="Chọn lớp áp dụng">
                {classOptions.map((cls) => (
                  <Option key={cls.value} value={cls.value}>
                    {cls.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
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
            body: { backgroundColor: "#f9fafe", padding: "24px" },
            header: { borderRadius: "12px 12px 0 0", padding: "16px 24px" },
            footer: { borderRadius: "0 0 12px 12px", padding: "16px 24px" },
            mask: { backdropFilter: "blur(5px)" },
          }}
          style={{
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
          }}
        >
          <Table
            dataSource={approvedStudents}
            rowKey="id" // Đảm bảo sử dụng khóa đúng, có thể là 'id' hoặc 'student_id' tùy API
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
                key: "full_name", // Thay đổi key để tránh nhầm lẫn
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
                title: "👁️Hành động",
                key: "action",
                render: (_, record) => (
                  <Tooltip title="Xem chi tiết học sinh">
                    <Button
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewStudentDetail(record)}
                      className="!text-blue-600 hover:!text-blue-700"
                    >
                      {" "}
                      {/* Giữ nút nhưng không hiển thị text */}
                    </Button>
                  </Tooltip>
                ),
              },
            ]}
            locale={{
              emptyText: (
                <Empty
                  description="Không có học sinh nào trong lịch trình này."
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
          />
          {loading && ( // Thêm loading indicator cho bảng học sinh
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
              />
            </div>
          )}
        </Modal>

        {/* Modal hiển thị cho phép nurse cập nhập Note và trạng thái của student*/}
        <Modal
          title="Chi tiết học sinh"
          open={isViewStudentModalVisible}
          onCancel={() => {
            setIsViewStudentModalVisible(false);
            // Có thể quay lại modal danh sách học sinh nếu muốn
            setIsStudentListModalVisible(true);
          }}
          centered
          width={600}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setIsViewStudentModalVisible(false);
                setIsStudentListModalVisible(true); // Quay lại modal danh sách
              }}
            >
              Hủy
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={() => formUpdateStudentDetail.submit()}
              loading={loading} // Hiển thị loading khi đang submit
            >
              Cập nhật
            </Button>,
          ]}
        >
          <Form
            layout="vertical"
            form={formUpdateStudentDetail}
            onFinish={handleFinishUpdateStudentDetail}
            initialValues={{
              full_name: selectedStudent?.full_name,
              student_code: selectedStudent?.student_code,
              className: selectedStudent?.className,
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
              follow_up_required_display:
                selectedStudent?.follow_up_required === true
                  ? "Có"
                  : selectedStudent?.follow_up_required === false
                  ? "Không"
                  : undefined,
              reaction: selectedStudent?.reaction,
              note: selectedStudent?.note,
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Họ và tên học sinh">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Mã học sinh">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Lớp">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Ngày sinh">
                  <DatePicker disabled style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Mã lịch khám">
              <Input disabled />
            </Form.Item>

            <Form.Item
              name="vaccinated_at"
              label="Ngày tiêm chủng"
              rules={[
                { required: true, message: "Vui lòng chọn ngày tiêm chủng!" },
              ]}
            >
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>

            <Form.Item
              name="vaccine_name"
              label="Tên vắc xin"
              rules={[
                { required: true, message: "Vui lòng nhập tên vắc xin!" },
              ]}
            >
              <Input placeholder="Tên vắc xin đã tiêm" />
            </Form.Item>

            <Form.Item
              name="dose_number"
              label="Số mũi"
              rules={[{ required: true, message: "Vui lòng nhập số mũi!" }]}
            >
              <InputNumber
                min={1}
                style={{ width: "100%" }}
                placeholder="Số mũi đã tiêm"
              />
            </Form.Item>

            <Form.Item
              name="follow_up_required_display" // Tên khác để tránh xung đột với boolean
              label="Cần theo dõi thêm"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn trạng thái theo dõi!",
                },
              ]}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="Có">Có</Option>
                <Option value="Không">Không</Option>
              </Select>
            </Form.Item>

            <Form.Item name="reaction" label="Phản ứng sau tiêm">
              <Input.TextArea rows={3} placeholder="Mô tả phản ứng (nếu có)" />
            </Form.Item>

            <Form.Item name="note" label="Ghi chú">
              <Input.TextArea rows={3} placeholder="Thêm ghi chú khác" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
