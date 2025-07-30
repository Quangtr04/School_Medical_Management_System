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
  Tabs,
  Radio,
  Alert,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleFilled,
  BankOutlined,
  FileTextOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import {
  submitMedicationRequest,
  setSelectedChild,
  getAllMedicationRequest,
  getMedicationRequestDetail,
  getParentChildren,
  getMedicationDailyLog,
  cancelMedicationRequest, // Đảm bảo thunk này đã được đổi tên và import đúng
} from "../../redux/parent/parentSlice"; // Đảm bảo đường dẫn đúng cho slice của bạn
import moment from "moment";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MedicineBoxOutlined,
  IdcardOutlined,
  CalendarOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  getImageUrl,
  extractImageUrl,
  extractAllImageUrls,
} from "../../utils/imageUtils";

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
  const [isGiveMedicineModalVisible, setIsGiveMedicineModalVisible] =
    useState(false);
  const [currentMedicationForGiving, setCurrentMedicationForGiving] =
    useState(null);

  // State cục bộ để quản lý modal CHI TIẾT và dữ liệu chi tiết
  const [modalDetailSubmission, setModalDetailSubmission] = useState(false); // Modal hiển thị chi tiết
  const [selectedMedicationRequest, setSelectedMedicationRequest] =
    useState(null);
  const [modalLoading, setModalLoading] = useState(false); // Loading riêng cho modal chi tiết
  const [modalError, setModalError] = useState(null); // Error riêng cho modal chi tiết
  const [historyFilterStatus, setHistoryFilterStatus] = useState("ALL");

  // Fetch all medication requests on mount
  useEffect(() => {
    // Truyền accessToken vào thunk nếu cần cho việc xác thực
    dispatch(getAllMedicationRequest({ accessToken })).unwrap();
  }, [dispatch, accessToken]); // Thêm accessToken vào dependencies

  useEffect(() => {
    if (user?.user_id) {
      dispatch(getParentChildren());
    }
  }, [dispatch, user]);

  useEffect(() => {
    // Removed console.log
  }, [children]);

  // Handle success from API for new submission
  useEffect(() => {
    if (success && submitting) {
      toast.success("Gửi yêu cầu thuốc thành công!");
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
        toast.error(`Lỗi: ${error.errors.join(", ")}`);
      } else {
        toast.error(
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

    // Reset form value cho prescription
    form.setFieldValue("prescription", []);
    // form.setFieldValue("prescription", []);

    if (!children || children.length === 0) {
      toast.warning("Chưa có dữ liệu học sinh để gửi yêu cầu.");
      return;
    }
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

  const handleChangeUpload = ({ fileList: newFileList }) => {
    // Validate each file
    const validatedFileList = newFileList.map((file) => {
      // Check file size (max 5MB)
      if (file.size && file.size > 5 * 1024 * 1024) {
        file.status = "error";
        file.response = "File quá lớn (tối đa 5MB)";
        return file;
      }

      // Check file type
      const isValidType = file.type?.startsWith("image/");
      if (!isValidType && file.originFileObj) {
        file.status = "error";
        file.response = "Chỉ cho phép file ảnh (JPG, PNG, GIF)";
        return file;
      }

      return file;
    });

    setFileList(validatedFileList);

    // Cập nhật form value để trigger validation
    form.setFieldValue("prescription", validatedFileList);
  };

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
      toast.error("Vui lòng chọn học sinh.");
      return;
    }

    if (!user?.user_id) {
      toast.error(
        "Không thể xác định thông tin phụ huynh. Vui lòng đăng nhập lại."
      );
      return;
    }

    // ✅ THÊM Ở ĐÂY
    const files = values.prescription
      ?.map((file) => file.originFileObj)
      .filter((file) => !!file);

    if (!files || files.length === 0) {
      toast.error("Vui lòng chọn ít nhất một ảnh đơn thuốc.");
      return;
    }

    const formData = new FormData();
    formData.append("student_id", student_id);
    formData.append("note", values.note || "");
    formData.append("start_date", startDate.format("YYYY-MM-DD"));
    formData.append("end_date", endDate.format("YYYY-MM-DD"));
    formData.append("status", "PENDING");
    formData.append("nurse_id", 3); // tạm hard-code, hoặc có thể để backend gán

    files.forEach((file) => {
      formData.append("image", file); // backend: upload.array("image")
    });

    setSubmitting(true);

    try {
      await dispatch(submitMedicationRequest(formData));
      toast.success("Gửi yêu cầu thành công!");
    } catch (error) {
      toast.error("Gửi yêu cầu thất bại.");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusTag = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return (
          <Tag icon={<ClockCircleFilled />} color="warning">
            Đang chờ duyệt
          </Tag>
        );
      case "ACCEPTED":
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Đã duyệt
          </Tag>
        );
      case "DECLINED":
        return (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Từ chối
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

  // Validate file before upload
  const beforeUpload = (file) => {
    const isValidType = file.type.startsWith("image/");
    if (!isValidType) {
      Modal.error({
        title: "File không hợp lệ",
        content: "Chỉ cho phép tải lên file ảnh (JPG, PNG, GIF)",
      });
      return false;
    }

    const isValidSize = file.size / 1024 / 1024 < 5; // 5MB
    if (!isValidSize) {
      Modal.error({
        title: "File quá lớn",
        content: "Kích thước file không được vượt quá 5MB",
      });
      return false;
    }

    return false; // Ngăn upload tự động, chỉ lưu file local
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Thêm ảnh</div>
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
      render: (text) => moment(text).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Thời gian sử dụng",
      key: "period",
      render: (_, record) => (
        <span>
          {moment(record.start_date).format("YYYY-MM-DD")} -{" "}
          {moment(record.end_date).format("YYYY-MM-DD")}
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
      width: 180,
      render: (_, record) => (
        <Space wrap align="center">
          <Button
            type="primary"
            size="small"
            icon={<InfoCircleOutlined />}
            onClick={() => viewMedicationDetails(record)}
          >
            Chi tiết
          </Button>

          {(record.status || "").toUpperCase() === "ACCEPTED" && (
            <Button
              type="default"
              size="small"
              icon={<MedicineBoxOutlined />}
              onClick={() => openGiveMedicineModal(record)}
            >
              Uống thuốc
            </Button>
          )}

          {(record.status || "").toUpperCase() === "PENDING" && (
            <Popconfirm
              title={`Xác nhận hủy yêu cầu thuốc #${record.id_req}?`}
              description="Bạn chắc chắn muốn hủy? Hành động này không thể hoàn tác."
              okText="Có"
              cancelText="Không"
              onConfirm={() => cancelRequestMedical(record)}
            >
              <Button
                type="default"
                size="small"
                icon={<MedicineBoxOutlined />}
              >
                Hủy yêu cầu
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // Hàm xử lý hiển thị chi tiết yêu cầu thuốc
  const viewMedicationDetails = async (record) => {
    const reqId = record.id_req; // Đảm bảo dùng đúng trường ID

    if (reqId) {
      setModalLoading(true); // Bắt đầu loading cho modal chi tiết
      setModalError(null); // Reset lỗi
      setSelectedMedicationRequest(null); // Xóa dữ liệu cũ

      try {
        const resultAction = await dispatch(
          getMedicationRequestDetail({
            id_req: reqId,
            accessToken: localStorage.getItem("accessToken"),
          })
        ).unwrap();

        // unwrap() sẽ xử lý cả fulfilled và rejected
        const details = resultAction; // resultAction.payload chính là dữ liệu trả về từ thunk nếu thành công

        if (details) {
          setSelectedMedicationRequest(details);
          setModalDetailSubmission(true); // Mở modal chi tiết
        } else {
          toast.warn("Không tìm thấy chi tiết yêu cầu thuốc.");
        }
      } catch (err) {
        console.error("Error fetching medication request details:", err);
        setModalError(err.message || "Lỗi không xác định khi tải chi tiết.");
        toast.error(
          "Không thể tải chi tiết yêu cầu: " +
            (err.message || "Vui lòng thử lại sau.")
        );
      } finally {
        setModalLoading(false); // Kết thúc loading cho modal
      }
    }
  };

  const openGiveMedicineModal = async (medicationRequest) => {
    const reqId = medicationRequest.id_req;
    console.log("studentId", medicationRequest.student_id);

    if (reqId) {
      setModalLoading(true);
      setModalError(null);
      setCurrentMedicationForGiving(null);

      try {
        const resultAction = await dispatch(
          getMedicationDailyLog({
            id_req: reqId,
            accessToken: localStorage.getItem("accessToken"),
            student_id: medicationRequest.student_id,
          })
        ).unwrap();

        const details = resultAction;

        if (details) {
          setCurrentMedicationForGiving(details);
          setIsGiveMedicineModalVisible(true);
        } else {
          toast.warn("Không tìm thấy chi tiết yêu cầu thuốc.");
        }
      } catch (err) {
        console.error("Error fetching medication details:", err);
        toast.error(
          "Không thể tải chi tiết yêu cầu: " +
            (err.message || "Vui lòng thử lại sau.")
        );
      } finally {
        setModalLoading(false);
      }
    }
  };

  const cancelRequestMedical = async (medicationRequest) => {
    const { id_req } = medicationRequest;

    try {
      await dispatch(
        cancelMedicationRequest({
          id_req,
          accessToken,
        })
      ).unwrap();

      toast.success("Đã hủy yêu cầu thuốc thành công.");
      dispatch(getAllMedicationRequest({ accessToken }));
    } catch (err) {
      toast.error("Không thể hủy yêu cầu: " + err);
    }
  };

  const closeGiveMedicineModal = () => {
    setCurrentMedicationForGiving(null); // Xóa thông tin đang xem
    setIsGiveMedicineModalVisible(false); // Đóng modal
  };

  const renderActiveMedications = () => {
    const activeRequests =
      medicationRequests?.filter(
        (req) => (req.status || "").toUpperCase() === "PENDING"
      ) || [];

    return (
      <Table
        columns={columns}
        dataSource={activeRequests}
        rowKey={(record) => record.id_req || record.id}
        loading={parentSliceLoading}
        pagination={{ pageSize: 5 }}
        locale={{
          emptyText: <Empty description="Không có yêu cầu thuốc đang xử lý" />,
        }}
      />
    );
  };

  const renderHistoryMedications = () => {
    const historyRequests =
      medicationRequests?.filter((req) => {
        const status = (req.status || "").toUpperCase();
        if (historyFilterStatus === "ALL") {
          return status === "ACCEPTED" || status === "DECLINED";
        }
        return status === historyFilterStatus;
      }) || [];

    return (
      <>
        <div style={{ marginBottom: 16, textAlign: "right" }}>
          <Select
            value={historyFilterStatus}
            onChange={(value) => setHistoryFilterStatus(value)}
            style={{ width: 200, textAlign: "center" }}
          >
            <Select.Option value="ALL">Tất cả trạng thái</Select.Option>
            <Select.Option value="ACCEPTED">Đã duyệt</Select.Option>
            <Select.Option value="DECLINED">Từ chối</Select.Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={historyRequests}
          rowKey={(record) => record.id_req || record.id}
          loading={parentSliceLoading}
          pagination={{ pageSize: 5 }}
          locale={{
            emptyText: <Empty description="Không có lịch sử gửi thuốc" />,
          }}
        />
      </>
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
                    {child.student_name}
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
                format="YYYY-MM-DD"
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
                    format="YYYY-MM-DD"
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
                    format="YYYY-MM-DD"
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

          <Form.Item
            name="prescription"
            label="Hình ảnh đơn thuốc"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            rules={[
              {
                required: true,
                message: "Vui lòng tải lên ít nhất một hình ảnh đơn thuốc",
              },
              {
                validator: (_, value) => {
                  if (value && value.length > 0) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Vui lòng tải lên ít nhất một hình ảnh đơn thuốc")
                  );
                },
              },
            ]}
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleChangeUpload}
              beforeUpload={beforeUpload} // Sử dụng function validation mới
              maxCount={5} // Cho phép tối đa 5 ảnh
              multiple={true} // Cho phép chọn nhiều file cùng lúc
              accept="image/*" // Chỉ chấp nhận file ảnh
            >
              {fileList.length >= 5 ? null : uploadButton}
            </Upload>
            <div style={{ marginTop: 8, color: "#666", fontSize: "12px" }}>
              * Có thể tải lên tối đa 5 hình ảnh đơn thuốc (JPG, PNG, GIF - tối
              đa 5MB mỗi file)
            </div>
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
                    "YYYY-MM-DD"
                  )
                : "N/A"}
            </p>
            <p>
              <Text strong>Ngày kết thúc:</Text>{" "}
              {selectedMedicationRequest.end_date
                ? moment(selectedMedicationRequest.end_date).format(
                    "YYYY-MM-DD"
                  )
                : "N/A"}
            </p>
            <p>
              <Text strong>Ghi chú:</Text>{" "}
              {selectedMedicationRequest.note || "Không có ghi chú"}
            </p>
            <p>
              <Text strong>ID Y tá:</Text>{" "}
              {selectedMedicationRequest.nurse_id || "Chưa có y tá tiếp nhận"}
            </p>
            <p>
              <Text strong>Ngày tạo:</Text>{" "}
              {selectedMedicationRequest.created_at
                ? moment(selectedMedicationRequest.created_at).format(
                    "YYYY-MM-DD HH:mm"
                  )
                : "N/A"}
            </p>
            {selectedMedicationRequest.image_url && (
              <div>
                <Text strong>Hình ảnh đơn thuốc:</Text>
                <br />

                {/* Hiển thị nhiều hình ảnh nếu có */}
                {(() => {
                  const imageUrls = extractAllImageUrls(
                    selectedMedicationRequest.image_url
                  );
                  return (
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
                    >
                      {imageUrls.map((url, index) => (
                        <div key={index} style={{ marginBottom: "10px" }}>
                          <img
                            src={url}
                            alt={`Đơn thuốc ${index + 1}`}
                            style={{
                              width: "200px",
                              height: "auto",
                              borderRadius: 8,
                              border: "1px solid #ccc",
                            }}
                            onError={(e) => {
                              console.error(
                                "Image failed to load:",
                                e.target.src
                              );
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/200x150?text=Image+Error";
                              e.target.style.border = "1px solid red";
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  );
                })()}
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

      {/* Modal xem việc uống thuốc trên trường */}
      <Modal
        title="💊 Báo cáo uống thuốc của học sinh trên trường"
        open={isGiveMedicineModalVisible}
        onCancel={closeGiveMedicineModal}
        footer={[
          <Button key="close" onClick={closeGiveMedicineModal}>
            Đóng
          </Button>,
        ]}
      >
        {Array.isArray(currentMedicationForGiving) ? (
          currentMedicationForGiving.map((log) => (
            <div
              key={log.log_id}
              style={{
                padding: "1rem",
                border: "1px solid #eee",
                borderRadius: "10px",
                marginBottom: "1.5rem",
                backgroundColor: "#fafafa",
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
              }}
            >
              <p>
                <b>
                  <IdcardOutlined style={{ marginRight: 4 }} />
                  Mã log:
                </b>{" "}
                {log.log_id}
              </p>
              <p>
                <b>
                  <UserOutlined style={{ marginRight: 4 }} />
                  Họ tên học sinh:
                </b>{" "}
                {log.full_name}
              </p>
              <p>
                <b>
                  <BankOutlined style={{ marginRight: 4 }} />
                  Lớp:
                </b>{" "}
                {log.class_name}
              </p>
              <p>
                <b>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  Ngày uống thuốc:
                </b>{" "}
                {new Date(log.date).toLocaleDateString("vi-VN")}
              </p>
              <p>
                <b>
                  <FileTextOutlined style={{ marginRight: 4 }} />
                  Ghi chú:
                </b>{" "}
                {log.note}
              </p>
              <p>
                <b>
                  <InfoCircleOutlined style={{ marginRight: 4 }} />
                  Trạng thái:
                </b>{" "}
                <Tag
                  icon={
                    log.status === "GIVEN" ? (
                      <CheckCircleOutlined />
                    ) : (
                      <CloseCircleOutlined />
                    )
                  }
                  color={log.status === "GIVEN" ? "green" : "orange"}
                  style={{ marginLeft: 5 }}
                >
                  {log.status === "GIVEN" ? "Đã uống" : "Chưa uống"}
                </Tag>
              </p>

              <p>
                <b>🧑‍⚕️ Y tá phụ trách:</b>{" "}
                <span style={{ marginLeft: 4 }}>ID {log.nurse_id}</span>
              </p>
              <p>
                <b>
                  <UsergroupAddOutlined style={{ marginRight: 4 }} />
                  Phụ huynh:
                </b>{" "}
                <span style={{ marginLeft: 4 }}>
                  <UserOutlined /> {log.parent_name}, <MailOutlined />{" "}
                  {log.parent_email}, <PhoneOutlined /> {log.parent_phone}
                </span>
              </p>

              {log.image_url && (
                <div style={{ marginTop: "1rem" }}>
                  <b>
                    <FileImageOutlined style={{ marginRight: 4 }} />
                    Hình ảnh đơn thuốc:
                  </b>
                  <br />
                  <div style={{ marginBottom: 10 }}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      URL gốc: {log.image_url}
                    </Text>
                  </div>
                  {/* Hiển thị nhiều hình ảnh nếu có */}
                  {(() => {
                    const imageUrls = extractAllImageUrls(log.image_url);
                    return (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "10px",
                        }}
                      >
                        {imageUrls.map((url, index) => (
                          <div key={index}>
                            <img
                              src={url}
                              alt={`Ảnh đơn thuốc ${index + 1}`}
                              style={{
                                width: "150px",
                                height: "auto",
                                borderRadius: "10px",
                                border: "1px solid #ccc",
                                boxShadow: "0 0 5px rgba(0,0,0,0.1)",
                              }}
                              onError={(e) => {
                                console.error(
                                  "Image failed to load:",
                                  e.target.src
                                );
                                e.target.onerror = null;
                                e.target.src =
                                  "https://via.placeholder.com/150x100?text=Image+Error";
                                e.target.style.border = "1px solid red";
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          ))
        ) : (
          <p>Không có dữ liệu báo cáo.</p>
        )}
      </Modal>
    </div>
  );
}

export default MedicineRequestPage;
