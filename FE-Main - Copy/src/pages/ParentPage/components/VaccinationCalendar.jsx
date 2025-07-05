import React from "react";
import { Calendar, Badge, Empty, Spin } from "antd";
import moment from "moment";
import { CalendarOutlined } from "@ant-design/icons";

const VaccinationCalendar = ({ campaigns, loading }) => {
  // Xử lý dữ liệu cho lịch
  const getCalendarData = (value) => {
    if (!campaigns || !Array.isArray(campaigns)) return [];

    // Lấy ngày hiện tại từ value
    const dateString = value.format("YYYY-MM-DD");

    // Lọc các chiến dịch tiêm chủng diễn ra vào ngày này
    return campaigns.filter((campaign) => {
      if (!campaign || !campaign.scheduled_date) return false;
      return (
        moment(campaign.scheduled_date).format("YYYY-MM-DD") === dateString
      );
    });
  };

  // Render nội dung cho mỗi ô ngày
  const dateCellRender = (value) => {
    const listData = getCalendarData(value);

    if (listData.length === 0) return null;

    return (
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {listData.map((item, index) => (
          <li
            key={`${value.format("YYYY-MM-DD")}-${index}`}
            style={{ margin: "2px 0", fontSize: "12px" }}
          >
            <Badge
              status={getStatusColor(item.approval_status)}
              text={item.title || "Chiến dịch tiêm chủng"}
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                width: "100%",
              }}
            />
          </li>
        ))}
      </ul>
    );
  };

  // Xác định màu sắc dựa trên trạng thái
  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "PENDING":
        return "processing";
      case "DECLINED":
        return "error";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Spin />
      </div>
    );
  }

  return (
    <div className="vaccination-calendar">
      <div className="calendar-header">
        <CalendarOutlined style={{ marginRight: 8 }} />
        <span>Lịch tiêm chủng</span>
      </div>
      {campaigns && campaigns.length > 0 ? (
        <Calendar
          fullscreen={false}
          dateCellRender={dateCellRender}
          style={{ maxHeight: 300 }}
        />
      ) : (
        <Empty description="Không có dữ liệu lịch tiêm chủng" />
      )}
    </div>
  );
};

export default VaccinationCalendar;
