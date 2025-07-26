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
  Tooltip,
} from "antd";
import moment from "moment";
import { CalendarOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { FaSyringe } from "react-icons/fa";

import api from "../../../configs/config-axios";

const VaccinationCalendar = ({ campaigns, loading }) => {
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [campaignDetail, setCampaignDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const getCalendarData = (value) => {
    if (!Array.isArray(campaigns)) return [];
    const dateStr = value.format("YYYY-MM-DD");
    return campaigns.filter(
      (c) => moment(c.scheduled_date).format("YYYY-MM-DD") === dateStr
    );
  };

  const fetchCampaignDetails = async (campaignId) => {
    try {
      setDetailLoading(true);
      const res = await api.get(`/parent/vaccine-campaign/${campaignId}`);
      setCampaignDetail(res.data?.data || res.data);
    } catch (err) {
      console.error("Error fetching campaign details:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCampaignClick = (campaign) => {
    fetchCampaignDetails(campaign.id);
    setDetailModalVisible(true);
  };

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

  const dateCellRender = (value) => {
    const listData = getCalendarData(value);
    if (listData.length === 0) return null;

    return (
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {listData.map((item, index) => (
          <li
            key={`${value.format("YYYY-MM-DD")}-${index}`}
            style={{ margin: "2px 0", cursor: "pointer" }}
            onClick={() => handleCampaignClick(item)}
          >
            <Tooltip title={item.title}>
              <Badge
                status={getStatusColor(item.approval_status)}
                text={<FaSyringe style={{ color: "#1890ff" }} />}
              />
            </Tooltip>
          </li>
        ))}
      </ul>
    );
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
      <div className="calendar-header" style={{ marginBottom: 12 }}>
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

      {/* Modal chi tiết */}
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
          <div style={{ textAlign: "center", padding: 20 }}>
            <Spin />
          </div>
        ) : campaignDetail ? (
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
        ) : (
          <Empty description="Không có thông tin chi tiết" />
        )}
      </Modal>
    </div>
  );
};

export default VaccinationCalendar;
