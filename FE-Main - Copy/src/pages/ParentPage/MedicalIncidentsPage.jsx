import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Typography,
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Timeline,
  Select,
  Input,
  Empty,
  Alert,
  Spin,
  Divider,
  Badge,
  Tooltip,
  message,
  notification,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  UserOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  getParentIncidents,
  getIncidentDetails,
  getParentChildren,
} from "../../redux/parent/parentSlice";

const { Title, Text } = Typography;
const { Option } = Select;

// No mock data - we'll use only real API data

const MedicalIncidentsPage = () => {
  const dispatch = useDispatch();
  const { incidents, selectedIncident, loading, error } = useSelector(
    (state) => state.parent
  );
  const { children } = useSelector((state) => state.parent);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [filters, setFilters] = useState({
    student: "all",
    severity: "all",
    search: "",
  });
  const [dataSource, setDataSource] = useState([]);

  // Fetch incidents data when component mounts
  useEffect(() => {
    dispatch(getParentIncidents())
      .unwrap()
      .then((data) => {
        console.log("Successfully fetched incidents:", data);
        // Check if data is in expected format
        if (Array.isArray(data)) {
          setDataSource(data);
        } else if (data && Array.isArray(data.data)) {
          setDataSource(data.data);
        } else if (data && typeof data === "object") {
          // If data is an object but not an array, try to extract data property
          const extractedData = data.data || data.incidents || data.items || [];
          setDataSource(
            Array.isArray(extractedData) ? extractedData : [extractedData]
          );
        } else {
          console.error("Unexpected data format:", data);
          setDataSource([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching incidents:", error);
        setDataSource([]);
      });
  }, [dispatch]);

  // Update data source when incidents from API change
  useEffect(() => {
    if (incidents) {
      if (Array.isArray(incidents)) {
        setDataSource(incidents);
      } else if (incidents && Array.isArray(incidents.data)) {
        setDataSource(incidents.data);
      } else if (incidents && typeof incidents === "object") {
        // Try to extract data from different possible properties
        const extractedData =
          incidents.data || incidents.incidents || incidents.items || [];
        setDataSource(
          Array.isArray(extractedData) ? extractedData : [extractedData]
        );
      }
    }
  }, [incidents]);

  // Fetch children data if not available
  useEffect(() => {
    if (!children || children.length === 0) {
      console.log("Fetching children data for filters");
      dispatch(getParentChildren())
        .unwrap()
        .then((data) => {
          console.log("Successfully fetched children data:", data);
        })
        .catch((error) => {
          console.error("Error fetching children data:", error);
        });
    }
  }, [children, dispatch]);

  // Filter data based on selected filters
  const filteredData = dataSource.filter((incident) => {
    return (
      (filters.student === "all" ||
        incident.student_code === filters.student) &&
      (filters.severity === "all" ||
        incident.severity_level === filters.severity) &&
      (incident.student_name
        ?.toLowerCase()
        .includes(filters.search.toLowerCase()) ||
        incident.description
          ?.toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        incident.medication_used
          ?.toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        incident.status?.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  const showIncidentDetails = (incidentId) => {
    setSelectedIncidentId(incidentId);
    console.log(`Requesting details for incident ID: ${incidentId}`);

    // First show the modal with basic info while loading
    setIsModalVisible(true);

    // Get the incident from the current data source
    const basicIncident = dataSource.find(
      (incident) => incident.event_id === incidentId
    );
    if (basicIncident) {
      console.log("Found basic incident data:", basicIncident);

      // Create timeline data from the incident
      const timeline = [];

      // Add reported event
      if (basicIncident.reported_at) {
        timeline.push({
          time:
            formatDate(basicIncident.reported_at) +
            " " +
            formatTime(basicIncident.reported_at),
          action: "Báo cáo sự cố",
          description: basicIncident.description,
          staff: basicIncident.nurse_name,
        });
      }

      // Add occurred event (if different from reported)
      if (
        basicIncident.occurred_at &&
        basicIncident.occurred_at !== basicIncident.reported_at
      ) {
        timeline.push({
          time:
            formatDate(basicIncident.occurred_at) +
            " " +
            formatTime(basicIncident.occurred_at),
          action: "Xảy ra sự cố",
          description: basicIncident.description,
        });
      }

      // Add resolution event if resolved
      if (basicIncident.resolved_at) {
        timeline.push({
          time:
            formatDate(basicIncident.resolved_at) +
            " " +
            formatTime(basicIncident.resolved_at),
          action: "Đã xử lý sự cố",
          description: basicIncident.resolution_notes || "Sự cố đã được xử lý",
          staff: basicIncident.nurse_name,
        });
      }

      // Add timeline to the incident data
      const enhancedIncident = {
        ...basicIncident,
        timeline: timeline,
        // Map API fields to UI fields
        severity: basicIncident.severity_level,
        type: basicIncident.description?.substring(0, 30),
        date: formatDate(basicIncident.occurred_at),
        time: formatTime(basicIncident.occurred_at),
        notes: basicIncident.resolution_notes,
        treatment: basicIncident.medication_used,
      };

      // Set the basic incident data first so we have something to show
      dispatch({
        type: "parent/setSelectedIncident",
        payload: enhancedIncident,
      });
    }

    // Try both Redux thunk and direct API call for maximum reliability

    // 1. Try Redux thunk approach
    dispatch(getIncidentDetails(incidentId))
      .unwrap()
      .then((data) => {
        console.log("Successfully fetched incident details via Redux:", data);

        // Try different ways to extract the incident data
        let incidentData = data;

        // If data is an object with a data property
        if (data && typeof data === "object") {
          if (data.data) {
            incidentData = data.data;
          } else if (data.incident) {
            incidentData = data.incident;
          }
        }

        console.log("Processed incident data:", incidentData);

        // Create timeline data from the incident
        const timeline = [];

        // Add reported event
        if (incidentData.reported_at) {
          timeline.push({
            time:
              formatDate(incidentData.reported_at) +
              " " +
              formatTime(incidentData.reported_at),
            action: "Báo cáo sự cố",
            description: incidentData.description,
            staff: incidentData.nurse_name,
          });
        }

        // Add occurred event (if different from reported)
        if (
          incidentData.occurred_at &&
          incidentData.occurred_at !== incidentData.reported_at
        ) {
          timeline.push({
            time:
              formatDate(incidentData.occurred_at) +
              " " +
              formatTime(incidentData.occurred_at),
            action: "Xảy ra sự cố",
            description: incidentData.description,
          });
        }

        // Add resolution event if resolved
        if (incidentData.resolved_at) {
          timeline.push({
            time:
              formatDate(incidentData.resolved_at) +
              " " +
              formatTime(incidentData.resolved_at),
            action: "Đã xử lý sự cố",
            description: incidentData.resolution_notes || "Sự cố đã được xử lý",
            staff: incidentData.nurse_name,
          });
        }

        // Add timeline to the incident data
        const enhancedIncident = {
          ...incidentData,
          timeline: timeline,
          // Map API fields to UI fields
          severity: incidentData.severity_level,
          type: incidentData.description?.substring(0, 30),
          date: formatDate(incidentData.occurred_at),
          time: formatTime(incidentData.occurred_at),
          notes: incidentData.resolution_notes,
          treatment: incidentData.medication_used,
        };

        // Update the selected incident in Redux
        dispatch({
          type: "parent/setSelectedIncident",
          payload: enhancedIncident,
        });
      })
      .catch((error) => {
        console.error("Error fetching incident details via Redux:", error);

        // 2. If Redux approach fails, try direct API call as fallback
        console.log("Trying direct API call as fallback");
        testDirectApiCall(incidentId);

        // If we have basic incident data, keep using that
        if (!selectedIncident && basicIncident) {
          dispatch({
            type: "parent/setSelectedIncident",
            payload: basicIncident,
          });
        }
      });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Get severity tag color
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "nặng":
        return "error";
      case "trung bình":
        return "warning";
      case "nhẹ":
        return "success";
      default:
        return "default";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "đang xử lý":
        return <ClockCircleOutlined style={{ color: "#1890ff" }} />;
      case "đã xử lý":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "mới":
        return <ExclamationCircleOutlined style={{ color: "#faad14" }} />;
      default:
        return <ExclamationCircleOutlined style={{ color: "#faad14" }} />;
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Format time function
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns = [
    {
      title: "Học sinh",
      dataIndex: "student_name",
      key: "student_name",
      render: (text, record) => (
        <Tooltip title={`Mã học sinh: ${record.student_code || "N/A"}`}>
          <span style={{ fontWeight: "bold" }}>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Ngày",
      dataIndex: "occurred_at",
      key: "occurred_at",
      render: (text) => (
        <Tooltip title={formatTime(text)}>
          <span>
            {formatDate(text)}
            <span style={{ color: "#888", marginLeft: 5 }}>
              ({formatTime(text)})
            </span>
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Loại sự cố",
      dataIndex: "description",
      key: "description",
      render: (description) => (
        <Tooltip title={description}>
          <Tag color="blue">
            {description?.length > 20
              ? description.substring(0, 20) + "..."
              : description}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: "Mức độ",
      dataIndex: "severity_level",
      key: "severity_level",
      render: (severity) => (
        <Tag color={getSeverityColor(severity)}>
          {severity === "Nặng" && <Badge status="error" />}
          {severity === "Trung bình" && <Badge status="warning" />}
          {severity === "Nhẹ" && <Badge status="success" />}
          {severity}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let displayStatus;
        let statusColor;

        switch (status) {
          case "IN_PROGRESS":
            displayStatus = "Đang xử lý";
            statusColor = "#1890ff";
            break;
          case "RESOLVED":
            displayStatus = "Đã xử lý";
            statusColor = "#52c41a";
            break;
          case "NEW":
            displayStatus = "Mới";
            statusColor = "#faad14";
            break;
          default:
            displayStatus = status;
            statusColor = "#999";
        }

        return (
          <Space>
            {getStatusIcon(displayStatus)}
            <span
              style={{
                fontWeight: status === "IN_PROGRESS" ? "bold" : "normal",
                color: statusColor,
              }}
            >
              {displayStatus}
            </span>
          </Space>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<SearchOutlined />}
          onClick={() => showIncidentDetails(record.event_id)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  // Get current incident from redux state or local data
  const currentIncident =
    selectedIncident ||
    dataSource.find((incident) => incident.id === selectedIncidentId);

  // Debug information
  useEffect(() => {
    console.log("Current Redux state - incidents:", incidents);
    console.log("Current Redux state - selectedIncident:", selectedIncident);
    console.log("Current dataSource:", dataSource);
  }, [incidents, selectedIncident, dataSource]);

  // Hàm gọi API lấy sự cố theo ID học sinh
  // API Endpoint: GET /api/parent/incidents/:student_id
  const fetchIncidentsByStudentId = (studentId) => {
    console.log(`Fetching incidents for student ID: ${studentId}`);
    const token = localStorage.getItem("accessToken");

    // Hiển thị trạng thái đang tải
    dispatch({ type: "parent/setLoading", payload: true });

    // Gọi API để lấy dữ liệu sự cố theo ID học sinh
    // Đường dẫn: /api/parent/incidents/:student_id
    fetch(`http://192.168.1.166:3000/api/parent/incidents/${studentId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        console.log("Student incidents API response status:", response.status);

        // Xử lý trường hợp đặc biệt khi không có sự cố nào (404)
        if (response.status === 404) {
          setDataSource([]);
          message.info(`Học sinh ${studentId} không có sự cố y tế nào`);
          dispatch({ type: "parent/setLoading", payload: false });
          return null; // Bỏ qua bước parse JSON
        }

        if (!response.ok) {
          throw new Error(`API trả về mã lỗi: ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        // Nếu trả về null từ bước trước, bỏ qua xử lý
        if (data === null) return;

        console.log("Student incidents API data:", data);
        dispatch({ type: "parent/setLoading", payload: false });

        // Xử lý dữ liệu trả về
        if (data) {
          let processedData = data;

          // Nếu data có thuộc tính data, lấy data đó
          if (data.data) {
            processedData = data.data;
          }

          // Nếu processedData là mảng, cập nhật dataSource
          if (Array.isArray(processedData)) {
            setDataSource(processedData);
            message.success(
              `Đã tải ${processedData.length} sự cố y tế cho học sinh ${studentId}`
            );
          }
          // Nếu processedData là object, đưa vào mảng rồi cập nhật dataSource
          else if (processedData && typeof processedData === "object") {
            setDataSource([processedData]);
            message.success(`Đã tải 1 sự cố y tế cho học sinh ${studentId}`);
          }
          // Nếu không có dữ liệu
          else {
            setDataSource([]);
            message.info(
              `Không tìm thấy sự cố y tế nào cho học sinh ${studentId}`
            );
          }
        } else {
          setDataSource([]);
          message.info(`Không có dữ liệu cho học sinh ${studentId}`);
        }
      })
      .catch((error) => {
        console.error("Student incidents API error:", error);
        dispatch({ type: "parent/setLoading", payload: false });
        message.error(`Lỗi khi tải dữ liệu: ${error.message}`);

        // Nếu có lỗi, hiển thị trạng thái trống
        setDataSource([]);
      });
  };

  // Kiểm tra API lấy sự cố theo ID học sinh
  // API Endpoint: GET /api/parent/incidents/:student_id
  const testStudentIncidentsApi = (studentId) => {
    console.log(`Testing API for student ID: ${studentId}`);
    const token = localStorage.getItem("accessToken");

    message.loading(`Đang thử API cho học sinh ${studentId}...`, 1);

    // Gọi API trực tiếp
    // Đường dẫn: /api/parent/incidents/:student_id
    fetch(`http://192.168.1.166:3000/api/parent/incidents/${studentId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        console.log("API response status:", response.status);

        if (response.status === 404) {
          message.info(`Học sinh ${studentId} không có sự cố y tế nào`);
          return null;
        }

        if (!response.ok) {
          throw new Error(`API trả về mã lỗi: ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        if (data === null) return;

        console.log("API response data:", data);
        message.success(
          `API trả về dữ liệu thành công cho học sinh ${studentId}`
        );

        // Hiển thị thông tin về dữ liệu trả về
        if (Array.isArray(data)) {
          message.info(`Có ${data.length} sự cố y tế được tìm thấy`);
        } else if (data && data.data && Array.isArray(data.data)) {
          message.info(`Có ${data.data.length} sự cố y tế được tìm thấy`);
        } else {
          message.info("Dữ liệu trả về không phải là mảng");
        }
      })
      .catch((error) => {
        console.error("API call error:", error);
        message.error(`Lỗi khi gọi API: ${error.message}`);
      });
  };

  // Direct API call for debugging
  // API Endpoint: GET /api/parent/incidents/:incident_id
  const testDirectApiCall = (incidentId) => {
    console.log(`Making direct API call for incident ID: ${incidentId}`);
    const token = localStorage.getItem("accessToken");

    message.loading("Đang tải dữ liệu chi tiết sự cố...");

    // Make a direct fetch call to test the API
    // Đường dẫn: /api/parent/incidents/:incident_id
    fetch(`http://192.168.1.166:3000/api/parent/incidents/${incidentId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        console.log("Direct API response status:", response.status);
        if (!response.ok) {
          throw new Error(`API trả về mã lỗi: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Direct API response data:", data);

        // Process the data
        let incidentData = data;
        if (data && data.data) {
          incidentData = data.data;
        }

        // Create timeline data from the incident
        const timeline = [];

        // Add reported event
        if (incidentData.reported_at) {
          timeline.push({
            time:
              formatDate(incidentData.reported_at) +
              " " +
              formatTime(incidentData.reported_at),
            action: "Báo cáo sự cố",
            description: incidentData.description,
            staff: incidentData.nurse_name,
          });
        }

        // Add occurred event (if different from reported)
        if (
          incidentData.occurred_at &&
          incidentData.occurred_at !== incidentData.reported_at
        ) {
          timeline.push({
            time:
              formatDate(incidentData.occurred_at) +
              " " +
              formatTime(incidentData.occurred_at),
            action: "Xảy ra sự cố",
            description: incidentData.description,
          });
        }

        // Add resolution event if resolved
        if (incidentData.resolved_at) {
          timeline.push({
            time:
              formatDate(incidentData.resolved_at) +
              " " +
              formatTime(incidentData.resolved_at),
            action: "Đã xử lý sự cố",
            description: incidentData.resolution_notes || "Sự cố đã được xử lý",
            staff: incidentData.nurse_name,
          });
        }

        // Add timeline to the incident data
        const enhancedIncident = {
          ...incidentData,
          timeline: timeline,
          // Map API fields to UI fields
          severity: incidentData.severity_level,
          type: incidentData.description?.substring(0, 30),
          date: formatDate(incidentData.occurred_at),
          time: formatTime(incidentData.occurred_at),
          notes: incidentData.resolution_notes,
          treatment: incidentData.medication_used,
        };

        // Update the selected incident in Redux
        dispatch({
          type: "parent/setSelectedIncident",
          payload: enhancedIncident,
        });
        message.success("Đã tải dữ liệu chi tiết sự cố");
      })
      .catch((error) => {
        console.error("Direct API call error:", error);
        message.error(`Lỗi khi tải dữ liệu: ${error.message}`);
      });
  };

  // Custom styles for the component
  const customStyles = `
    .table-row-severe {
      background-color: #fff1f0;
    }
    .table-row-severe:hover > td {
      background-color: #ffccc7 !important;
    }
    .table-row-in-progress {
      background-color: #e6f7ff;
    }
    .table-row-in-progress:hover > td {
      background-color: #bae7ff !important;
    }
    .ant-table-row:hover > td {
      background-color: #f5f5f5 !important;
    }
    .incident-card {
      box-shadow: 0 2px 8px rgba(0,0,0,0.09);
      border-radius: 8px;
    }
    .incident-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }
  `;

  return (
    <div>
      <style>{customStyles}</style>
      <Card className="incident-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Title level={3}>Sự cố y tế</Title>
            <Text type="secondary">
              Xem thông tin về các sự cố y tế liên quan đến học sinh của bạn
            </Text>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                message.loading("Đang làm mới dữ liệu...", 1);
                dispatch(getParentIncidents())
                  .then(() => {
                    message.success("Đã làm mới dữ liệu sự cố y tế");
                  })
                  .catch(() => {
                    message.error("Không thể làm mới dữ liệu");
                  });
              }}
            >
              Làm mới dữ liệu
            </Button>

            {filters.student !== "all" && (
              <Space>
                <Button
                  type="primary"
                  icon={<UserOutlined />}
                  onClick={() => fetchIncidentsByStudentId(filters.student)}
                >
                  Tải dữ liệu học sinh {filters.student}
                </Button>
                <Tooltip title="Kiểm tra API trực tiếp">
                  <Button
                    type="default"
                    icon={<SearchOutlined />}
                    onClick={() => {
                      message.info(
                        `Đang thử API cho học sinh ${filters.student}...`
                      );
                      // Gọi API trực tiếp để kiểm tra
                      testStudentIncidentsApi(filters.student);
                    }}
                  >
                    Thử API
                  </Button>
                </Tooltip>
              </Space>
            )}
          </Space>
        </div>

        {/* Statistics summary */}
        <Row gutter={16} style={{ marginTop: 24, marginBottom: 24 }}>
          <Col span={8}>
            <Card bordered={false} style={{ backgroundColor: "#f0f7ff" }}>
              <Statistic
                title="Tổng số sự cố"
                value={dataSource.length}
                prefix={<MedicineBoxOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{ color: "#1890ff" }}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  {dataSource.filter((i) => i.status === "RESOLVED").length} đã
                  xử lý
                </Text>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false} style={{ backgroundColor: "#fff7e6" }}>
              <Statistic
                title="Đang xử lý"
                value={
                  dataSource.filter((i) => i.status === "IN_PROGRESS").length
                }
                prefix={<ClockCircleOutlined style={{ color: "#fa8c16" }} />}
                valueStyle={{ color: "#fa8c16" }}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  {dataSource.filter((i) => i.status === "NEW").length} sự cố
                  mới
                </Text>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false} style={{ backgroundColor: "#f6ffed" }}>
              <Statistic
                title="Sự cố nghiêm trọng"
                value={
                  dataSource.filter((i) => i.severity_level === "Nặng").length
                }
                prefix={
                  <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
                }
                valueStyle={{ color: "#ff4d4f" }}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  {dataSource.filter((i) => i.severity_level === "Nhẹ").length}{" "}
                  sự cố nhẹ
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        {error && (
          <Alert
            message="Lỗi kết nối"
            description={`Không thể tải dữ liệu sự cố y tế: ${error}`}
            type="error"
            showIcon
            style={{ marginTop: 16, marginBottom: 16 }}
          />
        )}

        <div
          style={{
            marginTop: 24,
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Space>
            <Select
              placeholder="Chọn học sinh"
              style={{ width: 200 }}
              value={filters.student}
              onChange={(value) => {
                setFilters({ ...filters, student: value });
                if (value !== "all") {
                  message.loading(
                    `Đang tải dữ liệu cho học sinh mã ${value}...`,
                    1
                  );
                  // Hiển thị thông tin về API đang gọi
                  console.log(`Gọi API: /api/parent/incidents/${value}`);

                  // Gọi API để lấy sự cố theo ID học sinh
                  fetchIncidentsByStudentId(value);

                  // Hiển thị thông báo cho người dùng
                  notification.info({
                    message: "Đang tải dữ liệu",
                    description: `Đang gọi API: /api/parent/incidents/${value}`,
                    placement: "bottomRight",
                  });
                } else {
                  // Nếu chọn "Tất cả học sinh", tải lại toàn bộ dữ liệu
                  dispatch(getParentIncidents());

                  // Hiển thị thông báo
                  notification.info({
                    message: "Đang tải tất cả dữ liệu",
                    description: "Đang gọi API: /api/parent/incidents",
                    placement: "bottomRight",
                  });
                }
              }}
            >
              <Option value="all">Tất cả học sinh</Option>
              {children?.map((child) => (
                <Option key={child.student_id} value={child.student_id}>
                  {child.name}
                </Option>
              ))}
              {/* Add options based on the data we have */}
              {dataSource.length > 0 &&
                (!children || children.length === 0) &&
                [
                  ...new Set(
                    dataSource.map((incident) => incident.student_code)
                  ),
                ].map((code) => (
                  <Option key={code} value={code}>
                    {dataSource.find((i) => i.student_code === code)
                      ?.student_name || `Học sinh ${code}`}
                  </Option>
                ))}
              {/* Add hardcoded options for testing if no data */}
              {dataSource.length === 0 &&
                (!children || children.length === 0) && (
                  <>
                    <Option value="STU001">Nguyen Van D</Option>
                    <Option value="STU003">Học sinh STU003</Option>
                  </>
                )}
            </Select>
            <Select
              placeholder="Mức độ nghiêm trọng"
              style={{ width: 150 }}
              value={filters.severity}
              onChange={(value) => setFilters({ ...filters, severity: value })}
            >
              <Option value="all">Tất cả mức độ</Option>
              <Option value="Nhẹ">Nhẹ</Option>
              <Option value="Trung bình">Trung bình</Option>
              <Option value="Nặng">Nặng</Option>
            </Select>
          </Space>
          <Input
            placeholder="Tìm kiếm sự cố"
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">Đang tải dữ liệu sự cố y tế...</Text>
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center" }}>
            <Empty
              description={
                <div>
                  <p
                    style={{
                      fontSize: 16,
                      marginBottom: 8,
                      fontWeight: "bold",
                    }}
                  >
                    Không có sự cố y tế nào
                  </p>
                  <Text type="secondary">
                    {filters.student !== "all"
                      ? `Học sinh ${filters.student} không có sự cố y tế nào được ghi nhận`
                      : "Không tìm thấy sự cố y tế nào phù hợp với bộ lọc hiện tại"}
                  </Text>

                  {filters.student !== "all" && (
                    <div style={{ marginTop: 16 }}>
                      <Button
                        type="primary"
                        icon={<ReloadOutlined />}
                        size="small"
                        onClick={() =>
                          fetchIncidentsByStudentId(filters.student)
                        }
                      >
                        Thử tải lại dữ liệu
                      </Button>
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          API endpoint: /api/parent/incidents/{filters.student}
                        </Text>
                      </div>
                    </div>
                  )}
                </div>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <Table
            dataSource={filteredData}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            bordered
            size="middle"
            rowClassName={(record) => {
              if (record.severity_level === "Nặng") return "table-row-severe";
              if (record.status === "IN_PROGRESS")
                return "table-row-in-progress";
              return "";
            }}
          />
        )}
      </Card>

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ marginRight: 10 }}>Chi tiết sự cố y tế</span>
            {currentIncident && currentIncident.severity_level === "Nặng" && (
              <Tag color="error">Nghiêm trọng</Tag>
            )}
          </div>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button
            key="test"
            type="default"
            onClick={() => testDirectApiCall(selectedIncidentId)}
            style={{ marginRight: 8 }}
          >
            Thử kết nối trực tiếp
          </Button>,
          <Button key="back" onClick={handleCancel}>
            Đóng
          </Button>,
        ]}
        width={700}
        className="incident-modal"
      >
        {/* Show loading indicator when fetching incident details */}
        {loading && !currentIncident ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">Đang tải thông tin chi tiết...</Text>
            </div>
          </div>
        ) : currentIncident ? (
          <div>
            {/* Basic incident information */}
            <Card
              bordered={false}
              className="info-card"
              style={{ marginBottom: 20, backgroundColor: "#f9f9f9" }}
            >
              <Row gutter={16}>
                <Col span={16}>
                  <Title level={4} style={{ margin: 0 }}>
                    {currentIncident.student_name}
                  </Title>
                  <Text
                    type="secondary"
                    style={{ display: "block", marginBottom: 5 }}
                  >
                    Lớp: {currentIncident.class_name || "N/A"}
                  </Text>
                  <Text
                    type="secondary"
                    style={{ display: "block", marginBottom: 10 }}
                  >
                    Mã học sinh: {currentIncident.student_code || "N/A"}
                  </Text>

                  <Space style={{ marginTop: 10 }}>
                    <Tag
                      color={getSeverityColor(
                        currentIncident.severity_level ||
                          currentIncident.severity
                      )}
                    >
                      <Badge
                        status={
                          (currentIncident.severity_level ||
                            currentIncident.severity) === "Nặng"
                            ? "error"
                            : (currentIncident.severity_level ||
                                currentIncident.severity) === "Trung bình"
                            ? "warning"
                            : "success"
                        }
                      />
                      {currentIncident.severity_level ||
                        currentIncident.severity}
                    </Tag>

                    {/* Display status with proper translation */}
                    {(() => {
                      let displayStatus;
                      let statusColor;

                      switch (currentIncident.status) {
                        case "IN_PROGRESS":
                          displayStatus = "Đang xử lý";
                          statusColor = "#1890ff";
                          break;
                        case "RESOLVED":
                          displayStatus = "Đã xử lý";
                          statusColor = "#52c41a";
                          break;
                        case "NEW":
                          displayStatus = "Mới";
                          statusColor = "#faad14";
                          break;
                        default:
                          displayStatus = currentIncident.status;
                          statusColor = "#999";
                      }

                      return (
                        <Tag
                          icon={getStatusIcon(displayStatus)}
                          color={
                            statusColor === "#52c41a"
                              ? "success"
                              : statusColor === "#1890ff"
                              ? "processing"
                              : "warning"
                          }
                        >
                          {displayStatus}
                        </Tag>
                      );
                    })()}
                  </Space>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ marginBottom: 10 }}>
                      <CalendarOutlined style={{ marginRight: 5 }} />
                      <Text strong>Thời gian xảy ra:</Text>
                      <div>
                        {formatDate(currentIncident.occurred_at)}{" "}
                        {formatTime(currentIncident.occurred_at)}
                      </div>
                    </div>

                    {currentIncident.nurse_name && (
                      <div>
                        <UserOutlined style={{ marginRight: 5 }} />
                        <Text strong>Y tá phụ trách:</Text>
                        <div>{currentIncident.nurse_name}</div>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Incident description */}
            <div style={{ marginBottom: 24 }}>
              <Title
                level={5}
                style={{ borderLeft: "4px solid #1890ff", paddingLeft: 10 }}
              >
                Mô tả sự cố
              </Title>
              <div
                style={{
                  background: "#fff",
                  padding: 16,
                  border: "1px solid #f0f0f0",
                  borderRadius: 4,
                }}
              >
                <Text>{currentIncident.description}</Text>
              </div>
            </div>

            {/* Timeline of actions taken */}
            <div style={{ marginBottom: 24 }}>
              <Title
                level={5}
                style={{ borderLeft: "4px solid #1890ff", paddingLeft: 10 }}
              >
                Diễn biến xử lý
              </Title>
              {loading && selectedIncident && (
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <Spin size="small" />
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    Đang cập nhật thông tin chi tiết...
                  </Text>
                </div>
              )}
              <div
                style={{
                  background: "#fff",
                  padding: 16,
                  border: "1px solid #f0f0f0",
                  borderRadius: 4,
                }}
              >
                <Timeline mode="left">
                  {currentIncident.timeline ? (
                    currentIncident.timeline.map((item, index) => (
                      <Timeline.Item
                        key={index}
                        label={item.time}
                        color={
                          index === 0
                            ? "red"
                            : index === currentIncident.timeline.length - 1
                            ? "green"
                            : "blue"
                        }
                      >
                        <div>
                          <Text strong>{item.action}</Text>
                          <div>{item.description}</div>
                          {item.staff && (
                            <div>
                              <Text type="secondary">
                                Nhân viên: {item.staff}
                              </Text>
                            </div>
                          )}
                        </div>
                      </Timeline.Item>
                    ))
                  ) : (
                    <Timeline.Item>
                      <Text type="secondary">Không có thông tin diễn biến</Text>
                    </Timeline.Item>
                  )}
                </Timeline>
              </div>
            </div>

            {/* Notes section */}
            {currentIncident.notes && (
              <div style={{ marginBottom: 24 }}>
                <Title
                  level={5}
                  style={{ borderLeft: "4px solid #1890ff", paddingLeft: 10 }}
                >
                  Ghi chú
                </Title>
                <div
                  style={{
                    background: "#fff",
                    padding: 16,
                    border: "1px solid #f0f0f0",
                    borderRadius: 4,
                  }}
                >
                  <Text>{currentIncident.notes}</Text>
                </div>
              </div>
            )}

            {/* Treatment section if available */}
            {currentIncident.treatment && (
              <div style={{ marginBottom: 24 }}>
                <Title
                  level={5}
                  style={{ borderLeft: "4px solid #1890ff", paddingLeft: 10 }}
                >
                  Phương pháp điều trị
                </Title>
                <div
                  style={{
                    background: "#fff",
                    padding: 16,
                    border: "1px solid #f0f0f0",
                    borderRadius: 4,
                  }}
                >
                  <Text>{currentIncident.treatment}</Text>
                </div>
              </div>
            )}

            {/* Outcome section if available */}
            {currentIncident.outcome && (
              <div style={{ marginBottom: 24 }}>
                <Title
                  level={5}
                  style={{ borderLeft: "4px solid #1890ff", paddingLeft: 10 }}
                >
                  Kết quả
                </Title>
                <div
                  style={{
                    background: "#fff",
                    padding: 16,
                    border: "1px solid #f0f0f0",
                    borderRadius: 4,
                  }}
                >
                  <Text>{currentIncident.outcome}</Text>
                </div>
              </div>
            )}

            {/* Additional information if available */}
            {currentIncident.medication_used && (
              <div style={{ marginBottom: 24 }}>
                <Title
                  level={5}
                  style={{ borderLeft: "4px solid #1890ff", paddingLeft: 10 }}
                >
                  Thuốc đã sử dụng
                </Title>
                <div
                  style={{
                    background: "#fff",
                    padding: 16,
                    border: "1px solid #f0f0f0",
                    borderRadius: 4,
                  }}
                >
                  <Text>{currentIncident.medication_used}</Text>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Empty
            description="Không tìm thấy thông tin chi tiết"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Modal>
    </div>
  );
};

export default MedicalIncidentsPage;
