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
  submitMedicationRequest,
  setSelectedChild,
  getAllMedicationRequest,
  getMedicationRequestDetail, // Đảm bảo thunk này đã được đổi tên và import đúng
} from "../../redux/parent/parentSlice"; // Đảm bảo đường dẫn đúng cho slice của bạn
import moment from "moment";

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

function MedicineRequestPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const accessToken = localStorage.getItem("accessToken");
  const {
    children,
    selectedChild,
    medicationRequests,
    loading: parentSliceLoading, // Đổi tên để rõ ràng hơn, đây là loading chung của parentSlice
    success,
    error,
  } = useSelector((state) => state.parent);

  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal gửi yêu cầu mới
  const [activeTab, setActiveTab] = useState("1");
  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [dateType, setDateType] = useState("single"); // "single" or "multiple"
  const [submitting, setSubmitting] = useState(false); // Loading khi submit form mới

  // State cục bộ để quản lý modal CHI TIẾT và dữ liệu chi tiết
  const [modalDetailSubmission, setModalDetailSubmission] = useState(false); // Modal hiển thị chi tiết
  const [selectedMedicationRequest, setSelectedMedicationRequest] =
    useState(null);
  const [modalLoading, setModalLoading] = useState(false); // Loading riêng cho modal chi tiết
  const [modalError, setModalError] = useState(null); // Error riêng cho modal chi tiết

  // Fetch all medication requests on mount
  useEffect(() => {
    console.log("Fetching all medication requests...");
    // Truyền accessToken vào thunk nếu cần cho việc xác thực
    dispatch(getAllMedicationRequest({ accessToken })).unwrap();
  }, [dispatch, accessToken]); // Thêm accessToken vào dependencies

  console.log(selectedMedicationRequest);

  // Handle success from API for new submission
  useEffect(() => {
    if (success && submitting) {
      message.success("Gửi yêu cầu thuốc thành công!");
      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
      setDateType("single"); // Reset dateType về mặc định
      setSubmitting(false);

      // Refresh all medication requests after successful submission
      dispatch(getAllMedicationRequest({ accessToken }));
    }
  }, [success, form, selectedChild, submitting, dispatch, accessToken]); // Thêm accessToken vào dependencies

  // Handle errors from API for new submission
  useEffect(() => {
    if (error && submitting) {
      if (error.errors && Array.isArray(error.errors)) {
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
    setFileList([]);
    setDateType("single");
    // Nếu có học sinh đã chọn hoặc danh sách học sinh, thiết lập giá trị mặc định
    if (selectedChild?.student_id) {
      form.setFieldsValue({
        student: selectedChild.student_id,
      });
    } else if (children.length > 0) {
      form.setFieldsValue({
        student: children[0].student_id,
      });
      // Cập nhật selectedChild trong Redux store nếu chưa có (tùy chọn)
      dispatch(setSelectedChild(children[0]));
    }
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

  const disabledDate = (current) => {
    const today = moment().startOf("day");
    const isWeekend = current.day() === 0 || current.day() === 6;
    return current && (current < today || isWeekend);
  };

  const disabledEndDate = (current, startDate) => {
    const isBeforeStartDate = startDate && current < startDate.startOf("day");
    const isWeekend = current.day() === 0 || current.day() === 6;
    return current && (isBeforeStartDate || isWeekend);
  };

  const handleDateTypeChange = (e) => {
    const newDateType = e.target.value;
    setDateType(newDateType);
    form.setFieldsValue({
      singleDate: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  };

  const handleSubmit = async (values) => {
    let startDate, endDate;

    if (dateType === "single") {
      startDate = values.singleDate;
      endDate = values.singleDate;
    } else {
      startDate = values.startDate;
      endDate = values.endDate;
    }

    const student_id = values.student;

    if (!student_id) {
      message.error("Vui lòng chọn học sinh.");
      return;
    }

    if (!user?.user_id) {
      message.error(
        "Không thể xác định thông tin phụ huynh. Vui lòng đăng nhập lại."
      );
      return;
    }

    let imageUrl = "";
    if (fileList.length > 0 && fileList[0].originFileObj) {
      try {
        // Here, you would typically upload the file to your server
        // and get a real URL back. For now, using a placeholder.
        imageUrl = "https://example.com/uploaded-prescription.jpg";
      } catch (uploadError) {
        console.error("Lỗi khi tải ảnh lên:", uploadError);
        message.warning(
          "Không thể tải ảnh lên, tiếp tục gửi yêu cầu không có ảnh."
        );
      }
    }

    const medicationRequestData = {
      parent_id: user.user_id,
      student_id: student_id,
      note: values.note,
      image_url: imageUrl,
      start_date: startDate.format("YYYY-MM-DD"),
      end_date: endDate.format("YYYY-MM-DD"),
      medication_name: values.note.split("\n")[0] || "Thuốc", // Lấy dòng đầu tiên của ghi chú làm tên thuốc
      dosage: values.dosage || "",
      frequency: values.frequency || "",
      status: "PENDING",
      nurse_id: 3, // Luôn gán nurse_id mặc định là 3
    };

    console.log("Sending medication request data:", medicationRequestData);
    setSubmitting(true);
    dispatch(submitMedicationRequest(medicationRequestData));
  };

  const getStatusTag = (status) => {
    switch (status?.toUpperCase()) {
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

  // Hàm xử lý hiển thị chi tiết yêu cầu thuốc
  const viewMedicationDetails = async (record) => {
    console.log("Viewing details for record:", record);
    const reqId = record.id_req; // Đảm bảo dùng đúng trường ID

    if (reqId) {
      setModalLoading(true); // Bắt đầu loading cho modal chi tiết
      setModalError(null); // Reset lỗi
      setSelectedMedicationRequest(null); // Xóa dữ liệu cũ

      try {
        const resultAction = await dispatch(
          getMedicationRequestDetail(reqId)
        ).unwrap();

        // unwrap() sẽ xử lý cả fulfilled và rejected
        const details = resultAction; // resultAction.payload chính là dữ liệu trả về từ thunk nếu thành công

        if (details) {
          setSelectedMedicationRequest(details);
          setModalDetailSubmission(true); // Mở modal chi tiết
        } else {
          message.warn("Không tìm thấy chi tiết yêu cầu thuốc.");
        }
      } catch (err) {
        console.error("Error fetching medication request details:", err);
        setModalError(err.message || "Lỗi không xác định khi tải chi tiết.");
        message.error(
          `Không thể tải chi tiết yêu cầu thuốc: ${
            err.message || "Lỗi không xác định"
          }`
        );
      } finally {
        setModalLoading(false); // Kết thúc loading
      }
    } else {
      message.warn("Không tìm thấy ID yêu cầu thuốc.");
    }
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
        rowKey={(record) => record.id_req || record.id} // Đảm bảo rowKey đúng
        loading={parentSliceLoading} // Sử dụng loading chung của slice
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
        rowKey={(record) => record.id_req || record.id} // Đảm bảo rowKey đúng
        loading={parentSliceLoading} // Sử dụng loading chung của slice
        pagination={{ pageSize: 5 }}
        locale={{
          emptyText: <Empty description="Không có lịch sử gửi thuốc" />,
        }}
      />
    );
  };

  // Sử dụng parentSliceLoading để hiển thị Spin cho toàn bộ trang
  if (parentSliceLoading && !medicationRequests.length) {
    // Chỉ hiển thị nếu đang tải và chưa có dữ liệu nào
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

      {/* Modal gửi yêu cầu thuốc mới */}
      <Modal
        title="Gửi yêu cầu thuốc cho con"
        open={isModalVisible}
        onCancel={handleCancel}
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
              loading={parentSliceLoading} // Sử dụng loading chung của slice cho select
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
                        if (
                          value.isSame(startDate, "day") || // So sánh ngày, bỏ qua giờ
                          value.isAfter(startDate, "day")
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
              onClick={handleCancel} // Sử dụng handleCancel đã định nghĩa
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

      {/* Modal hiển thị chi tiết yêu cầu thuốc */}
      <Modal
        title="Chi tiết Yêu cầu Thuốc"
        open={modalDetailSubmission} // Đã sửa thành modalDetailSubmission
        onCancel={() => setModalDetailSubmission(false)}
        footer={[
          <Button key="back" onClick={() => setModalDetailSubmission(false)}>
            Đóng
          </Button>,
        ]}
      >
        {modalLoading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin size="large" />
            <p>Đang tải chi tiết...</p>
          </div>
        ) : modalError ? (
          <div style={{ color: "red" }}>
            <p>Có lỗi xảy ra khi tải chi tiết:</p>
            <Text type="danger">{modalError}</Text>
          </div>
        ) : selectedMedicationRequest ? (
          <div>
            <Title level={4}>
              Yêu cầu thuốc #{selectedMedicationRequest.id_req}
            </Title>
            <p>
              <Text strong>Tên phụ huynh:</Text>{" "}
              {selectedMedicationRequest.fullname}
            </p>
            <p>
              <Text strong>Tên học sinh:</Text>{" "}
              {selectedMedicationRequest.student}
            </p>
            <p>
              <Text strong>ID Học sinh:</Text>{" "}
              {selectedMedicationRequest.student_id}
            </p>
            <p>
              <Text strong>Trạng thái:</Text>{" "}
              {getStatusTag(selectedMedicationRequest.status)}
            </p>
            <p>
              <Text strong>Ngày bắt đầu:</Text>{" "}
              {selectedMedicationRequest.start_date
                ? moment(selectedMedicationRequest.start_date).format(
                    "DD/MM/YYYY"
                  )
                : "N/A"}
            </p>
            <p>
              <Text strong>Ngày kết thúc:</Text>{" "}
              {selectedMedicationRequest.end_date
                ? moment(selectedMedicationRequest.end_date).format(
                    "DD/MM/YYYY"
                  )
                : "N/A"}
            </p>
            <p>
              <Text strong>Ghi chú:</Text>{" "}
              {selectedMedicationRequest.note || "Không có ghi chú"}
            </p>
            <p>
              <Text strong>ID Y tá:</Text>{" "}
              {selectedMedicationRequest.nurse_id || "Chưa gán"}
            </p>
            <p>
              <Text strong>Ngày tạo:</Text>{" "}
              {selectedMedicationRequest.created_at
                ? moment(selectedMedicationRequest.created_at).format(
                    "DD/MM/YYYY HH:mm"
                  )
                : "N/A"}
            </p>
            {selectedMedicationRequest.image_url && (
              <div>
                <Text strong>Hình ảnh đơn thuốc:</Text>
                <br />
                <a
                  href={selectedMedicationRequest.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={selectedMedicationRequest.image_url}
                    alt="Đơn thuốc"
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      marginTop: "10px",
                    }}
                  />
                </a>
              </div>
            )}
          </div>
        ) : (
          <p>Không có dữ liệu chi tiết yêu cầu thuốc.</p>
        )}
      </Modal>

      {/* Modal xem trước ảnh */}
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
