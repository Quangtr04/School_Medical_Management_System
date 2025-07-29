/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Table,
  Input,
  Button,
  Space,
  Select,
  Tag,
  Modal,
  Form,
  message,
  Tooltip,
  Card,
  DatePicker,
  InputNumber,
  Divider,
  Row,
  Col,
  Progress,
  Avatar,
  Statistic,
  Alert,
  Typography,
} from "antd";
import {
  SearchOutlined,
  BarcodeOutlined,
  TagOutlined,
  FolderOutlined,
  MinusSquareOutlined,
  ContainerOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EyeFilled,
  EditOutlined,
  PlusOutlined,
  DownloadOutlined,
  ReloadOutlined,
  WarningOutlined,
  MedicineBoxOutlined,
  SafetyOutlined,
  FilterOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { IoStorefront } from "react-icons/io5";
import { MdInventory, MdOutlineInventory2 } from "react-icons/md";
import dayjs from "dayjs";
import { format, parseISO } from "date-fns";
import {
  addNewMedicalSupply,
  fetchMedicalSupplies,
  setMedicalSuppliesPagination,
  updateExpiredDate,
} from "../../redux/nurse/medicalSupplies/medicalSupplies";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const { TextArea } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

const fontFamily = {
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

// Modern design system matching the examination component
const modernTheme = {
  colors: {
    primary: "#667eea",
    secondary: "#764ba2",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
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

// Enhanced card styles
const modernCardStyle = {
  borderRadius: modernTheme.borderRadius.xl,
  background: modernTheme.colors.cardBackground,
  boxShadow: modernTheme.shadows.card,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  backdropFilter: "blur(20px)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
};

const gradientHeaderStyle = {
  background: `linear-gradient(135deg, ${modernTheme.colors.warning} 0%, ${modernTheme.colors.warning} 100%)`,
  borderRadius: modernTheme.borderRadius.xl,
  padding: "40px",
  color: "white",
  marginBottom: "32px",
  boxShadow: `0 20px 60px rgba(102, 126, 234, 0.4)`,
  position: "relative",
  overflow: "hidden",
};

// Enhanced status configuration
const statusConfig = {
  active: {
    color: modernTheme.colors.success,
    bgColor: "#ecfdf5",
    borderColor: "#a7f3d0",
    text: "Còn hàng",
    icon: <CheckCircleOutlined />,
  },
  inactive: {
    color: modernTheme.colors.error,
    bgColor: "#fef2f2",
    borderColor: "#fecaca",
    text: "Hết hàng",
    icon: <CloseCircleOutlined />,
  },
  low_stock: {
    color: modernTheme.colors.warning,
    bgColor: "#fffbeb",
    borderColor: "#fde68a",
    text: "Sắp hết",
    icon: <WarningOutlined />,
  },
  expired: {
    color: modernTheme.colors.error,
    bgColor: "#fef2f2",
    borderColor: "#fecaca",
    text: "Hết hạn",
    icon: <ExclamationCircleOutlined />,
  },
};

const MotionRow = ({ children, ...props }) => (
  <motion.tr
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{
      duration: 0.4,
      delay: props["data-row-key"] ? (props["data-row-key"] % 10) * 0.03 : 0,
      ease: "easeOut",
    }}
    {...props}
  >
    {children}
  </motion.tr>
);

export default function ModernMedicalSuppliesPage() {
  const dispatch = useDispatch();
  const { supplies, loading, error, pagination } = useSelector(
    (s) => s.medicalSupplies
  );

  console.log(supplies);

  const [searchQuery, setSearchQuery] = useState("");

  const [isStockModalVisible, setIsStockModalVisible] = useState(false);

  const [stockForm] = Form.useForm();
  const [addForm] = Form.useForm();
  const [updateForm] = Form.useForm();

  const [isSubmittingStock, setIsSubmittingStock] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState(null);
  const [updatingDate, setUpdatingDate] = useState(false);
  const [detailSupply, setDetailSupply] = useState(null);

  const [status, setStatus] = useState(true);
  const [filterType, setFilterType] = useState("all");

  // Mock data for demonstration

  // Use mock data if supplies is empty

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = supplies.length;
    const inStock = supplies.filter(
      (s) => s.is_active && s.quantity > 0
    ).length;
    const outOfStock = supplies.filter(
      (s) => !s.is_active || s.quantity === 0
    ).length;
    const lowStock = supplies.filter(
      (s) => s.quantity > 0 && s.quantity < 100
    ).length;

    return { total, inStock, outOfStock, lowStock };
  }, [supplies]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  useEffect(() => {
    dispatch(fetchMedicalSupplies({}));
  }, [dispatch, pagination.current, pagination.pageSize, searchQuery]);

  const handleTableChange = useCallback(
    (pagination) => {
      dispatch(
        setMedicalSuppliesPagination({
          current: pagination.current,
          pageSize: pagination.pageSize,
        })
      );
    },
    [dispatch]
  );

  const showStockModal = useCallback(() => {
    stockForm.resetFields();
    addForm.resetFields();
    addForm.setFieldsValue({
      name: "",
      type: "Thuốc",
      unit: "viên",
      quantity: 1,
      expired_date: dayjs().add(30, "day"),
      description: "",
      is_active: true,
    });
    setIsStockModalVisible(true);
  }, [addForm, stockForm]);

  const handleAddNewSubmit = useCallback(
    async (values) => {
      setIsSubmittingStock(true);
      try {
        await dispatch(addNewMedicalSupply(values)).unwrap();
        toast.success("✅ Thêm vật tư mới thành công!");
        setIsStockModalVisible(false);
        dispatch(
          fetchMedicalSupplies({
            page: pagination.current,
            pageSize: pagination.pageSize,
            search: searchQuery,
          })
        );
      } catch (error) {
        message.error(
          "❌ Thêm vật tư thất bại! Vui lòng kiểm tra lại thông tin."
        );
      } finally {
        setIsSubmittingStock(false);
      }
    },
    [dispatch, pagination.current, pagination.pageSize, searchQuery]
  );

  const handleUpdateExpiredDate = useCallback(
    async (values) => {
      try {
        setUpdatingDate(true);
        const isActive = values.quantity > 0 ? values.is_active : false;
        await dispatch(
          updateExpiredDate({
            supplyId: selectedSupply.supply_id,
            expired_date: values.expired_date.format("YYYY-MM-DD"),
            quantity: values.quantity,
            is_active: isActive,
          })
        ).unwrap();
        toast.success("✅ Cập nhật thành công");
        setSelectedSupply(null);
        await dispatch(
          fetchMedicalSupplies({
            page: pagination.current,
            pageSize: pagination.pageSize,
            search: searchQuery,
          })
        );
      } catch (err) {
        message.error(err || "❌ Cập nhật thất bại");
      } finally {
        setUpdatingDate(false);
      }
    },
    [
      dispatch,
      selectedSupply,
      pagination.current,
      pagination.pageSize,
      searchQuery,
    ]
  );

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value.trim());
  }, []);

  const filteredSupplies = useMemo(() => {
    if (!supplies) return [];

    const keyword = searchQuery?.trim().toLowerCase() || "";

    let filtered = supplies.filter(
      (supply) =>
        supply.name?.toLowerCase().includes(keyword) ||
        String(supply.supply_id).includes(keyword)
    );

    if (filterType !== "all") {
      filtered = filtered.filter((supply) => {
        switch (filterType) {
          case "in-stock":
            return supply.is_active && supply.quantity > 0;
          case "out-of-stock":
            return !supply.is_active || supply.quantity === 0;
          case "low-stock":
            return supply.quantity > 0 && supply.quantity < 100;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [supplies, searchQuery, filterType]);

  const renderStatusTag = useCallback((isActive, quantity = null) => {
    let config = statusConfig.active;

    if (quantity !== null) {
      if (quantity === 0 || !isActive) {
        config = statusConfig.inactive;
      } else if (quantity < 50) {
        config = statusConfig.low_stock;
      }
    } else if (!isActive) {
      config = statusConfig.inactive;
    }

    return (
      <Tag
        icon={config.icon}
        style={{
          color: config.color,
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
          border: `1px solid ${config.borderColor}`,
          borderRadius: modernTheme.borderRadius.md,
          padding: "6px 12px",
          fontWeight: "600",
          fontSize: "12px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        {config.text}
      </Tag>
    );
  }, []);

  const columns = useMemo(
    () => [
      {
        title: (
          <div className="flex items-center gap-2">
            <BarcodeOutlined style={{ color: modernTheme.colors.info }} />
            <span className="font-semibold">Mã vật tư</span>
          </div>
        ),
        dataIndex: "supply_id",
        key: "supply_id",
        width: 120,
        align: "center",
        render: (text) => (
          <div className="flex flex-col items-center gap-1">
            <div
              style={{
                background: "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)",
                padding: "8px 12px",
                borderRadius: modernTheme.borderRadius.md,
                border: "1px solid #bae6fd",
              }}
            >
              <Text
                code
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: modernTheme.colors.info,
                }}
              >
                {text}
              </Text>
            </div>
          </div>
        ),
      },
      {
        title: (
          <div className="flex items-center gap-2">
            <TagOutlined style={{ color: modernTheme.colors.success }} />
            <span className="font-semibold">Tên vật tư</span>
          </div>
        ),
        dataIndex: "name",
        key: "name",
        render: (name, record) => (
          <div className="flex items-center gap-3">
            <Avatar
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                boxShadow: `0 4px 12px ${"rgba(245, 158, 11, 0.3)"}`,
              }}
              size={36}
              icon={<SafetyOutlined />}
            />
            <div>
              <div className="flex items-center gap-2">
                <div
                  style={{
                    width: "4px",
                    height: "24px",
                    background: `linear-gradient(135deg, ${modernTheme.colors.success} 0%, #34d399 100%)`,
                    borderRadius: "2px",
                  }}
                />
                <Text
                  strong
                  style={{ color: "#1f2937", fontSize: "14px", ...fontFamily }}
                >
                  {name}
                </Text>
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  fontWeight: "500",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginLeft: "6px",
                  ...fontFamily,
                }}
              >
                {record.type}
              </div>
            </div>
          </div>
        ),
      },
      {
        title: (
          <div className="flex items-center gap-2">
            <MinusSquareOutlined style={{ color: "#ec4899" }} />
            <span className="font-semibold">Đơn vị</span>
          </div>
        ),
        dataIndex: "unit",
        key: "unit",
        align: "center",
        width: 100,
        render: (unit) => (
          <div
            style={{
              background: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",
              padding: "6px 12px",
              borderRadius: modernTheme.borderRadius.md,
              border: "1px solid #f9a8d4",
              fontSize: "11px",
              fontWeight: "600",
              color: "#ec4899",
              textAlign: "center",
              ...fontFamily,
            }}
          >
            {unit}
          </div>
        ),
      },
      {
        title: (
          <div className="flex items-center gap-2">
            <ContainerOutlined style={{ color: "#8b5cf6" }} />
            <span className="font-semibold">Số lượng</span>
          </div>
        ),
        dataIndex: "quantity",
        key: "quantity",
        align: "center",
        width: 140,
        render: (quantity) => (
          <div className="text-center">
            <div
              style={{
                fontSize: "18px",
                fontWeight: "800",
                color:
                  quantity === 0
                    ? modernTheme.colors.error
                    : quantity < 50
                    ? modernTheme.colors.warning
                    : modernTheme.colors.success,
                ...fontFamily,
              }}
            >
              {quantity}
            </div>
          </div>
        ),
      },
      {
        title: (
          <div className="flex items-center gap-2">
            <FileTextOutlined style={{ color: "#06b6d4" }} />
            <span className="font-semibold">Mô tả</span>
          </div>
        ),
        dataIndex: "description",
        key: "description",
        ellipsis: true,
        render: (description) => (
          <Tooltip title={description}>
            <Text
              ellipsis
              style={{
                maxWidth: "200px",
                color: "#6b7280",
                fontSize: "13px",
                lineHeight: "1.5",
                ...fontFamily,
              }}
            >
              {description || "Không có mô tả"}
            </Text>
          </Tooltip>
        ),
      },
      {
        title: (
          <div className="flex items-center gap-2">
            <CalendarOutlined style={{ color: "#f59e0b" }} />
            <span className="font-semibold">Hết hạn</span>
          </div>
        ),
        dataIndex: "expired_date",
        key: "expired_date",
        align: "center",
        width: 140,
        render: (date) => {
          if (!date)
            return (
              <span style={{ color: "#94a3b8", fontSize: "12px" }}>N/A</span>
            );

          let bgColor = "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)";
          let borderColor = "#86efac";
          let textColor = "#166534";

          return (
            <div className="text-center">
              <div
                style={{
                  background: bgColor,
                  padding: "6px 12px",
                  borderRadius: modernTheme.borderRadius.md,
                  border: `1px solid ${borderColor}`,
                  fontSize: "11px",
                  fontWeight: "700",
                  color: textColor,
                  ...fontFamily,
                }}
              >
                {format(parseISO(date), "dd/MM/yyyy")}
              </div>
            </div>
          );
        },
      },
      {
        title: (
          <div className="flex items-center gap-2">
            <CheckCircleOutlined style={{ color: "#06b6d4" }} />
            <span className="font-semibold">Trạng thái</span>
          </div>
        ),
        dataIndex: "is_active",
        key: "status",
        align: "center",
        width: 120,
        render: (value, record) => (
          <div className="flex justify-center">
            {renderStatusTag(value, record.quantity)}
          </div>
        ),
      },
      {
        title: (
          <div className="flex items-center gap-2">
            <EditOutlined style={{ color: "#6b7280" }} />
            <span className="font-semibold">Hành động</span>
          </div>
        ),
        key: "actions",
        align: "center",
        width: 140,
        render: (_, record) => (
          <Space size="small">
            <Tooltip title="Cập nhật">
              <Button
                type="primary"
                icon={<EditOutlined />}
                size="small"
                style={{
                  borderRadius: modernTheme.borderRadius.sm,
                  background: `linear-gradient(135deg, ${modernTheme.colors.warning} 0%, #fbbf24 100%)`,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
                }}
                onClick={() => setSelectedSupply(record)}
              />
            </Tooltip>
            <Tooltip title="Chi tiết">
              <Button
                type="primary"
                icon={<EyeFilled />}
                size="small"
                style={{
                  borderRadius: modernTheme.borderRadius.sm,
                  background: `linear-gradient(135deg, ${modernTheme.colors.info} 0%, #60a5fa 100%)`,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                }}
                onClick={() => setDetailSupply(record)}
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [renderStatusTag]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{
        minHeight: "100vh",
        padding: "24px",
        ...fontFamily,
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          style={gradientHeaderStyle}
        >
          {/* Background decoration */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "200px",
              height: "200px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              transform: "translate(50%, -50%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "150px",
              height: "150px",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "50%",
              transform: "translate(-50%, 50%)",
            }}
          />
          <Row
            align="middle"
            justify="space-between"
            style={{ position: "relative", zIndex: 1 }}
          >
            <Col>
              <div className="flex items-center gap-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: modernTheme.borderRadius.xl,
                    padding: "24px",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                >
                  <IoStorefront style={{ fontSize: "48px", color: "white" }} />
                </motion.div>
                <div>
                  <Title
                    level={1}
                    style={{
                      color: "white",
                      margin: 0,
                      fontSize: "36px",
                      fontWeight: "800",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Kho Vật Tư Y Tế
                  </Title>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.9)",
                      fontSize: "18px",
                      display: "block",
                      marginTop: "8px",
                      fontWeight: "500",
                    }}
                  >
                    Quản lý thông minh & theo dõi hiệu quả vật tư y tế
                  </Text>
                </div>
              </div>
            </Col>
            <Col>
              <Space size="middle">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={showStockModal}
                  size="large"
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    borderColor: "rgba(255,255,255,0.3)",
                    borderRadius: modernTheme.borderRadius.md,
                    height: "48px",
                    paddingLeft: "24px",
                    paddingRight: "24px",
                    fontWeight: "600",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 8px 32px rgba(255,255,255,0.2)",
                  }}
                >
                  Nhập Kho Mới
                </Button>
              </Space>
            </Col>
          </Row>
        </motion.div>

        {/* Enhanced Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
            <Col xs={24} sm={12} md={6}>
              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
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
                    title={
                      <span
                        style={{
                          color: "#1e40af",
                          fontWeight: "600",
                          fontSize: "14px",
                        }}
                      >
                        Tổng vật tư
                      </span>
                    }
                    value={statistics.total}
                    prefix={
                      <div
                        style={{
                          background:
                            "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                          borderRadius: "8px",
                          padding: "8px",
                          display: "inline-flex",
                          marginRight: "8px",
                        }}
                      >
                        <MdInventory
                          style={{ color: "white", fontSize: "16px" }}
                        />
                      </div>
                    }
                    valueStyle={{
                      color: "#1e40af",
                      fontWeight: "800",
                      fontSize: "32px",
                    }}
                  />
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
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
                    title={
                      <span
                        style={{
                          color: "#166534",
                          fontWeight: "600",
                          fontSize: "14px",
                        }}
                      >
                        Còn hàng
                      </span>
                    }
                    value={statistics.inStock}
                    prefix={
                      <div
                        style={{
                          background:
                            "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                          borderRadius: "8px",
                          padding: "8px",
                          display: "inline-flex",
                          marginRight: "8px",
                        }}
                      >
                        <CheckCircleOutlined
                          style={{ color: "white", fontSize: "16px" }}
                        />
                      </div>
                    }
                    valueStyle={{
                      color: "#166534",
                      fontWeight: "800",
                      fontSize: "32px",
                    }}
                  />
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
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
                    title={
                      <span
                        style={{
                          color: "#92400e",
                          fontWeight: "600",
                          fontSize: "14px",
                        }}
                      >
                        Sắp hết
                      </span>
                    }
                    value={statistics.lowStock}
                    prefix={
                      <div
                        style={{
                          background:
                            "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                          borderRadius: "8px",
                          padding: "8px",
                          display: "inline-flex",
                          marginRight: "8px",
                        }}
                      >
                        <WarningOutlined
                          style={{ color: "white", fontSize: "16px" }}
                        />
                      </div>
                    }
                    valueStyle={{
                      color: "#92400e",
                      fontWeight: "800",
                      fontSize: "32px",
                    }}
                  />
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                <Card
                  style={{
                    ...modernCardStyle,
                    background:
                      "linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)",
                    border: "1px solid #fca5a5",
                  }}
                  bodyStyle={{ padding: "24px" }}
                >
                  <Statistic
                    title={
                      <span
                        style={{
                          color: "#991b1b",
                          fontWeight: "600",
                          fontSize: "14px",
                        }}
                      >
                        Hết hàng
                      </span>
                    }
                    value={statistics.outOfStock}
                    prefix={
                      <div
                        style={{
                          background:
                            "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                          borderRadius: "8px",
                          padding: "8px",
                          display: "inline-flex",
                          marginRight: "8px",
                        }}
                      >
                        <CloseCircleOutlined
                          style={{ color: "white", fontSize: "16px" }}
                        />
                      </div>
                    }
                    valueStyle={{
                      color: "#991b1b",
                      fontWeight: "800",
                      fontSize: "32px",
                    }}
                  />
                </Card>
              </motion.div>
            </Col>
          </Row>
        </motion.div>

        {/* Enhanced Main Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Card style={modernCardStyle} bodyStyle={{ padding: "0" }}>
            {/* Enhanced Filters */}
            <div style={{ padding: "32px 32px 0 32px" }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Title
                    level={3}
                    style={{ margin: 0, color: "#1f2937", fontWeight: "700" }}
                  >
                    Danh sách vật tư y tế
                  </Title>
                  <Text
                    style={{
                      color: "#6b7280",
                      fontSize: "14px",
                      marginTop: "4px",
                    }}
                  >
                    Quản lý và theo dõi tất cả các vật tư y tế trong kho
                  </Text>
                </div>
                <div className="flex items-center gap-2">
                  <FilterOutlined style={{ color: "#6b7280" }} />
                  <Text
                    style={{
                      color: "#6b7280",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    {filteredSupplies.length} kết quả
                  </Text>
                </div>
              </div>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={8}>
                  <Input
                    placeholder="Tìm kiếm theo tên, mã, mô tả..."
                    style={{
                      borderRadius: modernTheme.borderRadius.lg,
                      height: "48px",
                      fontSize: "14px",
                    }}
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Select
                    placeholder="Trạng thái"
                    onChange={setFilterType}
                    allowClear
                    style={{ width: "100%", height: "48px" }}
                    value={filterType}
                  >
                    <Option value="all">Tất cả</Option>
                    <Option value="in-stock">Còn hàng</Option>
                    <Option value="low-stock">Sắp hết</Option>
                    <Option value="out-of-stock">Hết hàng</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={4}></Col>
              </Row>
            </div>

            {/* Enhanced Table */}
            <div style={{ padding: "32px" }}>
              <Table
                columns={columns}
                dataSource={filteredSupplies}
                rowKey="supply_id"
                pagination={{
                  ...pagination,
                  showQuickJumper: true,
                  showTotal: (total, range) => (
                    <span style={{ fontSize: "13px", color: "#6b7280" }}>
                      Hiển thị {range[0]}-{range[1]} trong tổng số {total} vật
                      tư
                    </span>
                  ),
                  locale: {
                    jump_to: "Tới trang", // nhãn “Jump to” của quick jumper
                    page: "trang", // nhãn “Page” sau ô input
                  },
                }}
                onChange={handleTableChange}
                loading={loading}
                locale={{
                  emptyText: (
                    <div style={{ textAlign: "center", padding: "60px 20px" }}>
                      <div
                        style={{
                          background:
                            "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                          borderRadius: "50%",
                          width: "100px",
                          height: "100px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 24px",
                        }}
                      >
                        <MdOutlineInventory2
                          style={{ fontSize: "40px", color: "#9ca3af" }}
                        />
                      </div>
                      <Title
                        level={4}
                        style={{ color: "#6b7280", marginBottom: "8px" }}
                      >
                        Không tìm thấy vật tư nào
                      </Title>
                      <Text style={{ color: "#9ca3af", fontSize: "14px" }}>
                        Thử thay đổi bộ lọc hoặc thêm vật tư mới
                      </Text>
                    </div>
                  ),
                }}
                style={{
                  borderRadius: modernTheme.borderRadius.lg,
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                }}
                components={{
                  body: {
                    row: (props) => (
                      <AnimatePresence>
                        <MotionRow {...props} />
                      </AnimatePresence>
                    ),
                  },
                }}
                size="middle"
                scroll={{ x: 1200 }}
              />
            </div>
          </Card>
        </motion.div>

        {/* Enhanced Add Stock Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3">
              <div
                style={{
                  background: `linear-gradient(135deg, ${modernTheme.colors.success} 0%, #34d399 100%)`,
                  borderRadius: modernTheme.borderRadius.md,
                  padding: "12px",
                  boxShadow: "0 8px 32px rgba(16, 185, 129, 0.3)",
                }}
              >
                <PlusOutlined style={{ color: "white", fontSize: "20px" }} />
              </div>
              <div>
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#1f2937",
                  }}
                >
                  Thêm Vật Tư Mới
                </span>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginTop: "2px",
                  }}
                >
                  Nhập thông tin vật tư y tế mới vào kho
                </div>
              </div>
            </div>
          }
          open={isStockModalVisible}
          footer={null}
          onCancel={() => setIsStockModalVisible(false)}
          width={800}
          style={{ top: 20 }}
          styles={{
            content: {
              borderRadius: modernTheme.borderRadius.xl,
              boxShadow: modernTheme.shadows.card,
            },
          }}
        >
          <Divider style={{ margin: "24px 0" }} />
          <Form
            form={addForm}
            layout="vertical"
            onFinish={handleAddNewSubmit}
            style={{ marginTop: "24px" }}
          >
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  name="name"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <TagOutlined
                        style={{ color: modernTheme.colors.success }}
                      />
                      Tên vật tư
                    </span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng nhập tên vật tư" },
                  ]}
                >
                  <Input
                    placeholder="Nhập tên vật tư y tế"
                    style={{
                      borderRadius: modernTheme.borderRadius.md,
                      height: "48px",
                      fontSize: "14px",
                      border: "2px solid #f3f4f6",
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <FolderOutlined
                        style={{ color: modernTheme.colors.warning }}
                      />
                      Loại vật tư
                    </span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng chọn loại vật tư" },
                  ]}
                >
                  <Select
                    placeholder="Chọn loại vật tư"
                    style={{ height: "48px", fontSize: "14px" }}
                  >
                    <Option value="Thuốc">💊 Thuốc</Option>
                    <Option value="Vật tư">🧰 Vật tư y tế</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="unit"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <MinusSquareOutlined style={{ color: "#ec4899" }} />
                      Đơn vị tính
                    </span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng chọn đơn vị tính" },
                  ]}
                >
                  <Select
                    placeholder="Chọn đơn vị"
                    style={{ height: "48px", fontSize: "14px" }}
                  >
                    <Option value="viên">💊 Viên</Option>
                    <Option value="vỉ">🧃 Vỉ</Option>
                    <Option value="hộp">📦 Hộp</Option>
                    <Option value="chai">🍼 Chai</Option>
                    <Option value="túi">👜 Túi</Option>
                    <Option value="cái">🔢 Cái</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="quantity"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <ContainerOutlined style={{ color: "#8b5cf6" }} />
                      Số lượng
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      type: "number",
                      min: 1,
                      message: "Vui lòng nhập số lượng (ít nhất 1)",
                    },
                  ]}
                >
                  <InputNumber
                    min={1}
                    placeholder="Nhập số lượng"
                    style={{
                      width: "100%",
                      borderRadius: modernTheme.borderRadius.md,
                      height: "48px",
                      fontSize: "14px",
                      border: "2px solid #f3f4f6",
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="expired_date"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <CalendarOutlined style={{ color: "#f59e0b" }} />
                      Ngày hết hạn
                    </span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày hết hạn" },
                  ]}
                >
                  <DatePicker
                    style={{
                      width: "100%",
                      borderRadius: modernTheme.borderRadius.md,
                      height: "48px",
                      fontSize: "14px",
                      border: "2px solid #f3f4f6",
                    }}
                    disabledDate={(d) => d && d < dayjs().startOf("day")}
                    placeholder="Chọn ngày hết hạn"
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
                  name="description"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <FileTextOutlined style={{ color: "#06b6d4" }} />
                      Mô tả chi tiết
                    </span>
                  }
                >
                  <TextArea
                    rows={3}
                    placeholder="Ghi chú thêm về vật tư (tùy chọn)..."
                    style={{
                      borderRadius: modernTheme.borderRadius.md,
                      fontSize: "14px",
                      border: "2px solid #f3f4f6",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Divider style={{ margin: "32px 0" }} />
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setIsStockModalVisible(false)}
                size="large"
                style={{
                  borderRadius: modernTheme.borderRadius.md,
                  height: "48px",
                  paddingLeft: "24px",
                  paddingRight: "24px",
                  fontWeight: "600",
                  border: "2px solid #f3f4f6",
                }}
              >
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmittingStock}
                size="large"
                style={{
                  background: `linear-gradient(135deg, ${modernTheme.colors.success} 0%, #34d399 100%)`,
                  borderRadius: modernTheme.borderRadius.md,
                  height: "48px",
                  paddingLeft: "32px",
                  paddingRight: "32px",
                  fontWeight: "700",
                  border: "none",
                  boxShadow: "0 8px 32px rgba(16, 185, 129, 0.3)",
                }}
              >
                {isSubmittingStock ? "Đang thêm..." : "Thêm Vật Tư"}
              </Button>
            </div>
            <Form.Item name="is_active" initialValue={status} hidden>
              <Input />
            </Form.Item>
          </Form>
        </Modal>

        {/* Enhanced Update Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3">
              <div
                style={{
                  background: `linear-gradient(135deg, ${modernTheme.colors.warning} 0%, #fbbf24 100%)`,
                  borderRadius: modernTheme.borderRadius.md,
                  padding: "12px",
                  boxShadow: "0 8px 32px rgba(245, 158, 11, 0.3)",
                }}
              >
                <EditOutlined style={{ color: "white", fontSize: "20px" }} />
              </div>
              <div>
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#1f2937",
                  }}
                >
                  Cập Nhật Vật Tư
                </span>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginTop: "2px",
                  }}
                >
                  Cập nhật thông tin vật tư y tế
                </div>
              </div>
            </div>
          }
          open={!!selectedSupply}
          onCancel={() => setSelectedSupply(null)}
          footer={null}
          width={600}
          styles={{
            content: {
              borderRadius: modernTheme.borderRadius.xl,
              boxShadow: modernTheme.shadows.card,
            },
          }}
        >
          <Divider style={{ margin: "24px 0" }} />
          <Form
            form={updateForm}
            layout="vertical"
            onFinish={handleUpdateExpiredDate}
            initialValues={{
              expired_date: selectedSupply?.expired_date
                ? dayjs(selectedSupply.expired_date)
                : null,
              quantity: selectedSupply?.quantity ?? 0,
              is_active: selectedSupply?.is_active ?? true,
            }}
            style={{ marginTop: "24px" }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="quantity"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <ContainerOutlined style={{ color: "#8b5cf6" }} />
                      Số lượng mới
                    </span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng nhập số lượng" },
                  ]}
                >
                  <InputNumber
                    min={0}
                    style={{
                      width: "100%",
                      borderRadius: modernTheme.borderRadius.md,
                      height: "48px",
                      fontSize: "14px",
                      border: "2px solid #f3f4f6",
                    }}
                    placeholder="Nhập số lượng mới"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="expired_date"
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <CalendarOutlined style={{ color: "#f59e0b" }} />
                      Ngày hết hạn mới
                    </span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày hết hạn" },
                  ]}
                >
                  <DatePicker
                    style={{
                      width: "100%",
                      borderRadius: modernTheme.borderRadius.md,
                      height: "48px",
                      fontSize: "14px",
                      border: "2px solid #f3f4f6",
                    }}
                    disabledDate={(d) => d && d < dayjs().startOf("day")}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="is_active" hidden>
              <Select>
                <Select.Option value={true}>Còn hàng</Select.Option>
                <Select.Option value={false}>Hết hàng</Select.Option>
              </Select>
            </Form.Item>
            <Divider style={{ margin: "32px 0" }} />
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setSelectedSupply(null)}
                size="large"
                style={{
                  borderRadius: modernTheme.borderRadius.md,
                  height: "48px",
                  paddingLeft: "24px",
                  paddingRight: "24px",
                  fontWeight: "600",
                  border: "2px solid #f3f4f6",
                }}
              >
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={updatingDate}
                size="large"
                style={{
                  background: `linear-gradient(135deg, ${modernTheme.colors.warning} 0%, #fbbf24 100%)`,
                  borderRadius: modernTheme.borderRadius.md,
                  height: "48px",
                  paddingLeft: "32px",
                  paddingRight: "32px",
                  fontWeight: "700",
                  border: "none",
                  boxShadow: "0 8px 32px rgba(245, 158, 11, 0.3)",
                }}
              >
                {updatingDate ? "Đang cập nhật..." : "Cập Nhật"}
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Enhanced Detail Modal */}
        <Modal
          title={null}
          open={!!detailSupply}
          onCancel={() => setDetailSupply(null)}
          footer={[
            <Button
              key="close"
              type="primary"
              size="large"
              style={{
                background: `linear-gradient(135deg, ${modernTheme.colors.info} 0%, #60a5fa 100%)`,
                borderRadius: modernTheme.borderRadius.md,
                height: "48px",
                paddingLeft: "32px",
                paddingRight: "32px",
                fontWeight: "700",
                border: "none",
                boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)",
              }}
              onClick={() => setDetailSupply(null)}
            >
              Đóng
            </Button>,
          ]}
          width={800}
          style={{ top: 20 }}
          styles={{
            content: {
              borderRadius: modernTheme.borderRadius.xl,
              boxShadow: modernTheme.shadows.card,
            },
          }}
        >
          {detailSupply && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {/* Enhanced Header */}
              <div
                style={{
                  background: `linear-gradient(135deg, ${modernTheme.colors.info} 0%, #60a5fa 100%)`,
                  borderRadius: modernTheme.borderRadius.lg,
                  padding: "32px",
                  color: "white",
                  marginBottom: "32px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Background decoration */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "120px",
                    height: "120px",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "50%",
                    transform: "translate(30%, -30%)",
                  }}
                />
                <div
                  className="flex items-center gap-4"
                  style={{ position: "relative", zIndex: 1 }}
                >
                  <div
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: modernTheme.borderRadius.lg,
                      padding: "16px",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <MdOutlineInventory2
                      style={{ fontSize: "32px", color: "white" }}
                    />
                  </div>
                  <div>
                    <Title
                      level={2}
                      style={{ color: "white", margin: 0, fontWeight: "800" }}
                    >
                      {detailSupply.name}
                    </Title>
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.9)",
                        fontSize: "16px",
                        fontWeight: "500",
                      }}
                    >
                      Mã vật tư: {detailSupply.supply_id}
                    </Text>
                  </div>
                </div>
              </div>

              {/* Status Alert */}
              <Alert
                message="Thông tin vật tư"
                description={`${detailSupply.type} - ${detailSupply.unit} - Số lượng: ${detailSupply.quantity}`}
                type="info"
                showIcon
                style={{
                  borderRadius: modernTheme.borderRadius.lg,
                  marginBottom: "32px",
                  border: `1px solid ${modernTheme.colors.info}`,
                  background:
                    "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                }}
              />

              {/* Enhanced Details */}
              <Card
                style={{
                  borderRadius: modernTheme.borderRadius.lg,
                  border: "1px solid #f3f4f6",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <Row gutter={[24, 24]}>
                  <Col span={12}>
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        style={{
                          background: `linear-gradient(135deg, ${modernTheme.colors.success} 0%, #34d399 100%)`,
                          borderRadius: modernTheme.borderRadius.md,
                          padding: "8px",
                        }}
                      >
                        <TagOutlined
                          style={{ color: "white", fontSize: "16px" }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: "700",
                          color: "#1f2937",
                        }}
                      >
                        Thông tin cơ bản
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Text style={{ color: "#6b7280", fontWeight: "600" }}>
                          Loại:
                        </Text>
                        <Tag
                          style={{
                            borderRadius: modernTheme.borderRadius.sm,
                            fontWeight: "600",
                            fontSize: "12px",
                            border: "1px solid",
                            borderColor:
                              detailSupply.type === "Thuốc"
                                ? "#86efac"
                                : "#fbbf24",
                            background:
                              detailSupply.type === "Thuốc"
                                ? "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)"
                                : "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                            color:
                              detailSupply.type === "Thuốc"
                                ? "#166534"
                                : "#92400e",
                          }}
                        >
                          {detailSupply.type === "Thuốc" ? "💊" : "🧰"}{" "}
                          {detailSupply.type}
                        </Tag>
                      </div>
                      <div className="flex justify-between">
                        <Text style={{ color: "#6b7280", fontWeight: "600" }}>
                          Đơn vị:
                        </Text>
                        <Text style={{ fontWeight: "600", color: "#1f2937" }}>
                          {detailSupply.unit}
                        </Text>
                      </div>
                      <div className="flex justify-between">
                        <Text style={{ color: "#6b7280", fontWeight: "600" }}>
                          Số lượng:
                        </Text>
                        <div className="flex items-center gap-2">
                          <Text
                            style={{
                              fontWeight: "800",
                              fontSize: "16px",
                              color:
                                detailSupply.quantity === 0
                                  ? modernTheme.colors.error
                                  : detailSupply.quantity < 10
                                  ? modernTheme.colors.warning
                                  : modernTheme.colors.success,
                            }}
                          >
                            {detailSupply.quantity}
                          </Text>
                          <Progress
                            percent={Math.min(
                              (detailSupply.quantity / 100) * 100,
                              100
                            )}
                            size="small"
                            strokeColor={
                              detailSupply.quantity === 0
                                ? modernTheme.colors.error
                                : detailSupply.quantity < 10
                                ? modernTheme.colors.warning
                                : modernTheme.colors.success
                            }
                            showInfo={false}
                            style={{ width: 80 }}
                          />
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        style={{
                          background: `linear-gradient(135deg, ${modernTheme.colors.warning} 0%, #fbbf24 100%)`,
                          borderRadius: modernTheme.borderRadius.md,
                          padding: "8px",
                        }}
                      >
                        <CalendarOutlined
                          style={{ color: "white", fontSize: "16px" }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: "700",
                          color: "#1f2937",
                        }}
                      >
                        Thông tin thời gian
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Text style={{ color: "#6b7280", fontWeight: "600" }}>
                          Hết hạn:
                        </Text>
                        <Text style={{ fontWeight: "600", color: "#1f2937" }}>
                          {detailSupply.expired_date
                            ? format(
                                parseISO(detailSupply.expired_date),
                                "dd/MM/yyyy"
                              )
                            : "N/A"}
                        </Text>
                      </div>
                      <div className="flex justify-between">
                        <Text style={{ color: "#6b7280", fontWeight: "600" }}>
                          Trạng thái:
                        </Text>
                        <div>
                          {renderStatusTag(
                            detailSupply.is_active,
                            detailSupply.quantity
                          )}
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>

                <Divider style={{ margin: "24px 0", borderColor: "#f3f4f6" }} />

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      style={{
                        background: `linear-gradient(135deg, ${modernTheme.colors.info} 0%, #60a5fa 100%)`,
                        borderRadius: modernTheme.borderRadius.md,
                        padding: "8px",
                      }}
                    >
                      <InfoCircleOutlined
                        style={{ color: "white", fontSize: "16px" }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "#1f2937",
                      }}
                    >
                      Mô tả chi tiết
                    </span>
                  </div>
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                      padding: "16px",
                      borderRadius: modernTheme.borderRadius.md,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Text
                      style={{
                        color: "#374151",
                        lineHeight: "1.6",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      {detailSupply.description ||
                        "Không có mô tả chi tiết cho vật tư này."}
                    </Text>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </Modal>
      </div>

      {/* Enhanced Custom Styles */}
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
          border-color: ${modernTheme.colors.info} !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
        }
        .ant-select-focused .ant-select-selector {
          border-color: ${modernTheme.colors.info} !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
        }
      `}</style>
    </motion.div>
  );
}
