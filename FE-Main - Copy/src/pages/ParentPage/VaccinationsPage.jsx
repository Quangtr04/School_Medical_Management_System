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
} from "@ant-design/icons";
import moment from "moment";
import {
  getParentChildren,
  getChildDetails,
  getVaccineCampaigns,
  getApprovedCampaigns,
  getDeclinedCampaigns,
  respondToVaccinationConsent,
  getIncidentsByUser,
} from "../../redux/parent/parentSlice";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { confirm } = Modal;

export default function VaccinationsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { children, selectedChild, vaccinations, loading, error, success } =
    useSelector((state) => state.parent);

  const [selectedDate, setSelectedDate] = useState(null);
  const [campaignModalVisible, setCampaignModalVisible] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [responseForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [studentVaccinations, setStudentVaccinations] = useState([]);

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

  // When a child is selected, fetch their incidents (which include vaccination reactions)
  useEffect(() => {
    if (selectedChild?.id) {
      dispatch(getIncidentsByUser(selectedChild.id));
    }
  }, [dispatch, selectedChild]);

  // Filter vaccinations for the selected child
  useEffect(() => {
    if (selectedChild && vaccinations) {
      // Get student vaccinations from Redux store if available
      const studentVaccinationData =
        vaccinations.studentVaccinations[selectedChild.id];

      if (studentVaccinationData) {
        setStudentVaccinations(studentVaccinationData);
        return;
      }

      // If not available in Redux store, create from campaigns
      const childVaccines = [];

      // Add upcoming vaccinations from campaigns
      if (vaccinations.campaigns) {
        vaccinations.campaigns.forEach((campaign) => {
          if (campaign.status === "upcoming") {
            childVaccines.push({
              id: `campaign-${campaign.id}`,
              campaignId: campaign.id,
              vaccineName: campaign.vaccineType || campaign.name,
              type: "Chiến dịch",
              scheduledDate: campaign.startDate,
              actualDate: null,
              status: "upcoming",
              location: campaign.location || "Trạm y tế trường học",
              description: campaign.description,
              notes: campaign.notes || "Cần có sự đồng ý của phụ huynh",
              responseStatus: getStudentResponseStatus(
                campaign,
                selectedChild.id
              ),
              responseDeadline: campaign.responseDeadline,
            });
          }
        });
      }

      // Add approved vaccinations
      if (vaccinations.approved) {
        vaccinations.approved.forEach((campaign) => {
          if (campaign.studentId === selectedChild.id) {
            childVaccines.push({
              id: `approved-${campaign.id}`,
              campaignId: campaign.id,
              vaccineName: campaign.vaccineType || campaign.name,
              type: "Đã đồng ý",
              scheduledDate: campaign.startDate,
              actualDate: campaign.actualVaccinationDate || null,
              status: campaign.status,
              location: campaign.location || "Trạm y tế trường học",
              description: campaign.description,
              notes: campaign.notes,
              responseStatus: "approved",
            });
          }
        });
      }

      // Add declined vaccinations
      if (vaccinations.declined) {
        vaccinations.declined.forEach((campaign) => {
          if (campaign.studentId === selectedChild.id) {
            childVaccines.push({
              id: `declined-${campaign.id}`,
              campaignId: campaign.id,
              vaccineName: campaign.vaccineType || campaign.name,
              type: "Đã từ chối",
              scheduledDate: campaign.startDate,
              actualDate: null,
              status: "declined",
              location: campaign.location || "Trạm y tế trường học",
              description: campaign.description,
              notes: campaign.parentNotes || "Đã từ chối tiêm chủng",
              responseStatus: "declined",
            });
          }
        });
      }

      setStudentVaccinations(childVaccines);
    }
  }, [selectedChild, vaccinations]);

  // Helper function to get student response status for a campaign
  const getStudentResponseStatus = (campaign, studentId) => {
    if (!campaign.studentResponses) return null;

    const studentResponse = campaign.studentResponses[studentId];
    return studentResponse ? studentResponse.status : null;
  };

  // Calculate vaccination statistics
  const completedVaccinations = studentVaccinations.filter(
    (v) => v.status === "completed"
  ).length;
  const upcomingVaccinations = studentVaccinations.filter(
    (v) => v.status === "upcoming"
  ).length;
  const declinedVaccinations = studentVaccinations.filter(
    (v) => v.status === "declined"
  ).length;
  const totalVaccinations = studentVaccinations.length;

  const progressPercentage =
    totalVaccinations > 0
      ? Math.round((completedVaccinations / totalVaccinations) * 100)
      : 0;

  // Filter vaccinations based on active tab
  const getFilteredVaccinations = () => {
    switch (activeTab) {
      case "upcoming":
        return studentVaccinations.filter((v) => v.status === "upcoming");
      case "completed":
        return studentVaccinations.filter((v) => v.status === "completed");
      case "declined":
        return studentVaccinations.filter((v) => v.status === "declined");
      default:
        return studentVaccinations;
    }
  };

  // Table columns definition
  const columns = [
    {
      title: "Tên vaccine",
      dataIndex: "vaccineName",
      key: "vaccineName",
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Ngày tiêm dự kiến",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày tiêm thực tế",
      dataIndex: "actualDate",
      key: "actualDate",
      render: (date) => (date ? moment(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        let config = {
          color: "default",
          icon: null,
          text: status,
          style: {
            borderRadius: "16px",
            padding: "4px 10px",
            fontWeight: "600",
            fontSize: "12px",
            textTransform: "uppercase",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          },
        };

        switch (status) {
          case "completed":
            config = {
              ...config,
              color: "green",
              icon: <CheckCircleOutlined />,
              text: "Đã tiêm",
              style: {
                ...config.style,
                backgroundColor: "#f6ffed",
                borderColor: "#b7eb8f",
                color: "#389e0d",
              },
            };
            break;

          case "upcoming":
            config = {
              ...config,
              color: "orange",
              icon: <ClockCircleOutlined />,
              text: "Sắp tới",
              style: {
                ...config.style,
                backgroundColor: "#fff7e6",
                borderColor: "#ffd591",
                color: "#d46b08",
              },
            };
            break;

          case "declined":
            config = {
              ...config,
              color: "red",
              icon: <ExclamationCircleOutlined />,
              text: "Đã từ chối",
              style: {
                ...config.style,
                backgroundColor: "#fff1f0",
                borderColor: "#ffa39e",
                color: "#cf1322",
              },
            };
            break;

          default:
            config.text = "Không xác định";
            break;
        }

        return (
          <Tag icon={config.icon} style={config.style} color={config.color}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "Địa điểm",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => {
        if (record.status === "upcoming" && !record.responseStatus) {
          return (
            <Space>
              <Button
                type="primary"
                size="small"
                onClick={() => handleViewCampaign(record)}
              >
                Xem chi tiết
              </Button>
            </Space>
          );
        } else if (
          record.responseStatus === "approved" &&
          record.status !== "completed"
        ) {
          return <Tag color="green">Đã đồng ý</Tag>;
        } else if (record.responseStatus === "declined") {
          return <Tag color="red">Đã từ chối</Tag>;
        }
        return null;
      },
    },
  ];

  // Calendar data helpers
  const getListData = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    const dayVaccinations = studentVaccinations.filter(
      (v) => v.scheduledDate === dateStr || v.actualDate === dateStr
    );

    return dayVaccinations.map((v) => ({
      type:
        v.status === "completed"
          ? "success"
          : v.status === "upcoming"
          ? "warning"
          : "error",
      content: v.vaccineName,
    }));
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {listData.map((item, index) => (
          <li key={index}>
            <Badge status={item.type} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };

  // Handle selecting a child
  const handleSelectChild = (child) => {
    dispatch(getChildDetails(child.id));
  };

  // Handle viewing campaign details
  const handleViewCampaign = (vaccination) => {
    // Find the full campaign details
    const campaign = vaccinations.campaigns.find(
      (c) => c.id === vaccination.campaignId
    );
    setSelectedCampaign(campaign);
    setCampaignModalVisible(true);

    // Reset form
    responseForm.resetFields();
  };

  // Handle responding to vaccination consent
  const handleRespondToVaccine = (values) => {
    if (!selectedChild || !selectedCampaign) return;

    const responseData = {
      studentId: selectedChild.id,
      status: values.response,
      notes: values.notes,
    };

    dispatch(
      respondToVaccinationConsent({
        id: selectedCampaign.id,
        responseData,
      })
    );

    // Close modal
    setCampaignModalVisible(false);

    // Show success message
    message.success(
      values.response === "approved"
        ? "Đã đồng ý cho con tham gia tiêm chủng"
        : "Đã từ chối cho con tham gia tiêm chủng"
    );
  };

  // Loading state
  if (loading && !children.length) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Text type="danger">{error}</Text>
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
    <div style={{ padding: "0" }}>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
              <MedicineBoxOutlined style={{ marginRight: 8 }} />
              Lịch tiêm chủng
            </Title>
          </Col>
        </Row>
      </Card>

      {/* Child Selection */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {children.map((child) => (
          <Col xs={24} sm={12} md={8} key={child.id}>
            <Card
              hoverable
              style={{
                border:
                  selectedChild?.id === child.id
                    ? "2px solid #1890ff"
                    : "1px solid #d9d9d9",
                backgroundColor:
                  selectedChild?.id === child.id ? "#f0f9ff" : "#fff",
              }}
              onClick={() => handleSelectChild(child)}
            >
              <Space>
                <Avatar
                  size={48}
                  src={child.avatar}
                  icon={!child.avatar && <UserOutlined />}
                />
                <div>
                  <Title level={4} style={{ margin: 0 }}>
                    {child.name}
                  </Title>
                  <Text type="secondary">{child.class || "N/A"}</Text>
                  <br />
                  <Progress
                    percent={progressPercentage}
                    size="small"
                    format={(percent) => `${percent}% hoàn thành`}
                  />
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Vaccination Overview */}
      {selectedChild && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={8}>
            <Card>
              <div style={{ textAlign: "center" }}>
                <CheckCircleOutlined
                  style={{ fontSize: 32, color: "#52c41a", marginBottom: 8 }}
                />
                <Title level={3}>{completedVaccinations}</Title>
                <Text>Đã tiêm chủng</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <div style={{ textAlign: "center" }}>
                <ClockCircleOutlined
                  style={{ fontSize: 32, color: "#faad14", marginBottom: 8 }}
                />
                <Title level={3}>{upcomingVaccinations}</Title>
                <Text>Sắp đến hạn</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <div style={{ textAlign: "center" }}>
                <ExclamationCircleOutlined
                  style={{ fontSize: 32, color: "#ff4d4f", marginBottom: 8 }}
                />
                <Title level={3}>{declinedVaccinations}</Title>
                <Text>Đã từ chối</Text>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Vaccination Calendar and Table */}
      {selectedChild && (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card
              title="Lịch tiêm chủng"
              extra={<CalendarOutlined />}
              style={{ marginBottom: 16 }}
            >
              <Calendar
                fullscreen={false}
                dateCellRender={dateCellRender}
                onSelect={(date) => setSelectedDate(date)}
              />
              {selectedDate && (
                <Alert
                  message={`Lịch tiêm chủng cho ngày ${selectedDate.format(
                    "DD/MM/YYYY"
                  )}`}
                  description={
                    getListData(selectedDate).length > 0 ? (
                      <ul>
                        {getListData(selectedDate).map((item, index) => (
                          <li key={index}>
                            <Badge status={item.type} text={item.content} />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "Không có lịch tiêm chủng cho ngày này"
                    )
                  }
                  type="info"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title="Danh sách tiêm chủng"
              style={{ marginBottom: 16 }}
              tabList={[
                { key: "upcoming", tab: "Sắp tới" },
                { key: "completed", tab: "Đã hoàn thành" },
                { key: "declined", tab: "Đã từ chối" },
                { key: "all", tab: "Tất cả" },
              ]}
              activeTabKey={activeTab}
              onTabChange={(key) => setActiveTab(key)}
            >
              {getFilteredVaccinations().length > 0 ? (
                <Table
                  columns={columns}
                  dataSource={getFilteredVaccinations()}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  size="middle"
                />
              ) : (
                <Empty
                  description={`Không có dữ liệu tiêm chủng ${
                    activeTab === "all"
                      ? ""
                      : activeTab === "upcoming"
                      ? "sắp tới"
                      : activeTab === "completed"
                      ? "đã hoàn thành"
                      : "đã từ chối"
                  }`}
                />
              )}
            </Card>
          </Col>
        </Row>
      )}

      {/* Campaign Detail Modal */}
      <Modal
        title={selectedCampaign?.name || "Chi tiết chiến dịch tiêm chủng"}
        visible={campaignModalVisible}
        onCancel={() => setCampaignModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedCampaign && (
          <>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Tên chiến dịch">
                {selectedCampaign.name}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {selectedCampaign.description}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian">
                {moment(selectedCampaign.startDate).format("DD/MM/YYYY")} -{" "}
                {moment(selectedCampaign.endDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Địa điểm">
                {selectedCampaign.location}
              </Descriptions.Item>
              <Descriptions.Item label="Loại vắc xin">
                {selectedCampaign.vaccineType}
              </Descriptions.Item>
              <Descriptions.Item label="Nhà sản xuất">
                {selectedCampaign.manufacturer}
              </Descriptions.Item>
              <Descriptions.Item label="Đối tượng tiêm">
                {selectedCampaign.targetGroups}
              </Descriptions.Item>
              <Descriptions.Item label="Tác dụng phụ có thể gặp">
                {selectedCampaign.sideEffects}
              </Descriptions.Item>
              <Descriptions.Item label="Chống chỉ định">
                {selectedCampaign.contraindications}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú">
                {selectedCampaign.notes}
              </Descriptions.Item>
              <Descriptions.Item label="Hạn phản hồi">
                {moment(selectedCampaign.responseDeadline).format("DD/MM/YYYY")}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Alert
              message="Phản hồi đồng ý/từ chối tiêm chủng"
              description="Vui lòng cho biết quyết định của bạn về việc cho con tham gia chiến dịch tiêm chủng này."
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
              style={{ marginBottom: 16 }}
            />

            <Form
              form={responseForm}
              layout="vertical"
              onFinish={handleRespondToVaccine}
            >
              <Form.Item
                name="response"
                label="Quyết định của bạn"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn quyết định của bạn",
                  },
                ]}
              >
                <Radio.Group>
                  <Radio value="approved">
                    Đồng ý cho con tham gia tiêm chủng
                  </Radio>
                  <Radio value="declined">
                    Không đồng ý cho con tham gia tiêm chủng
                  </Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item name="notes" label="Ghi chú (nếu có)">
                <TextArea
                  rows={4}
                  placeholder="Nhập ghi chú của bạn (nếu có)"
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Gửi phản hồi
                </Button>
                <Button
                  style={{ marginLeft: 8 }}
                  onClick={() => setCampaignModalVisible(false)}
                >
                  Hủy
                </Button>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
}
