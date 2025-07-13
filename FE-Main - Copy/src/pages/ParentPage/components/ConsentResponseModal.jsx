import React from "react";
import { Modal, Form, Radio, Input, Button } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const ConsentResponseModal = ({
  visible,
  onCancel,
  onSubmit,
  loading = false,
  form,
}) => {
  return (
    <Modal
      title="Phản hồi đồng ý khám sức khỏe"
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        name="consentForm"
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
              <CloseCircleOutlined style={{ color: "#f5222d" }} /> Không đồng ý
              cho con tham gia khám sức khỏe
            </Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item name="note" label="Ghi chú (nếu có)">
          <TextArea rows={4} placeholder="Nhập ghi chú hoặc lý do (nếu có)" />
        </Form.Item>

        <Form.Item>
          <div style={{ textAlign: "right" }}>
            <Button style={{ marginRight: 8 }} onClick={onCancel}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Gửi phản hồi
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ConsentResponseModal;
