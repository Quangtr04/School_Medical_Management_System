import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  List,
  Typography,
  Badge,
  Empty,
  Spin,
  Alert,
  Row,
  Col,
  Avatar,
} from "antd";
import { BellOutlined } from "@ant-design/icons";
import { getParentNotifications } from "../../redux/parent/parentSlice";

const { Title, Text } = Typography;

const ParentNotificationsPage = () => {
  const dispatch = useDispatch();
  const { notifications, loading, error } = useSelector(
    (state) => state.parent
  );

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

  return (
    <div style={{ padding: "0" }}>
      <Card>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Title level={3}>
                <BellOutlined /> Thông báo{" "}
                {unreadCount > 0 && (
                  <Badge count={unreadCount} style={{ marginLeft: 8 }} />
                )}
              </Title>
            </div>
          </Col>

          <Col span={24}>
            {allNotifications.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={allNotifications}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      padding: "12px",
                      backgroundColor: !isNotificationRead(item)
                        ? "#f0f7ff"
                        : "transparent",
                      borderRadius: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{
                            backgroundColor: !isNotificationRead(item)
                              ? "#1890ff"
                              : "#d9d9d9",
                          }}
                          icon={<BellOutlined />}
                        />
                      }
                      title={
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text strong>{item.title || "Thông báo mới"}</Text>
                          {!isNotificationRead(item) && (
                            <Badge status="processing" color="blue" />
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Không có thông báo" />
            )}
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ParentNotificationsPage;
