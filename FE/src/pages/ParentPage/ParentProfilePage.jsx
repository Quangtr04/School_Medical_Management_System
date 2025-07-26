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
  Tag,
  Empty,
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
  TeamOutlined,
  MedicineBoxOutlined,
  ColumnHeightOutlined,
  ColumnWidthOutlined,
  AlertOutlined,
  HeartOutlined,
  BookOutlined,
} from "@ant-design/icons";
import {
  getParentProfile,
  updateParentProfile,
  getParentChildren,
  getChildDetails,
  updateProfileDirect,
  updateChildHealth,
} from "../../redux/parent/parentSlice";
import api from "../../configs/config-axios";
import { format } from "date-fns";
import moment from "moment";
import axios from "axios";
import HealthModal from "./components/HealthModal";
import { toast } from "react-toastify";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

export default function ParentProfilePage() {
  const dispatch = useDispatch();
  const { selectedChild } = useSelector((state) => state.parent);
  const { profile, children, loading, error, success } = useSelector(
    (state) => state.parent
  );
  const [form] = Form.useForm();

  const [editing, setEditing] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [forceUpdate, setForceUpdate] = useState(0);
  const [detailVisible, setDetailVisible] = useState(false);
  const [childEditVisible, setChildEditVisible] = useState(false);
  const [editingChild, setEditingChild] = useState(null);
  const [childForm] = Form.useForm();
  const [localChildren, setLocalChildren] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(false);

  // State để quản lý giá trị của các trường input
  const [formValues, setFormValues] = useState({
    fullname: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    dayOfBirth: null,
    major: "", // Thêm trường nghề nghiệp
    password: "", // Thêm trường mật khẩu
  });

  // Handle edit child
  const handleEditChild = async (child) => {
    try {
      // Try to get the most up-to-date child data
      const response = await api.get(
        `/parent/students/${child.student_id || child.id}`
      );

      const updatedChild = response.data.data || response.data || child;

      // Ensure we have the student_id
      updatedChild.student_id =
        updatedChild.student_id ||
        updatedChild.id ||
        child.student_id ||
        child.id;

      setEditingChild(updatedChild);

      // Ensure health object exists
      const health = updatedChild.health || {};

      // Set initial form values
      childForm.setFieldsValue({
        full_name:
          updatedChild.full_name ||
          updatedChild.student_name ||
          updatedChild.name ||
          "",
        gender:
          updatedChild.gender === "Male"
            ? "Nam"
            : updatedChild.gender === "Female"
              ? "Nữ"
              : updatedChild.gender || "",
        date_of_birth:
          updatedChild.date_of_birth || updatedChild.student_date_of_birth
            ? moment(
                updatedChild.date_of_birth || updatedChild.student_date_of_birth
              )
            : null,
        class_name: updatedChild.class_name || "",
        blood_type: health.blood_type || "",
        height_cm:
          health.height_cm !== null && health.height_cm !== undefined
            ? health.height_cm
            : "",
        weight_kg:
          health.weight_kg !== null && health.weight_kg !== undefined
            ? health.weight_kg
            : "",
        allergy: health.allergy || "",
      });
    } catch (error) {
      console.error("Error fetching updated child data:", error);

      // Fall back to the provided child data
      setEditingChild(child);

      // Ensure health object exists
      const health = child.health || {};

      // Set initial form values
      childForm.setFieldsValue({
        full_name: child.full_name || child.student_name || child.name || "",
        gender:
          child.gender === "Male"
            ? "Nam"
            : child.gender === "Female"
              ? "Nữ"
              : child.gender || "",
        date_of_birth:
          child.date_of_birth || child.student_date_of_birth
            ? moment(child.date_of_birth || child.student_date_of_birth)
            : null,
        class_name: child.class_name || "",
        blood_type: health.blood_type || "",
        height_cm:
          health.height_cm !== null && health.height_cm !== undefined
            ? health.height_cm
            : "",
        weight_kg:
          health.weight_kg !== null && health.weight_kg !== undefined
            ? health.weight_kg
            : "",
        allergy: health.allergy || "",
      });
    }

    setChildEditVisible(true);
  };

  // Handle save child info
  const handleSaveChildInfo = async (values) => {
    try {
      message.loading({
        content: "Đang cập nhật thông tin...",
        key: "updateChild",
      });

      // Ensure we have the student_id
      const studentId = editingChild.student_id || editingChild.id;
      if (!studentId) {
        throw new Error("Missing student ID for update");
      }

      // Preserve original values for non-editable fields
      const preservedData = {
        full_name: editingChild.full_name,
        gender: editingChild.gender, // Keep original "Male"/"Female" value
        date_of_birth: editingChild.date_of_birth,
        class_name: editingChild.class_name,
      };

      // Keep blood type if it's already set
      const bloodType = editingChild.health?.blood_type
        ? editingChild.health.blood_type
        : values.blood_type;

      // Prepare health data with proper type conversion
      const healthData = {
        blood_type: bloodType,
        height_cm:
          values.height_cm !== undefined && values.height_cm !== ""
            ? parseFloat(values.height_cm)
            : null,
        weight_kg:
          values.weight_kg !== undefined && values.weight_kg !== ""
            ? parseFloat(values.weight_kg)
            : null,
        allergy: values.allergy || "",
      };

      // Prepare data for API
      const updatedChildData = {
        student_id: studentId,
        ...preservedData,
        // Create health object with all health information
        health: healthData,
      };

      // Call API to update child information
      const response = await api.patch(
        `/parent/students/${studentId}`,
        updatedChildData
      );

      if (response.data) {
        // Update Redux store
        dispatch(
          updateChildHealth({
            studentId: studentId,
            healthData: healthData,
          })
        );

        // Update localChildren state with proper health data
        setLocalChildren((prevChildren) => {
          return prevChildren.map((child) => {
            if (child.student_id === studentId || child.id === studentId) {
              // Translate gender for display
              const displayGender =
                child.gender === "Male"
                  ? "Nam"
                  : child.gender === "Female"
                    ? "Nữ"
                    : child.gender || "";

              const updatedChild = {
                ...child,
                gender: displayGender,
                health: {
                  ...(child.health || {}),
                  blood_type: healthData.blood_type,
                  height_cm: healthData.height_cm,
                  weight_kg: healthData.weight_kg,
                  allergy: healthData.allergy,
                },
              };

              return updatedChild;
            }
            return child;
          });
        });

        message.success({
          content: "Cập nhật thông tin thành công!",
          key: "updateChild",
        });
        setChildEditVisible(false);

        // Refresh data from server
        dispatch(getParentChildren());

        // Fetch children directly to ensure we have the latest data
        setTimeout(() => {
          fetchChildrenDirectly();
        }, 1000);

        // Force update the component to reflect changes
        setForceUpdate((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error updating child information:", error);
      message.error({
        content:
          "Lỗi khi cập nhật thông tin: " +
          (error.response?.data?.message || error.message),
        key: "updateChild",
      });
    }
  };

  // Fetch profile data
  useEffect(() => {
    dispatch(getParentProfile());
    dispatch(getParentChildren());

    // Also fetch children directly
    fetchChildrenDirectly();

    // Log the current children data from Redux store
  }, [dispatch, forceUpdate]);

  // Add a new useEffect to log children data when it changes
  useEffect(() => {
    // Check if children data is properly structured
    if (children && Array.isArray(children)) {
      children.forEach((child, index) => {});
    }
  }, [children]);

  // Monitor localChildren state for debugging
  useEffect(() => {
    // Check if local children data has health information
    if (localChildren && Array.isArray(localChildren)) {
      localChildren.forEach((child, index) => {});
    }
  }, [localChildren]);

  // Log profile data when it changes
  useEffect(() => {
    if (profile) {
      resetForm();

      // Cập nhật state formValues với dữ liệu từ profile
      setFormValues({
        fullname: profile.fullname || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        gender: profile.gender || "",
        dayOfBirth: profile.dayOfBirth ? moment(profile.dayOfBirth) : null,
        major: profile.major || "", // Thêm trường nghề nghiệp
        password: profile.password || "", // Thêm trường mật khẩu
      });
    }
  }, [profile]);

  // Set form values when profile data is loaded and when editing mode changes
  useEffect(() => {
    if (profile && editing) {
      // Đặt giá trị form khi chuyển sang chế độ chỉnh sửa
      form.setFieldsValue({
        fullname: profile.fullname || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        gender: profile.gender || "",
        dayOfBirth: profile.dayOfBirth ? moment(profile.dayOfBirth) : null,
        major: profile.major || "", // Thêm trường nghề nghiệp
        password: profile.password || "", // Thêm trường mật khẩu
      });
    }
  }, [profile, form, editing]);

  // Khởi tạo form khi component mount
  useEffect(() => {
    // Đảm bảo form được khởi tạo ngay cả khi không ở chế độ chỉnh sửa
    if (profile) {
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
          major: profile.major || "", // Thêm trường nghề nghiệp
          password: profile.password || "", // Thêm trường mật khẩu
        });
      }, 100);
    }
  }, [form, profile]);

  // Handle form submission
  const handleSubmit = (values) => {
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
        major: profile.major || "", // Thêm trường nghề nghiệp
        password: profile.password || "", // Thêm trường mật khẩu
      });
    }
  };

  // Cập nhật trực tiếp bằng axios
  const updateProfileDirectly = async (profileData) => {
    try {
      message.loading({ content: "Đang cập nhật...", key: "updateProfile" });

      const response = await api.patch("/parent/profile", profileData);

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
    message.info(token ? "Token đã được lưu" : "Không tìm thấy token");
  };

  // Test API trực tiếp
  const testDirectAPI = async () => {
    try {
      message.loading({ content: "Đang kiểm tra API...", key: "testAPI" });

      // Kiểm tra token
      const token = localStorage.getItem("accessToken");

      // Test GET API
      const getResponse = await api.get("/parent/profile");

      // Test PATCH API với dữ liệu đơn giản
      const testData = {
        fullname: profile?.fullname || "Test Name",
        test_field: "Test value " + new Date().toISOString(),
      };

      const patchResponse = await api.patch("/parent/profile", token);

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
    // Khởi tạo form với giá trị từ profile
    if (profile) {
      const updatedFormValues = {
        fullname: profile.fullname || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        gender: profile.gender || "",
        dayOfBirth: profile.dayOfBirth ? moment(profile.dayOfBirth) : null,
        major: profile.major || "", // Thêm trường nghề nghiệp
        password: profile.password || "", // Thêm trường mật khẩu
      };

      // Cập nhật state formValues
      setFormValues(updatedFormValues);

      // Cập nhật form
      form.setFieldsValue(updatedFormValues);

      // Chuyển sang chế độ chỉnh sửa
      setEditing(true);
    }
  };

  // Xử lý khi nhấn nút lưu
  const handleSave = async () => {
    try {
      // Validate the address field
      if (!formValues.address || formValues.address.trim() === "") {
        message.error({
          content: "Địa chỉ không được để trống!",
          key: "updateProfile",
        });
        return;
      }

      // Format lại ngày tháng nếu có
      const formattedValues = {
        // Chỉ gửi address và major theo yêu cầu của BE
        address: formValues.address.trim(), // Ensure address is trimmed
        major: formValues.major?.trim() || "", // Thêm trường nghề nghiệp
        password: formValues.password?.trim(),
      };

      // Log để debug

      // Gọi API trực tiếp với đúng định dạng mà BE mong đợi
      try {
        const response = await api.patch("/parent/profile", {
          address: formattedValues.address,
          major: formattedValues.major,
          password: formattedValues.password,
        });
        console.log("Direct API response:", response);
      } catch (error) {
        console.error("Direct API error:", error);
      }

      // Cập nhật UI ngay lập tức với giá trị mới (optimistic update)
      const optimisticProfile = {
        ...profile,
        address: formattedValues.address,
        major: formattedValues.major,
        password: formattedValues.password,
      };

      // Hiển thị dữ liệu mới ngay lập tức
      dispatch(updateProfileDirect(optimisticProfile));

      // Hiển thị thông báo đang cập nhật
      message.loading({ content: "Đang cập nhật...", key: "updateProfile" });

      toast.success("Cập nhật thành công!");

      // Đợi 2 giây rồi lấy dữ liệu mới từ server
      setTimeout(async () => {
        const serverData = await fetchDirectFromServer();
        setEditing(false);
      }, 2000);
    } catch (error) {
      console.error("Save error:", error);
      let errorMessage = "Lỗi khi cập nhật thông tin";

      if (error.response) {
        console.error("Error response:", error.response.data);
        if (
          error.response.data &&
          error.response.data.error === "Address is required"
        ) {
          errorMessage = "Địa chỉ là bắt buộc";
        } else {
          errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            `Lỗi máy chủ: ${error.response.status}`;
        }
      }

      toast.error("Cập nhật thất bại");
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
        // Kiểm tra và cập nhật dữ liệu
        if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data) &&
          response.data.data.length > 0
        ) {
          const profileData = response.data.data[0];
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

      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data) &&
        response.data.data.length > 0
      ) {
        const profileData = response.data.data[0];
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

  // Direct API call to fetch children data
  const fetchChildrenDirectly = async () => {
    try {
      setLoadingChildren(true);
      const response = await api.get("/parent/students");

      let childrenData = [];
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        childrenData = response.data.data;
      } else if (Array.isArray(response.data)) {
        childrenData = response.data;
      }

      // Process children data to ensure health information is available
      const processedChildren = await Promise.all(
        childrenData.map(async (child) => {
          // Try to get detailed information for each child
          try {
            const detailResponse = await api.get(
              `/parent/students/${child.student_id || child.id}`
            );

            const detailData = detailResponse.data.data || detailResponse.data;

            // Use the detailed data if available, otherwise use the original data
            const mergedChild = detailData || child;

            // Ensure health object exists and properly process health data
            const health = mergedChild.health || {};

            // Translate gender for display
            const displayGender =
              mergedChild.gender === "Male" || mergedChild.gender === "male"
                ? "Nam"
                : mergedChild.gender === "Female" ||
                    mergedChild.gender === "female"
                  ? "Nữ"
                  : mergedChild.gender || "";

            // Create a properly structured child object with all required fields
            const processedChild = {
              ...mergedChild,
              id: mergedChild.student_id || mergedChild.id,
              student_id: mergedChild.student_id || mergedChild.id,
              full_name:
                mergedChild.full_name ||
                mergedChild.student_name ||
                mergedChild.name,
              date_of_birth:
                mergedChild.date_of_birth || mergedChild.student_date_of_birth,
              gender: displayGender, // Use translated gender
              health: {
                ...health,
                height_cm:
                  health.height_cm !== undefined && health.height_cm !== null
                    ? parseFloat(health.height_cm)
                    : null,
                weight_kg:
                  health.weight_kg !== undefined && health.weight_kg !== null
                    ? parseFloat(health.weight_kg)
                    : null,
                blood_type: health.blood_type || null,
                allergy: health.allergy || "",
              },
            };

            return processedChild;
          } catch (error) {
            console.error(
              `Error fetching details for child ${
                child.student_id || child.id
              }:`,
              error
            );
            // If detail fetch fails, use the original data
            const health = child.health || {};

            // Translate gender for display
            const displayGender =
              child.gender === "Male" || child.gender === "male"
                ? "Nam"
                : child.gender === "Female" || child.gender === "female"
                  ? "Nữ"
                  : child.gender || "";

            // Create a properly structured child object with all required fields
            const processedChild = {
              ...child,
              id: child.student_id || child.id,
              student_id: child.student_id || child.id,
              full_name: child.full_name || child.student_name || child.name,
              date_of_birth: child.date_of_birth || child.student_date_of_birth,
              gender: displayGender, // Use translated gender
              health: {
                ...health,
                height_cm:
                  health.height_cm !== undefined && health.height_cm !== null
                    ? parseFloat(health.height_cm)
                    : null,
                weight_kg:
                  health.weight_kg !== undefined && health.weight_kg !== null
                    ? parseFloat(health.weight_kg)
                    : null,
                blood_type: health.blood_type || null,
                allergy: health.allergy || "",
              },
            };

            return processedChild;
          }
        })
      );

      setLocalChildren(processedChildren);
      return processedChildren;
    } catch (error) {
      console.error("Error fetching children directly:", error);
      message.error("Không thể tải thông tin con em");
      return [];
    } finally {
      setLoadingChildren(false);
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
    <div
      className="parent-profile-container"
      style={{
        padding: "30px",
        background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)",
        minHeight: "100vh",
      }}
    >
      <Title
        level={2}
        style={{
          color: "#1890ff",
          fontWeight: "600",
          marginBottom: "24px",
          borderBottom: "2px solid #e6f7ff",
          paddingBottom: "12px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <UserOutlined
          style={{ marginRight: "12px", color: "#1890ff", fontSize: "28px" }}
        />
        Hồ sơ phụ huynh
      </Title>

      <Tabs
        defaultActiveKey="profile"
        type="card"
        className="custom-tabs"
        style={{
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        <TabPane
          tab={
            <span>
              <UserOutlined style={{ marginRight: "8px" }} />
              Thông tin cá nhân
            </span>
          }
          key="profile"
        >
          <Card
            bordered={false}
            style={{
              borderRadius: "8px",
              boxShadow: "none",
            }}
          >
            {!editing ? (
              // View mode
              <>
                <div style={{ textAlign: "right", marginBottom: 16 }}>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={startEditing}
                    style={{
                      background: "#1890ff",
                      borderRadius: "6px",
                      padding: "0 20px",
                      height: "38px",
                      boxShadow: "0 2px 6px rgba(24, 144, 255, 0.2)",
                    }}
                  >
                    Chỉnh sửa
                  </Button>
                </div>

                <Row gutter={24} align="middle">
                  <Col xs={24} sm={6} md={4} style={{ textAlign: "center" }}>
                    <div style={{ position: "relative" }}>
                      <Avatar
                        size={140}
                        src={profile?.avatar}
                        icon={!profile?.avatar && <UserOutlined />}
                        style={{
                          border: "4px solid #e6f7ff",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <div
                        style={{
                          marginTop: "12px",
                          fontWeight: "600",
                          color: "#1890ff",
                        }}
                      >
                        {profile?.fullname || "Chưa cập nhật"}
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={18} md={20}>
                    <Descriptions
                      column={{ xs: 1, sm: 2 }}
                      bordered
                      style={{
                        background: "#fff",
                        borderRadius: "8px",
                        overflow: "hidden",
                      }}
                      labelStyle={{
                        background: "#f0f7ff",
                        fontWeight: "500",
                        padding: "12px 16px",
                      }}
                      contentStyle={{
                        padding: "12px 16px",
                      }}
                    >
                      <Descriptions.Item
                        label={
                          <span
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <UserOutlined
                              style={{ marginRight: "8px", color: "#1890ff" }}
                            />
                            Họ và tên
                          </span>
                        }
                      >
                        <span style={{ fontWeight: "500" }}>
                          {profile?.fullname || "Chưa cập nhật"}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={
                          <span
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <MailOutlined
                              style={{ marginRight: "8px", color: "#1890ff" }}
                            />
                            Email
                          </span>
                        }
                      >
                        <span style={{ fontWeight: "500" }}>
                          {profile?.email || "Chưa cập nhật"}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={
                          <span
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <PhoneOutlined
                              style={{ marginRight: "8px", color: "#1890ff" }}
                            />
                            Số điện thoại
                          </span>
                        }
                      >
                        <span style={{ fontWeight: "500" }}>
                          {profile?.phone || "Chưa cập nhật"}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={
                          <span
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <HomeOutlined
                              style={{ marginRight: "8px", color: "#1890ff" }}
                            />
                            Địa chỉ
                          </span>
                        }
                      >
                        <span style={{ fontWeight: "500" }}>
                          {profile?.address || "Chưa cập nhật"}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={
                          <span
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <CalendarOutlined
                              style={{ marginRight: "8px", color: "#1890ff" }}
                            />
                            Ngày sinh
                          </span>
                        }
                      >
                        <span style={{ fontWeight: "500" }}>
                          {profile?.dayOfBirth
                            ? format(new Date(profile.dayOfBirth), "dd/MM/yyyy")
                            : "Chưa cập nhật"}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={
                          <span
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <IdcardOutlined
                              style={{ marginRight: "8px", color: "#1890ff" }}
                            />
                            Giới tính
                          </span>
                        }
                      >
                        <span style={{ fontWeight: "500" }}>
                          {profile?.gender || "Chưa cập nhật"}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={
                          <span
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <BookOutlined
                              style={{ marginRight: "8px", color: "#1890ff" }}
                            />
                            Nghề nghiệp
                          </span>
                        }
                      >
                        <span style={{ fontWeight: "500" }}>
                          {profile?.major || "Chưa cập nhật"}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={
                          <span
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <BookOutlined
                              style={{ marginRight: "8px", color: "#1890ff" }}
                            />
                            Mật khẩu tài khoản
                          </span>
                        }
                      >
                        <span style={{ fontWeight: "500" }}>
                          {profile?.password}
                        </span>
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
                  major: profile?.major || "",
                }}
                onFinish={handleSave}
                onValuesChange={(changedValues, allValues) => {}}
                autoComplete="off"
                style={{
                  background: "#fff",
                  padding: "20px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                }}
              >
                <div style={{ textAlign: "right", marginBottom: 16 }}>
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => {
                      setEditing(false);
                      form.resetFields();
                    }}
                    style={{
                      marginRight: 8,
                      borderRadius: "6px",
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={loading}
                    style={{
                      background: "#52c41a",
                      borderColor: "#52c41a",
                      borderRadius: "6px",
                      boxShadow: "0 2px 6px rgba(82, 196, 26, 0.2)",
                    }}
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
                      style={{
                        borderRadius: "50%",
                        overflow: "hidden",
                      }}
                    >
                      {avatar ? (
                        <img
                          src={avatar.url || avatar.preview || profile?.avatar}
                          alt="avatar"
                          style={{
                            width: "100%",
                            borderRadius: "50%",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                          }}
                        >
                          <UploadOutlined
                            style={{ fontSize: "24px", color: "#1890ff" }}
                          />
                          <div style={{ marginTop: 8, color: "#1890ff" }}>
                            Tải ảnh lên
                          </div>
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
                          <input
                            className="ant-input"
                            value={formValues.gender}
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
                          Nghề nghiệp
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
                        value={formValues.major}
                        onChange={(e) => {
                          setFormValues({
                            ...formValues,
                            major: e.target.value,
                          });
                          form.setFieldsValue({ major: e.target.value });
                        }}
                        placeholder="Nhập nghề nghiệp của bạn"
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
                          Mật khẩu
                        </span>
                        <span
                          style={{
                            color: "#52c41a",
                            fontSize: "12px",
                            marginLeft: "8px",
                            fontWeight: "500",
                          }}
                        >
                          (Có thể thay đổi)
                        </span>
                      </div>
                      <input
                        className="ant-input"
                        type="newpassword"
                        value={formValues.password}
                        onChange={(e) => {
                          setFormValues({
                            ...formValues,
                            password: e.target.value,
                          });
                          form.setFieldsValue({ password: e.target.value });
                        }}
                        placeholder="Nhập mật khẩu mới"
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

                      <div
                        style={{
                          marginTop: "8px",
                          fontSize: "13px",
                          color: "#8c8c8c",
                          fontStyle: "italic",
                        }}
                      >
                        Mật khẩu hiện tại:{" "}
                        <span style={{ fontWeight: "600", color: "#262626" }}>
                          {formValues.password || "Không có"}
                        </span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Form>
            )}
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <TeamOutlined style={{ marginRight: "8px" }} />
              Thông tin con em
            </span>
          }
          key="children"
        >
          <Card
            bordered={false}
            style={{
              borderRadius: "8px",
              boxShadow: "none",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Title
                level={4}
                style={{
                  margin: 0,
                  color: "#1890ff",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <TeamOutlined style={{ marginRight: "8px" }} />
                Danh sách con em
              </Title>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={fetchChildrenDirectly}
                loading={loadingChildren}
                style={{
                  background: "#1890ff",
                  borderRadius: "6px",
                  boxShadow: "0 2px 6px rgba(24, 144, 255, 0.2)",
                }}
              >
                Làm mới
              </Button>
            </div>
            {loadingChildren ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Spin size="large" />
                <div style={{ marginTop: "16px", color: "#1890ff" }}>
                  Đang tải thông tin...
                </div>
              </div>
            ) : localChildren && localChildren.length > 0 ? (
              <div className="children-list">
                {localChildren.map((child, index) => (
                  <Card
                    key={child.student_id || index}
                    style={{
                      marginBottom: 16,
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                      border: "1px solid #e6f7ff",
                    }}
                    hoverable
                  >
                    <Row gutter={24} align="middle">
                      <Col
                        xs={24}
                        sm={6}
                        md={4}
                        style={{ textAlign: "center" }}
                      >
                        <Avatar
                          size={80}
                          src={child.avatar}
                          icon={!child.avatar && <UserOutlined />}
                          style={{
                            border: "3px solid #e6f7ff",
                            backgroundColor: "#1890ff",
                          }}
                        />
                        <div style={{ marginTop: 8 }}>
                          <Text
                            strong
                            style={{ fontSize: "16px", color: "#1890ff" }}
                          >
                            {child.full_name ||
                              child.student_name ||
                              child.name ||
                              `Học sinh ${index + 1}`}
                          </Text>
                        </div>
                        <div>
                          <Text type="secondary" style={{ fontSize: "13px" }}>
                            {child.student_code || `Mã HS: ${index + 1}`}
                          </Text>
                        </div>
                      </Col>
                      <Col xs={24} sm={18} md={20}>
                        <Descriptions
                          column={{ xs: 1, sm: 2 }}
                          bordered
                          size="small"
                          style={{
                            background: "#fff",
                            borderRadius: "8px",
                            overflow: "hidden",
                          }}
                          labelStyle={{
                            background: "#f0f7ff",
                            fontWeight: "500",
                            padding: "10px 16px",
                          }}
                          contentStyle={{
                            padding: "10px 16px",
                          }}
                        >
                          <Descriptions.Item
                            label={
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <CalendarOutlined
                                  style={{
                                    marginRight: "8px",
                                    color: "#1890ff",
                                  }}
                                />
                                Ngày sinh
                              </span>
                            }
                          >
                            {child.date_of_birth || child.student_date_of_birth
                              ? format(
                                  new Date(
                                    child.date_of_birth ||
                                      child.student_date_of_birth
                                  ),
                                  "dd/MM/yyyy"
                                )
                              : "Chưa cập nhật"}
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <UserOutlined
                                  style={{
                                    marginRight: "8px",
                                    color: "#1890ff",
                                  }}
                                />
                                Giới tính
                              </span>
                            }
                          >
                            {child.gender ||
                              child.student_gender ||
                              "Chưa cập nhật"}
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <TeamOutlined
                                  style={{
                                    marginRight: "8px",
                                    color: "#1890ff",
                                  }}
                                />
                                Lớp
                              </span>
                            }
                          >
                            {child.class_name || "Chưa cập nhật"}
                          </Descriptions.Item>

                          <Descriptions.Item
                            label={
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <MedicineBoxOutlined
                                  style={{
                                    marginRight: "8px",
                                    color: "#1890ff",
                                  }}
                                />
                                Nhóm máu
                              </span>
                            }
                          >
                            <Tag color="#f50">
                              {(child.health && child.health.blood_type) ||
                                child.blood_type ||
                                "Chưa cập nhật"}
                            </Tag>
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <ColumnHeightOutlined
                                  style={{
                                    marginRight: "8px",
                                    color: "#1890ff",
                                  }}
                                />
                                Chiều cao
                              </span>
                            }
                          >
                            {(child.health &&
                              child.health.height_cm !== null &&
                              child.health.height_cm !== undefined &&
                              child.health.height_cm !== "") ||
                            (child.height_cm !== null &&
                              child.height_cm !== undefined &&
                              child.height_cm !== "")
                              ? `${
                                  child.health?.height_cm || child.height_cm
                                } cm`
                              : "Chưa cập nhật"}
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <ColumnWidthOutlined
                                  style={{
                                    marginRight: "8px",
                                    color: "#1890ff",
                                  }}
                                />
                                Cân nặng
                              </span>
                            }
                          >
                            {(child.health &&
                              child.health.weight_kg !== null &&
                              child.health.weight_kg !== undefined &&
                              child.health.weight_kg !== "") ||
                            (child.weight_kg !== null &&
                              child.weight_kg !== undefined &&
                              child.weight_kg !== "")
                              ? `${
                                  child.health?.weight_kg || child.weight_kg
                                } kg`
                              : "Chưa cập nhật"}
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <AlertOutlined
                                  style={{
                                    marginRight: "8px",
                                    color: "#ff4d4f",
                                  }}
                                />
                                Dị ứng
                              </span>
                            }
                            span={2}
                          >
                            {(child.health && child.health.allergy) ||
                              child.allergy ||
                              "Không có"}
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <HeartOutlined
                                  style={{
                                    marginRight: "8px",
                                    color: "#1890ff",
                                  }}
                                />
                                Trạng thái sức khỏe
                              </span>
                            }
                            span={2}
                          >
                            <Tag
                              color={
                                (child.health?.health_status ||
                                  child.health_status) === "Khỏe mạnh"
                                  ? "green"
                                  : (child.health?.health_status ||
                                        child.health_status) === "Cần theo dõi"
                                    ? "orange"
                                    : (child.health?.health_status ||
                                          child.health_status) ===
                                        "Nghiêm trọng"
                                      ? "red"
                                      : "blue"
                              }
                            >
                              {child.health?.health_status ||
                                child.health_status ||
                                "Chưa cập nhật"}
                            </Tag>
                          </Descriptions.Item>
                        </Descriptions>
                        <div style={{ textAlign: "right", marginTop: 12 }}>
                          <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => {
                              setEditingChild(child);
                              setDetailVisible(true);
                            }}
                            style={{
                              background: "#1890ff",
                              borderRadius: "6px",
                              boxShadow: "0 2px 6px rgba(24, 144, 255, 0.2)",
                            }}
                          >
                            Xem chi tiết
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty
                description="Chưa có thông tin con em"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ margin: "40px 0" }}
              />
            )}
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>

      {/* Health Modal */}
      <HealthModal
        detailVisible={detailVisible}
        setDetailVisible={setDetailVisible}
        selectedChild={editingChild}
        reloadData={refreshData}
      />
    </div>
  );
}
