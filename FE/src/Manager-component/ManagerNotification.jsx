import React, { useEffect, useRef } from "react";
import { List, Typography, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchManagerNotifications } from "../redux/manager/managerNotificationSlice";

const { Title } = Typography;

export default function ManagerNotifications() {
  const dispatch = useDispatch();
  const {
    items: notifications,
    loading,
    currentPage,
    totalPages,
  } = useSelector((state) => state.managerNotifications);

  const listRef = useRef();

  useEffect(() => {
    dispatch(fetchManagerNotifications({ page: 1, limit: 10 }));
  }, [dispatch]);

  // Infinite scroll logic
  const handleScroll = () => {
    const el = listRef.current;
    if (!el || loading) return;

    const isBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
    if (isBottom && currentPage < totalPages) {
      dispatch(fetchManagerNotifications({ page: currentPage + 1, limit: 10 }));
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <Title level={3}>Thông báo</Title>
      <div
        ref={listRef}
        style={{
          width: "400px",
          maxHeight: "360px",
          overflowY: "auto", // ✅ chỉ scroll dọc
          overflowX: "hidden",
          padding: "12px",
          background: "#fff",
          borderRadius: 8,
        }}
        onScroll={handleScroll}
      >
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              key={item.notification_id}
              style={{
                background: "#fafafa",
                borderRadius: 8,
                padding: "12px 16px",
                marginBottom: 8,
                transition: "all 0.3s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f0f5ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fafafa";
              }}
            >
              <List.Item.Meta
                title={
                  <strong style={{ fontSize: 14, color: "#1f1f1f" }}>
                    {item.title}
                  </strong>
                }
                description={
                  <div style={{ fontSize: 13 }}>
                    <p style={{ marginBottom: 4 }}>{item.message}</p>
                    <small style={{ color: "#888" }}>
                      {new Date(item.created_at).toLocaleString()}
                    </small>
                  </div>
                }
              />
            </List.Item>
          )}
        />

        {loading && (
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <Spin size="small" />
          </div>
        )}

        {!loading && currentPage >= totalPages && (
          <p
            style={{
              textAlign: "center",
              color: "#aaa",
              marginTop: 12,
              fontSize: 13,
            }}
          >
            🎉 Đã tải hết tất cả thông báo.
          </p>
        )}
      </div>
    </div>
  );
}
