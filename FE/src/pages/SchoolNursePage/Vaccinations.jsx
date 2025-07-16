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
import { FiFeather, FiPlusCircle, FiCalendar } from "react-icons/fi";
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
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllVaccineCampaigns,
  createVaccinationCampaign,
  updateStudentVaccineDetail,
  fetchApprovedStudentsByCampaignId,
} from "../../redux/nurse/vaccinations/vaccinationSlice";
import { toast } from "react-toastify";
import { debounce } from "lodash";
import {
  fetchMedicalSupplies,
  setMedicalSuppliesPagination,
} from "../../redux/nurse/medicalSupplies/medicalSupplies";
import VaccinesOutlinedIcon from '@mui/icons-material/VaccinesOutlined';

const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Helper: render loading state
const renderLoadingState = () => (
  <div className="text-center py-8 flex flex-col items-center justify-center gap-4">
    <Spin indicator={<LoadingOutlined style={{ fontSize: 30 }} spin />} />
    <p className="text-gray-500 text-lg">Đang tải dữ liệu chiến dịch...</p>
  </div>
);

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

export default function Vaccination() {
  const dispatch = useDispatch();
  const { campaigns, loading } = useSelector((state) => state.vaccination);
  const token = localStorage.getItem("accessToken");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [scheduleTypeFilter, setScheduleTypeFilter] = useState(null);
  const [isCreateNewScheduleModalVisible, setCreateNewScheduleModal] = useState(false);
  const [isStudentListModalVisible, setIsStudentListModalVisible] = useState(false);
  const [isViewStudentModalVisible, setIsViewStudentModalVisible] = useState(false);
  const [approvedStudents, setApprovedStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formCreateNewSchedule] = Form.useForm();
  const [formUpdateStudentDetail] = Form.useForm();

  const debouncedSearch = useMemo(() => {
    return debounce((value) => {
      dispatch(
        fetchMedicalSupplies({
          page: 1,
          pageSize: pagination.pageSize,
          search: value.trim(),
        })
      );
      dispatch(
        setMedicalSuppliesPagination({
          current: 1,
          pageSize: pagination.pageSize,
        })
      );
    }, 500);
  }, [dispatch, pagination.pageSize]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

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

  const classOptions = [1, 2, 3, 4, 5].map((classNumber) => ({
    label: `Lớp ${classNumber}`,
    value: classNumber,
  }));

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      total: (campaigns || []).length,
    }));
  }, [campaigns]);

  const upcomingVaccinations = useMemo(() => {
    const today = startOfDay(new Date());
    return campaigns.filter((item) => {
      if (!item || !item.scheduled_date || item.approval_status !== "APPROVED") return false;
      const parsedDate = parseISO(item.scheduled_date);
      return (
        isAfter(parsedDate, today) ||
        isToday(parsedDate) ||
        isWithinInterval(parsedDate, { start: today, end: addDays(today, 7) })
      );
    });
  }, [campaigns]);

  const handleTableChange = useCallback((newPagination) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  }, []);

  const handleScheduleTypeFilterChange = useCallback((value) => {
    setScheduleTypeFilter(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  const showNewScheduleModal = useCallback(() => {
    formCreateNewSchedule.resetFields();
    setCreateNewScheduleModal(true);
  }, [formCreateNewSchedule]);

  const handleCreateNewScheduleModalOk = useCallback(async () => {
    try {
      const values = await formCreateNewSchedule.validateFields();
      const payload = {
        title: values.title,
        description: values.description,
        scheduled_date: values.scheduled_date ? values.scheduled_date.format("YYYY-MM-DD") : null,
        sponsor: values.sponsor,
        className: values.className,
      };
      await dispatch(createVaccinationCampaign({ token, campaignData: payload })).unwrap();
      toast.success("Tạo lịch tiêm chủng thành công");
      setCreateNewScheduleModal(false);
      formCreateNewSchedule.resetFields();
      dispatch(fetchAllVaccineCampaigns());
    } catch (err) {
      toast.error(err);
    }
  }, [dispatch, formCreateNewSchedule, token]);

  const handleCancelCreateNewScheduleModal = useCallback(() => {
    setCreateNewScheduleModal(false);
    formCreateNewSchedule.resetFields();
  }, [formCreateNewSchedule]);

  const handleViewStudentList = useCallback(async (campaignId) => {
    try {
      const result = await dispatch(fetchApprovedStudentsByCampaignId(campaignId)).unwrap();
      setApprovedStudents(result);
      setIsStudentListModalVisible(true);
    } catch (err) {
      message.error(err.message || "Tải danh sách học sinh thất bại.");
    }
  }, [dispatch]);

  const handleViewStudentDetail = useCallback((selectedStudent) => {
    setSelectedStudent(selectedStudent);
    setIsViewStudentModalVisible(true);
    setIsStudentListModalVisible(false);
  }, []);

  useEffect(() => {
    if (selectedStudent && isViewStudentModalVisible) {
      formUpdateStudentDetail.resetFields();
      formUpdateStudentDetail.setFieldsValue({
        student_id: selectedStudent.student_id,
        full_name: selectedStudent.full_name,
        student_code: selectedStudent.student_code,
        class_name: selectedStudent.class_name,
        date_of_birth: selectedStudent.date_of_birth ? dayjs(selectedStudent.date_of_birth) : null,
        vaccinated_at: selectedStudent.vaccinated_at ? dayjs(selectedStudent.vaccinated_at) : null,
        campaign_id: selectedStudent.campaign_id,
        vaccine_name: selectedStudent.vaccine_name,
        dose_number: selectedStudent.dose_number ? Number(selectedStudent.dose_number) : null,
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

  const handleFinishUpdateStudentDetail = useCallback(async (values) => {
    if (!selectedStudent?.id) {
      message.error("Không tìm thấy học sinh để cập nhật.");
      return;
    }
    const formData = {
      vaccinated_at: values.vaccinated_at ? values.vaccinated_at.format("YYYY-MM-DD") : null,
      vaccine_name: values.vaccine_name || "",
      dose_number: values.dose_number || null,
      reaction: values.reaction || "",
      follow_up_required: values.follow_up_required_display === "Có" ? "Có" : "Không",
      note: values.note || "",
    };
    try {
      await dispatch(updateStudentVaccineDetail({ vaccine_id: selectedStudent.id, values: formData })).unwrap();
      toast.success("Cập nhật ghi chú tiêm thành công!");
      setIsViewStudentModalVisible(false);
      if (selectedStudent.campaign_id) {
        handleViewStudentList(selectedStudent.campaign_id);
      }
    } catch (error) {
      message.error("Cập nhật thất bại: " + (error.message || "Lỗi không xác định"));
    }
  }, [dispatch, selectedStudent, handleViewStudentList]);

  const columns = useMemo(() => [
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
                console.log(record);

                handleViewStudentList(record.campaign_id);
              } else {
                message.warning("Lịch trình này chưa được duyệt.");
              }
            }}
          />
        </Tooltip>
      ),
      className: "!text-gray-700 !font-medium",
    },
  ], [handleViewStudentList]);

  const filteredAndPaginatedCampaigns = useMemo(() => {
    return (campaigns || [])
      .filter(
        (campaign) =>
          (campaign.title && campaign.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (campaign.description && campaign.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (campaign.campaign_id && campaign.campaign_id.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
          (campaign.sponsor && campaign.sponsor.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .filter((campaign) => {
        if (scheduleTypeFilter && campaign.scheduleType !== scheduleTypeFilter) {
          return false;
        }
        return true;
      })
      .slice((pagination.current - 1) * pagination.pageSize, pagination.current * pagination.pageSize);
  }, [campaigns, searchQuery, scheduleTypeFilter, pagination]);

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
            <div style={{ ...statIconStyle, fontSize: 36, background: '#E0F0FF', color: '#28a745' }}>
              <VaccinesOutlinedIcon />
            </div>
            <div>
              <h1 className="text-gray-900 font-semibold text-3xl mb-2" style={fontFamily}>
                Lịch tiêm chủng
              </h1>
              <p className="text-gray-500 flex items-center gap-2 text-sm" style={fontFamily}>
                <span>✨</span>
                Quản lý lịch tiêm chủng và khám sức khỏe
              </p>
            </div>
          </div>
          <Button
            type="primary"
            icon={<FiPlusCircle />}
            onClick={showNewScheduleModal}
            className="flex items-center gap-1 px-4 py-2 !rounded-lg !bg-blue-600 hover:!bg-blue-700 hover:shadow-lg hover:scale-105 transition-all duration-200"
            style={fontFamily}
          >
            Lịch trình mới
          </Button>
        </header>
        {/* chỗ hiện thị lịch tiêm chủng và khám sức khỏe sắp tới */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} lg={24}>
            <Card
              title={
                <div className="flex items-center justify-between text-base" style={fontFamily}>
                  <span className="flex items-center gap-2 text-gray-800 font-medium">
                    <FiCalendar className="text-blue-600" />
                    Tiêm chủng sắp tới
                  </span>
                </div>
              }
              style={cardNeumorph}
              bodyStyle={{ padding: 24 }}
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
                          onClick={() => handleViewStudentList(item.campaign_id)}
                          className="!text-blue-600 hover:!text-blue-700"
                          style={fontFamily}
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
                          <Text strong className="text-gray-900" style={fontFamily}>
                            {item.title} (Lớp {item.class})
                          </Text>
                        }
                        description={
                          <div className="text-gray-600" style={fontFamily}>
                            <p>
                              Ngày khám: <Text className="font-semibold text-green-600">{item.scheduled_date ? `${format(parseISO(item.scheduled_date), "dd/MM/yyyy")} (${differenceInCalendarDays(parseISO(item.scheduled_date), new Date())} ngày nữa)` : "N/A"}</Text>
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
        <Card style={cardNeumorph} bodyStyle={{ padding: 24 }}>
          <div className="flex flex-wrap items-center gap-4 mb-6" style={{ overflowX: "auto" }}>
            <Input
              placeholder=" Tìm theo tên, mã, mô tả..."
              prefix={<SearchOutlined />}
              allowClear
              style={{
                width: 320,
                marginBottom: 3,
             
              }}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                debouncedSearch(e.target.value);
              }}
              value={searchQuery}
            />
            <Button
              icon={<FilterOutlined />}
              className="flex items-center gap-1 px-4 py-2 !border !border-gray-300 !rounded-lg hover:!bg-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-200 !transition-colors !text-gray-900 h-10"
            >
              Lọc
            </Button>
     
          </div>
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
            className="rounded-lg"
            style={{
              borderRadius: 16,
              boxShadow: "0 2px 8px #e0f0ff",
              fontFamily: 'Poppins, Roboto, sans-serif',
              background: '#fff',
            }}
            locale={{
              emptyText: (
                <Empty
                  description="Không tìm thấy dữ liệu lịch trình nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
          />
          <div className="text-sm text-gray-600 mt-4" style={fontFamily}>
            Hiển thị {(pagination.current - 1) * pagination.pageSize + 1} - {Math.min(pagination.current * pagination.pageSize, (campaigns || []).length)} trên tổng số {(campaigns || []).length} lịch trình
          </div>
        </Card>
        {/* Modal Tạo lịch trình mới */}
        <Modal
          title={<span>🗓️ Tạo lịch trình mới</span>}
          open={isCreateNewScheduleModalVisible}
          onOk={handleCreateNewScheduleModalOk}
          onCancel={handleCancelCreateNewScheduleModal}
          okText="Tạo lịch trình"
          cancelText="Hủy"
          confirmLoading={loading}
          style={{ borderRadius: 24 }}
          bodyStyle={{ borderRadius: 24, background: '#F8FBFF', fontFamily: 'Poppins, Roboto, sans-serif' }}
          maskStyle={{ background: 'rgba(224,240,255,0.5)' }}
        >
          <Form
            form={formCreateNewSchedule}
            layout="vertical"
            name="new_schedule_form"
            style={fontFamily}
          >
            <Form.Item
              name="title"
              label={<span>🏷️ Tiêu đề</span>}
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
            >
              <Input placeholder="Nhập tiêu đề lịch tiêm chủng" />
            </Form.Item>
            <Form.Item
              name="description"
              label={<span>📝 Mô tả</span>}
              rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
            >
              <Input.TextArea rows={3} placeholder="Mô tả nội dung lịch tiêm chủng" />
            </Form.Item>

            <Form.Item
              name="scheduled_date"
              label={<span>📅 Ngày tiêm chủng</span>}
              rules={[
                { required: true, message: "Vui lòng chọn ngày tiêm chủng!" },
              ]}
            >
              <DatePicker placeholder="Chọn ngày tiêm chủng" style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>

            <Form.Item
              name="sponsor"
              label={<span>🤝 Nhà tài trợ</span>}
              rules={[
                { required: true, message: "Vui lòng chọn nhà tài trợ !" },
              ]}
            >
              <Input placeholder="Chọn nhà tài trợ" />
            </Form.Item>

            <Form.Item
              name="className"
              label={<span>🏫 Lớp</span>}
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
          style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)" }}
          bodyStyle={{ backgroundColor: "#f9fafe", padding: "24px", borderRadius: 16, fontFamily: 'Poppins, Roboto, sans-serif' }}
          maskStyle={{ backdropFilter: "blur(5px)" }}
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
                dataIndex: "id",
                key: "id",
                hidden: true,
              },
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
                title: "💉 Thời gian tiêm",
                dataIndex: "vaccinated_at",
                key: "vaccinated_at",
                render: (date) =>
                  date ? format(parseISO(date), "dd/MM/yyyy HH:mm:ss") : "N/A", // <-- Đã thêm "HH:mm:ss"
              },
              {
                title: "👁️Hành động",
                key: "action",
                render: (_, record) => (
                  console.log(record),
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
          title={<span>👤 Chi tiết học sinh</span>}
          open={isViewStudentModalVisible}
          onCancel={() => {
            setIsViewStudentModalVisible(false);
            setIsStudentListModalVisible(true);
          }}
          centered
          width={600}
          style={{ borderRadius: 16 }}
          bodyStyle={{ background: '#F8FBFF', borderRadius: 16, fontFamily: 'Poppins, Roboto, sans-serif' }}
          maskStyle={{ background: 'rgba(224,240,255,0.5)' }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setIsViewStudentModalVisible(false);
                setIsStudentListModalVisible(true);
              }}
              style={{ borderRadius: 12, fontFamily: 'Poppins, Roboto, sans-serif' }}
            >
              Hủy
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={() => formUpdateStudentDetail.submit()}
              loading={loading}
              style={{ borderRadius: 12, fontFamily: 'Poppins, Roboto, sans-serif' }}
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
              className: selectedStudent?.class_name,
              date_of_birth: selectedStudent?.date_of_birth ? dayjs(selectedStudent.date_of_birth) : null,
              vaccinated_at: selectedStudent?.vaccinated_at ? dayjs(selectedStudent.vaccinated_at) : null,
              campaign_id: selectedStudent?.campaign_id,
              vaccine_name: selectedStudent?.vaccine_name,
              dose_number: selectedStudent?.dose_number ? Number(selectedStudent?.dose_number) : null,
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
                <Form.Item label={<span>👤 Họ và tên học sinh</span>}>
                  <Input readOnly value={selectedStudent?.full_name} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={<span>🎓 Mã học sinh</span>}>
                  <Input readOnly value={selectedStudent?.student_code} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={<span>🏫 Lớp</span>}>
                  <Input readOnly value={selectedStudent?.class_name} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={<span>🎂 Ngày sinh</span>}>
                  <DatePicker
                    readOnly
                    value={selectedStudent?.date_of_birth ? dayjs(selectedStudent.date_of_birth) : null}
                    style={{ width: "100%" }}
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label={<span>🧾 Mã lịch khám</span>}>
              <Input readOnly value={selectedStudent?.campaign_id} />
            </Form.Item>
            <Form.Item
              name="vaccinated_at"
              label={<span>📅 Ngày tiêm chủng</span>}
              rules={[
                { required: true, message: "Vui lòng chọn ngày tiêm chủng!" },
              ]}
            >
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item
              name="vaccine_name"
              label={<span>💉 Tên vắc xin</span>}
              rules={[
                { required: true, message: "Vui lòng nhập tên vắc xin!" },
              ]}
            >
              <Input placeholder="Tên vắc xin đã tiêm" />
            </Form.Item>
            <Form.Item
              name="dose_number"
              label={<span>#️⃣ Số mũi</span>}
              rules={[{ required: true, message: "Vui lòng nhập số mũi!" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} placeholder="Số mũi đã tiêm" />
            </Form.Item>
            <Form.Item
              name="follow_up_required_display"
              label={<span>👀 Cần theo dõi thêm</span>}
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
            <Form.Item name="reaction" label={<span>💬 Phản ứng sau tiêm</span>}>
              <Input.TextArea rows={3} placeholder="Mô tả phản ứng (nếu có)" />
            </Form.Item>
            <Form.Item name="note" label={<span>��️ Ghi chú</span>}>
              <Input.TextArea rows={3} placeholder="Thêm ghi chú khác" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
