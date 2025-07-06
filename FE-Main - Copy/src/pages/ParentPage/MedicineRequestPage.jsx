import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Divider,
  Spin,
  Empty,
  Form,
  Input,
  DatePicker,
  Select,
  Upload,
  Modal,
  message,
  Tabs,
  Radio,
  Alert,
} from "antd";
import {
  PlusOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  FileImageOutlined,
  ClockCircleOutlined,
  UserOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleFilled,
} from "@ant-design/icons";
import {
  getParentChildren,
  getChildDetails,
  submitMedicationRequest,
  getMedicationRequests,
  setSelectedChild,
} from "../../redux/parent/parentSlice";
import moment from "moment";
import api from "../../configs/config-axios";

const { TextArea } = Input;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

function MedicineRequestPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    children,
    selectedChild,
    medicationRequests,
    loading: childrenLoading,
    success,
    error,
  } = useSelector((state) => state.parent);

  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [dateType, setDateType] = useState("single"); // "single" or "multiple"
  const [submitting, setSubmitting] = useState(false);

  // Fetch children data on mount
  useEffect(() => {
    console.log("Fetching children data...");
    dispatch(getParentChildren())
      .unwrap()
      .then((data) => {
        console.log("Children data fetched successfully:", data);
      })
      .catch((error) => {
        console.error("Error fetching children data:", error);
        message.error(
          "Không thể tải danh sách học sinh. Vui lòng thử lại sau."
        );
      });
  }, [dispatch]);

  // Log children data when it changes
  useEffect(() => {
    console.log("Children data in Redux:", children);
  }, [children]);

  // Select first child if none selected
  useEffect(() => {
    if (children && children.length > 0 && !selectedChild) {
      // Make sure we have a valid ID before dispatching
      const childId = children[0].id || children[0].student_id;
      if (childId) {
        console.log("Selecting first child:", children[0]);
        dispatch(getChildDetails(childId));
      } else {
        console.error("No valid ID found for child:", children[0]);
      }
    }
  }, [dispatch, children, selectedChild]);

  // Fetch medication requests when child is selected
  useEffect(() => {
    if (selectedChild?.student_id) {
      dispatch(getMedicationRequests(selectedChild.student_id));
    } else if (selectedChild) {
      // If selectedChild exists but doesn't have student_id, log warning
      console.warn("Selected child doesn't have a student_id:", selectedChild);
    }
  }, [dispatch, selectedChild]);

  // Handle success from API
  useEffect(() => {
    if (success && submitting) {
      message.success("Gửi yêu cầu thuốc thành công!");
      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
      setSubmitting(false);

      // Refresh medicine requests
      if (selectedChild?.student_id) {
        dispatch(getMedicationRequests(selectedChild.student_id));
      }
    }
  }, [success, form, selectedChild, submitting, dispatch]);

  // Handle errors from API
  useEffect(() => {
    if (error && submitting) {
      if (error.errors && Array.isArray(error.errors)) {
        // Display specific validation errors
        message.error(`Lỗi: ${error.errors.join(", ")}`);
      } else {
        message.error(
          "Không thể gửi yêu cầu thuốc: " +
            (error.message || "Vui lòng thử lại sau.")
        );
      }
      setSubmitting(false);
    }
  }, [error, submitting]);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const showModal = () => {
    form.resetFields();

    // Nếu có học sinh đã chọn, thiết lập giá trị mặc định cho trường học sinh
    if (selectedChild?.student_id) {
      form.setFieldsValue({
        student: selectedChild.student_id,
      });
    } else if (children.length > 0) {
      // Nếu chưa có học sinh được chọn nhưng có danh sách học sinh, chọn học sinh đầu tiên
      form.setFieldsValue({
        student: children[0].student_id,
      });
      // Cập nhật selectedChild trong Redux store
      dispatch(setSelectedChild(children[0]));
    }

    setFileList([]);
    setDateType("single");
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
    setPreviewTitle(
      file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
    );
  };

  const handlePreviewCancel = () => setPreviewVisible(false);

  const handleChangeUpload = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  // Date disabler function - disables weekends and past dates
  const disabledDate = (current) => {
    // Can't select days before today
    const today = moment().startOf("day");

    // Can't select weekends (Saturday is 6, Sunday is 0)
    const isWeekend = current.day() === 0 || current.day() === 6;

    return current && (current < today || isWeekend);
  };

  // End date disabler - also prevents selecting date before start date
  const disabledEndDate = (current, startDate) => {
    // Can't select days before start date
    const isBeforeStartDate = startDate && current < startDate.startOf("day");

    // Can't select weekends (Saturday is 6, Sunday is 0)
    const isWeekend = current.day() === 0 || current.day() === 6;

    return current && (isBeforeStartDate || isWeekend);
  };

  const handleDateTypeChange = (e) => {
    const newDateType = e.target.value;
    setDateType(newDateType);

    // Clear the date fields when switching between single and multiple
    form.setFieldsValue({
      singleDate: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  };

  const handleSubmit = async (values) => {
    // Prepare start and end dates based on date type
    let startDate, endDate;

    if (dateType === "single") {
      // For single date, both start and end are the same
      startDate = values.singleDate;
      endDate = values.singleDate;
    } else {
      // For multiple dates
      startDate = values.startDate;
      endDate = values.endDate;
    }

    // Get student_id from form values
    const student_id = values.student;

    // Find the selected child from the children array
    const selectedStudentFromForm = children.find(
      (child) => child.student_id === student_id
    );

    // Check if student_id exists
    if (!student_id) {
      message.error("Vui lòng chọn học sinh.");
      return;
    }

    // Check if parent_id exists
    if (!user?.user_id) {
      message.error(
        "Không thể xác định thông tin phụ huynh. Vui lòng đăng nhập lại."
      );
      return;
    }

    // Prepare the image if available
    let imageUrl = "";
    if (fileList.length > 0 && fileList[0].originFileObj) {
      try {
        const formData = new FormData();
        formData.append("file", fileList[0].originFileObj);

        // For now we'll use a placeholder until image upload is implemented
        imageUrl = "https://example.com/uploaded-prescription.jpg";

        // In a real implementation with actual file upload:
        // const uploadResponse = await api.post('/parent/upload-image', formData);
        // imageUrl = uploadResponse.data.url;
      } catch (uploadError) {
        console.error("Lỗi khi tải ảnh lên:", uploadError);
        message.warning(
          "Không thể tải ảnh lên, tiếp tục gửi yêu cầu không có ảnh."
        );
      }
    }

    // Create medication request data with all required fields
    const medicationRequestData = {
      parent_id: user.user_id,
      student_id: student_id,
      note: values.note,
      image_url: imageUrl,
      start_date: startDate.format("YYYY-MM-DD"),
      end_date: endDate.format("YYYY-MM-DD"),
      medication_name: values.note.split("\n")[0] || "Thuốc",
      dosage: values.dosage || "",
      frequency: values.frequency || "",
      status: "PENDING",
      nurse_id: 3, // Luôn gán nurse_id mặc định là 3
    };

    console.log("Sending medication request data:", medicationRequestData);
    setSubmitting(true);

    // Use the Redux action instead of direct API call
    dispatch(submitMedicationRequest(medicationRequestData));
  };

  const getStatusTag = (status) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return (
          <Tag icon={<ClockCircleFilled />} color="warning">
            Đang chờ duyệt
          </Tag>
        );
      case "APPROVED":
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Đã duyệt
          </Tag>
        );
      case "REJECTED":
        return (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Từ chối
          </Tag>
        );
      case "IN_REVIEW":
        return (
          <Tag icon={<ExclamationCircleOutlined />} color="processing">
            Đang xem xét
          </Tag>
        );
      case "DELIVERED":
        return (
          <Tag icon={<MedicineBoxOutlined />} color="blue">
            Đã giao thuốc
          </Tag>
        );
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Tải lên</div>
    </div>
  );

  const columns = [
    {
      title: "Mã YC",
      dataIndex: "id_req",
      key: "id_req",
      width: 80,
    },
    {
      title: "Thời gian yêu cầu",
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => moment(text).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thời gian sử dụng",
      key: "period",
      render: (_, record) => (
        <span>
          {moment(record.start_date).format("DD/MM/YYYY")} -{" "}
          {moment(record.end_date).format("DD/MM/YYYY")}
        </span>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<InfoCircleOutlined />}
            onClick={() => viewMedicationDetails(record)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  const viewMedicationDetails = (record) => {
    Modal.info({
      title: "Chi tiết yêu cầu gửi thuốc",
      width: 600,
      content: (
        <div style={{ marginTop: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card>
                <Row gutter={16}>
                  <Col span={12}>
                    <p>
                      <strong>Mã yêu cầu:</strong> #{record.id_req}
                    </p>
                    <p>
                      <strong>Ngày yêu cầu:</strong>{" "}
                      {moment(record.created_at).format("DD/MM/YYYY HH:mm")}
                    </p>
                    <p>
                      <strong>Thời gian sử dụng:</strong>{" "}
                      {moment(record.start_date).format("DD/MM/YYYY")} -{" "}
                      {moment(record.end_date).format("DD/MM/YYYY")}
                    </p>
                    <p>
                      <strong>Trạng thái:</strong> {getStatusTag(record.status)}
                    </p>
                  </Col>
                  <Col span={12}>
                    <p>
                      <strong>Học sinh:</strong> {selectedChild?.full_name}
                    </p>
                    <p>
                      <strong>Lớp:</strong> {selectedChild?.class_name}
                    </p>
                    <p>
                      <strong>Y tá phụ trách:</strong> ID: {record.nurse_id}
                    </p>
                  </Col>
                </Row>
                <Divider />
                <div>
                  <strong>Ghi chú:</strong>
                  <p>{record.note || "Không có ghi chú"}</p>
                </div>
                {record.image_url && (
                  <div style={{ marginTop: 16 }}>
                    <strong>Hình ảnh đơn thuốc:</strong>
                    <div style={{ marginTop: 8 }}>
                      <img
                        src={record.image_url}
                        alt="Đơn thuốc"
                        style={{ maxWidth: "100%", maxHeight: 200 }}
                      />
                    </div>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      ),
      onOk() {},
    });
  };

  const renderActiveMedications = () => {
    const activeRequests =
      medicationRequests?.filter((req) =>
        ["PENDING", "APPROVED", "IN_REVIEW"].includes(
          (req.status || "").toUpperCase()
        )
      ) || [];

    return (
      <Table
        columns={columns}
        dataSource={activeRequests}
        rowKey={(record) => record.id_req || record.id}
        loading={childrenLoading}
        pagination={{ pageSize: 5 }}
        locale={{
          emptyText: (
            <Empty description="Không có yêu cầu thuốc nào đang hoạt động" />
          ),
        }}
      />
    );
  };

  const renderHistoryMedications = () => {
    const historyRequests =
      medicationRequests?.filter((req) =>
        ["DELIVERED", "REJECTED"].includes((req.status || "").toUpperCase())
      ) || [];

    return (
      <Table
        columns={columns}
        dataSource={historyRequests}
        rowKey={(record) => record.id_req || record.id}
        loading={childrenLoading}
        pagination={{ pageSize: 5 }}
        locale={{
          emptyText: <Empty description="Không có lịch sử gửi thuốc" />,
        }}
      />
    );
  };

  if (childrenLoading) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div className="medication-submission-page">
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              <MedicineBoxOutlined style={{ marginRight: 8 }} />
              Gửi thuốc
            </Title>
            <Text type="secondary">
              Gửi yêu cầu thuốc cho con em và theo dõi tình trạng
            </Text>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
              Gửi yêu cầu mới
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane
            tab={
              <span>
                <ClockCircleOutlined /> Yêu cầu đang xử lý
              </span>
            }
            key="1"
          >
            {renderActiveMedications()}
          </TabPane>
          <TabPane
            tab={
              <span>
                <CheckCircleOutlined /> Lịch sử gửi thuốc
              </span>
            }
            key="2"
          >
            {renderHistoryMedications()}
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal gửi yêu cầu thuốc */}
      <Modal
        title="Gửi yêu cầu thuốc cho con"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="student"
            label="Học sinh"
            initialValue={selectedChild?.student_id}
            rules={[
              {
                required: true,
                message: "Vui lòng chọn học sinh",
              },
            ]}
          >
            <Select
              onChange={(value) => {
                const selected = children.find(
                  (child) => child.student_id === value
                );
                if (selected) {
                  dispatch(setSelectedChild(selected));
                }
              }}
              notFoundContent={
                children.length === 0 ? (
                  <Spin size="small" />
                ) : (
                  <Empty description="Không có dữ liệu" />
                )
              }
              loading={childrenLoading}
              placeholder="Chọn học sinh"
            >
              {children && children.length > 0 ? (
                children.map((child) => (
                  <Select.Option
                    key={child.student_id}
                    value={child.student_id}
                  >
                    {child.full_name ||
                      child.name ||
                      `Học sinh ${child.student_id}`}{" "}
                    {child.class_name ? `- ${child.class_name}` : ""}
                  </Select.Option>
                ))
              ) : (
                <Select.Option value="" disabled>
                  Không có dữ liệu học sinh
                </Select.Option>
              )}
            </Select>
          </Form.Item>

          <Alert
            message="Lưu ý về thời gian gửi thuốc"
            description="Không thể chọn ngày cuối tuần (Thứ 7, Chủ Nhật) và ngày trong quá khứ."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item label="Loại thời gian sử dụng thuốc">
            <Radio.Group value={dateType} onChange={handleDateTypeChange}>
              <Radio value="single">Một ngày duy nhất</Radio>
              <Radio value="multiple">Nhiều ngày</Radio>
            </Radio.Group>
          </Form.Item>

          {dateType === "single" ? (
            <Form.Item
              name="singleDate"
              label="Ngày sử dụng thuốc"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ngày sử dụng thuốc",
                },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày"
                disabledDate={disabledDate}
              />
            </Form.Item>
          ) : (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="startDate"
                  label="Ngày bắt đầu"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn ngày bắt đầu",
                    },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder="Ngày bắt đầu"
                    disabledDate={disabledDate}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="endDate"
                  label="Ngày kết thúc"
                  dependencies={["startDate"]}
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn ngày kết thúc",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const startDate = getFieldValue("startDate");
                        if (!value || !startDate) {
                          return Promise.resolve();
                        }
                        // Use standard moment.js comparison
                        if (
                          value.isSame(startDate) ||
                          value.isAfter(startDate)
                        ) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(
                            "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu"
                          )
                        );
                      },
                    }),
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder="Ngày kết thúc"
                    disabledDate={(current) => {
                      const startDate = form.getFieldValue("startDate");
                      return disabledEndDate(current, startDate);
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Form.Item
            name="note"
            label="Ghi chú về thuốc"
            rules={[
              { required: true, message: "Vui lòng nhập thông tin về thuốc" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập tên thuốc, liều lượng, cách dùng và các hướng dẫn cần thiết khác"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="dosage" label="Liều lượng">
                <Input placeholder="Ví dụ: 1 viên/lần" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="frequency" label="Tần suất sử dụng">
                <Input placeholder="Ví dụ: 3 lần/ngày sau bữa ăn" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="prescription" label="Hình ảnh đơn thuốc (nếu có)">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleChangeUpload}
              beforeUpload={() => false} // Prevent auto upload
              maxCount={1}
            >
              {fileList.length >= 1 ? null : uploadButton}
            </Upload>
          </Form.Item>

          <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
            <Button
              style={{ marginRight: 8 }}
              onClick={() => setIsModalVisible(false)}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Gửi yêu cầu
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={handlePreviewCancel}
      >
        <img alt="example" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </div>
  );
}

export default MedicineRequestPage;
