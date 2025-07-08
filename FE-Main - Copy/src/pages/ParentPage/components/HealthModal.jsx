import React, { useEffect } from "react";
import {
  Modal,
  Descriptions,
  Form,
  Input,
  Spin,
  Button,
  message,
  Select,
  InputNumber,
} from "antd";
import { format } from "date-fns";
import { useDispatch } from "react-redux";
import { updateHealthDeclaration } from "../../../redux/parent/parentSlice";

const HealthModal = ({ detailVisible, setDetailVisible, selectedChild }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedChild) {
      form.setFieldsValue({
        blood_type: selectedChild.health?.blood_type ?? "",
        height_cm: selectedChild.health?.height_cm,
        weight_kg: selectedChild.health?.weight_kg,
        allergy: selectedChild.health?.allergy,
        chronic_disease: selectedChild.health?.chronic_disease,
        vision_left: selectedChild.health?.vision_left,
        vision_right: selectedChild.health?.vision_right,
        hearing_left: selectedChild.health?.hearing_left,
        hearing_right: selectedChild.health?.hearing_right,
        health_status: selectedChild.health?.health_status,
      });
    }
  }, [selectedChild, form]);

  const handleUpdate = () => {
    form.validateFields().then((values) => {
      console.log("Giá trị từ form:", values);

      const transformedValues = {
        ...values,
        vision_left: values.vision_left?.toString(),
        vision_right: values.vision_right?.toString(),
        hearing_left: values.hearing_left?.toString(),
        hearing_right: values.hearing_right?.toString(),
        // 👇 Thêm nhóm máu hiện tại nếu đã tồn tại
        blood_type: selectedChild.health?.blood_type ?? values.blood_type,
      };

      dispatch(
        updateHealthDeclaration({
          studentId: selectedChild.student_id,
          declarationData: transformedValues,
        })
      )
        .unwrap()
        .then(() => {
          message.success("Cập nhật thành công");
          setDetailVisible(false);
        })
        .catch((err) => {
          message.error(
            "Cập nhật thất bại: " + (err?.message || "Lỗi không xác định")
          );
        });
    });
  };

  return (
    <Modal
      visible={detailVisible}
      title="Chi tiết học sinh"
      footer={null}
      onCancel={() => setDetailVisible(false)}
    >
      {selectedChild ? (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
          onFinishFailed={(err) => {
            console.log("Form validation failed:", err);
          }}
        >
          <Descriptions column={1} bordered size="small">
            {/* Trường không được sửa */}
            <Descriptions.Item label="Họ và tên">
              {selectedChild.full_name}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              {selectedChild.date_of_birth
                ? format(new Date(selectedChild.date_of_birth), "dd/MM/yyyy")
                : "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {selectedChild.gender || "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Lớp">
              {selectedChild.class_name || "Chưa cập nhật"}
            </Descriptions.Item>

            {/* Nhóm máu: chỉ cho input nếu chưa có dữ liệu */}
            <Descriptions.Item label="Nhóm máu">
              {selectedChild.health?.blood_type ? (
                selectedChild.health.blood_type
              ) : (
                <Form.Item name="blood_type" noStyle>
                  <Input placeholder="Nhập nhóm máu" />
                </Form.Item>
              )}
            </Descriptions.Item>

            {/* Các trường cho phép nhập */}
            <Descriptions.Item label="Chiều cao (cm)">
              <Form.Item
                name="height_cm"
                noStyle
                rules={[{ required: true, message: "Vui lòng nhập chiều cao" }]}
              >
                <InputNumber
                  min={30}
                  max={250}
                  step={1}
                  style={{ width: "100%" }}
                  placeholder="Nhập chiều cao"
                />
              </Form.Item>
            </Descriptions.Item>

            <Descriptions.Item label="Cân nặng (kg)">
              <Form.Item
                name="weight_kg"
                noStyle
                rules={[{ required: true, message: "Vui lòng nhập cân nặng" }]}
              >
                <InputNumber
                  min={5}
                  max={200}
                  step={0.1}
                  style={{ width: "100%" }}
                  placeholder="Nhập cân nặng"
                />
              </Form.Item>
            </Descriptions.Item>

            <Descriptions.Item label="Tầm nhìn trái">
              <Form.Item
                name="vision_left"
                noStyle
                rules={[
                  { required: true, message: "Vui lòng nhập tầm nhìn trái" },
                ]}
              >
                <InputNumber
                  min={0}
                  max={10}
                  step={0.1}
                  style={{ width: "100%" }}
                  stringMode
                  placeholder="VD: 1.0"
                />
              </Form.Item>
            </Descriptions.Item>

            <Descriptions.Item label="Tầm nhìn phải">
              <Form.Item
                name="vision_right"
                noStyle
                rules={[
                  { required: true, message: "Vui lòng nhập tầm nhìn phải" },
                ]}
              >
                <InputNumber
                  min={0}
                  max={10}
                  step={0.1}
                  style={{ width: "100%" }}
                  stringMode
                  placeholder="VD: 1.0"
                />
              </Form.Item>
            </Descriptions.Item>

            <Descriptions.Item label="Thính lực trái">
              <Form.Item
                name="hearing_left"
                noStyle
                rules={[
                  { required: true, message: "Vui lòng nhập thính lực trái" },
                ]}
              >
                <InputNumber
                  min={0}
                  max={120}
                  step={0.1}
                  style={{ width: "100%" }}
                  stringMode
                  placeholder="VD: 80"
                />
              </Form.Item>
            </Descriptions.Item>

            <Descriptions.Item label="Thính lực phải">
              <Form.Item
                name="hearing_right"
                noStyle
                rules={[
                  { required: true, message: "Vui lòng nhập thính lực phải" },
                ]}
              >
                <InputNumber
                  min={0}
                  max={120}
                  step={0.1}
                  style={{ width: "100%" }}
                  stringMode
                  placeholder="VD: 80"
                />
              </Form.Item>
            </Descriptions.Item>

            <Descriptions.Item label="Dị ứng">
              <Form.Item name="allergy" noStyle>
                <Input placeholder="Nhập dị ứng (nếu có)" />
              </Form.Item>
            </Descriptions.Item>

            <Descriptions.Item label="Bệnh mãn tính">
              <Form.Item name="chronic_disease" noStyle>
                <Input placeholder="Nhập bệnh mãn tính" />
              </Form.Item>
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái sức khỏe">
              <Form.Item name="health_status" noStyle>
                <Select placeholder="Chọn trạng thái sức khỏe">
                  <Select.Option value="Khỏe mạnh">Khỏe mạnh</Select.Option>
                  <Select.Option value="Cần theo dõi">
                    Cần theo dõi
                  </Select.Option>
                  <Select.Option value="Nghiêm trọng">
                    Nghiêm trọng
                  </Select.Option>
                </Select>
              </Form.Item>
            </Descriptions.Item>

            <Descriptions.Item label="Lần cập nhật gần nhất">
              {selectedChild.health?.updated_at || "Chưa cập nhật"}
            </Descriptions.Item>
          </Descriptions>

          <Form.Item style={{ marginTop: 16, textAlign: "right" }}>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <Spin size="small" />
      )}
    </Modal>
  );
};

export default HealthModal;
