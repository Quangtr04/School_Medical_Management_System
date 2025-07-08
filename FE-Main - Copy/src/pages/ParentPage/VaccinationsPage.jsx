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
import VaccinationHistoryDetail from "./components/VaccinationHistoryDetail";

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
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyData, setHistoryData] = useState([]);

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
      dispatch(getChildDetails(children[0].student_id));
    }
  }, [dispatch, children, selectedChild]);

  // When a child is selected, fetch their vaccinations
  useEffect(() => {
    if (selectedChild?.student_id) {
      dispatch(getStudentVaccinations(selectedChild.student_id));
    }
  }, [dispatch, selectedChild]);
  useEffect(() => {
    console.log("selectedChild", selectedChild);
    console.log(
      "vaccinations.studentVaccinations",
      vaccinations.studentVaccinations
    );
  }, [vaccinations, selectedChild]);
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
      selectedChild?.student_id &&
      vaccinations.studentVaccinations?.[selectedChild.student_id]
    ) {
      setVaccinationResults(
        vaccinations.studentVaccinations[selectedChild.student_id]
      );
    } else {
      setVaccinationResults([]);
    }
  }, [vaccinations, selectedChild]);

  const handleOpenHistoryModal = async (record) => {
    try {
      const result = await dispatch(
        getStudentVaccinations({
          campaignId: record.campaign_id, // hoặc record.form_id tùy backend
          studentId: selectedChild.student_id,
        })
      ).unwrap();

      setHistoryData(result.data); // ✅ Gán dữ liệu vào state để truyền qua props
      setHistoryModalVisible(true);
    } catch (error) {
      message.error("Không thể tải lịch sử tiêm chủng");
      console.error(error);
    }
  };

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
    setSelectedCampaignId(campaign.form_id);
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

  // Tìm form_id theo selectedChild và selectedCampaignId
  const currentForm = campaigns.find(
    (item) =>
      item.form_id === selectedCampaignId ||
      item.campaign_id === selectedCampaignId
  );

  const formId = currentForm?.form_id || null;

  // Get status tag based on campaign/consent status
  const getStatusTag = (status) => {
    switch (status) {
      case "AGREED":
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Đã chấp thuận
          </Tag>
        );
      case "PENDING":
        return (
          <Tag color="processing" icon={<ClockCircleOutlined />}>
            Đang chờ phản hồi
          </Tag>
        );
      case "DECLINED":
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Đã từ chối
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
      title: "Mô tả chiến dịch",
      dataIndex: "description",
      key: "description",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Ngày tiêm",
      dataIndex: "scheduled_date",
      key: "scheduled_date",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Tên Học Sinh",
      dataIndex: "full_name",
      key: "full_name",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Lớp",
      dataIndex: "class",
      key: "class",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Button
            type="primary"
            size="small"
            icon={<InfoCircleOutlined />}
            onClick={() => handleViewCampaign(record)}
            block
          >
            Xem chi tiết
          </Button>

          {record.consent_status === "PENDING" && (
            <Button
              type="default"
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => handleRespondToConsent(record)}
              block
            >
              Phản hồi đồng ý
            </Button>
          )}

          {record.status === "AGREED" && (
            <Button
              type="dashed"
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => handleOpenHistoryModal(record)}
              block
            >
              Lịch sử tiêm chủng
            </Button>
          )}
        </Space>
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
                </Tabs>
              </Card>
            </Col>
          </Row>

          {/* Vaccination Detail Modal */}
          <VaccinationDetail
            form_id={formId}
            campaignId={selectedCampaignId}
            visible={detailModalVisible}
            onClose={() => setDetailModalVisible(false)}
            onSuccess={handleConsentSuccess}
          />

          <VaccinationHistoryDetail
            visible={historyModalVisible}
            onClose={() => {
              setHistoryModalVisible(false);
              setHistoryData([]); // clear
            }}
            student={selectedChild}
            data={historyData}
            destroyOnClose
          />

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
