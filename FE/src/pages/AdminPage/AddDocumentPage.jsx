import {
  Typography,
  Form,
  Input,
  Button,
  Select,
  Upload,
  message,
  Card,
  Space,
  Divider,
  Row,
  Col,
} from "antd";
import {
  UploadOutlined,
  SaveOutlined,
  RollbackOutlined,
} from "@ant-design/icons";

import React from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export default function AddDocumentPage() {
  const { Title, Paragraph } = Typography;
  const { Option } = Select;

  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Một cách mạnh mẽ hơn để lấy dữ liệu từ localStorage
  const getInitialDataFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem("documentData");
      // Nếu có dữ liệu và không phải chuỗi rỗng thì parse, nếu không trả về mảng rỗng.
      return savedData ? JSON.parse(savedData) : [];
    } catch (error) {
      console.error(
        "Lỗi khi đọc hoặc phân tích cú pháp từ localStorage",
        error
      );
      // Nếu parse lỗi, trả về mảng rỗng để tránh làm sập ứng dụng.
      return [];
    }
  };

  const onFinish = (values) => {
    console.log("Giá trị nhận được từ form: ", values);

    // Lấy danh sách tài liệu hiện tại từ localStorage
    const currentDocuments = getInitialDataFromLocalStorage();
    const newKey = uuidv4();

    let fileName = "Chưa có file";
    let fileType = "N/A";
    let fileSize = "0 KB";

    // Kiểm tra xem trường 'upload' có tồn tại và có tệp tin không
    if (values.upload && values.upload.length > 0) {
      const file = values.upload[0].originFileObj; // Lấy đối tượng file gốc

      if (file) {
        fileName = file.name;
        fileType = file.name.split(".").pop()?.toUpperCase() || "N/A";
        fileSize = `${(file.size / 1024).toFixed(0)} KB`;
        if (file.size > 1024 * 1024) {
          fileSize = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
        }
      }
    } else {
      message.warning("Vui lòng chọn một file để tải lên.");
      return; // Tùy chọn: dừng việc submit nếu không có file nào được chọn
    }

    const newDocument = {
      key: newKey,
      name: values.name,
      description: values.description,
      category: values.category,
      type: fileType,
      size: fileSize,
      uploader: "Admin",
      downloads: 0,
      status: values.status,
      // Trong một ứng dụng thực tế, bạn sẽ lưu cả URL của file từ server/dịch vụ lưu trữ
      // fileUrl: 'https://your-storage-service.com/path/to/file.pdf'
    };

    const updatedDocuments = [...currentDocuments, newDocument];

    try {
      localStorage.setItem("documentData", JSON.stringify(updatedDocuments));
      message.success("Thêm tài liệu thành công!");
      form.resetFields();
    } catch (error) {
      console.error("Lỗi khi lưu tài liệu vào localStorage", error);
      message.error("Có lỗi xảy ra khi thêm tài liệu!");
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    // Chúng ta chỉ giữ lại file cuối cùng được chọn vì đã có maxCount={1}
    return e?.fileList.slice(-1);
  };

  return (
    <div className="add-document-page">
      <Title level={3}>Thêm tài liệu mới</Title>
      <Paragraph type="secondary">
        Điền thông tin chi tiết để thêm tài liệu vào hệ thống.
      </Paragraph>

      <Divider />

      <Card>
        <Form
          form={form}
          name="add_document"
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ status: "Công khai" }}
          scrollToFirstError
        >
          {/* ... các Form.Item khác đã đúng ... */}
          <Form.Item
            name="name"
            label="Tên tài liệu"
            rules={[{ required: true, message: "Vui lòng nhập tên tài liệu!" }]}
          >
            <Input placeholder="Tên của tài liệu" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn gọn về tài liệu" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Danh mục"
                rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
              >
                <Select placeholder="Chọn danh mục">
                  <Option value="Quy chế">Quy chế</Option>
                  <Option value="Biểu mẫu">Biểu mẫu</Option>
                  <Option value="Hướng dẫn">Hướng dẫn</Option>
                  <Option value="Báo cáo">Báo cáo</Option>
                  <Option value="Khác">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái!" },
                ]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="Công khai">Công khai</Option>
                  <Option value="Riêng tư">Riêng tư</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="upload"
            label="Tải lên file"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: "Vui lòng tải lên một file!" }]}
          >
            {/* 
              CÁC THAY ĐỔI CHÍNH Ở ĐÂY:
              1. Xóa thuộc tính `action` để ngăn các yêu cầu HTTP tự động.
              2. Thêm `beforeUpload` và trả về `false` để dừng quá trình tải lên,
                 cho phép chúng ta xử lý tệp tin thủ công trong hàm `onFinish`.
            */}
            <Upload
              name="file"
              beforeUpload={() => false} // <-- NGĂN VIỆC TẢI LÊN TỰ ĐỘNG
              listType="text"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Chọn File</Button>
            </Upload>
            <Paragraph type="secondary" style={{ marginTop: "8px" }}>
              Chỉ hỗ trợ PDF, DOCX, XLSX.
            </Paragraph>
          </Form.Item>

          <Divider />

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Thêm tài liệu
              </Button>
              <Button
                htmlType="button"
                icon={<RollbackOutlined />}
                onClick={() => navigate("/admin")}
              >
                Quay lại
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
