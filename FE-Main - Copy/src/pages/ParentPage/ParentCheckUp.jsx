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
  Spin,
  Empty,
  Tabs,
  Statistic,
  Form,
} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import moment from "moment";
import {
  getParentChildren,
  getChildDetails,
  getAllCheckupDetails,
  getPendingConsents,
  getApprovedConsents,
  getDeclinedConsents,
  getStudentCheckups,
  respondToCheckupConsent,
  getStudentCheckupsResult,
} from "../../redux/parent/parentSlice";
import CheckupCalendar from "./components/CheckupCalendar";
import CheckupDetail from "./components/CheckupDetail";
import CheckupHistoryDetail from "./components/CheckupHistoryDetail";
import ConsentResponseModal from "./components/ConsentResponseModal";
import { toast } from "react-toastify";

const { Text } = Typography;
const { TabPane } = Tabs;

const CheckupsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    children,
    selectedChild,
    checkups,
    loading: childrenLoading,
  } = useSelector((state) => state.parent);

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [calendarData, setCalendarData] = useState({});
  const [checkupResults, setCheckupResults] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [approvedCampaigns, setApprovedCampaigns] = useState([]);
  const [declinedCampaigns, setDeclinedCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [consentModalVisible, setConsentModalVisible] = useState(false);
  const [consentForm] = Form.useForm();
  const [respondingConsent, setRespondingConsent] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState(null);

  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([
      dispatch(getParentChildren()),
      dispatch(getAllCheckupDetails(accessToken)),
      dispatch(getPendingConsents(accessToken)),
      dispatch(getApprovedConsents(accessToken)),
      dispatch(getDeclinedConsents(accessToken)),
    ]).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    if (children && children.length > 0 && !selectedChild) {
      console.log("👨‍👩‍👧 Danh sách học sinh:", children);
      dispatch(getChildDetails(children[0].student_id));
    }
  }, [dispatch, children, selectedChild]);

  useEffect(() => {
    if (selectedChild?.student_id) {
      const student_id = selectedChild.student_id;
      dispatch(
        getStudentCheckups({
          studentId: student_id,
          accessToken: accessToken,
        })
      );
    }
  }, [dispatch, selectedChild]);

  useEffect(() => {
    console.log("📦 Dữ liệu checkups từ Redux:", checkups);

    // 📋 Khám sắp tới (Pending)
    const pendingForms = checkups.pending?.forms || [];
    setCampaigns(Array.isArray(pendingForms) ? pendingForms : []);
    console.log(
      `📋 Sắp tới (PENDING) – ${pendingForms.length} chiến dịch`,
      pendingForms
    );

    // ✅ Đã đồng ý (Approved)
    const approvedForms = (checkups.approved?.forms || []).filter(
      (form) => form.status === "AGREED"
    );
    setApprovedCampaigns(approvedForms);
    console.log(
      `✅ Đã đồng ý (APPROVED) – ${approvedForms.length} chiến dịch`,
      approvedForms
    );

    // ❌ Từ chối (Declined)
    const declinedForms = (checkups.declined?.forms || []).filter(
      (form) => form.status === "DECLINED"
    );
    setDeclinedCampaigns(declinedForms);
    console.log(
      `❌ Đã từ chối (DECLINED) – ${declinedForms.length} chiến dịch`,
      declinedForms
    );

    // 📄 Kết quả khám
    if (
      selectedChild?.student_id &&
      checkups.studentCheckups?.[selectedChild.student_id]
    ) {
      const resultData = checkups.studentCheckups[selectedChild.student_id];
      setCheckupResults(resultData);
      console.log(
        `📄 KQ khám học sinh [ID: ${selectedChild.student_id}] – ${resultData.length} kết quả`,
        resultData
      );
    } else {
      setCheckupResults([]);
    }

    // 📅 Dữ liệu lịch từ tất cả forms
    const allForms = [...pendingForms, ...approvedForms, ...declinedForms];
    processCalendarData(allForms);
  }, [checkups, selectedChild]);

  const handleConsentSubmit = async (values) => {
    setRespondingConsent(true);
    try {
      await dispatch(
        respondToCheckupConsent({
          formId: selectedFormId,
          status: values.status,
          note: values.note || "",
          accessToken,
        })
      ).unwrap();
      toast.success("Phản hồi thành công!");
      setConsentModalVisible(false);
      consentForm.resetFields();
      fetchData();
    } catch (err) {
      toast.error("Phản hồi thất bại!");
    } finally {
      setRespondingConsent(false);
    }
  };

  const processCalendarData = (campaigns) => {
    const calData = {};
    campaigns.forEach((campaign) => {
      if (!campaign || !campaign.scheduled_date) return;
      const dateKey = moment(campaign.scheduled_date).format("YYYY-MM-DD");
      if (!calData[dateKey]) calData[dateKey] = [];
      calData[dateKey].push(campaign);
    });
    setCalendarData(calData);
  };

  const handleTabChange = (key) => setActiveTab(key);

  const handleViewCampaign = (campaign) => {
    setSelectedCampaignId(campaign.form_id || campaign.checkup_id);
    setDetailModalVisible(true);
  };

  const handleOpenHistoryModal = async (record) => {
    try {
      console.log("📂 Mở lịch sử khám với:", {
        checkupId: record.checkup_id,
        studentId: selectedChild.student_id,
      });

      const result = await dispatch(
        getStudentCheckupsResult({
          checkupId: record.checkup_id,
          studentId: selectedChild.student_id,
          accessToken: accessToken,
        })
      ).unwrap();

      console.log("🧾 Dữ liệu lịch sử khám trả về:", result);

      setHistoryData(result.checkups);
      setHistoryModalVisible(true);
    } catch (error) {
      toast.error("Không thể tải lịch sử khám");
      console.error("❌ Lỗi khi tải lịch sử:", error);
    }
  };

  const handleRespondToConsent = (campaign) => {
    setSelectedCampaignId(campaign.checkup_id);
    setSelectedFormId(campaign.form_id);
    console.log("🎯 Responding to form:", campaign.form_id);

    setConsentModalVisible(true);
  };

  const handleConsentSuccess = () => {
    fetchData();
  };

  const currentForm = [
    ...campaigns,
    ...approvedCampaigns,
    ...declinedCampaigns,
  ].find(
    (item) =>
      item.form_id === selectedCampaignId ||
      item.checkup_id === selectedCampaignId
  );

  const formId = currentForm?.form_id || null;

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

  const upcomingCheckupColumns = [
    {
      title: "Tên đợt khám",
      dataIndex: "title",
      key: "title",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Tên học sinh",
      dataIndex: "full_name",
      key: "title",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Lớp",
      dataIndex: "class_name",
      key: "class_name",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Ngày khám",
      dataIndex: "scheduled_date",
      key: "scheduled_date",
      render: (date) => moment(date).format("DD/MM/YYYY"),
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
          {record.status === "PENDING" && (
            <Button
              type="default"
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => handleRespondToConsent(record)}
              block
            >
              Phản hồi ý kiến
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
              Lịch sử khám
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="checkups-page">
      {isLoading ? (
        <div className="loading-container">
          <Spin size="large" />
          <Text className="mt-2">Đang tải dữ liệu...</Text>
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card
                title="Tổng quan khám sức khỏe"
                style={{ marginBottom: 16 }}
              >
                {selectedChild ? (
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Statistic
                        title="Đã khám"
                        value={checkupResults.length}
                        suffix="lần"
                        valueStyle={{ color: "#3f8600" }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Sắp tới"
                        value={campaigns.length}
                        suffix="đợt"
                        valueStyle={{ color: "#1890ff" }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Chờ phản hồi"
                        value={
                          campaigns.filter((c) => c.status === "PENDING").length
                        }
                        suffix="đợt"
                        valueStyle={{ color: "#faad14" }}
                      />
                    </Col>
                  </Row>
                ) : (
                  <Empty description="Không có thông tin học sinh" />
                )}
              </Card>
              <CheckupCalendar
                campaigns={campaigns}
                loading={childrenLoading}
              />
            </Col>
            <Col xs={24} md={16}>
              <Card>
                <Tabs activeKey={activeTab} onChange={handleTabChange}>
                  <TabPane
                    tab={
                      <span>
                        <CalendarOutlined /> Lịch khám sắp tới
                      </span>
                    }
                    key="1"
                  >
                    <Table
                      columns={upcomingCheckupColumns}
                      dataSource={campaigns.map((item, index) => ({
                        ...item,
                        key: item.id || index,
                      }))}
                      pagination={{ pageSize: 5 }}
                      size="middle"
                    />
                  </TabPane>
                  <TabPane
                    tab={
                      <span>
                        <CheckCircleOutlined /> Đã duyệt
                      </span>
                    }
                    key="2"
                  >
                    <Table
                      columns={upcomingCheckupColumns}
                      dataSource={approvedCampaigns.map((item, index) => ({
                        ...item,
                        key: `approved-${item.id || index}`,
                      }))}
                      pagination={{ pageSize: 5 }}
                      size="middle"
                    />
                  </TabPane>
                  <TabPane
                    tab={
                      <span>
                        <CloseCircleOutlined /> Từ chối
                      </span>
                    }
                    key="3"
                  >
                    <Table
                      columns={upcomingCheckupColumns}
                      dataSource={declinedCampaigns.map((item, index) => ({
                        ...item,
                        key: `declined-${item.id || index}`,
                      }))}
                      pagination={{ pageSize: 5 }}
                      size="middle"
                    />
                  </TabPane>
                </Tabs>
              </Card>
            </Col>
          </Row>

          <CheckupDetail
            visible={detailModalVisible}
            onClose={() => setDetailModalVisible(false)}
            checkup={currentForm}
            onSuccess={fetchData}
          />

          <CheckupHistoryDetail
            visible={historyModalVisible}
            onClose={() => {
              setHistoryModalVisible(false);
              setHistoryData([]);
            }}
            student={selectedChild}
            data={historyData}
            destroyOnClose
          />

          <ConsentResponseModal
            visible={consentModalVisible}
            onCancel={() => {
              setConsentModalVisible(false);
              consentForm.resetFields();
            }}
            onSubmit={handleConsentSubmit}
            loading={respondingConsent}
            form={consentForm}
          />

          <style jsx>{`
            .checkups-page {
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

export default CheckupsPage;
