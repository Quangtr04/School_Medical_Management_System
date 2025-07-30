/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Table,
  Modal,
  Button,
  Tag,
  Tooltip,
  Form,
  Input,
  Empty,
  Image,
  Space,
  Row,
  Col,
  Typography,
  Divider,
  Alert,
  Card,
  Badge,
  Statistic,
  Select,
  List,
  DatePicker,
  Upload,
} from "antd";
import {
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchAllMedicationSubmissions,
  giveMedicine,
  updateMedicationSubmissionReq,
} from "../../redux/nurse/medicalSubmission/medicalSubmisstionSlice";
import { fetchAllStudentHealthRecords } from "../../redux/nurse/studentRecords/studentRecord";
import { toast } from "react-toastify";
import Stepper, { Step } from "../../Animation/Step/Stepper";
import moment from "moment";
import { MdClass } from "react-icons/md";
import { FaPills } from "react-icons/fa6";
import {
  getDailyLogByReqId,
  updateLogByLogId,
} from "../../redux/nurse/dailylogs/dailyLogSlice";
import dayjs from "dayjs";
import { fetchUsers } from "../../redux/admin/adminSlice";

const { Text, Title } = Typography;

// Enhanced status configuration
const statusConfig = {
  pending: {
    icon: <SyncOutlined spin />,
    color: "#faad14",
    bgColor: "#fff7e6",
    borderColor: "#ffd666",
    text: "Đang chờ duyệt",
  },
  accepted: {
    icon: <CheckOutlined />,
    color: "#52c41a",
    bgColor: "#f6ffed",
    borderColor: "#95de64",
    text: "Đã duyệt",
  },

  declined: {
    icon: <CloseOutlined />,
    color: "#ff4d4f", // chữ màu đỏ (Ant Design danger)
    bgColor: "#fff1f0", // nền đỏ nhạt
    borderColor: "#ffa39e", // viền đỏ nhạt
    text: "Đã từ chối",
  },
};

const modernTheme = {
  colors: {
    primary: "#1677ff",
    secondary: "#722ed1",
    success: "#52c41a",
    warning: "#faad14",
    error: "#ff4d4f",
    info: "#13c2c2",
    background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
    cardBackground: "rgba(255, 255, 255, 0.95)",
    glassMorphism: "rgba(255, 255, 255, 0.25)",
  },
  shadows: {
    card: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    hover: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  },
  borderRadius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    full: "9999px",
  },
};
const modernCardStyle = {
  borderRadius: modernTheme.borderRadius.xl,
  background: modernTheme.colors.cardBackground,
  boxShadow: modernTheme.shadows.card,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  backdropFilter: "blur(20px)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
};

const renderStatusTag = (status) => {
  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
  return (
    <Tag
      icon={config.icon}
      style={{
        color: config.color,
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
        border: `1px solid ${config.borderColor}`,
        borderRadius: "6px",
        padding: "4px 12px",
        fontWeight: "500",
        fontSize: "12px",
      }}
    >
      {config.text}
    </Tag>
  );
};

const renderDateWithIcon = (date, IconComponent, color) => (
  <div className="flex items-center gap-2">
    <IconComponent style={{ color, fontSize: "14px" }} />
    <span style={{ fontSize: "13px", color: "#595959", fontWeight: "600" }}>
      {date ? moment(date).format("DD/MM/YYYY") : "N/A"}
    </span>
  </div>
);

