import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
} from "antd";
import {
  UserOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  BellOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  getParentChildren,
  getChildDetails,
  getParentNotifications,
  getStudentVaccinations,
  getHealthDeclaration,
} from "../../redux/parent/parentSlice";

const { Title, Text } = Typography;

const ParentDashboard = () => {
  const dispatch = useDispatch();
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

  // Fetch initial data
  useEffect(() => {
    dispatch(getParentChildren());

    if (user?.id || user?.user_id) {
      const userId = user?.id || user?.user_id;
      try {
        dispatch(getParentNotifications());
      } catch (error) {
        console.error("Error fetching notifications:", error);
        // Tiếp tục ngay cả khi không thể tải thông báo
      }
    }
  }, [dispatch, user]);

  // Process children data when it changes
  useEffect(() => {
    console.log("Children data from Redux:", children);

    if (children) {
      let processedChildren = [];

      // Handle case where children is an object with status and data properties
      if (children.status === "success" && Array.isArray(children.data)) {
        processedChildren = children.data;
      }
      // Handle case where children is already an array
      else if (Array.isArray(children)) {
        processedChildren = children;
      }
      // Handle case where children might be nested in a property
      else if (children.children && Array.isArray(children.children)) {
        processedChildren = children.children;
      }

      setChildrenList(processedChildren);
      console.log("Processed children list:", processedChildren);
    }
  }, [children, dispatch]);

  // Handle child selection
  const handleSelectChild = (childId) => {
    setActiveChildId(childId);
    setLoadingDetails(true);
    setChildDetailError(null);

    // Fetch child details with error handling
    dispatch(getChildDetails(childId))
      .unwrap()
      .then((detailsData) => {
        console.log("Child details fetched successfully:", detailsData);

        // Also fetch health declaration data separately
        return dispatch(getHealthDeclaration(childId))
          .unwrap()
          .then((healthData) => {
            console.log("Health data fetched successfully:", healthData);
            // Continue with other data fetching if needed
            return dispatch(getStudentVaccinations(childId)).catch((error) => {
              console.error("Error fetching vaccinations:", error);
              // Continue even if vaccinations fail
            });
          })
          .catch((error) => {
            console.error("Error fetching health declaration:", error);
            message.error(
              "Không thể tải dữ liệu sức khỏe. Vui lòng thử lại sau."
            );
          });
      })
      .catch((error) => {
        console.error("Error fetching child details:", error);
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
        return selectedChild.health;
      }

      // Trường hợp các thuộc tính sức khỏe nằm trực tiếp trong đối tượng
      if (
        selectedChild.height_cm ||
        selectedChild.weight_kg ||
        selectedChild.blood_type
      ) {
        return selectedChild;
      }
    }

    // Dữ liệu có thể được lưu trong healthDeclarations theo student_id
    const healthData = healthDeclarations?.[activeChildId] || null;
    if (healthData && healthData.data) {
      return healthData.data;
    }

    return healthData;
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
              <Col key={child.student_id} xs={24} sm={12} md={8} lg={8}>
                <Card
                  hoverable
                  onClick={() => handleSelectChild(child.student_id)}
                  style={{
                    background:
                      activeChildId === child.student_id ? "#f0f7ff" : "white",
                    border:
                      activeChildId === child.student_id
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
                        {child.full_name}
                      </Title>
                      <Text type="secondary">
                        {child.student_code || "STU001"}
                      </Text>
                      <br />
                      <Text type="secondary">
                        {child.date_of_birth
                          ? `Sinh nhật: ${child.date_of_birth.split("T")[0]}`
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
                          value={healthData.height_cm}
                          suffix="cm"
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card>
                        <Statistic
                          title="Cân nặng"
                          value={healthData.weight_kg}
                          suffix="kg"
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

              {/* Debug Info - hiển thị cấu trúc dữ liệu từ API */}
              {process.env.NODE_ENV !== "production" && (
                <Card title="Debug - API Response" style={{ marginBottom: 24 }}>
                  <div style={{ maxHeight: "200px", overflow: "auto" }}>
                    <pre style={{ fontSize: "12px" }}>
                      {JSON.stringify(selectedChild, null, 2)}
                    </pre>
                  </div>
                </Card>
              )}
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
