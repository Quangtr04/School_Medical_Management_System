import React, { useState } from "react";
import { Modal, Descriptions, Tag, Button, Form, Radio, Input } from "antd";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { respondToCheckupConsent } from "../../../redux/parent/parentSlice";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

const { TextArea } = Input;

const getStatusTag = (status) => {
  switch (status) {
    case "PENDING":
      return <Tag color="processing">Đang chờ phản hồi</Tag>;
    case "AGREED":
      return <Tag color="success">Đã đồng ý</Tag>;
    case "DECLINED":
      return <Tag color="error">Đã từ chối</Tag>;
    default:
      return <Tag color="default">Không rõ</Tag>;
  }
};

const CheckupDetail = ({ visible, onClose, checkup, onSuccess }) => {
  const dispatch = useDispatch();
  const { selectedChild } = useSelector((state) => state.parent);
  const accessToken = localStorage.getItem("accessToken");

  const [resendVisible, setResendVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleResendConsent = async (values) => {
    try {
      setLoading(true);
      await dispatch(
        respondToCheckupConsent({
          formId: checkup.form_id,
          studentId: selectedChild?.student_id,
          accessToken,
          status: values.status,
          note: values.note,
        })
      ).unwrap();
      toast.success("Gửi lại phản hồi thành công!");
      setResendVisible(false);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error("Gửi lại phản hồi thất bại!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!checkup) return null;

  return (
    <>
      <Modal
        title="Chi tiết đợt khám"
        open={visible}
        onCancel={onClose}
        footer={[
          checkup.status !== "PENDING" && (
            <Button key="resend" onClick={() => setResendVisible(true)}>
              Gửi lại yêu cầu
            </Button>
          ),
          <Button onClick={onClose} key="close">
            Đóng
          </Button>,
        ]}
        centered
      >
        <Descriptions column={1} bordered size="middle">
          <Descriptions.Item label="📌 Tên đợt khám">
            {checkup.title}
          </Descriptions.Item>
          <Descriptions.Item label="👦 Học sinh">
            {checkup.full_name}
          </Descriptions.Item>
          <Descriptions.Item label="🏫 Lớp">
            {checkup.class_name || "Không rõ"}
          </Descriptions.Item>
          <Descriptions.Item label="📝 Mô tả">
            {checkup.description}
          </Descriptions.Item>
          <Descriptions.Item label="📅 Ngày khám">
            {moment(checkup.scheduled_date).format("DD/MM/YYYY")}
          </Descriptions.Item>
          <Descriptions.Item label="💰 Nhà tài trợ">
            {checkup.sponsor || "Không có"}
          </Descriptions.Item>
          <Descriptions.Item label="📤 Trạng thái phản hồi">
            {getStatusTag(checkup.status)}
          </Descriptions.Item>
          <Descriptions.Item label="📤 Ghi chú">
            {checkup.note ? checkup.note : "Không có ghi chú gì"}
          </Descriptions.Item>
        </Descriptions>
      </Modal>

      {/* Gộp modal phản hồi lại yêu cầu */}
      <Modal
        title="Phản hồi lại yêu cầu khám sức khỏe"
        open={resendVisible}
        onCancel={() => setResendVisible(false)}
        footer={null}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleResendConsent}
          name="resendConsentForm"
        >
          <Form.Item
            name="status"
            label="Quyết định của bạn"
            rules={[{ required: true, message: "Vui lòng chọn quyết định" }]}
          >
            <Radio.Group>
              <Radio value="AGREED">
                <CheckCircleOutlined style={{ color: "#52c41a" }} /> Đồng ý cho
                con tham gia khám sức khỏe
              </Radio>
              <Radio value="DECLINED">
                <CloseCircleOutlined style={{ color: "#f5222d" }} /> Không đồng
                ý cho con tham gia khám sức khỏe
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
                onClick={() => setResendVisible(false)}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Gửi phản hồi
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CheckupDetail;