export default function MedicalSubmission() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(
    (state) => state.medicationSubmission
  );

  console.log(data);

  const { logs, loadingLog, errorLog } = useSelector((state) => state.logs);

  const students = useSelector((state) => state.studentRecord.healthRecords);
  const nurses = useSelector((state) => state.admin.users);
  console.log(nurses);

  const user = JSON.parse(localStorage.getItem("currentUser"));
  const token = localStorage.getItem("accessToken");

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestDetailModalVisible, setRequestDetailModalVisible] =
    useState(false);
  const [inputPage, setInputPage] = useState(1);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });

  const [declinedForm] = Form.useForm();
  const [declinedModal, setDeclinedModal] = useState(false);

  const [giveMedicineForm] = Form.useForm();
  const [giveMedicinceModal, setGiveMedicinceModal] = useState(false);

  const imageGroups = (() => {
    try {
      const parsed = JSON.parse(selectedRequest.image_url || "[]");
      return Array.isArray(parsed[0]) ? parsed : [parsed]; // đảm bảo dạng mảng các mảng
    } catch (err) {
      return [];
    }
  })();

  // const logIdByDate = useMemo(() => {
  //   const map = {};
  //   logs?.forEach((log) => {
  //     map[dayjs(log.date).format("YYYY-MM-DD")] = log.log_id;
  //   });
  //   return map;
  // }, [logs]);

  // State Filter
  const khoiList = Array.from(
    new Set(students?.map((s) => s.class_name?.[0]))
  ).filter(Boolean);

  const dateList = Array.from(
    new Set(
      data?.map((req) =>
        moment(req.created_at).locale("vi").format("DD-MM-YYYY")
      )
    )
  ).filter(Boolean);

  const [filters, setFilters] = useState({
    date: "",
    name: "",
  });

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  }, []);

  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter((item) => {
      const studentName = item?.student?.toLowerCase().trim();
      const filterName = filters?.name.toLowerCase().trim();

      const matchedName = !filterName || studentName.includes(filterName);

      const itemDate = moment(item.created_at).format("DD-MM-YYYY");
      const matchDate = !filters.date || itemDate === filters.date;

      return matchedName && matchDate;
    });
  }, [data, filters]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = data.length;
    const pending = data.filter(
      (item) => item.status?.toLowerCase() === "pending"
    ).length;
    const accepted = data.filter(
      (item) => item.status?.toLowerCase() === "accepted"
    ).length;
    const declined = data.filter(
      (item) => item.status?.toLowerCase() === "declined"
    ).length;

    return { total, pending, accepted, declined };
  }, [data]);

  useEffect(() => {
    dispatch(fetchAllMedicationSubmissions());
    dispatch(fetchAllStudentHealthRecords());
    dispatch(fetchUsers({ endpointPath: "/admin/nurses" }));
  }, [dispatch]);

  useEffect(() => {
    const id = selectedRequest?.id_req;
    if (id) dispatch(getDailyLogByReqId(id));
  }, [dispatch, selectedRequest]);

  useEffect(() => {
    setInputPage(pagination.current);
  }, [pagination]);

  useEffect(() => {
    if (logs && giveMedicinceModal) {
      const today = dayjs().startOf("day");
      // const today = dayjs("2025-07-28");
      const logToday = logs.find((log) => dayjs(log.date).isSame(today, "day"));
      if (logToday.nurse_id === user.user_id) {
        const validateValue = {
          selectedDate: today,
          full_name: logToday?.full_name || null,
          parent_name: logToday?.parent_name || null,
          note: logToday?.note || null,
          image_url: "",
          status: logToday?.status || "pending",
          log_id: logToday?.log_id || null,
        };

        console.log("validateValue", validateValue);

        giveMedicineForm.setFieldsValue(validateValue);
      } else {
        toast.warning("Bạn không phải người phụ trách đơn uống thuốc này");
      }
    }
  }, [
    dispatch,
    logs,
    giveMedicinceModal,
    selectedRequest,
    giveMedicineForm,
    user.user_id,
  ]);
  console.log("logs", logs);

  const handleViewDetailRequest = useCallback((record) => {
    console.log(record);

    setSelectedRequest(record);
    setRequestDetailModalVisible(true);
  }, []);

  const handleRespondRequest = useCallback(
    (record, action) => {
      const reqId = record.id_req;
      const payload = { reqId, status: action, token };
      dispatch(updateMedicationSubmissionReq(payload))
        .unwrap()
        .then(() => {
          toast.success("Xét duyệt đơn thuốc thành công");
          dispatch(fetchAllMedicationSubmissions());
        })
        .catch(() => {
          toast.error("Cập nhật thất bại");
        });
    },
    [dispatch, token]
  );

  const handleOpenDeclinedModal = useCallback(
    (record) => {
      console.log(record);
      if (!record) return;
      setSelectedRequest(record);
      setDeclinedModal(true);
      declinedForm.resetFields();
    },
    [declinedForm]
  );

  const handleDeclineSubmission = (values) => {
    const reqId = selectedRequest.id_req;
    const payload = {
      reqId,
      status: "DECLINED",
      reasons: values.reasons,
      token,
    };
    dispatch(updateMedicationSubmissionReq(payload))
      .unwrap()
      .then(() => {
        toast.success("Đơn thuốc đã được từ chối");
        setDeclinedModal(false);
        dispatch(fetchAllMedicationSubmissions());
      })
      .catch((error) => {
        toast.error(`Từ chối đơn thuốc thất bại: ${error.message}`);
      });
  };

  const handleGiveMedicine = useCallback(
    async (record) => {
      console.log("record", record);
      setSelectedRequest(record);
      const today = dayjs().startOf("day");
      // const today = dayjs("2025-07-28");
      console.log(selectedRequest);

      // Chuyển start_date và end_date sang dayjs
      const startDate = dayjs(record?.start_date).startOf("day");
      const endDate = dayjs(record?.end_date).startOf("day");

      const logToday = logs.find((log) => dayjs(log.date).isSame(today, "day"));
      console.log("logToday", logToday);

      // Kiểm tra today có nằm trong khoảng không
      const isTodayInRange =
        today.isSame(startDate) ||
        today.isSame(endDate) ||
        (today.isAfter(startDate) && today.isBefore(endDate));
      /*
        isSame(startDate) → true nếu hôm nay đúng ngày bắt đầu.

isSame(endDate) → true nếu hôm nay đúng ngày kết thúc.

(isAfter(startDate) && isBefore(endDate)) → true nếu hôm nay nằm giữa khoảng.
 */
      const isNurseIdTheSame = logToday?.nurse_id === user?.user_id;

      if (!isTodayInRange) {
        toast.warning(
          "Hôm nay không nằm trong khoảng ngày bắt đầu và kết thúc uống thuốc!"
        );
        return; // Dừng hàm nếu không hợp lệ
      } else if (!isNurseIdTheSame) {
        toast.warning("Bạn ko phải người phụ trách đơn thuốc này!");
        return;
      }

      if (isTodayInRange) {
        try {
          setSelectedRequest(record);
          setGiveMedicinceModal(true); // Mở modal nếu hợp lệ
          await dispatch(getDailyLogByReqId(record.id_req));
        } catch (error) {
          toast.error(error.message || "Lỗi khi tải log");
        }
      }
    },
    [dispatch, logs, user, selectedRequest]
  );

  const handleSubmitGiveMedicineForm = useCallback(
    async (values) => {
      console.log("Values nhận vào từ Form:", values);
      try {
        await dispatch(
          updateLogByLogId({ logId: values.log_id, status: values.status })
        )
          .unwrap()
          .then(() => {
            toast.success("Cho học sinh uống thuốc thành công");
            dispatch(fetchAllMedicationSubmissions());
            setGiveMedicinceModal(false);
          });
      } catch (error) {
        toast.error("Cập nhập thất bại");
      }
    },
    [dispatch]
  );

  const columns = useMemo(
    () => [
      {
        title: (
          <div className="flex items-center justify-center gap-2">
            <FileTextOutlined className="text-blue-500" />
            <span>Mã yêu cầu</span>
          </div>
        ),
        dataIndex: "id_req",
        key: "id_req",
        width: 140,
        align: "center",
        render: (text, record) => (
          <div className="flex flex-col items-center">
            <Badge
              count={record.status?.toLowerCase() === "pending" ? "Mới" : ""}
              size="small"
              style={{ backgroundColor: "#52c41a" }}
            >
              <Text
                code
                style={{
                  fontSize: "12px",
                  padding: "2px 6px",
                  fontWeight: "500",
                }}
              >
                {record.id_req || record._id}
              </Text>
            </Badge>
          </div>
        ),
      },

      {
        title: (
          <div className="flex items-center justify-center gap-2">
            <MedicineBoxOutlined className="text-purple-500" />
            <span>Được xét duyệt bởi</span>
          </div>
        ),
        dataIndex: "nurse_id",
        key: "nurse_id",
        width: 140,
        align: "center",
        render: (id, record) => {
          const nurse = nurses.find((n) => n.user_id === id);

          // Map trạng thái sang nội dung hiển thị
          const statusMap = {
            CANCELLED: "Đã huỷ",
            ACCEPTED: "Đã chấp thuận",
            PENDING: "Chờ duyệt",
          };

          return (
            <div className="flex justify-center">
              {nurse ? (
                nurse.fullname
              ) : statusMap[record.status] ? (
                <span className="text-gray-400 italic">
                  {statusMap[record.status]}
                </span>
              ) : (
                <span className="text-gray-400 italic">Không xác định</span>
              )}
            </div>
          );
        },
      },
      {
        title: (
          <div className="flex items-center justify-center gap-2">
            <UserOutlined className="text-green-500" />
            <span>Học sinh</span>
          </div>
        ),
        dataIndex: "student",
        key: "student",
        width: 160,
        align: "center",
        render: (text) => (
          <div className="flex flex-col items-center">
            <Text
              strong
              style={{
                fontSize: "13px",
                color: "#262626",
                fontWeight: "500",
              }}
            >
              {text}
            </Text>
          </div>
        ),
      },

      {
        title: (
          <div className="flex items-center justify-center gap-2">
            <MdClass />
            <span>Lớp</span>
          </div>
        ),
        dataIndex: "class_name",
        key: "class-name",
        width: 160,
        align: "center",
        render: (text) => (
          <div className="flex flex-col items-center">
            <Text
              strong
              style={{
                fontSize: "13px",
                color: "#262626",
                fontWeight: "500",
              }}
            >
              {text}
            </Text>
          </div>
        ),
      },
      {
        title: (
          <div className="flex items-center justify-center gap-2">
            <UserOutlined className="text-purple-500" />
            <span>Phụ huynh</span>
          </div>
        ),
        dataIndex: "fullname",
        key: "parent",
        width: 160,
        align: "center",
        render: (text) => (
          <Text
            style={{ fontSize: "13px", color: "#595959", fontWeight: "600" }}
          >
            {text}
          </Text>
        ),
      },
      {
        title: (
          <div className="flex items-center justify-center gap-2">
            <CalendarOutlined className="text-blue-500" />
            <span>Ngày gửi</span>
          </div>
        ),
        dataIndex: "created_at",
        key: "created_at",
        width: 140,
        align: "center",
        render: (text) => renderDateWithIcon(text, CalendarOutlined, "#1890ff"),
        style: { fontSize: "13px", color: "#595959", fontWeight: "500" },
      },
      {
        title: (
          <div className="flex items-center justify-center gap-2">
            <CalendarOutlined className="text-green-500" />
            <span>Bắt đầu</span>
          </div>
        ),
        dataIndex: "start_date",
        key: "start_date",
        width: 130,
        align: "center",
        render: (text) => renderDateWithIcon(text, CalendarOutlined, "#52c41a"),
      },
      {
        title: (
          <div className="flex items-center justify-center gap-2">
            <CalendarOutlined className="text-red-500" />
            <span>Kết thúc</span>
          </div>
        ),
        dataIndex: "end_date",
        key: "end_date",
        width: 130,
        align: "center",
        render: (text) => renderDateWithIcon(text, CalendarOutlined, "#ff4d4f"),
      },
      {
        title: (
          <div className="flex items-center justify-center gap-2">
            <EditOutlined className="text-orange-500" />
            <span>Ghi chú</span>
          </div>
        ),
        dataIndex: "note",
        key: "note",
        width: 200,
        align: "center",
        render: (text) => (
          <Tooltip title={text || "Không có ghi chú"}>
            <Text
              ellipsis
              style={{
                maxWidth: "150px",
                fontSize: "13px",
                color: "#595959",
                fontWeight: "500",
              }}
            >
              {text || "Không có"}
            </Text>
          </Tooltip>
        ),
      },
      {
        title: (
          <div className="flex items-center justify-center gap-2">
            <MedicineBoxOutlined className="text-purple-500" />
            <span>Trạng thái</span>
          </div>
        ),
        dataIndex: "status",
        key: "status",
        width: 140,
        align: "center",
        render: (status) => (
          <div className="flex justify-center">{renderStatusTag(status)}</div>
        ),
      },
      {
        title: (
          <div className="flex items-center justify-center">
            <span>Thao tác</span>
          </div>
        ),
        key: "actions",
        width: 200,
        align: "center",
        render: (_, record) => (
          <Space size="small">
            <Tooltip title="Xem chi tiết">
              <Button
                type="primary"
                icon={<EyeOutlined />}
                size="small"
                onClick={() => handleViewDetailRequest(record)}
                style={{ borderRadius: "6px" }}
              />
            </Tooltip>
            {record.status?.toLowerCase() === "pending" && (
              <>
                <Tooltip title="Duyệt đơn">
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    size="small"
                    style={{
                      backgroundColor: "#52c41a",
                      borderColor: "#52c41a",
                      borderRadius: "6px",
                    }}
                    onClick={() => handleRespondRequest(record, "ACCEPTED")}
                  />
                </Tooltip>
                <Tooltip title="Từ chối">
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    size="small"
                    style={{ borderRadius: "6px" }}
                    onClick={() => handleOpenDeclinedModal(record)}
                  />
                </Tooltip>
              </>
            )}

            {record?.status?.toLowerCase() === "accepted" && (
              <>
                <Tooltip title="Cho học sinh uống thuốc">
                  <Button
                    type="primary"
                    icon={<FaPills />}
                    size="small"
                    style={{
                      backgroundColor: "#52c41a",
                      borderColor: "#52c41a",
                      borderRadius: "6px",
                    }}
                    onClick={() => handleGiveMedicine(record)}
                  />
                </Tooltip>
              </>
            )}
          </Space>
        ),
      },
    ],
    [
      handleViewDetailRequest,
      handleRespondRequest,
      handleOpenDeclinedModal,
      handleGiveMedicine,
      nurses,
    ]
  );

  return (
    <motion.div
      className="min-h-screen p-6"
      style={{
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card
            style={{
              marginBottom: "24px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
            bodyStyle={{ padding: "32px" }}
          >
            <Row align="middle" justify="space-between">
              <Col>
                <div className="flex items-center gap-4">
                  <div
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: "16px",
                      padding: "16px",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <MedicineBoxOutlined
                      style={{ fontSize: "32px", color: "white" }}
                    />
                  </div>
                  <div>
                    <Title
                      level={2}
                      style={{
                        color: "white",
                        margin: 0,
                        fontSize: "28px",
                        fontWeight: "700",
                      }}
                    >
                      Quản lý đơn thuốc
                    </Title>
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.8)",
                        fontSize: "16px",
                        display: "block",
                        marginTop: "4px",
                      }}
                    >
                      Xét duyệt và quản lý đơn thuốc từ phụ huynh
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  ...modernCardStyle,
                  background:
                    "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                  border: "1px solid #93c5fd",
                }}
                bodyStyle={{ padding: "24px" }}
              >
                <Statistic
                  title="Tổng đơn thuốc"
                  value={stats.total}
                  prefix={<FileTextOutlined style={{ color: "#1890ff" }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  ...modernCardStyle,
                  background:
                    "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                  border: "1px solid #fbbf24",
                }}
                bodyStyle={{ padding: "24px" }}
              >
                <Statistic
                  title="Đang chờ duyệt"
                  value={stats.pending}
                  prefix={<SyncOutlined style={{ color: "#faad14" }} />}
                  valueStyle={{ color: "#faad14", fontWeight: "600" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  ...modernCardStyle,
                  background:
                    "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
                  border: "1px solid #86efac",
                }}
                bodyStyle={{ padding: "24px" }}
              >
                <Statistic
                  title="Đã duyệt"
                  value={stats.accepted}
                  prefix={<CheckOutlined style={{ color: "#52c41a" }} />}
                  valueStyle={{ color: "#52c41a", fontWeight: "600" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  borderRadius: "12px",
                  border: "1px solid #f31c0c",
                  background:
                    "linear-gradient(135deg, #fb5d51 0%, #ffffff 100%)",
                }}
              >
                <Statistic
                  title="Đã từ chối"
                  value={stats.declined}
                  prefix={
                    <CloseOutlined
                      style={{ color: "#fb5d51", fontWeight: 900 }}
                    />
                  }
                  valueStyle={{ color: "#fb5d51", fontWeight: "600" }}
                />
              </Card>
            </Col>
          </Row>
        </motion.div>

        {/*  Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card style={modernCardStyle} bodyStyle={{ padding: "0" }}>
            {/* Thanh lọc */}
            <div style={{ padding: "32px 32px 0 32px" }}>
              <Row gutter={[16, 16]} align="middle">
                {/* Tìm kiếm theo tên */}
                <Col xs={24} sm={12} md={8}>
                  <Input
                    placeholder="Tìm kiếm theo tiêu đề, mô tả..."
                    style={{
                      borderRadius: modernTheme.borderRadius.lg,
                      height: "48px",
                      border: "2px solid #f3f4f6",
                      fontSize: "14px",
                    }}
                    value={String(filters.name)}
                    onChange={(e) =>
                      handleFilterChange("name", String(e.target.value))
                    }
                    // onPressEnter={(e) => handleSearch(e.target.value)}
                    // onBlur={(e) => handleSearch(e.target.value)}
                  />
                </Col>

                {/* Lọc theo khối
                <Col xs={24} sm={12} md={4}>
                  <Select
                    placeholder="Chọn khối"
                    allowClear
                    style={{ width: "100%", height: "48px" }}
                    value={filters.khoi}
                    onChange={(value) => handleFilterChange("khoi", value)}
                  >
                    {khoiList?.map((khoi) => (
                      <Select.Option key={khoi} value={Number(khoi)}>
                        Khối {khoi}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>

                Lọc theo trang thái
                <Col xs={24} sm={12} md={4}>
                  <Select
                    placeholder="Trạng thái"
                    onChange={(value) => handleFilterChange("status", value)}
                    allowClear={() => handleFilterChange("status", "values")}
                    style={{ width: "100%", height: "48px" }}
                    value={filters.status}
                  >
                    <Option value="PENDING">Đang chờ</Option>
                    <Option value="APPROVED">Đã duyệt</Option>
                    <Option value="DECLINED">Đã từ chối</Option>
                  </Select>
                </Col> */}

                {/* Lọc theo ngày gửi */}
                <Col xs={24} sm={12} md={4}>
                  <Select
                    showSearch
                    placeholder="Ngày gửi"
                    onChange={(value) => handleFilterChange("date", value)}
                    allowClear={() => handleFilterChange("date", "")}
                    style={{ width: "100%", height: "48px" }}
                    // value={statusFilter}
                  >
                    {dateList.map((date, idx) => (
                      <Select.Option key={idx} value={date}></Select.Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            </div>

            <div style={{ padding: "10px" }}></div>
            <Stepper
              onStepChange={(step) => {
                setPagination((prev) => ({ ...prev, current: step }));
                setInputPage(step);
              }}
              backButtonText="Trang trước"
              nextButtonText="Trang sau"
              disableStepIndicators={true}
              currentStep={pagination.current}
              padding="0"
            >
              {(filteredData.length === 0
                ? [0]
                : Array.from({
                    length: Math.ceil(
                      filteredData.length / pagination.pageSize
                    ),
                  }).map((_, idx) => idx)
              ).map((idx) => (
                <Step key={idx}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={pagination.current}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Table
                        columns={columns}
                        dataSource={filteredData.slice(
                          idx * pagination.pageSize,
                          (idx + 1) * pagination.pageSize
                        )}
                        rowKey="req_id"
                        size="large"
                        scroll={{ x: 1200 }}
                        pagination={false}
                        loading={loading}
                        style={{
                          borderRadius: "16px",
                          overflow: "hidden",
                          maxHeight: "max-content",
                        }}
                        fontSize="large"
                        locale={{
                          emptyText: (
                            <Empty
                              description="Chưa có đơn thuốc nào"
                              image={Empty.PRESENTED_IMAGE_SIMPLE}
                              style={{ padding: "40px" }}
                            />
                          ),
                        }}
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Enhanced Pagination */}
                  <div
                    style={{
                      borderTop: "1px solid #f0f0f0",
                    }}
                  ></div>
                </Step>
              ))}
            </Stepper>
          </Card>
        </motion.div>
      </div>

      {/* Detail Modal - Keep your existing modal code but with enhanced styling */}
      <Modal
        open={requestDetailModalVisible}
        onCancel={() => setRequestDetailModalVisible(false)}
        footer={null}
        width={900}
        style={{ maxWidth: "90vw" }}
        closeIcon={
          <CloseOutlined style={{ fontSize: "16px", color: "#666" }} />
        }
        title={
          <div className="flex items-center">
            <EyeOutlined
              style={{
                color: "#1890ff",
                fontSize: "20px",
                marginRight: "8px",
              }}
            />
            <span
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#262626",
              }}
            >
              Thông tin chi tiết đơn thuốc
            </span>
          </div>
        }
      >
        {selectedRequest ? (
          <div style={{ padding: "20px 0" }}>
            <Row gutter={32} align="stretch">
              <Col span={12}>
                <div
                  style={{
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    minHeight: "100%",
                  }}
                >
                  {imageGroups.map((group, idx) => (
                    <div key={idx} style={{ marginBottom: 24 }}>
                      <Title level={5}>🧾 Đơn thuốc {idx + 1}</Title>
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          flexWrap: "wrap",
                        }}
                      >
                        {group.map((url, i) => (
                          <Image
                            key={i}
                            src={url}
                            alt={`Ảnh ${i + 1}`}
                            style={{
                              borderRadius: 8,
                              width: "100%",
                              height: "auto",
                              objectFit: "contain", // hoặc "cover" nếu muốn fill
                            }}
                            preview={{
                              mask: (
                                <div style={{ color: "white" }}>
                                  <EyeOutlined /> Xem ảnh
                                </div>
                              ),
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* <Image
                    src={selectedRequest.image_url || "Ảnh lỗi"}
                    alt="Đơn thuốc"
                    style={{
                      borderRadius: "8px",
                      maxWidth: "100%",
                      maxHeight: "100%",
                      width: "auto",
                      height: "auto",
                    }}
                    preview={{
                      title: "Xem ảnh đơn thuốc",
                      mask: (
                        <div
                          style={{
                            background: "rgba(0,0,0,0.5)",
                            color: "white",
                            borderRadius: "4px",
                            fontSize: "14px",
                          }}
                        >
                          <EyeOutlined style={{ marginRight: "6px" }} />
                          Xem ảnh đơn thuốc
                        </div>
                      ),
                    }}
                  /> */}
                </div>
              </Col>

              <Col span={12}>
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    paddingLeft: "20px",
                  }}
                >
                  <Title
                    level={4}
                    style={{
                      marginBottom: "24px",
                      color: "#262626",
                      fontSize: "18px",
                      fontWeight: "600",
                    }}
                  >
                    Thông tin đơn thuốc
                  </Title>
                  <div style={{ flex: 1 }}>
                    <Space
                      direction="vertical"
                      size={30}
                      style={{ width: "100%" }}
                    >
                      <Row>
                        <Col span={10}>
                          <Text style={{ color: "#595959", fontSize: "14px" }}>
                            Thời gian cho uống:
                          </Text>
                        </Col>
                        <Col span={14}>
                          <Text
                            style={{
                              color: "#262626",
                              fontSize: "14px",
                              fontWeight: "500",
                            }}
                          >
                            {selectedRequest.start_date
                              ? moment(selectedRequest.start_date)
                                  .locale("vi")
                                  .format("DD/MM/YYYY")
                              : "N/A"}{" "}
                            -{" "}
                            {selectedRequest.end_date
                              ? moment(selectedRequest.end_date)
                                  .locale("vi")
                                  .format("DD/MM/YYYY")
                              : "N/A"}
                          </Text>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={10}>
                          <Text style={{ color: "#595959", fontSize: "14px" }}>
                            Phụ huynh:
                          </Text>
                        </Col>
                        <Col span={14}>
                          <Text
                            style={{
                              color: "#262626",
                              fontSize: "14px",
                              fontWeight: "500",
                            }}
                          >
                            {selectedRequest.fullname || "Không rõ"}
                          </Text>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={10}>
                          <Text style={{ color: "#595959", fontSize: "14px" }}>
                            Ngày gửi:
                          </Text>
                        </Col>
                        <Col span={14}>
                          <Text
                            style={{
                              color: "#262626",
                              fontSize: "14px",
                              fontWeight: "500",
                            }}
                          >
                            {moment(selectedRequest.created_at)
                              .locale("vi")
                              .format("DD/MM/YYYY")}
                          </Text>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={10}>
                          <Text style={{ color: "#595959", fontSize: "14px" }}>
                            Gửi cho học sinh:
                          </Text>
                        </Col>
                        <Col span={14}>
                          <Text
                            style={{
                              color: "#262626",
                              fontSize: "14px",
                              fontWeight: "500",
                            }}
                          >
                            {selectedRequest.student || "N/A"}
                          </Text>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={10}>
                          <Text style={{ color: "#595959", fontSize: "14px" }}>
                            Trạng thái:
                          </Text>
                        </Col>
                        <Col span={14}>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            {renderStatusTag(selectedRequest.status)}
                          </div>
                        </Col>
                      </Row>
                      <Divider style={{ margin: "20px 0" }} />
                      <div>
                        <Title
                          level={5}
                          style={{
                            marginBottom: "12px",
                            color: "#262626",
                            fontSize: "16px",
                            fontWeight: "600",
                          }}
                        >
                          Ghi chú
                        </Title>
                        <Text
                          style={{
                            color: "#595959",
                            fontSize: "14px",
                            lineHeight: "1.6",
                            display: "block",
                          }}
                        >
                          {selectedRequest.note || "Không có ghi chú"}
                        </Text>
                      </div>
                    </Space>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Text type="danger" style={{ fontSize: "16px" }}>
              Không có dữ liệu.
            </Text>
          </div>
        )}
      </Modal>

      {/* Modal nhập lí do từ chối Modal */}
      <AnimatePresence>
        {declinedModal && (
          <Modal
            open={true}
            onCancel={() => setDeclinedModal(false)}
            width={600}
            centered
            closable={false}
            footer={null}
            styles={{
              body: { padding: 0 },
              content: {
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
              },
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Header Section */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)",
                  padding: "28px 32px",
                  color: "white",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      borderRadius: "50%",
                      padding: "10px",
                      marginRight: "16px",
                    }}
                  >
                    <CloseCircleOutlined
                      style={{ fontSize: "24px", color: "white" }}
                    />
                  </div>
                  <Title
                    level={3}
                    style={{
                      color: "white",
                      margin: 0,
                      fontSize: "22px",
                      fontWeight: "600",
                    }}
                  >
                    Từ chối đơn thuốc
                  </Title>
                </div>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: "15px",
                    display: "block",
                  }}
                >
                  Vui lòng cung cấp lý do chi tiết để từ chối đơn thuốc này
                </Text>
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={() => setDeclinedModal(false)}
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    color: "white",
                    border: "none",
                    background: "rgba(255, 255, 255, 0.15)",
                    borderRadius: "8px",
                    width: "32px",
                    height: "32px",
                  }}
                />
              </div>

              {/* Content Section */}
              <div style={{ padding: "32px" }}>
                <Alert
                  message="Lưu ý quan trọng"
                  description="Việc từ chối đơn thuốc sẽ được ghi lại trong hệ thống và thông báo đến phụ huynh. Vui lòng đảm bảo lý do từ chối chính xác và chi tiết."
                  type="warning"
                  icon={<ExclamationCircleOutlined />}
                  showIcon
                  style={{
                    marginBottom: "28px",
                    borderRadius: "10px",
                    border: "1px solid #fadb14",
                    background: "#fffbe6",
                  }}
                />

                <Form
                  form={declinedForm}
                  layout="vertical"
                  onFinish={handleDeclineSubmission}
                >
                  <Form.Item
                    name="reasons"
                    label={
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <EditOutlined
                          style={{ marginRight: "8px", color: "#1890ff" }}
                        />
                        <Text strong style={{ fontSize: "16px" }}>
                          Lý do từ chối
                        </Text>
                      </div>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập lý do từ chối.",
                      },
                      {
                        min: 10,
                        message: "Lý do từ chối phải có ít nhất 10 ký tự.",
                      },
                    ]}
                  >
                    <Input.TextArea
                      rows={5}
                      placeholder="Ví dụ: Thông tin bệnh nhân không đầy đủ, thuốc không phù hợp với tình trạng bệnh, cần xét nghiệm bổ sung..."
                      style={{
                        borderRadius: "10px",
                        fontSize: "14px",
                        resize: "none",
                        border: "2px solid #f0f0f0",
                      }}
                      showCount
                      maxLength={500}
                    />
                  </Form.Item>

                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #f6f8fa 0%, #e9ecef 100%)",
                      padding: "20px",
                      borderRadius: "10px",
                      border: "1px solid #e8e8e8",
                      marginBottom: "24px",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: "14px",
                        color: "#666",
                        lineHeight: "1.6",
                      }}
                    >
                      💡 <strong>Gợi ý:</strong> Hãy cung cấp lý do cụ thể để
                      giúp phụ huynh hiểu rõ vấn đề và có thể điều chỉnh đơn
                      thuốc phù hợp hơn.
                    </Text>
                  </div>

                  {/* Footer Section */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "12px",
                      paddingTop: "20px",
                      borderTop: "1px solid #f0f0f0",
                    }}
                  >
                    <Button
                      size="large"
                      onClick={() => setDeclinedModal(false)}
                      style={{
                        borderRadius: "8px",
                        height: "44px",
                        paddingLeft: "24px",
                        paddingRight: "24px",
                        fontWeight: "500",
                      }}
                    >
                      Hủy bỏ
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      loading={loading}
                      danger
                      htmlType="submit"
                      onClick={() => declinedForm.submit()}
                      style={{
                        borderRadius: "8px",
                        height: "44px",
                        paddingLeft: "28px",
                        paddingRight: "28px",
                        fontWeight: "600",
                        boxShadow: "0 4px 12px rgba(255, 77, 79, 0.3)",
                      }}
                    >
                      Xác nhận từ chối
                    </Button>
                  </div>
                </Form>
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Modal Chọn ngày cho học sinh uống thuốc */}
      <AnimatePresence>
        {giveMedicinceModal && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <Modal
              open={giveMedicinceModal}
              title="📅Cho học sinh uống thuốc trong ngày"
              onCancel={() => setGiveMedicinceModal(false)}
              footer={null}
              centered
            >
              <Form
                layout="vertical"
                onFinish={handleSubmitGiveMedicineForm}
                form={giveMedicineForm}
                initialValues={{
                  status: "Chưa cho uống", // giá trị mặc định cho Select
                }}
              >
                <Form.Item name="selectedDate" label="Ngày uống thuốc">
                  <DatePicker format="DD/MM/YYYY" disabled />
                </Form.Item>

                <Form.Item name="parent_name" label="Người gửi">
                  <Input readOnly></Input>
                </Form.Item>

                <Form.Item name="full_name" label="Cho học sinh">
                  <Input readOnly></Input>
                </Form.Item>

                <Form.Item label="Mã yêu cầu" name="log_id">
                  <Input readOnly />
                </Form.Item>

                <Form.Item
                  label="Trạng thái"
                  name="status"
                  rules={[
                    { required: true, message: "Vui lòng chọn trạng thái!" },
                  ]}
                >
                  <Select placeholder="Chọn trạng thái">
                    <Select.Option value="GIVEN">Đã cho uống</Select.Option>
                    <Select.Option value="NOT GIVEN">
                      Không cho uống
                    </Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item label="Ghi chú" name="note">
                  <Input.TextArea rows={3} placeholder="Nhập ghi chú..." />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" block>
                    ✅ Xác nhận cho uống thuốc
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Styles */}
      <style jsx global>{`
        .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-bottom: 2px solid #e2e8f0;
          font-weight: 700;
          color: #1e293b;
          padding: 20px 16px;
          font-size: 14px;
        }

        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9;
          padding: 20px 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ant-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ant-card-head {
          border: none !important;
        }

        .ant-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
        }
        .ant-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ant-btn:hover {
          transform: translateY(-2px);
        }
        .ant-select-selector {
          border-radius: ${modernTheme.borderRadius.lg} !important;
          height: 48px !important;
          border: 2px solid #f3f4f6 !important;
        }
        .ant-input {
          border-radius: ${modernTheme.borderRadius.lg} !important;
          border: 2px solid #f3f4f6 !important;
        }
        .ant-input:focus,
        .ant-input-focused {
          border-color: ${modernTheme.colors.primary} !important;
          box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1) !important;
        }
        .ant-select-focused .ant-select-selector {
          border-color: ${modernTheme.colors.primary} !important;
          box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1) !important;
        }
      `}</style>
    </motion.div>
  );
}
