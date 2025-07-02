import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Button,
  Form,
  Input,
  Spin,
  message,
  Tabs,
  Descriptions,
  Upload,
  Modal,
  Divider,
  DatePicker,
  Select,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  UploadOutlined,
  IdcardOutlined,
  CloseOutlined,
  CalendarOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  getParentProfile,
  updateParentProfile,
  getParentChildren,
  updateProfileDirect,
} from "../../redux/parent/parentSlice";
import api from "../../configs/config-axios";
import { format } from "date-fns";
import moment from "moment";
import axios from "axios";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

export default function ParentProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { profile, children, loading, error, success } = useSelector(
    (state) => state.parent
  );

  const [form] = Form.useForm();
  console.log("Form instance created:", form);

  const [editing, setEditing] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [forceUpdate, setForceUpdate] = useState(0);

  // State để quản lý giá trị của các trường input
  const [formValues, setFormValues] = useState({
    fullname: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    dayOfBirth: null,
  });

  // Fetch profile data
  useEffect(() => {
    console.log("Fetching profile data using token");
    dispatch(getParentProfile());
    dispatch(getParentChildren());
  }, [dispatch, forceUpdate]);

  // Log profile data when it changes
  useEffect(() => {
    if (profile) {
      console.log("Profile data in component:", profile);
      console.log("Redux store profile state:", JSON.stringify(profile));
      resetForm();

      // Cập nhật state formValues với dữ liệu từ profile
      setFormValues({
        fullname: profile.fullname || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        gender: profile.gender || "",
        dayOfBirth: profile.dayOfBirth ? moment(profile.dayOfBirth) : null,
      });
    }
  }, [profile]);

  // Set form values when profile data is loaded and when editing mode changes
  useEffect(() => {
    if (profile && editing) {
      console.log("Setting form values with profile data:", profile);
      // Đặt giá trị form khi chuyển sang chế độ chỉnh sửa
      form.setFieldsValue({
        fullname: profile.fullname || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        gender: profile.gender || "",
        dayOfBirth: profile.dayOfBirth ? moment(profile.dayOfBirth) : null,
      });

      // Kiểm tra form đã được khởi tạo đúng chưa
      console.log("Form values after set:", form.getFieldsValue());
    }
  }, [profile, form, editing]);

  // Khởi tạo form khi component mount
  useEffect(() => {
    // Đảm bảo form được khởi tạo ngay cả khi không ở chế độ chỉnh sửa
    if (profile) {
      console.log("Initializing form with profile data:", profile);

      // Tạo form mới để tránh vấn đề với form cũ
      form.resetFields();

      // Đặt lại giá trị form
      setTimeout(() => {
        form.setFieldsValue({
          fullname: profile.fullname || "",
          email: profile.email || "",
          phone: profile.phone || "",
          address: profile.address || "",
          gender: profile.gender || "",
          dayOfBirth: profile.dayOfBirth ? moment(profile.dayOfBirth) : null,
        });
        console.log("Form initialized with values:", form.getFieldsValue());
      }, 100);
    }
  }, [form, profile]);

  // Handle form submission
  const handleSubmit = (values) => {
    console.log("Form values:", values);

    // Tạo object dữ liệu để gửi đi
    const profileData = {
      fullname: values.fullname,
      email: values.email,
      phone: values.phone,
      address: values.address,
      gender: values.gender,
      dayOfBirth: values.dayOfBirth
        ? values.dayOfBirth.format("YYYY-MM-DD")
        : null,
    };

    // Gửi request cập nhật thông tin
    updateProfileDirectly(profileData);
  };

  // Handle avatar change
  const handleAvatarChange = ({ fileList }) => {
    if (fileList.length > 0) {
      setAvatar(fileList[fileList.length - 1]);
    } else {
      setAvatar(null);
    }
  };

  // Preview avatar
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

  // Convert file to base64
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Reset form khi cần thiết
  const resetForm = () => {
    if (profile) {
      // Đặt lại form với dữ liệu từ profile
      form.setFieldsValue({
        fullname: profile.fullname || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        gender: profile.gender || "",
        dayOfBirth: profile.dayOfBirth ? moment(profile.dayOfBirth) : null,
      });

      console.log("Form values after reset:", form.getFieldsValue());
    }
  };

  // Cập nhật trực tiếp bằng axios
  const updateProfileDirectly = async (profileData) => {
    try {
      message.loading({ content: "Đang cập nhật...", key: "updateProfile" });

      console.log("Sending direct update with:", profileData);
      console.log("To endpoint: /parent/profile");

      const response = await api.patch("/parent/profile", profileData);

      console.log("Update response:", response.data);
      message.success({
        content: "Cập nhật thông tin thành công!",
        key: "updateProfile",
      });

      // Đợi lâu hơn (3 giây) trước khi lấy dữ liệu mới từ server
      message.info("Đang đồng bộ dữ liệu...");
      setTimeout(async () => {
        // Lấy dữ liệu mới trực tiếp từ server
        const updatedProfile = await fetchDirectFromServer();

        if (updatedProfile) {
          // Cập nhật giao diện với dữ liệu mới
          dispatch(
            updateProfileDirect({
              ...profile,
              ...updatedProfile,
            })
          );
        }

        setEditing(false);
      }, 3000);
    } catch (error) {
      console.error("Direct update error:", error);

      let errorMessage = "Cập nhật thất bại!";
      if (error.response) {
        console.error("Error response:", error.response.data);
        errorMessage =
          error.response.data?.message ||
          `Lỗi máy chủ: ${error.response.status}`;
      }

      message.error({ content: errorMessage, key: "updateProfile" });
    }
  };

  // Kiểm tra token
  const checkToken = () => {
    const token = localStorage.getItem("accessToken");
    console.log("Current token:", token);
    message.info(token ? "Token đã được lưu" : "Không tìm thấy token");
  };

  // Test API trực tiếp
  const testDirectAPI = async () => {
    try {
      message.loading({ content: "Đang kiểm tra API...", key: "testAPI" });

      // Kiểm tra token
      const token = localStorage.getItem("accessToken");
      console.log("Using token:", token);

      // Test GET API
      console.log("Testing GET API: /parent/profile");
      const getResponse = await api.get("/parent/profile");
      console.log("GET response:", getResponse.data);

      // Test PATCH API với dữ liệu đơn giản
      const testData = {
        fullname: profile?.fullname || "Test Name",
        test_field: "Test value " + new Date().toISOString(),
      };

      console.log("Testing PATCH API with:", testData);
      console.log("To endpoint: /parent/profile");
      console.log("With headers:", {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      });

      const patchResponse = await api.patch("/parent/profile", token);
      console.log("patchResponse", patchResponse);
      console.log("PATCH response:", patchResponse.data);

      message.success({
        content: "API hoạt động bình thường!",
        key: "testAPI",
      });

      // Cập nhật lại dữ liệu
      refreshData();
    } catch (error) {
      console.error("API test error:", error);

      let errorMessage = "Lỗi khi test API!";
      if (error.response) {
        console.error("Error response:", error.response.data);
        errorMessage =
          error.response.data?.message ||
          `Lỗi máy chủ: ${error.response.status}`;
      }

      message.error({ content: errorMessage, key: "testAPI" });
    }
  };

  // Xử lý khi bắt đầu chỉnh sửa
  const startEditing = () => {
    console.log("Starting edit mode");

    // Khởi tạo form với giá trị từ profile
    if (profile) {
      const updatedFormValues = {
        fullname: profile.fullname || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        gender: profile.gender || "",
        dayOfBirth: profile.dayOfBirth ? moment(profile.dayOfBirth) : null,
      };

      console.log("Setting form values:", updatedFormValues);

      // Cập nhật state formValues
      setFormValues(updatedFormValues);

      // Cập nhật form
      form.setFieldsValue(updatedFormValues);

      console.log("Form values after set:", form.getFieldsValue());

      // Chuyển sang chế độ chỉnh sửa
      setEditing(true);
    }
  };

  // Xử lý khi nhấn nút lưu
  const handleSave = async () => {
    try {
      console.log("save values:", formValues);
      const token = localStorage.getItem("accessToken");

      // Format lại ngày tháng nếu có
      const formattedValues = {
        fullname: formValues.fullname,
        email: formValues.email,
        phone: formValues.phone,
        address: formValues.address,
        gender: formValues.gender,
        dayOfBirth: formValues.dayOfBirth
          ? formValues.dayOfBirth.format("YYYY-MM-DD")
          : undefined,
      };
      console.log("formattedValues", formattedValues);

      // Log để debug
      dispatch(updateParentProfile(formattedValues, token));

      // Cập nhật UI ngay lập tức với giá trị mới (optimistic update)
      const optimisticProfile = {
        ...profile,
        ...formattedValues,
      };

      // Hiển thị dữ liệu mới ngay lập tức
      dispatch(updateProfileDirect(optimisticProfile));

      // Gọi API cập nhật trực tiếp
      message.loading({ content: "Đang cập nhật...", key: "updateProfile" });

      const response = await api.patch("/parent/profile", formattedValues);
      console.log("Update response:", response.data);

      if (
        response.data &&
        response.data.message === "User updated successfully"
      ) {
        message.success({
          content: "Cập nhật thành công!",
          key: "updateProfile",
        });

        // Đợi 2 giây rồi lấy dữ liệu mới từ server
        setTimeout(async () => {
          const serverData = await fetchDirectFromServer();
          setEditing(false);
        }, 2000);
      } else {
        message.warning({
          content: "Cập nhật thành công nhưng không nhận được phản hồi đầy đủ",
          key: "updateProfile",
        });
        setEditing(false);
      }
    } catch (error) {
      console.error("Save error:", error);
      message.error({
        content: "Lỗi khi cập nhật thông tin",
        key: "updateProfile",
      });
    }
  };

  // Làm mới dữ liệu từ server
  const refreshData = (force = false) => {
    message.loading({ content: "Đang tải dữ liệu mới...", key: "refreshData" });

    // Thêm timestamp để tránh cache
    const timestamp = new Date().getTime();

    // Thêm tham số force=true để server biết cần làm mới dữ liệu
    api
      .get(`/parent/profile?_t=${timestamp}&force=${force ? "true" : "false"}`)
      .then((response) => {
        console.log("Fresh data from server:", response.data);

        // Kiểm tra và cập nhật dữ liệu
        if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data) &&
          response.data.data.length > 0
        ) {
          const profileData = response.data.data[0];
          console.log("Updating profile with:", profileData);

          // Cập nhật Redux store với dữ liệu mới
          dispatch(updateProfileDirect(profileData));
          message.success({
            content: "Dữ liệu đã được cập nhật!",
            key: "refreshData",
          });
        } else {
          message.warning({
            content: "Không tìm thấy dữ liệu mới",
            key: "refreshData",
          });
        }
      })
      .catch((error) => {
        console.error("Error refreshing data:", error);
        message.error({
          content: "Lỗi khi tải dữ liệu mới",
          key: "refreshData",
        });
      });

    if (force) {
      setForceUpdate((prev) => prev + 1);
    }
  };

  // Lấy dữ liệu trực tiếp từ server, bypass cache
  const fetchDirectFromServer = async () => {
    try {
      message.loading({
        content: "Đang tải dữ liệu từ server...",
        key: "directFetch",
      });

      // Tạo request mới với headers đặc biệt để bypass cache
      const headers = {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      };

      const timestamp = new Date().getTime();
      const response = await axios.get(
        `${api.defaults.baseURL}/parent/profile?_t=${timestamp}`,
        {
          headers: {
            ...headers,
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      console.log("Direct fetch response:", response.data);

      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data) &&
        response.data.data.length > 0
      ) {
        const profileData = response.data.data[0];
        console.log("Direct fetch profile data:", profileData);

        // Cập nhật Redux store với dữ liệu mới
        dispatch(updateProfileDirect(profileData));
        message.success({
          content: "Dữ liệu đã được cập nhật từ server!",
          key: "directFetch",
        });

        return profileData;
      } else {
        message.warning({
          content: "Không tìm thấy dữ liệu từ server",
          key: "directFetch",
        });
        return null;
      }
    } catch (error) {
      console.error("Direct fetch error:", error);
      message.error({
        content: "Lỗi khi tải dữ liệu từ server",
        key: "directFetch",
      });
      return null;
    }
  };

  if (loading && !profile) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <Text style={{ display: "block", marginTop: 16 }}>
          Đang tải thông tin...
        </Text>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Hồ sơ phụ huynh</Title>

      <Tabs defaultActiveKey="profile">
        <TabPane tab="Thông tin cá nhân" key="profile">
          <Card>
            {!editing ? (
              // View mode
              <>
                <div style={{ textAlign: "right", marginBottom: 16 }}>
                  <Button onClick={checkToken} style={{ marginRight: 8 }}>
                    Kiểm tra token
                  </Button>
                  <Button onClick={testDirectAPI} style={{ marginRight: 8 }}>
                    Test API
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={refreshData}
                    style={{ marginRight: 8 }}
                  >
                    Làm mới
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchDirectFromServer}
                    style={{ marginRight: 8 }}
                  >
                    Tải trực tiếp
                  </Button>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={startEditing}
                  >
                    Chỉnh sửa
                  </Button>
                </div>

                <Row gutter={24}>
                  <Col xs={24} sm={6} md={4} style={{ textAlign: "center" }}>
                    <Avatar
                      size={120}
                      src={profile?.avatar}
                      icon={!profile?.avatar && <UserOutlined />}
                    />
                  </Col>
                  <Col xs={24} sm={18} md={20}>
                    <Descriptions column={{ xs: 1, sm: 2 }} bordered>
                      <Descriptions.Item label="Họ và tên">
                        {profile?.fullname || "Chưa cập nhật"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Email">
                        <MailOutlined /> {profile?.email || "Chưa cập nhật"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Số điện thoại">
                        <PhoneOutlined /> {profile?.phone || "Chưa cập nhật"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Địa chỉ">
                        <HomeOutlined /> {profile?.address || "Chưa cập nhật"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày sinh">
                        <CalendarOutlined />{" "}
                        {profile?.dayOfBirth
                          ? format(new Date(profile.dayOfBirth), "dd/MM/yyyy")
                          : "Chưa cập nhật"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Giới tính">
                        <IdcardOutlined /> {profile?.gender || "Chưa cập nhật"}
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                </Row>
              </>
            ) : (
              // Edit mode
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  fullname: profile?.fullname || "",
                  email: profile?.email || "",
                  phone: profile?.phone || "",
                  address: profile?.address || "",
                  gender: profile?.gender || "",
                  dayOfBirth: profile?.dayOfBirth
                    ? moment(profile.dayOfBirth)
                    : null,
                }}
                onFinish={handleSave}
                onValuesChange={(changedValues, allValues) => {
                  console.log("Form values changed:", changedValues);
                  console.log("All form values:", allValues);
                }}
                autoComplete="off"
              >
                <div style={{ textAlign: "right", marginBottom: 16 }}>
                  <Button
                    onClick={() =>
                      console.log("Current form values:", form.getFieldsValue())
                    }
                    style={{ marginRight: 8 }}
                  >
                    Kiểm tra form
                  </Button>
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => {
                      setEditing(false);
                      form.resetFields();
                    }}
                    style={{ marginRight: 8 }}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={loading}
                  >
                    Lưu thay đổi
                  </Button>
                </div>

                <Row gutter={24}>
                  <Col xs={24} sm={6} md={4} style={{ textAlign: "center" }}>
                    <Upload
                      listType="picture-card"
                      showUploadList={false}
                      beforeUpload={() => false}
                      onChange={handleAvatarChange}
                      onPreview={handlePreview}
                    >
                      {avatar ? (
                        <img
                          src={avatar.url || avatar.preview || profile?.avatar}
                          alt="avatar"
                          style={{ width: "100%" }}
                        />
                      ) : (
                        <div>
                          <UploadOutlined />
                          <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                        </div>
                      )}
                    </Upload>
                  </Col>
                  <Col xs={24} sm={18} md={20}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <div style={{ marginBottom: 24 }}>
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ color: "#ff4d4f" }}>*</span>
                            <span
                              style={{
                                fontWeight: "600",
                                fontSize: "14px",
                                color: "#262626",
                                marginLeft: "4px",
                              }}
                            >
                              Họ và tên
                            </span>
                            <span
                              style={{
                                color: "#8c8c8c",
                                fontSize: "12px",
                                marginLeft: "8px",
                              }}
                            >
                              (Không thể chỉnh sửa)
                            </span>
                          </div>
                          <input
                            className="ant-input"
                            value={formValues.fullname}
                            disabled
                            placeholder="Họ và tên"
                            style={{
                              width: "100%",
                              height: "40px",
                              padding: "8px 12px",
                              backgroundColor: "#f5f5f5",
                              cursor: "not-allowed",
                              border: "2px solid #d9d9d9",
                              borderRadius: "6px",
                              fontSize: "14px",
                            }}
                          />
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ marginBottom: 24 }}>
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ color: "#ff4d4f" }}>*</span>
                            <span
                              style={{
                                fontWeight: "600",
                                fontSize: "14px",
                                color: "#262626",
                                marginLeft: "4px",
                              }}
                            >
                              Email
                            </span>
                            <span
                              style={{
                                color: "#8c8c8c",
                                fontSize: "12px",
                                marginLeft: "8px",
                              }}
                            >
                              (Không thể chỉnh sửa)
                            </span>
                          </div>
                          <input
                            className="ant-input"
                            value={formValues.email}
                            disabled
                            placeholder="Email"
                            style={{
                              width: "100%",
                              height: "40px",
                              padding: "8px 12px",
                              backgroundColor: "#f5f5f5",
                              cursor: "not-allowed",
                              border: "2px solid #d9d9d9",
                              borderRadius: "6px",
                              fontSize: "14px",
                            }}
                          />
                        </div>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <div style={{ marginBottom: 24 }}>
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ color: "#ff4d4f" }}>*</span>
                            <span
                              style={{
                                fontWeight: "600",
                                fontSize: "14px",
                                color: "#262626",
                                marginLeft: "4px",
                              }}
                            >
                              Số điện thoại
                            </span>
                            <span
                              style={{
                                color: "#8c8c8c",
                                fontSize: "12px",
                                marginLeft: "8px",
                              }}
                            >
                              (Không thể chỉnh sửa)
                            </span>
                          </div>
                          <input
                            className="ant-input"
                            value={formValues.phone}
                            disabled
                            placeholder="Số điện thoại"
                            style={{
                              width: "100%",
                              height: "40px",
                              padding: "8px 12px",
                              backgroundColor: "#f5f5f5",
                              cursor: "not-allowed",
                              border: "2px solid #d9d9d9",
                              borderRadius: "6px",
                              fontSize: "14px",
                            }}
                          />
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ marginBottom: 24 }}>
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ color: "#ff4d4f" }}>*</span>
                            <span
                              style={{
                                fontWeight: "600",
                                fontSize: "14px",
                                color: "#262626",
                                marginLeft: "4px",
                              }}
                            >
                              Giới tính
                            </span>
                            <span
                              style={{
                                color: "#8c8c8c",
                                fontSize: "12px",
                                marginLeft: "8px",
                              }}
                            >
                              (Không thể chỉnh sửa)
                            </span>
                          </div>
                          <select
                            className="ant-select-selector"
                            value={formValues.gender}
                            disabled
                            style={{
                              width: "100%",
                              height: "40px",
                              padding: "8px 12px",
                              backgroundColor: "#f5f5f5",
                              cursor: "not-allowed",
                              border: "2px solid #d9d9d9",
                              borderRadius: "6px",
                              fontSize: "14px",
                            }}
                          >
                            <option value="">Chọn giới tính</option>
                            <option value="Male">Nam</option>
                            <option value="Female">Nữ</option>
                            <option value="Other">Khác</option>
                          </select>
                        </div>
                      </Col>
                    </Row>
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ color: "#ff4d4f" }}>*</span>
                        <span
                          style={{
                            fontWeight: "600",
                            fontSize: "14px",
                            color: "#262626",
                            marginLeft: "4px",
                          }}
                        >
                          Địa chỉ
                        </span>
                        <span
                          style={{
                            color: "#52c41a",
                            fontSize: "12px",
                            marginLeft: "8px",
                            fontWeight: "500",
                          }}
                        >
                          (Có thể chỉnh sửa)
                        </span>
                      </div>
                      <input
                        className="ant-input"
                        value={formValues.address}
                        onChange={(e) => {
                          setFormValues({
                            ...formValues,
                            address: e.target.value,
                          });
                          form.setFieldsValue({ address: e.target.value });
                        }}
                        placeholder="Nhập địa chỉ của bạn"
                        style={{
                          width: "100%",
                          height: "40px",
                          padding: "8px 12px",
                          border: "2px solid #1890ff",
                          borderRadius: "6px",
                          fontSize: "14px",
                          backgroundColor: "#ffffff",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ color: "#ff4d4f" }}>*</span>
                        <span
                          style={{
                            fontWeight: "600",
                            fontSize: "14px",
                            color: "#262626",
                            marginLeft: "4px",
                          }}
                        >
                          Ngày sinh
                        </span>
                        <span
                          style={{
                            color: "#8c8c8c",
                            fontSize: "12px",
                            marginLeft: "8px",
                          }}
                        >
                          (Không thể chỉnh sửa)
                        </span>
                      </div>
                      <DatePicker
                        value={formValues.dayOfBirth}
                        disabled
                        placeholder="Ngày sinh"
                        style={{
                          width: "100%",
                          height: "40px",
                          backgroundColor: "#f5f5f5",
                          border: "2px solid #d9d9d9",
                          borderRadius: "6px",
                          fontSize: "14px",
                        }}
                      />
                    </div>
                  </Col>
                </Row>
              </Form>
            )}
          </Card>
        </TabPane>

        <TabPane tab="Thông tin con em" key="children">
          <Card>
            <Title level={4}>Danh sách con em</Title>
            {children && children.length > 0 ? (
              children.map((child, index) => (
                <Card
                  key={child.student_id || index}
                  style={{ marginBottom: 16 }}
                  type="inner"
                >
                  <Row gutter={24}>
                    <Col xs={24} sm={6} md={4} style={{ textAlign: "center" }}>
                      <Avatar
                        size={80}
                        src={child.avatar}
                        icon={!child.avatar && <UserOutlined />}
                      />
                      <div style={{ marginTop: 8 }}>
                        <Text strong>{child.full_name}</Text>
                      </div>
                      <div>
                        <Text type="secondary">
                          {child.student_code || `Học sinh ${index + 1}`}
                        </Text>
                      </div>
                    </Col>
                    <Col xs={24} sm={18} md={20}>
                      <Descriptions
                        column={{ xs: 1, sm: 2 }}
                        bordered
                        size="small"
                      >
                        <Descriptions.Item label="Ngày sinh">
                          {child.date_of_birth
                            ? format(
                                new Date(child.date_of_birth),
                                "dd/MM/yyyy"
                              )
                            : "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giới tính">
                          {child.gender || "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Lớp">
                          {child.class_name || "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Khối">
                          {child.grade || "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Nhóm máu">
                          {child.blood_type || "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Chiều cao">
                          {child.height_cm
                            ? `${child.height_cm} cm`
                            : "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Cân nặng">
                          {child.weight_kg
                            ? `${child.weight_kg} kg`
                            : "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Dị ứng">
                          {child.allergies || "Không có"}
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                  </Row>
                </Card>
              ))
            ) : (
              <Text type="secondary">Chưa có thông tin con em</Text>
            )}
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        visible={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </div>
  );
}
