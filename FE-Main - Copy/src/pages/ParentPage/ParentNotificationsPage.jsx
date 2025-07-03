import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  List,
  Typography,
  Tag,
  Button,
  Tabs,
  Badge,
  Empty,
  Spin,
  Alert,
  Space,
  Divider,
  Modal,
  Descriptions,
  Row,
  Col,
  Tooltip,
  message,
} from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import {
  getParentNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  respondToVaccinationConsent,
  respondToCheckupConsent,
} from "../../redux/parent/parentSlice";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const ParentNotificationsPage = () => {
  const dispatch = useDispatch();
  const { notifications, loading, error } = useSelector(
    (state) => state.parent
  );
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    dispatch(getParentNotifications());
  }, [dispatch]);

  // Helper function to check if a notification is read
  const isNotificationRead = (notification) => {
    return notification.isRead || notification.is_read;
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

  const allNotifications = getNotifications();

  // Filter notifications by type
  const vaccinationNotifications = allNotifications.filter(
    (notification) => notification.type === "vaccination"
  );

  const checkupNotifications = allNotifications.filter(
    (notification) =>
      notification.type === "health_checkup" ||
      notification.type === "health_record"
  );

  const otherNotifications = allNotifications.filter(
    (notification) =>
      notification.type !== "vaccination" &&
      notification.type !== "health_checkup" &&
      notification.type !== "health_record"
  );

  const getNotificationIcon = (type) => {
    switch (type) {
      case "vaccination":
        return (
          <MedicineBoxOutlined style={{ fontSize: "16px", color: "#1890ff" }} />
        );
      case "health_checkup":
      case "health_record":
        return (
          <FileTextOutlined style={{ fontSize: "16px", color: "#52c41a" }} />
        );
      case "appointment":
        return (
          <CalendarOutlined style={{ fontSize: "16px", color: "#722ed1" }} />
        );
      default:
        return <BellOutlined style={{ fontSize: "16px", color: "#faad14" }} />;
    }
  };

  const getNotificationTag = (priority, notification) => {
    if (!isNotificationRead(notification)) {
      return <Tag color="blue">Mới</Tag>;
    }

    switch (priority) {
      case "high":
        return <Tag color="red">Quan trọng</Tag>;
      case "medium":
        return <Tag color="orange">Thông thường</Tag>;
      case "low":
        return <Tag color="green">Thông tin</Tag>;
      default:
        return null;
    }
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setIsModalVisible(true);

    // Mark notification as read when opened
    if (!isNotificationRead(notification)) {
      dispatch(markNotificationAsRead(notification.id));
    }
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const handleVaccinationConsent = (agree) => {
    if (!selectedNotification || !selectedNotification.details) {
      message.error("Không thể xử lý yêu cầu. Thiếu thông tin tiêm chủng.");
      return;
    }

    const { id, details } = selectedNotification;
    const { studentId, campaignId } = details;

    dispatch(
      respondToVaccinationConsent({
        notificationId: id,
        studentId,
        campaignId,
        consent: agree,
      })
    )
      .then(() => {
        message.success(`Đã ${agree ? "đồng ý" : "từ chối"} tiêm chủng`);
        setIsModalVisible(false);
        // Refresh notifications list
        dispatch(getParentNotifications());
      })
      .catch((error) => {
        message.error(`Lỗi: ${error.message}`);
      });
  };

  const handleCheckupConsent = (agree) => {
    if (!selectedNotification || !selectedNotification.details) {
      message.error("Không thể xử lý yêu cầu. Thiếu thông tin kiểm tra y tế.");
      return;
    }

    const { id, details } = selectedNotification;
    const { studentId, checkupId } = details;

    dispatch(
      respondToCheckupConsent({
        notificationId: id,
        studentId,
        checkupId,
        consent: agree,
      })
    )
      .then(() => {
        message.success(`Đã ${agree ? "đồng ý" : "từ chối"} kiểm tra y tế`);
        setIsModalVisible(false);
        // Refresh notifications list
        dispatch(getParentNotifications());
      })
      .catch((error) => {
        message.error(`Lỗi: ${error.message}`);
      });
  };

  const renderNotificationDetail = () => {
    if (!selectedNotification) return null;

    const { type, title, message, date, childName, details } =
      selectedNotification;

    return (
      <>
        <Descriptions title={title} bordered column={1}>
          <Descriptions.Item label="Thời gian">
            {new Date(date).toLocaleString()}
          </Descriptions.Item>
          {childName && (
            <Descriptions.Item label="Học sinh">{childName}</Descriptions.Item>
          )}
          <Descriptions.Item label="Nội dung">{message}</Descriptions.Item>
        </Descriptions>

        {details && (
          <>
            <Divider />
            <div>
              {type === "vaccination" && (
                <Card title="Chi tiết tiêm chủng" size="small">
                  <p>
                    <strong>Tên vắc-xin:</strong> {details.vaccineName}
                  </p>
                  <p>
                    <strong>Ngày tiêm:</strong> {details.date}
                  </p>
                  <p>
                    <strong>Mô tả:</strong> {details.description}
                  </p>
                  <p>
                    <strong>Lưu ý:</strong> {details.notes}
                  </p>

                  <Divider />
                  <Space>
                    <Button
                      type="primary"
                      onClick={() => handleVaccinationConsent(true)}
                    >
                      <CheckCircleOutlined /> Đồng ý tiêm chủng
                    </Button>
                    <Button
                      danger
                      onClick={() => handleVaccinationConsent(false)}
                    >
                      <CloseCircleOutlined /> Từ chối
                    </Button>
                  </Space>
                </Card>
              )}

              {(type === "health_checkup" || type === "health_record") && (
                <Card title="Chi tiết kiểm tra y tế" size="small">
                  <p>
                    <strong>Loại kiểm tra:</strong> {details.checkupType}
                  </p>
                  <p>
                    <strong>Ngày kiểm tra:</strong> {details.date}
                  </p>
                  <p>
                    <strong>Nội dung kiểm tra:</strong> {details.description}
                  </p>
                  <p>
                    <strong>Lưu ý:</strong> {details.notes}
                  </p>

                  <Divider />
                  <Space>
                    <Button
                      type="primary"
                      onClick={() => handleCheckupConsent(true)}
                    >
                      <CheckCircleOutlined /> Đồng ý kiểm tra
                    </Button>
                    <Button danger onClick={() => handleCheckupConsent(false)}>
                      <CloseCircleOutlined /> Từ chối
                    </Button>
                  </Space>
                </Card>
              )}
            </div>
          </>
        )}
      </>
    );
  };

  const renderNotificationList = (notifications) => {
    if (notifications.length === 0) {
      return <Empty description="Không có thông báo" />;
    }

    return (
      <List
        itemLayout="horizontal"
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button type="link" onClick={() => handleNotificationClick(item)}>
                Chi tiết
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={getNotificationIcon(item.type)}
              title={
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Text strong>{item.title}</Text>
                  {getNotificationTag(item.priority, item)}
                </div>
              }
              description={
                <>
                  <Paragraph ellipsis={{ rows: 2 }}>{item.message}</Paragraph>
                  <Text type="secondary">
                    {item.date ? new Date(item.date).toLocaleString() : ""}
                  </Text>
                </>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <Text style={{ display: "block", marginTop: 16 }}>
          Đang tải thông báo...
        </Text>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Đã xảy ra lỗi"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  // Count unread notifications
  const unreadCount = allNotifications.filter(
    (n) => !isNotificationRead(n)
  ).length;
  const unreadVaccinationCount = vaccinationNotifications.filter(
    (n) => !isNotificationRead(n)
  ).length;
  const unreadCheckupCount = checkupNotifications.filter(
    (n) => !isNotificationRead(n)
  ).length;
  const unreadOtherCount = otherNotifications.filter(
    (n) => !isNotificationRead(n)
  ).length;

  return (
    <div style={{ padding: "0" }}>
      <Card>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Title level={3}>
              <BellOutlined /> Thông báo
            </Title>
            <Text type="secondary">
              Quản lý các thông báo về tiêm chủng, kiểm tra y tế và các thông
              tin khác
            </Text>
          </Col>

          <Col span={24}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              tabBarExtraContent={
                <Badge count={unreadCount}>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                  >
                    Đánh dấu đã đọc tất cả
                  </Button>
                </Badge>
              }
            >
              <TabPane
                tab={
                  <Badge count={unreadCount}>
                    <span>Tất cả</span>
                  </Badge>
                }
                key="all"
              >
                {renderNotificationList(allNotifications)}
              </TabPane>

              <TabPane
                tab={
                  <Badge count={unreadVaccinationCount}>
                    <span>Tiêm chủng</span>
                  </Badge>
                }
                key="vaccination"
              >
                {renderNotificationList(vaccinationNotifications)}
              </TabPane>

              <TabPane
                tab={
                  <Badge count={unreadCheckupCount}>
                    <span>Kiểm tra y tế</span>
                  </Badge>
                }
                key="checkup"
              >
                {renderNotificationList(checkupNotifications)}
              </TabPane>

              <TabPane
                tab={
                  <Badge count={unreadOtherCount}>
                    <span>Khác</span>
                  </Badge>
                }
                key="other"
              >
                {renderNotificationList(otherNotifications)}
              </TabPane>
            </Tabs>
          </Col>
        </Row>
      </Card>

      <Modal
        title={selectedNotification?.title || "Chi tiết thông báo"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {renderNotificationDetail()}
      </Modal>
    </div>
  );
};

export default ParentNotificationsPage;
