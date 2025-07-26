import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Tag,
  Button,
  Spin,
  Alert,
  Empty,
  Space,
  Divider,
  Statistic,
  List,
  Timeline,
  message,
  Select,
} from "antd";
import {
  UserOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  BellOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  getParentChildren,
  getChildDetails,
  getParentNotifications,
  getStudentVaccinations,
  getHealthDeclaration,
  getVaccineCampaigns,
  getApprovedCampaigns,
  getDeclinedCampaigns,
} from "../../redux/parent/parentSlice";

const { Title, Text } = Typography;

const ParentDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const {
    children,
    selectedChild,
    profile,
    notifications,
    incidents,
    vaccinations,
    healthDeclarations,
    loading,
    error,
  } = useSelector((state) => state.parent);

  const [activeChildId, setActiveChildId] = useState(null);
  const [childrenList, setChildrenList] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [childDetailError, setChildDetailError] = useState(null);

  // State for health stats
  const [healthStats, setHealthStats] = useState({
    completed: 0,
    upcoming: 0,
    waiting: 0,
  });

  const [vaccinationStats, setVaccinationStats] = useState({
    completed: 0,
    upcoming: 0,
    pending: 0,
  });

  // Fetch initial data
  useEffect(() => {
    dispatch(getParentChildren());

    if (user?.id || user?.user_id) {
      const userId = user?.id || user?.user_id;
      try {
        dispatch(getParentNotifications());
      } catch (error) {
        // Tiếp tục ngay cả khi không thể tải thông báo
      }
    }
  }, [dispatch, user]);

  // Process children data
  useEffect(() => {
    if (children && Array.isArray(children) && children.length > 0) {
      // Map children to options for the select dropdown
      const processedChildren = children
        .filter((child) => child && (child.student_id || child.id)) // Filter out children without valid IDs
        .map((child) => ({
          value: child.student_id || child.id,
          label:
            child.full_name ||
            child.student_name ||
            `Học sinh ${child.id || child.student_id}`,
          data: child,
        }));

      setChildrenList(processedChildren);

      // Set the first child as selected by default if no child is selected
      if (
        (!activeChildId || activeChildId === "") &&
        processedChildren.length > 0
      ) {
        const firstChildId = processedChildren[0].value;
        setActiveChildId(firstChildId);
        handleSelectChild(firstChildId);
      }
    }
  }, [children, activeChildId]);

  // Handle child selection
  // Update health and vaccination stats when data changes
  useEffect(() => {
    if (selectedChild?.student_id) {
      // Example stats calculation - replace with actual data processing
      // For health stats
      const completedCheckups = 0; // This should be calculated from API data
      const upcomingCheckups = 0; // This should be calculated from API data
      const waitingCheckups = 0; // This should be calculated from API data

      setHealthStats({
        completed: completedCheckups,
        upcoming: upcomingCheckups,
        waiting: waitingCheckups,
      });

      // For vaccination stats
      const completedVaccinations = 0; // This should be calculated from API data
      const upcomingVaccinations = 0; // This should be calculated from API data
      const waitingVaccinations = 0; // This should be calculated from API data

      setVaccinationStats({
        completed: completedVaccinations,
        upcoming: upcomingVaccinations,
        waiting: waitingVaccinations,
      });
    }
  }, [selectedChild, vaccinations]);

  // Trong useEffect khi dữ liệu vaccinations thay đổi, cập nhật stats
  useEffect(() => {
    if (selectedChild?.student_id && vaccinations) {
      calculateVaccinationStats();
    }
  }, [vaccinations, selectedChild]);

  // Thêm hàm tính toán thống kê tiêm chủng
  const calculateVaccinationStats = () => {
    if (!selectedChild) return;

    // Get student vaccinations
    const studentVaccinations =
      vaccinations.studentVaccinations?.[selectedChild.student_id] || [];

    // Get campaigns
    const pendingCampaigns = (vaccinations.campaigns || []).filter(
      (c) => c.status === "PENDING"
    );

    // Calculate completed vaccinations (those with a vaccination date)
    const completed = studentVaccinations.filter((v) => v.vaccinated_at).length;

    // Calculate upcoming vaccinations (approved but not yet administered)
    const upcoming = (vaccinations.approved || []).length;

    // Calculate pending responses
    const pending = pendingCampaigns.length;

    setVaccinationStats({
      completed,
      upcoming,
      pending,
    });
  };

  const handleSelectChild = (childId) => {
    // Check if childId is valid before proceeding
    if (!childId) {
      message.warning("ID học sinh không hợp lệ");
      return;
    }

    setActiveChildId(childId);
    setLoadingDetails(true);
    setChildDetailError(null);

    // Fetch child details with error handling
    dispatch(getChildDetails(childId))
      .unwrap()
      .then((detailsData) => {
        // Check if we got valid details data
        if (!detailsData) {
          throw new Error("Không nhận được dữ liệu chi tiết học sinh");
        }

        // Also fetch health declaration data separately
        dispatch(getHealthDeclaration(childId))
          .unwrap()
          .then((healthData) => {
            // Fetch vaccination data
            dispatch(getVaccineCampaigns());
            dispatch(getApprovedCampaigns());
            dispatch(getDeclinedCampaigns());
          })
          .catch((error) => {
            // Don't show error message for health declaration if it's not critical
            console.error("Health declaration fetch error:", error);
          });
      })
      .catch((error) => {
        setChildDetailError(
          "Không thể tải thông tin chi tiết từ máy chủ. Vui lòng thử lại sau."
        );
        message.error("Lỗi kết nối đến máy chủ");
      })
      .finally(() => {
        setLoadingDetails(false);
      });
  };

  // Safe data accessors
  const getChildHealthData = () => {
    if (!selectedChild) return null;

    // API trả về dữ liệu sức khỏe trực tiếp từ endpoint /health-declaration
    // Dữ liệu có thể nằm trực tiếp trong selectedChild
    if (selectedChild && typeof selectedChild === "object") {
      if (selectedChild.health) {
        return {
          ...selectedChild.health,
          height_cm: selectedChild.health.height_cm || null,
          weight_kg: selectedChild.health.weight_kg || null,
          blood_type: selectedChild.health.blood_type || null,
          allergy: selectedChild.health.allergy || "",
          health_status: selectedChild.health.health_status || "Khỏe mạnh",
          chronic_diseases: selectedChild.health.chronic_diseases || "",
        };
      }

      // Trường hợp các thuộc tính sức khỏe nằm trực tiếp trong đối tượng
      if (
        selectedChild.height_cm ||
        selectedChild.weight_kg ||
        selectedChild.blood_type
      ) {
        return {
          height_cm: selectedChild.height_cm || null,
          weight_kg: selectedChild.weight_kg || null,
          blood_type: selectedChild.blood_type || null,
          allergy: selectedChild.allergy || "",
          health_status: selectedChild.health_status || "Khỏe mạnh",
          chronic_diseases: selectedChild.chronic_diseases || "",
        };
      }
    }

    // Dữ liệu có thể được lưu trong healthDeclarations theo student_id
    if (activeChildId && healthDeclarations) {
      const healthData = healthDeclarations[activeChildId] || null;
      if (healthData && healthData.data) {
        return {
          ...healthData.data,
          height_cm: healthData.data.height_cm || null,
          weight_kg: healthData.data.weight_kg || null,
          blood_type: healthData.data.blood_type || null,
          allergy: healthData.data.allergy || "",
          health_status: healthData.data.health_status || "Khỏe mạnh",
          chronic_diseases: healthData.data.chronic_diseases || "",
        };
      }

      if (healthData) {
        return {
          ...healthData,
          height_cm: healthData.height_cm || null,
          weight_kg: healthData.weight_kg || null,
          blood_type: healthData.blood_type || null,
          allergy: healthData.allergy || "",
          health_status: healthData.health_status || "Khỏe mạnh",
          chronic_diseases: healthData.chronic_diseases || "",
        };
      }
    }

    // Return default empty health data
    return {
      height_cm: null,
      weight_kg: null,
      blood_type: null,
      allergy: "",
      health_status: "Khỏe mạnh",
      chronic_diseases: "",
    };
  };

  const getChildIncidents = () => {
    if (!selectedChild || !incidents) return [];

    const childIncidents = incidents[selectedChild.student_id];
    return Array.isArray(childIncidents) ? childIncidents : [];
  };

  const getChildVaccinations = () => {
    if (!selectedChild || !vaccinations?.studentVaccinations) return [];

    const childVaccinations =
      vaccinations.studentVaccinations[selectedChild.student_id];
    return Array.isArray(childVaccinations) ? childVaccinations : [];
  };

  const getNotifications = () => {
    // Handle case where notifications has a structure like {items: [...]}
    if (
      notifications &&
      notifications.items &&
      Array.isArray(notifications.items)
    ) {
      return notifications.items;
    }

    return Array.isArray(notifications) ? notifications : [];
  };

  // Get current child data from API response
  const getDisplayChild = () => {
    return selectedChild;
  };

  if (loading && !childrenList.length) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <Text style={{ display: "block", marginTop: 16 }}>
          Đang tải thông tin...
        </Text>
      </div>
    );
  }

  if (error && !childrenList.length) {
    return (
      <Alert
        message="Đã xảy ra lỗi"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  const displayChild = getDisplayChild();
  const healthData = getChildHealthData();

  return (
    <div style={{ padding: "0" }}>
      {/* Welcome Banner */}
      <Card
        style={{
          marginBottom: 24,
          background: "linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)",
          color: "white",
          borderRadius: "8px",
        }}
      >
        <Title level={3} style={{ color: "white", margin: 0 }}>
          Xin chào, {user?.fullname || "Phụ huynh"}!
        </Title>
        <Text style={{ color: "rgba(255,255,255,0.9)" }}>
          Chào mừng đến với hệ thống quản lý sức khỏe học đường
        </Text>
      </Card>

      {/* Children Selection */}
      <Card title="Danh sách con em" style={{ marginBottom: 24 }}>
        {childrenList && childrenList.length > 0 ? (
          <Row gutter={[16, 16]}>
            {childrenList.map((child) => (
              <Col key={child.value} xs={24} sm={12} md={8} lg={8}>
                <Card
                  hoverable
                  onClick={() => handleSelectChild(child.value)}
                  style={{
                    background:
                      activeChildId === child.value ? "#f0f7ff" : "white",
                    border:
                      activeChildId === child.value
                        ? "2px solid #1890ff"
                        : "1px solid #f0f0f0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                      size={64}
                      icon={<UserOutlined />}
                      style={{ backgroundColor: "#1890ff" }}
                    />
                    <div style={{ marginLeft: 16 }}>
                      <Title level={5} style={{ marginBottom: 4 }}>
                        {child.label}
                      </Title>
                      <Text type="secondary">
                        {child.data?.student_code || "STU001"}
                      </Text>
                      <br />
                      <Text type="secondary">
                        {child.data?.date_of_birth
                          ? `Sinh nhật: ${
                              child.data.date_of_birth.split("T")[0]
                            }`
                          : ""}
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty
            description="Không có thông tin con em"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>

      {/* Child details section */}
      {activeChildId && (
        <>
          {loadingDetails ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <Spin size="large" />
              <Text style={{ display: "block", marginTop: 16 }}>
                Đang tải thông tin chi tiết...
              </Text>
            </div>
          ) : childDetailError ? (
            <Alert
              message="Lỗi kết nối"
              description={childDetailError}
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
              action={
                <Button
                  type="primary"
                  onClick={() => handleSelectChild(activeChildId)}
                >
                  Thử lại
                </Button>
              }
            />
          ) : (
            <>
              {/* Child Info Card */}
              <Card style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    size={80}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: "#1890ff" }}
                  />
                  <div style={{ marginLeft: 24 }}>
                    <Title level={3} style={{ marginBottom: 8 }}>
                      {displayChild?.full_name || "Học sinh"}
                    </Title>
                    <div>
                      <Tag color="blue">{displayChild?.class_name || "5A"}</Tag>
                      <Tag color="green">
                        {displayChild?.student_code || "STU001"}
                      </Tag>
                      <Tag color="geekblue">
                        {displayChild?.gender || "Nam"}
                      </Tag>
                    </div>
                    <Text
                      type="secondary"
                      style={{ marginTop: 8, display: "block" }}
                    >
                      {displayChild?.date_of_birth
                        ? `Ngày sinh: ${
                            displayChild.date_of_birth.split("T")[0]
                          }`
                        : ""}
                    </Text>
                  </div>
                </div>
              </Card>

              {/* Health and Vaccination Overview Section */}
              <Card
                title={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <MedicineBoxOutlined
                      style={{ marginRight: 8, color: "#1890ff" }}
                    />
                    <span>Tổng quan tiêm chủng</span>
                  </div>
                }
                style={{ marginBottom: 16 }}
              >
                <Row gutter={16}>
                  <Col xs={24} sm={8}>
                    <Statistic
                      title="Đã tiêm"
                      value={vaccinationStats.completed}
                      valueStyle={{ color: "#3f8600" }}
                      suffix="mũi"
                      prefix={<CheckCircleOutlined />}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <Statistic
                      title="Sắp tới"
                      value={vaccinationStats.upcoming}
                      valueStyle={{ color: "#1890ff" }}
                      suffix="đợt"
                      prefix={<ClockCircleOutlined />}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <Statistic
                      title="Chờ phản hồi"
                      value={vaccinationStats.pending}
                      valueStyle={{ color: "#faad14" }}
                      suffix="đợt"
                      prefix={<ExclamationCircleOutlined />}
                    />
                  </Col>
                </Row>
              </Card>

              {/* Health Overview */}
              <Card
                title={
                  <Space>
                    <HeartOutlined />
                    <span>Thông tin sức khỏe</span>
                  </Space>
                }
                style={{ marginBottom: 24 }}
              >
                {healthData ? (
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                      <Card>
                        <Statistic
                          title="Chiều cao"
                          value={
                            healthData.height_cm !== null &&
                            healthData.height_cm !== undefined
                              ? healthData.height_cm
                              : "Chưa có"
                          }
                          suffix={
                            healthData.height_cm !== null &&
                            healthData.height_cm !== undefined
                              ? "cm"
                              : ""
                          }
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card>
                        <Statistic
                          title="Cân nặng"
                          value={
                            healthData.weight_kg !== null &&
                            healthData.weight_kg !== undefined
                              ? healthData.weight_kg
                              : "Chưa có"
                          }
                          suffix={
                            healthData.weight_kg !== null &&
                            healthData.weight_kg !== undefined
                              ? "kg"
                              : ""
                          }
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card>
                        <Statistic
                          title="Nhóm máu"
                          value={healthData.blood_type || "Chưa có"}
                        />
                      </Card>
                    </Col>
                    <Col span={24}>
                      <Divider orientation="left">Chi tiết</Divider>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                          <Card size="small" title="Tình trạng sức khỏe">
                            <Text>
                              {healthData.health_status === "Healthy" ||
                              healthData.health_status === "healthy" ||
                              healthData.health_status === "Khỏe mạnh"
                                ? "Khỏe mạnh"
                                : healthData.health_status ||
                                  "Không có thông tin"}
                            </Text>
                          </Card>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Card size="small" title="Dị ứng">
                            <Text>
                              {healthData.allergy || "Không có dị ứng"}
                            </Text>
                          </Card>
                        </Col>
                        <Col xs={24}>
                          <Card size="small" title="Bệnh mãn tính">
                            <Text>
                              {healthData.chronic_diseases
                                ? typeof healthData.chronic_diseases ===
                                  "string"
                                  ? healthData.chronic_diseases
                                  : "Có"
                                : "Không có"}
                            </Text>
                          </Card>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                ) : (
                  <Empty description="Chưa có thông tin sức khỏe" />
                )}
              </Card>
            </>
          )}
        </>
      )}

      {/* Notifications for all users */}
      <Card
        title={
          <Space>
            <BellOutlined />
            <span>Thông báo</span>
            {getNotifications().filter((n) => !n.is_read).length > 0 && (
              <Tag color="red">
                {getNotifications().filter((n) => !n.is_read).length} mới
              </Tag>
            )}
          </Space>
        }
      >
        {getNotifications().length > 0 ? (
          <List
            dataSource={getNotifications().slice(0, 5)}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={item.title || "Thông báo mới"}
                  description={
                    <>
                      <Text>{item.message || "Không có nội dung"}</Text>
                      <br />
                      <Text type="secondary">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString()
                          : ""}
                      </Text>
                    </>
                  }
                />
                {!item.is_read && <Tag color="blue">Mới</Tag>}
              </List.Item>
            )}
          />
        ) : (
          <Empty description="Không có thông báo" />
        )}
      </Card>
    </div>
  );
};

export default ParentDashboard;
