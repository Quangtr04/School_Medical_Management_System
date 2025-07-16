import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Modal,
  Descriptions,
  Button,
  Tag,
  Typography,
  Spin,
  Empty,
  Form,
  Radio,
  Input,
  message,
  Divider,
  Row,
  Col,
  Card,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import moment from "moment";
import {
  getVaccineCampaignDetails,
  resendToVaccinationConsent,
  respondToVaccinationConsent,
} from "../../../redux/parent/parentSlice";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const VaccinationDetail = ({
  form_id,
  campaignId,
  visible,
  onClose,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const { selectedChild } = useSelector((state) => state.parent);
  const [loading, setLoading] = useState(false);
  const [campaignDetail, setCampaignDetail] = useState(null);
  const [consentForm] = Form.useForm();
  const [respondingConsent, setRespondingConsent] = useState(false);
  const [consentModalVisible, setConsentModalVisible] = useState(false);
  const [resendModalVisible, setResendModalVisible] = useState(false);
  const [resendForm] = Form.useForm();

  const token = localStorage.getItem("accessToken");

  // Fetch campaign details when modal becomes visible
  useEffect(() => {
    if (visible && campaignId) {
      fetchCampaignDetails();
    }
  }, [visible, campaignId]);

  const fetchCampaignDetails = async () => {
    try {
      setLoading(true);
      const response = await dispatch(
        getVaccineCampaignDetails({ campaignId, token })
      ).unwrap();
      setCampaignDetail(response);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching campaign details:", error);
      message.error("Không thể tải thông tin chi tiết chiến dịch tiêm chủng");
      setLoading(false);
    }
  };

  const handleResendSubmit = async (values) => {
    if (!selectedChild || !campaignId) {
      message.error("Thiếu thông tin học sinh hoặc chiến dịch");
      return;
    }

    try {
      setRespondingConsent(true);
      await dispatch(
        resendToVaccinationConsent({
          accessToken: token,
          form_id: form_id,
          status: values.status === "AGREED" ? "AGREED" : "DECLINED",
          note: values.notes || "",
        })
      ).unwrap();

      message.success("Đã gửi phản hồi thành công");
      setConsentModalVisible(false);
      fetchCampaignDetails(); // Refresh campaign details
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error responding to consent:", error);
      message.error("Không thể gửi phản hồi. Vui lòng thử lại sau.");
    } finally {
      setRespondingConsent(false);
    }
  };

  // Handle consent form submission
  const handleConsentSubmit = async (values) => {
    if (!selectedChild || !campaignId) {
      message.error("Thiếu thông tin học sinh hoặc chiến dịch");
      return;
    }

    try {
      console.log(values);

      setRespondingConsent(true);
      await dispatch(
        respondToVaccinationConsent({
          accessToken: token,
          form_id: form_id,
          status: values.status === "AGREED" ? "AGREED" : "DECLINED",
          note: values.notes || "",
        })
      ).unwrap();

      message.success("Đã gửi phản hồi thành công");
      setConsentModalVisible(false);
      fetchCampaignDetails(); // Refresh campaign details
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error responding to consent:", error);
      message.error("Không thể gửi phản hồi. Vui lòng thử lại sau.");
    } finally {
      setRespondingConsent(false);
    }
  };

  // Show consent form modal
  const showConsentForm = () => {
    consentForm.resetFields();
    setConsentModalVisible(true);
  };

  const showResendForm = () => {
    consentForm.resetFields();
    setResendModalVisible(true);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "AGREED":
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
      case "AGREED":
        return "Đã duyệt";
      case "PENDING":
        return "Đang chờ";
      case "DECLINED":
        return "Từ chối";
      default:
        return "Không xác định";
    }
  };

  return (
    <>
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <MedicineBoxOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            <span>Chi tiết chiến dịch tiêm chủng</span>
          </div>
        }
        open={visible}
        onCancel={onClose}
        footer={[
          campaignDetail?.status === "PENDING" && (
            <Button key="respond" type="primary" onClick={showConsentForm}>
              Phản hồi đồng ý/từ chối
            </Button>
          ),
          (campaignDetail?.status === "DECLINED" ||
            campaignDetail?.status === "AGREED") && (
            <Button key="resend" type="dashed" onClick={showResendForm}>
              Gửi lại yêu cầu
            </Button>
          ),
          <Button key="close" onClick={onClose}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin size="large" />
          </div>
        ) : campaignDetail ? (
          <div className="campaign-detail">
            <Card className="mb-4" style={{ textAlign: "center" }}>
              <Title level={4} style={{ textAlign: "center" }}>
                {campaignDetail.title || "Chiến dịch tiêm chủng"}
              </Title>
              <Row gutter={[16, 16]} justify="center">
                <Col>
                  <div
                    className="detail-item"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <CalendarOutlined
                      className="detail-icon"
                      style={{ marginRight: 8 }}
                    />
                    <Text>
                      Ngày tiêm:{" "}
                      <Text strong>
                        {campaignDetail.scheduled_date
                          ? moment(campaignDetail.scheduled_date).format(
                              "DD/MM/YYYY"
                            )
                          : "Chưa xác định"}
                      </Text>
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>
            <Descriptions bordered column={1} className="mb-4">
              <Descriptions.Item label="Tên học sinh">
                {campaignDetail.full_name || "Không có thông tin"}
              </Descriptions.Item>
              <Descriptions.Item label="Lớp">
                {campaignDetail.class || "Không có thông tin"}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả tiêm chủng">
                {campaignDetail.description || "Không có thông tin"}
              </Descriptions.Item>
              <Descriptions.Item label="Nhà tài trợ">
                <div className="detail-item">
                  <TeamOutlined className="detail-icon" />
                  <Text>{campaignDetail.sponsor || "Không có"}</Text>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(campaignDetail.status)}>
                  {getStatusText(campaignDetail.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái phản hồi">
                <Tag color={getStatusColor(campaignDetail.status)}>
                  {getStatusText(campaignDetail.status)}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </div>
        ) : (
          <Empty description="Không có thông tin chi tiết" />
        )}
      </Modal>

      {/* Consent Form Modal */}
      <Modal
        title="Phản hồi đồng ý tiêm chủng"
        open={consentModalVisible}
        onCancel={() => setConsentModalVisible(false)}
        footer={null}
      >
        <Form
          form={consentForm}
          layout="vertical"
          onFinish={handleConsentSubmit}
        >
          <Form.Item
            name="status"
            label="Quyết định của bạn"
            rules={[{ required: true, message: "Vui lòng chọn quyết định" }]}
          >
            <Radio.Group>
              <Radio value="AGREED">
                <CheckCircleOutlined style={{ color: "#52c41a" }} /> Đồng ý cho
                con tham gia tiêm chủng
              </Radio>
              <Radio value="DECLINED">
                <CloseCircleOutlined style={{ color: "#f5222d" }} /> Không đồng
                ý cho con tham gia tiêm chủng
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="note" label="Ghi chú (nếu có)">
            <TextArea rows={4} placeholder="Nhập ghi chú hoặc lý do (nếu có)" />
          </Form.Item>

          <Form.Item>
            <div style={{ textAlign: "right" }}>
              <Button
                style={{ marginRight: 8 }}
                onClick={() => setConsentModalVisible(false)}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={respondingConsent}
              >
                Gửi phản hồi
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Resend Form Modal */}
      <Modal
        title="Phản hồi đồng ý tiêm chủng"
        open={resendModalVisible}
        onCancel={() => setResendModalVisible(false)}
        footer={null}
      >
        <Form form={resendForm} layout="vertical" onFinish={handleResendSubmit}>
          <Form.Item
            name="status"
            label="Quyết định của bạn"
            rules={[{ required: true, message: "Vui lòng chọn quyết định" }]}
          >
            <Radio.Group>
              <Radio value="AGREED">
                <CheckCircleOutlined style={{ color: "#52c41a" }} /> Đồng ý cho
                con tham gia tiêm chủng
              </Radio>
              <Radio value="DECLINED">
                <CloseCircleOutlined style={{ color: "#f5222d" }} /> Không đồng
                ý cho con tham gia tiêm chủng
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="note" label="Ghi chú (nếu có)">
            <TextArea rows={4} placeholder="Nhập ghi chú hoặc lý do (nếu có)" />
          </Form.Item>

          <Form.Item>
            <div style={{ textAlign: "right" }}>
              <Button
                style={{ marginRight: 8 }}
                onClick={() => setResendModalVisible(false)}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={respondingConsent}
              >
                Gửi phản hồi
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <style jsx>{`
        .campaign-detail .detail-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        .campaign-detail .detail-icon {
          margin-right: 8px;
          color: #1890ff;
        }
        .mb-4 {
          margin-bottom: 16px;
        }
      `}</style>
    </>
  );
};

export default VaccinationDetail;
