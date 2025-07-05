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
import VaccinationDetail from "./components/VaccinationDetail";

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
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [dispatch]);

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([
      dispatch(getParentChildren()),
      dispatch(getVaccineCampaigns()),
      dispatch(getApprovedCampaigns()),
      dispatch(getDeclinedCampaigns()),
    ]).finally(() => {
      setIsLoading(false);
    });
  };

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
    setSelectedCampaignId(campaign.id);
    setDetailModalVisible(true);
  };

  // View vaccination result details
  const handleViewResult = (result) => {
    setSelectedResult(result);
    setResultModalVisible(true);
  };

  // Respond to consent form
  const handleRespondToConsent = (campaign) => {
    setSelectedCampaignId(campaign.id);
    setDetailModalVisible(true);
  };

  // Handle successful response to consent
  const handleConsentSuccess = () => {
    // Refresh data after consent response
    fetchData();
  };

  // Get status tag based on campaign/consent status
  const getStatusTag = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Đã duyệt
          </Tag>
        );
      case "PENDING":
        return (
          <Tag color="processing" icon={<ClockCircleOutlined />}>
            Đang chờ
          </Tag>
        );
      case "DECLINED":
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Từ chối
          </Tag>
        );
      default:
        return (
          <Tag color="default" icon={<ExclamationCircleOutlined />}>
            Không xác định
          </Tag>
        );
    }
  };

  // Columns for the upcoming campaigns table
  const upcomingCampaignsColumns = [
    {
      title: "Tên chiến dịch",
      dataIndex: "title",
      key: "title",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Ngày tiêm",
      dataIndex: "scheduled_date",
      key: "scheduled_date",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Địa điểm",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Trạng thái",
      dataIndex: "approval_status",
      key: "approval_status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Phản hồi",
      dataIndex: "consent_status",
      key: "consent_status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="small">
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
              type="default"
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

  // Columns for the vaccination history table
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

  return (
    <div className="vaccinations-page">
      {isLoading ? (
        <div className="loading-container">
          <Spin size="large" />
          <Text className="mt-2">Đang tải dữ liệu...</Text>
        </div>
      ) : (
        <>
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
                            campaigns.filter(
                              (c) => c.consent_status === "PENDING"
                            ).length
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

              {/* Vaccination Calendar */}
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
                        <CalendarOutlined /> Lịch tiêm sắp tới
                      </span>
                    }
                    key="1"
                  >
                    {campaigns && campaigns.length > 0 ? (
                      <Table
                        columns={upcomingCampaignsColumns}
                        dataSource={campaigns.map((item, index) => ({
                          ...item,
                          key: item.id || index,
                        }))}
                        pagination={{ pageSize: 5 }}
                        size="middle"
                      />
                    ) : (
                      <Empty description="Không có lịch tiêm chủng sắp tới" />
                    )}
                  </TabPane>
                  <TabPane
                    tab={
                      <span>
                        <CheckCircleOutlined /> Đã duyệt
                      </span>
                    }
                    key="2"
                  >
                    {approvedCampaigns && approvedCampaigns.length > 0 ? (
                      <Table
                        columns={upcomingCampaignsColumns}
                        dataSource={approvedCampaigns.map((item, index) => ({
                          ...item,
                          key: `approved-${item.id || index}`,
                        }))}
                        pagination={{ pageSize: 5 }}
                        size="middle"
                      />
                    ) : (
                      <Empty description="Không có lịch tiêm chủng đã duyệt" />
                    )}
                  </TabPane>
                  <TabPane
                    tab={
                      <span>
                        <CloseCircleOutlined /> Từ chối
                      </span>
                    }
                    key="3"
                  >
                    {declinedCampaigns && declinedCampaigns.length > 0 ? (
                      <Table
                        columns={upcomingCampaignsColumns}
                        dataSource={declinedCampaigns.map((item, index) => ({
                          ...item,
                          key: `declined-${item.id || index}`,
                        }))}
                        pagination={{ pageSize: 5 }}
                        size="middle"
                      />
                    ) : (
                      <Empty description="Không có lịch tiêm chủng bị từ chối" />
                    )}
                  </TabPane>
                  <TabPane
                    tab={
                      <span>
                        <MedicineBoxOutlined /> Lịch sử tiêm chủng
                      </span>
                    }
                    key="4"
                  >
                    {vaccinationResults && vaccinationResults.length > 0 ? (
                      <Table
                        columns={vaccinationHistoryColumns}
                        dataSource={vaccinationResults.map((item, index) => ({
                          ...item,
                          key: `history-${item.id || index}`,
                        }))}
                        pagination={{ pageSize: 5 }}
                        size="middle"
                      />
                    ) : (
                      <Empty description="Không có lịch sử tiêm chủng" />
                    )}
                  </TabPane>
                </Tabs>
              </Card>
            </Col>
          </Row>

          {/* Vaccination Detail Modal */}
          <VaccinationDetail
            campaignId={selectedCampaignId}
            visible={detailModalVisible}
            onClose={() => setDetailModalVisible(false)}
            onSuccess={handleConsentSuccess}
          />

          {/* Result Detail Modal */}
          <Modal
            title="Chi tiết kết quả tiêm chủng"
            open={resultModalVisible}
            onCancel={() => setResultModalVisible(false)}
            footer={[
              <Button key="close" onClick={() => setResultModalVisible(false)}>
                Đóng
              </Button>,
            ]}
            width={700}
          >
            {selectedResult ? (
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Tên vaccine">
                  {selectedResult.vaccine_name}
                </Descriptions.Item>
                <Descriptions.Item label="Thuộc chiến dịch">
                  {selectedResult.campaign_title}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tiêm">
                  {moment(selectedResult.vaccinated_at).format("DD/MM/YYYY")}
                </Descriptions.Item>
                <Descriptions.Item label="Mũi số">
                  <Tag color="blue">Mũi {selectedResult.dose_number}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Lô vaccine">
                  {selectedResult.batch_number || "Không có thông tin"}
                </Descriptions.Item>
                <Descriptions.Item label="Phản ứng phụ">
                  {selectedResult.reaction || "Không có"}
                  {selectedResult.follow_up_required && (
                    <Tag color="error" style={{ marginLeft: 8 }}>
                      Cần theo dõi thêm
                    </Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Ghi chú">
                  {selectedResult.notes || "Không có ghi chú"}
                </Descriptions.Item>
                <Descriptions.Item label="Y tá thực hiện">
                  {selectedResult.nurse_name || "Không có thông tin"}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Empty description="Không có thông tin chi tiết" />
            )}
          </Modal>

          <style jsx>{`
            .vaccinations-page {
              padding: 16px;
            }
            .loading-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 300px;
            }
            .mt-2 {
              margin-top: 8px;
            }
          `}</style>
        </>
      )}
    </div>
  );
};

export default VaccinationsPage;
