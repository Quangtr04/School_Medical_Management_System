import React, { useState } from "react";
import {
  Calendar,
  Badge,
  Empty,
  Spin,
  Modal,
  Descriptions,
  Button,
  Tag,
  Typography,
} from "antd";
import moment from "moment";
import { CalendarOutlined, InfoCircleOutlined } from "@ant-design/icons";
import api from "../../../configs/config-axios";

const { Title, Text } = Typography;

const VaccinationCalendar = ({ campaigns, loading }) => {
  // State for modal
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignDetail, setCampaignDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

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

  // Fetch campaign details
  const fetchCampaignDetails = async (campaignId) => {
    try {
      setDetailLoading(true);
      const response = await api.get(`/parent/vaccine-campaign/${campaignId}`);
      const data = response.data?.data || response.data;
      setCampaignDetail(data);
      setDetailLoading(false);
    } catch (error) {
      console.error("Error fetching campaign details:", error);
      setDetailLoading(false);
    }
  };

  // Handle campaign click
  const handleCampaignClick = (campaign) => {
    setSelectedCampaign(campaign);
    fetchCampaignDetails(campaign.id);
    setDetailModalVisible(true);
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
            style={{ margin: "2px 0", fontSize: "12px", cursor: "pointer" }}
            onClick={() => handleCampaignClick(item)}
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

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case "APPROVED":
        return "Đã duyệt";
      case "PENDING":
        return "Đang chờ";
      case "DECLINED":
        return "Từ chối";
      default:
        return "Không xác định";
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

      {/* Campaign Detail Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <InfoCircleOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            <span>Chi tiết chiến dịch tiêm chủng</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {detailLoading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin />
          </div>
        ) : campaignDetail ? (
          <div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Tên chiến dịch">
                {campaignDetail.title || "Không có tên"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tiêm">
                {campaignDetail.scheduled_date
                  ? moment(campaignDetail.scheduled_date).format("DD/MM/YYYY")
                  : "Chưa xác định"}
              </Descriptions.Item>
              <Descriptions.Item label="Địa điểm">
                {campaignDetail.location || "Chưa xác định"}
              </Descriptions.Item>
              <Descriptions.Item label="Nhà tài trợ">
                {campaignDetail.sponsor || "Không có"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(campaignDetail.approval_status)}>
                  {getStatusText(campaignDetail.approval_status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái phản hồi">
                <Tag color={getStatusColor(campaignDetail.consent_status)}>
                  {getStatusText(campaignDetail.consent_status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {campaignDetail.description || "Không có mô tả"}
              </Descriptions.Item>
            </Descriptions>
          </div>
        ) : (
          <Empty description="Không có thông tin chi tiết" />
        )}
      </Modal>
    </div>
  );
};

export default VaccinationCalendar;
