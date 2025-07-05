/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Calendar,
  Badge,
  Alert,
  Avatar,
  Progress,
  Spin,
  Empty,
  Tabs,
  Form,
  Input,
  Radio,
  Descriptions,
  Divider,
  message,
  Tooltip,
  Select,
  Statistic,
} from "antd";
import {
  CalendarOutlined,
  MedicineBoxOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  BankOutlined,
} from "@ant-design/icons";
import moment from "moment";
import {
  getParentChildren,
  getChildDetails,
  getVaccineCampaigns,
  getVaccineCampaignDetails,
  getApprovedCampaigns,
  getDeclinedCampaigns,
  respondToVaccinationConsent,
  getStudentVaccinations,
} from "../../redux/parent/parentSlice";
import api from "../../configs/config-axios";
import VaccinationCalendar from "./components/VaccinationCalendar";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { confirm } = Modal;

const VaccinationsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    children,
    selectedChild,
    vaccinations,
    loading: childrenLoading,
  } = useSelector((state) => state.parent);

  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [campaignModalVisible, setCampaignModalVisible] = useState(false);
  const [consentModalVisible, setConsentModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [consentForm] = Form.useForm();
  const [campaigns, setCampaigns] = useState([]);
  const [approvedCampaigns, setApprovedCampaigns] = useState([]);
  const [declinedCampaigns, setDeclinedCampaigns] = useState([]);
  const [vaccinationResults, setVaccinationResults] = useState([]);
  const [calendarData, setCalendarData] = useState({});

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getParentChildren());
    dispatch(getVaccineCampaigns());
    dispatch(getApprovedCampaigns());
    dispatch(getDeclinedCampaigns());
  }, [dispatch]);

  // When children data is loaded, select the first child
  useEffect(() => {
    if (children && children.length > 0 && !selectedChild) {
      dispatch(getChildDetails(children[0].id));
    }
  }, [dispatch, children, selectedChild]);

  // When a child is selected, fetch their vaccinations
  useEffect(() => {
    if (selectedChild?.id) {
      dispatch(getStudentVaccinations(selectedChild.id));
    }
  }, [dispatch, selectedChild]);

  // Process vaccination data for display
  useEffect(() => {
    // Update campaigns data from Redux store
    if (vaccinations.campaigns && Array.isArray(vaccinations.campaigns)) {
      setCampaigns(vaccinations.campaigns);
    } else {
      setCampaigns([]);
    }

    // Update approved campaigns
    if (vaccinations.approved && Array.isArray(vaccinations.approved)) {
      setApprovedCampaigns(vaccinations.approved);
    } else {
      setApprovedCampaigns([]);
    }

    // Update declined campaigns
    if (vaccinations.declined && Array.isArray(vaccinations.declined)) {
      setDeclinedCampaigns(vaccinations.declined);
    } else {
      setDeclinedCampaigns([]);
    }

    // Process calendar data
    processCalendarData(vaccinations.campaigns || []);

    // Process vaccination results for the selected student
    if (
      selectedChild?.id &&
      vaccinations.studentVaccinations?.[selectedChild.id]
    ) {
      setVaccinationResults(vaccinations.studentVaccinations[selectedChild.id]);
    } else {
      setVaccinationResults([]);
    }
  }, [vaccinations, selectedChild]);

  // Process calendar data for the calendar display
  const processCalendarData = (campaigns) => {
    if (!campaigns || !Array.isArray(campaigns)) return;

    const calData = {};

    campaigns.forEach((campaign) => {
      if (!campaign || !campaign.scheduled_date) return;

      const dateKey = moment(campaign.scheduled_date).format("YYYY-MM-DD");
      if (!calData[dateKey]) {
        calData[dateKey] = [];
      }
      calData[dateKey].push(campaign);
    });

    setCalendarData(calData);
  };

  // Render data cell in calendar
  const dateCellRender = (value) => {
    const dateKey = value.format("YYYY-MM-DD");
    const listData = calendarData[dateKey] || [];

    if (listData.length === 0) return null;

    return (
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {listData.map((item, index) => (
          <li
            key={`${dateKey}-${index}`}
            style={{ margin: "2px 0", fontSize: "12px" }}
          >
            <Tag
              color="blue"
              style={{
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.title}
            </Tag>
          </li>
        ))}
      </ul>
    );
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // Handle selecting a child
  const handleSelectChild = (childId) => {
    dispatch(getChildDetails(childId));
  };

  // View campaign details
  const handleViewCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setCampaignModalVisible(true);
  };

  // View vaccination result details
  const handleViewResult = (result) => {
    setSelectedResult(result);
    setResultModalVisible(true);
  };

  // Respond to consent form
  const handleRespondToConsent = (campaign) => {
    setSelectedCampaign(campaign);
    setConsentModalVisible(true);
    consentForm.resetFields();
  };

  // Submit consent response
  const handleSubmitConsent = (values) => {
    if (!selectedChild?.id || !selectedCampaign?.campaign_id) {
      message.error("Không thể xác định thông tin học sinh hoặc chiến dịch");
      return;
    }

    dispatch(
      respondToVaccinationConsent({
        notificationId: selectedCampaign.notification_id,
        studentId: selectedChild.id,
        campaignId: selectedCampaign.campaign_id,
        consent: values.consent,
      })
    )
      .unwrap()
      .then(() => {
        message.success("Đã gửi phản hồi thành công");
        setConsentModalVisible(false);

        // Refresh data
        dispatch(getVaccineCampaigns());
        dispatch(getApprovedCampaigns());
        dispatch(getDeclinedCampaigns());

        if (selectedChild?.id) {
          dispatch(getStudentVaccinations(selectedChild.id));
        }
      })
      .catch((error) => {
        console.error("Error submitting consent:", error);
        message.error(
          "Không thể gửi phản hồi: " + (error.message || "Lỗi không xác định")
        );
      });
  };

  // Fetch all campaigns
  const fetchAllCampaigns = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        dispatch(getVaccineCampaigns()),
        dispatch(getApprovedCampaigns()),
        dispatch(getDeclinedCampaigns()),
      ]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching vaccination campaigns:", error);
      message.error("Không thể tải thông tin chiến dịch tiêm chủng");
      // Use mock data as fallback
      useMockCampaignData();
      setIsLoading(false);
    }
  };

  // Fetch vaccination results for a student
  const fetchVaccinationResults = async (studentId) => {
    if (!studentId) return;

    try {
      setIsLoading(true);
      await dispatch(getStudentVaccinations(studentId));
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching vaccination results:", error);
      // Use mock data as fallback
      useMockVaccinationResults(studentId);
      setIsLoading(false);
    }
  };

  // Use mock data if API fails
  const useMockCampaignData = () => {
    const mockCampaigns = [
      {
        campaign_id: 1,
        title: "Tiêm phòng sởi MMR đợt 1/2024",
        description:
          "Chiến dịch tiêm chủng vaccine MMR ngừa sởi, quai bị và rubella cho học sinh tiểu học",
        scheduled_date: "2024-08-15",
        created_at: "2024-07-01T08:30:00",
        created_by: 5, // nurse_id
        approved_by: "Nguyễn Thị Quản Lý", // manager name
        approval_status: "APPROVED",
        sponsor: "Sở Y tế TP.HCM",
        class: 3, // class_id or grade level
        consent_status: "PENDING",
        form_id: 1,
        location: "Phòng y tế trường học",
      },
      {
        campaign_id: 2,
        title: "Tiêm phòng viêm não Nhật Bản",
        description: "Tiêm ngừa viêm não Nhật Bản cho học sinh 6-8 tuổi",
        scheduled_date: "2024-09-20",
        created_at: "2024-07-10T10:15:00",
        created_by: 5, // nurse_id
        approved_by: null, // not yet approved
        approval_status: "PENDING",
        sponsor: "Bộ Y tế Việt Nam",
        class: 2, // class_id or grade level
        consent_status: "PENDING",
        form_id: 2,
        location: "Phòng y tế trường học",
      },
      {
        campaign_id: 3,
        title: "Tiêm vaccine Covid-19 mũi nhắc lại",
        description: "Tiêm mũi nhắc lại vaccine Covid-19 cho học sinh",
        scheduled_date: "2024-10-05",
        created_at: "2024-07-15T14:00:00",
        created_by: 6, // nurse_id
        approved_by: "Nguyễn Thị Quản Lý", // manager name
        approval_status: "APPROVED",
        sponsor: "Bộ Y tế và UNICEF",
        class: 0, // all classes
        consent_status: "PENDING",
        form_id: 3,
        location: "Hội trường trường học",
      },
    ];

    setCampaigns(mockCampaigns);
    setApprovedCampaigns(
      mockCampaigns.filter((c) => c.approval_status === "APPROVED")
    );
    setDeclinedCampaigns([]);
    processCalendarData(mockCampaigns);
  };

  // Use mock vaccination results if API fails
  const useMockVaccinationResults = (studentId) => {
    const mockResults = [
      {
        id: 1,
        campaign_id: 101,
        student_id: studentId,
        consent_form_id: 201,
        vaccinated_at: "2023-10-15T09:30:00",
        vaccine_name: "MMR (Sởi - Quai bị - Rubella)",
        dose_number: 2,
        reaction: "Không có phản ứng",
        follow_up_required: false,
        note: "Tiêm chủng thành công",
        campaign_title: "Tiêm chủng MMR định kỳ năm 2023",
      },
      {
        id: 2,
        campaign_id: 102,
        student_id: studentId,
        consent_form_id: 202,
        vaccinated_at: "2023-05-20T10:15:00",
        vaccine_name: "Viêm gan B",
        dose_number: 3,
        reaction: "Sốt nhẹ sau tiêm 24 giờ",
        follow_up_required: true,
        note: "Theo dõi thêm",
        campaign_title: "Tiêm vaccine Viêm gan B đợt 2/2023",
      },
      {
        id: 3,
        campaign_id: 103,
        student_id: studentId,
        consent_form_id: 203,
        vaccinated_at: "2022-11-10T09:00:00",
        vaccine_name: "Cúm mùa",
        dose_number: 1,
        reaction: "Không có phản ứng",
        follow_up_required: false,
        note: "Tiêm chủng thành công",
        campaign_title: "Tiêm ngừa cúm mùa 2022-2023",
      },
    ];

    setVaccinationResults(mockResults);
  };

  // Columns for upcoming vaccination campaigns table
  const upcomingCampaignsColumns = [
    {
      title: "Tên chiến dịch",
      dataIndex: "title",
      key: "title",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Ngày tiêm dự kiến",
      dataIndex: "scheduled_date",
      key: "scheduled_date",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Nhà tài trợ",
      dataIndex: "sponsor",
      key: "sponsor",
    },
    {
      title: "Trạng thái phê duyệt",
      dataIndex: "approval_status",
      key: "approval_status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Trạng thái đồng ý",
      dataIndex: "consent_status",
      key: "consent_status",
      render: (status) => getStatusTag(status || "PENDING"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<InfoCircleOutlined />}
            onClick={() => handleViewCampaign(record)}
          >
            Chi tiết
          </Button>
          {record.consent_status === "PENDING" && (
            <Button
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => handleRespondToConsent(record)}
            >
              Phản hồi
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Columns for vaccination history table
  const vaccinationHistoryColumns = [
    {
      title: "Tên vaccine",
      dataIndex: "vaccine_name",
      key: "vaccine_name",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Thuộc chiến dịch",
      dataIndex: "campaign_title",
      key: "campaign_title",
    },
    {
      title: "Ngày tiêm",
      dataIndex: "vaccinated_at",
      key: "vaccinated_at",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Mũi số",
      dataIndex: "dose_number",
      key: "dose_number",
      render: (dose) => <Tag color="blue">Mũi {dose}</Tag>,
    },
    {
      title: "Phản ứng phụ",
      dataIndex: "reaction",
      key: "reaction",
      render: (reaction, record) => (
        <>
          <Text>{reaction}</Text>
          {record.follow_up_required && (
            <Tooltip title="Cần theo dõi thêm">
              <ExclamationCircleOutlined
                style={{ color: "#ff4d4f", marginLeft: 8 }}
              />
            </Tooltip>
          )}
        </>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<InfoCircleOutlined />}
          onClick={() => handleViewResult(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  // Get status tag based on campaign/consent status
  const getStatusTag = (status) => {
    if (!status) return null;

    switch (status.toUpperCase()) {
      case "APPROVED":
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Đã đồng ý
          </Tag>
        );
      case "PENDING":
        return (
          <Tag icon={<ClockCircleOutlined />} color="warning">
            Chờ phản hồi
          </Tag>
        );
      case "REJECTED":
        return (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Đã từ chối
          </Tag>
        );
      case "COMPLETED":
        return (
          <Tag icon={<CheckCircleOutlined />} color="blue">
            Đã tiêm
          </Tag>
        );
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  // Loading state
  if (isLoading || childrenLoading) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Đang tải thông tin tiêm chủng...</p>
      </div>
    );
  }

  // Empty state
  if (!children || children.length === 0) {
    return (
      <Card>
        <Empty description="Không có thông tin con em" />
      </Card>
    );
  }

  return (
    <div className="vaccination-page">
      {/* Header section */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              <MedicineBoxOutlined style={{ marginRight: 8 }} /> Lịch tiêm chủng
            </Title>
            <Text type="secondary">
              Thông tin về các đợt tiêm chủng và lịch sử tiêm chủng của học sinh
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Student selector */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col span={8}>
            <Text strong>Chọn học sinh:</Text>
            <Select
              style={{ width: "100%", marginTop: 8 }}
              placeholder="Chọn học sinh"
              value={selectedChild?.id}
              onChange={handleSelectChild}
            >
              {children.map((child, index) => (
                <Option key={child.id || `child-${index}`} value={child.id}>
                  {child.full_name || child.name || `Học sinh ${index + 1}`}
                </Option>
              ))}
            </Select>
          </Col>
          {selectedChild && (
            <Col span={16}>
              <Card bordered={false} bodyStyle={{ padding: 0 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Descriptions size="small">
                      <Descriptions.Item label="Họ tên" span={3}>
                        {selectedChild.full_name}
                      </Descriptions.Item>
                      <Descriptions.Item label="Lớp" span={3}>
                        {selectedChild.class_name}
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                  <Col span={12}>
                    <Descriptions size="small">
                      <Descriptions.Item label="Ngày sinh" span={3}>
                        {selectedChild.date_of_birth &&
                          moment(selectedChild.date_of_birth).format(
                            "DD/MM/YYYY"
                          )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Giới tính" span={3}>
                        {selectedChild.gender}
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                </Row>
              </Card>
            </Col>
          )}
        </Row>
      </Card>

      {/* Main content */}
      <Row gutter={[16, 16]}>
        {/* Vaccination overview card */}
        <Col xs={24} md={8}>
          <Card title="Tổng quan tiêm chủng" style={{ marginBottom: 16 }}>
            {selectedChild ? (
              <>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Statistic
                      title="Đã tiêm"
                      value={vaccinationResults.length}
                      suffix="mũi"
                      valueStyle={{ color: "#3f8600" }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Sắp tới"
                      value={
                        campaigns.filter(
                          (c) => c.approval_status === "APPROVED"
                        ).length
                      }
                      suffix="đợt"
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Chờ phản hồi"
                      value={
                        campaigns.filter((c) => c.consent_status === "PENDING")
                          .length
                      }
                      suffix="đợt"
                      valueStyle={{ color: "#faad14" }}
                    />
                  </Col>
                </Row>
              </>
            ) : (
              <Empty description="Không có thông tin học sinh" />
            )}
          </Card>

          {/* Thay thế Card Calendar bằng component VaccinationCalendar */}
          <VaccinationCalendar
            campaigns={campaigns}
            loading={childrenLoading}
          />
        </Col>

        {/* Main content tabs */}
        <Col xs={24} md={16}>
          <Card>
            <Tabs activeKey={activeTab} onChange={handleTabChange}>
              <TabPane
                tab={
                  <span>
                    <ClockCircleOutlined /> Chiến dịch tiêm chủng sắp tới
                  </span>
                }
                key="1"
              >
                {campaigns.length > 0 ? (
                  <Table
                    dataSource={campaigns}
                    columns={upcomingCampaignsColumns}
                    rowKey="campaign_id"
                    pagination={{ pageSize: 5 }}
                  />
                ) : (
                  <Empty description="Không có chiến dịch tiêm chủng nào sắp tới" />
                )}
              </TabPane>
              <TabPane
                tab={
                  <span>
                    <CheckCircleOutlined /> Lịch sử tiêm chủng
                  </span>
                }
                key="2"
              >
                {vaccinationResults.length > 0 ? (
                  <Table
                    dataSource={vaccinationResults}
                    columns={vaccinationHistoryColumns}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                  />
                ) : (
                  <Empty description="Chưa có lịch sử tiêm chủng" />
                )}
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* Campaign detail modal */}
      <Modal
        title={
          <div>
            <CalendarOutlined style={{ marginRight: 8 }} />
            Chi tiết chiến dịch tiêm chủng
          </div>
        }
        open={campaignModalVisible}
        onCancel={() => setCampaignModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setCampaignModalVisible(false)}>
            Đóng
          </Button>,
          selectedCampaign && selectedCampaign.consent_status === "PENDING" && (
            <Button
              key="submit"
              type="primary"
              onClick={() => {
                setCampaignModalVisible(false);
                handleRespondToConsent(selectedCampaign);
              }}
            >
              Phản hồi
            </Button>
          ),
        ]}
        width={700}
      >
        {selectedCampaign && (
          <>
            <Descriptions title="Thông tin chung" bordered column={2}>
              <Descriptions.Item label="Tên chiến dịch" span={2}>
                {selectedCampaign.title}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tiêm">
                {moment(selectedCampaign.scheduled_date).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Địa điểm">
                {selectedCampaign.location}
              </Descriptions.Item>
              <Descriptions.Item label="Nhà tài trợ">
                {selectedCampaign.sponsor}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {getStatusTag(selectedCampaign.approval_status)}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>
                {selectedCampaign.description}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="Thông tin phản hồi" bordered>
              <Descriptions.Item label="Trạng thái phản hồi" span={3}>
                {getStatusTag(selectedCampaign.consent_status || "PENDING")}
              </Descriptions.Item>
              {selectedCampaign.note && (
                <Descriptions.Item label="Ghi chú" span={3}>
                  {selectedCampaign.note}
                </Descriptions.Item>
              )}
            </Descriptions>
          </>
        )}
      </Modal>

      {/* Consent response modal */}
      <Modal
        title={
          <div>
            <FileTextOutlined style={{ marginRight: 8 }} />
            Phản hồi phiếu đồng ý tiêm chủng
          </div>
        }
        open={consentModalVisible}
        onCancel={() => setConsentModalVisible(false)}
        footer={null}
      >
        <Form
          form={consentForm}
          layout="vertical"
          onFinish={handleSubmitConsent}
        >
          <Alert
            message="Thông tin chiến dịch"
            description={
              selectedCampaign ? (
                <>
                  <p>
                    <strong>Tên chiến dịch:</strong> {selectedCampaign.title}
                  </p>
                  <p>
                    <strong>Ngày tiêm chủng:</strong>{" "}
                    {moment(selectedCampaign.scheduled_date).format(
                      "DD/MM/YYYY"
                    )}
                  </p>
                  <p>
                    <strong>Địa điểm:</strong> {selectedCampaign.location}
                  </p>
                </>
              ) : (
                "Không có thông tin"
              )
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            name="consent"
            label="Phản hồi của phụ huynh"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn phản hồi",
              },
            ]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value="APPROVED">
                  <Text strong style={{ color: "#52c41a" }}>
                    Đồng ý
                  </Text>{" "}
                  - Con tôi được phép tham gia chiến dịch tiêm chủng này
                </Radio>
                <Radio value="REJECTED">
                  <Text strong style={{ color: "#f5222d" }}>
                    Từ chối
                  </Text>{" "}
                  - Con tôi không tham gia chiến dịch tiêm chủng này
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="note" label="Ghi chú (không bắt buộc)">
            <Input.TextArea rows={4} placeholder="Nhập ghi chú nếu cần..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Gửi phản hồi
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => setConsentModalVisible(false)}
            >
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Vaccination result modal */}
      <Modal
        title={
          <div>
            <MedicineBoxOutlined style={{ marginRight: 8 }} />
            Chi tiết kết quả tiêm chủng
          </div>
        }
        open={resultModalVisible}
        onCancel={() => setResultModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setResultModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedResult && (
          <Descriptions title="Thông tin tiêm chủng" bordered column={2}>
            <Descriptions.Item label="Tên vaccine" span={2}>
              {selectedResult.vaccine_name}
            </Descriptions.Item>
            <Descriptions.Item label="Thuộc chiến dịch" span={2}>
              {selectedResult.campaign_title}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tiêm">
              {moment(selectedResult.vaccinated_at).format("DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Mũi số">
              <Tag color="blue">Mũi {selectedResult.dose_number}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Phản ứng phụ" span={2}>
              {selectedResult.reaction || "Không có phản ứng phụ"}
              {selectedResult.follow_up_required && (
                <Tag color="red" style={{ marginLeft: 8 }}>
                  Cần theo dõi thêm
                </Tag>
              )}
            </Descriptions.Item>
            {selectedResult.note && (
              <Descriptions.Item label="Ghi chú" span={2}>
                {selectedResult.note}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default VaccinationsPage;
