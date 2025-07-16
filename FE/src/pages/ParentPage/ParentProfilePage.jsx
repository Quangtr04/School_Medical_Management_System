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
  getChildDetails,
  updateProfileDirect,
  updateChildHealth,
} from "../../redux/parent/parentSlice";
import api from "../../configs/config-axios";
import { format } from "date-fns";
import moment from "moment";
import axios from "axios";
import HealthModal from "./components/HealthModal";

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
  console.log("Form instance created:", form);

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
  });

  // Handle edit child
  const handleEditChild = async (child) => {
    console.log("Editing child:", child);

    try {
      // Try to get the most up-to-date child data
      const response = await api.get(
        `/parent/students/${child.student_id || child.id}`
      );
      console.log("Raw child data from API:", response.data);

      const updatedChild = response.data.data || response.data || child;
      console.log("Updated child data for editing:", updatedChild);

      // Ensure we have the student_id
      updatedChild.student_id =
        updatedChild.student_id ||
        updatedChild.id ||
        child.student_id ||
        child.id;

      setEditingChild(updatedChild);

      // Ensure health object exists
      const health = updatedChild.health || {};
      console.log("Health data for form:", health);

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

      console.log("Form values set:", childForm.getFieldsValue());
    } catch (error) {
      console.error("Error fetching updated child data:", error);

      // Fall back to the provided child data
      setEditingChild(child);

      // Ensure health object exists
      const health = child.health || {};
      console.log("Fallback health data for form:", health);

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

      console.log("Form values set (fallback):", childForm.getFieldsValue());
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

      console.log("Form values to save:", values);
      console.log("Current editing child:", editingChild);

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

      console.log("Prepared health data:", healthData);

      // Prepare data for API
      const updatedChildData = {
        student_id: studentId,
        ...preservedData,
        // Create health object with all health information
        health: healthData,
      };

      console.log("Updating child data:", updatedChildData);

      // Call API to update child information
      const response = await api.patch(
        `/parent/students/${studentId}`,
        updatedChildData
      );

      console.log("Child update API response:", response.data);

      if (response.data) {
        console.log("Child update response:", response.data);

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

              console.log("Updated child in local state:", updatedChild);
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
    console.log("Fetching profile data using token");
    dispatch(getParentProfile());
    dispatch(getParentChildren());

    // Also fetch children directly
    fetchChildrenDirectly();

    // Log the current children data from Redux store
    console.log("Current children data:", children);
  }, [dispatch, forceUpdate]);

  // Add a new useEffect to log children data when it changes
  useEffect(() => {
    console.log("Children data updated:", children);

    // Check if children data is properly structured
    if (children && Array.isArray(children)) {
      children.forEach((child, index) => {
        console.log(`Child ${index + 1}:`, {
          id: child.student_id || child.id,
          name: child.full_name,
          health: child.health,
          class: child.class_name,
          gender: child.gender,
          dob: child.date_of_birth,
        });
      });
    }
  }, [children]);

  // Monitor localChildren state for debugging
  useEffect(() => {
    console.log("Local children data updated:", localChildren);

    // Check if local children data has health information
    if (localChildren && Array.isArray(localChildren)) {
      localChildren.forEach((child, index) => {
        console.log(`Local child ${index + 1} health data:`, {
          id: child.student_id || child.id,
          name: child.full_name,
          health: child.health,
          height: child.health?.height_cm,
          weight: child.health?.weight_kg,
          bloodType: child.health?.blood_type,
        });
      });
    }
  }, [localChildren]);

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

  // Direct API call to fetch children data
  const fetchChildrenDirectly = async () => {
    try {
      setLoadingChildren(true);
      const response = await api.get("/parent/students");
      console.log("Direct API children response:", response.data);

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
    <div style={{ padding: "20px" }}>
      <Title level={2}>Hồ sơ phụ huynh</Title>

      <Tabs defaultActiveKey="profile">
        <TabPane tab="Thông tin cá nhân" key="profile">
          <Card>
            {!editing ? (
              // View mode
              <>
                <div style={{ textAlign: "right", marginBottom: 16 }}>
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Title level={4} style={{ margin: 0 }}>
                Danh sách con em
              </Title>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={fetchChildrenDirectly}
                loading={loadingChildren}
              >
                Làm mới
              </Button>
            </div>
            {loadingChildren ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin size="large" />
              </div>
            ) : localChildren && localChildren.length > 0 ? (
              localChildren.map((child, index) => (
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
                        <Text strong>
                          {child.full_name ||
                            child.student_name ||
                            child.name ||
                            `Học sinh ${index + 1}`}
                        </Text>
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
                        <Descriptions.Item label="Giới tính">
                          {child.gender ||
                            child.student_gender ||
                            "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Lớp">
                          {child.class_name || "Chưa cập nhật"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Nhóm máu">
                          {(child.health && child.health.blood_type) ||
                            child.blood_type ||
                            "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Chiều cao">
                          {(child.health &&
                            child.health.height_cm !== null &&
                            child.health.height_cm !== undefined &&
                            child.health.height_cm !== "") ||
                          (child.height_cm !== null &&
                            child.height_cm !== undefined &&
                            child.height_cm !== "")
                            ? `${child.health?.height_cm || child.height_cm} cm`
                            : "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Cân nặng">
                          {(child.health &&
                            child.health.weight_kg !== null &&
                            child.health.weight_kg !== undefined &&
                            child.health.weight_kg !== "") ||
                          (child.weight_kg !== null &&
                            child.weight_kg !== undefined &&
                            child.weight_kg !== "")
                            ? `${child.health?.weight_kg || child.weight_kg} kg`
                            : "Chưa cập nhật"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Dị ứng" span={2}>
                          {(child.health && child.health.allergy) ||
                            child.allergy ||
                            "Không có"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái sức khỏe" span={2}>
                          {(child.status && child.health.status) ||
                            child.status ||
                            "Chưa cập nhật"}
                        </Descriptions.Item>
                      </Descriptions>
                      <div style={{ textAlign: "right", marginTop: 8 }}>
                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          onClick={() => {
                            setEditingChild(child);
                            setDetailVisible(true);
                          }}
                        >
                          Xem chi tiết
                        </Button>
                      </div>
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
      />
    </div>
  );
}
