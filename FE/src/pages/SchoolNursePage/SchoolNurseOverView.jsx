/* eslint-disable no-unused-vars */
import React, { useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  List,
  Typography,
  Tag,
  Spin,
  Empty,
  Button,
  Avatar,
  Tooltip,
  Form,
  Select,
  Divider,
} from "antd";
import {
  MedicineBoxOutlined,
  UserOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  LoadingOutlined,
  RightOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import {
  FiUsers,
  FiHeart,
  FiAlertTriangle,
  FiCalendar,
  FiBell,
  FiActivity,
  FiBox,
} from "react-icons/fi";
import { format, parseISO, isWithinInterval, startOfDay, addDays } from "date-fns";
import { vi } from "date-fns/locale";
import { NavLink } from "react-router-dom";
import { IoWarningOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { FaSyringe, FaStethoscope } from "react-icons/fa";
import { TbNurse } from "react-icons/tb";

const { Title, Text } = Typography;

const cardNeumorph = {
  borderRadius: 24,
  boxShadow: "8px 8px 24px #e0f0ff, -8px -8px 24px #fff",
  background: "#fff",
  border: "1.5px solid #e0f0ff",
  transition: "box-shadow 0.2s, transform 0.2s",
};


const statIconStyle = {
  borderRadius: "50%",
  background: "#E0F0FF",
  boxShadow: "0 2px 8px #e0f0ff",
  width: 56,
  height: 56,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 28,
};

const fontFamily = { fontFamily: "Poppins, Roboto, sans-serif" };

const PercentageChange = React.memo(({ value }) => {
  const isPositive = value >= 0;
  const colorClass = isPositive ? "text-green-500" : "text-red-500";
  const sign = isPositive ? "+" : "";
  return (
    <p className={`text-sm ${colorClass} mt-1`} style={fontFamily}>
      {sign}
      {value}% so với tháng trước
    </p>
  );
});

function getRecentMedicalIncidents(medicalIncidents) {
  const today = startOfDay(new Date());
  const sevenDaysAgo = addDays(today, -7);
  return medicalIncidents
    .filter((item) => {
      if (!item?.occurred_at) return false;
      const incidentDate = parseISO(item.occurred_at);
      return isWithinInterval(incidentDate, {
        start: sevenDaysAgo,
        end: today,
      });
    })
    .map((item) => ({
      description: item.description,
      medication_used: item.medication_used,
      student_name: item.student_name,
      incidentTime: item.occurred_at,
      severity: item.severity_level || "N/A",
    }))
    .sort((a, b) => new Date(b.incidentTime) - new Date(a.incidentTime));
}

function getLowOrExpiredSupplies(medicalSupplies) {
  const today = new Date();
  return medicalSupplies.filter((item) => {
    const expiredDate = new Date(item.expired_date);
    const daysRemaining = (expiredDate - today) / (1000 * 60 * 60 * 24);
    return item.quantity <= 50 || daysRemaining <= 30;
  });
}

function getUpcomingAppointments(campaigns, examinations) {
  const today = startOfDay(new Date());
  const endDate = addDays(today, 7);
  const mappedVaccinations = campaigns
    .filter((item) => {
      if (!item || !item.scheduled_date || item.approval_status?.toUpperCase() !== "APPROVED") return false;
      const parsedDate = parseISO(item.scheduled_date);
      return isWithinInterval(parsedDate, { start: today, end: endDate });
    })
    .map((item) => ({
      type: "Tiêm chủng",
      appointmentTime: item.scheduled_date,
      scheduled_date: item.scheduled_date,
      description: item.vaccine_name || "Tiêm chủng định kỳ",
      title: item.title,
    }));
  const mappedExaminations = examinations
    .filter((item) => {
      if (!item || !item.scheduled_date || item.approval_status?.toUpperCase() !== "APPROVED") return false;
      const parsedDate = parseISO(item.scheduled_date);
      return isWithinInterval(parsedDate, { start: today, end: endDate });
    })
    .map((item) => ({
      type: "Khám sức khỏe",
      appointmentTime: item.scheduled_date,
      scheduled_date: item.scheduled_date,
      description: item.description || "Khám định kỳ",
      title: item.title,
    }));
  return [...mappedVaccinations, ...mappedExaminations].sort(
    (a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime)
  );
}

// Hàm format ngày tháng theo tiếng Việt
const formatDateVN = (dateString) => {
  if (!dateString) return "";
  return format(parseISO(dateString), "dd MMMM, yyyy HH:mm", { locale: vi });
};

// Hàm kiểm tra trạng thái sức khỏe bình thường
const isNormalHealthStatus = (status) => {
  if (!status) return false;
  const normalized = status.toLowerCase().trim();
  return [
    "bình thường", "tốt", "bình thu?ng", "t?t", "healthy"
  ].includes(normalized);
};

export default function NurseDashboardPage() {
  const children = useSelector((state) => state.studentRecord.healthRecords);
  const medicalIncidents = useSelector((state) => state.medicalIncidents.records);
  const medicalSupplies = useSelector((state) => state.medicalSupplies.supplies);
  const campaigns = useSelector((state) => state.vaccination.campaigns);
  const examinations = useSelector((state) => state.examination.records);

  // State cho các số liệu tổng quan (có thể lấy từ API nếu cần)
  const [summary] = useState({
    totalStudentsChange: 0,
    studentsWithHealthIssuesChange: 0,
    medicalIncidentsChange: 0,
    expiredSuppliesChange: 0,
    nearlyExpiredSuppliesChange: 0,
  });

  // State cho phân trang cảnh báo sức khỏe học sinh
  const [studentHealthPage, setStudentHealthPage] = useState(1);
  const pageSize = 5;

  // Lọc học sinh có vấn đề sức khỏe
  const studentWithDangerHealth = useMemo(() =>
    children.filter((child) => {
      const status = child.health?.health_status;
      return !isNormalHealthStatus(status);
    }),
    [children]
  );

  // Dữ liệu phân trang cho cảnh báo sức khỏe học sinh
  const paginatedStudentWithDangerHealth = useMemo(() => {
    const start = (studentHealthPage - 1) * pageSize;
    return studentWithDangerHealth.slice(start, start + pageSize);
  }, [studentWithDangerHealth, studentHealthPage]);

  console.log(studentWithDangerHealth);
  

  const lowOrExpiredSupplies = useMemo(() => getLowOrExpiredSupplies(medicalSupplies), [medicalSupplies]);
  const recentMedicalIncidents = useMemo(() => getRecentMedicalIncidents(medicalIncidents), [medicalIncidents]);
  const upcomingAppointments = useMemo(() => getUpcomingAppointments(campaigns, examinations), [campaigns, examinations]);

  const [studentHealthAlerts] = useState([]);
  
  const [loading] = useState(false);

  const renderLoadingState = () => (
    <div className="text-center py-8 flex flex-col items-center justify-center gap-4" style={fontFamily}>
      <Spin indicator={<LoadingOutlined style={{ fontSize: 30, color: '#007BFF' }} spin />} />
      <p className="text-gray-500 text-lg">Đang tải dữ liệu bảng điều khiển...</p>
    </div>
  );

  return (
    <div
      className="min-h-screen p-6 bg-fixed"
      style={{
        background: "#E0F0FF",
        fontFamily: "Poppins, Roboto, sans-serif",
        minHeight: "100vh",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header
          className="mb-5 p-4 flex items-center justify-between"
          style={{
            borderRadius: 24,
            background: "#fff",
            boxShadow: "8px 8px 24px #e0f0ff, -8px -8px 24px #fff",
            border: "1.5px solid #e0f0ff",
          }}
        >
          <div className="flex items-center gap-3">
            <div style={{ ...statIconStyle, fontSize: 36, background: '#E0F0FF', color: '#007BFF' }}>
              <TbNurse />
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-3xl mb-2" style={fontFamily}>
                Xin chào, Y tá 👩‍⚕️
              </h1>
              <p className="text-gray-500 flex items-center gap-2 text-sm" style={fontFamily}>
                <span>✨</span>
                Chúc bạn một ngày làm việc hiệu quả!
              </p>
            </div>
          </div>
          <Avatar size={56} style={{ background: '#E0F0FF', color: '#007BFF', fontSize: 32, boxShadow: '0 2px 8px #e0f0ff' }} icon={<UserOutlined />} />
        </header>
        <Divider style={{ borderColor: '#e0f0ff', margin: '24px 0' }} />
        {loading ? (
          renderLoadingState()
        ) : (
          <>
            {/* Overview Statistics */}
            <Row gutter={[16, 16]} className="mb-6">
              {/* Total Students Card */}
              <Col xs={24} sm={12} lg={6}>
                <Tooltip title="Tổng số học sinh trong trường">
                  <Card
                    className="stat-card"
                    style={cardNeumorph}
                    bodyStyle={{ padding: 24 }}
                  >
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                      <div style={{ ...statIconStyle, background: '#E0F0FF', color: '#007BFF' }}>
                        <FiUsers />
                      </div>
                      <div className="text-center">
                        <div className="text-gray-700 text-lg font-medium mb-1" >Tổng học sinh</div>
                        <div className="text-gray-900 text-3xl font-bold leading-none" style={fontFamily}>{children.length}</div>
                        <PercentageChange value={summary.totalStudentsChange} />
                      </div>
                    </div>
                  </Card>
                </Tooltip>
              </Col>
              {/* Students with Health Issues Card */}
              <Col xs={24} sm={12} lg={6}>
                <Tooltip title="Số học sinh có vấn đề sức khỏe">
                  <Card
                    className="stat-card"
                    style={cardNeumorph}
                    bodyStyle={{ padding: 24 }}
                  >
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                      <div style={{ ...statIconStyle, background: '#E0F0FF', color: '#28a745' }}>
                        <FiHeart />
                      </div>
                      <div className="text-center">
                        <div className="text-gray-700 text-base font-medium mb-1" >Học sinh có vấn đề sức khỏe</div>
                        <div className="text-gray-900 text-3xl font-bold leading-none" style={fontFamily}>{studentWithDangerHealth.length}</div>
                        <PercentageChange value={summary.studentsWithHealthIssuesChange} />
                      </div>
                    </div>
                  </Card>
                </Tooltip>
              </Col>
              {/* Medical Incidents Card */}
              <Col xs={24} sm={12} lg={6}>
                <Tooltip title="Tổng số sự cố y tế đã ghi nhận">
                  <Card
                    className="stat-card"
                    style={cardNeumorph}
                    bodyStyle={{ padding: 24 }}
                  >
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                      <div style={{ ...statIconStyle, background: '#FFE0E0', color: '#ff4d4f' }}>
                        <IoWarningOutline />
                      </div>
                      <div className="text-center">
                        <div className="text-gray-700 text-lg font-medium mb-1">Sự cố y tế</div>
                        <div className="text-gray-900 text-3xl font-bold leading-none" style={fontFamily}>{medicalIncidents.length}</div>
                        <PercentageChange value={summary.medicalIncidentsChange} />
                      </div>
                    </div>
                  </Card>
                </Tooltip>
              </Col>
              {/* Medical Supplies Card */}
              <Col xs={24} sm={12} lg={6}>
                <Tooltip title="Số vật tư y tế hết hoặc sắp hết hạn">
                  <Card
                    className="stat-card"
                    style={cardNeumorph}
                    bodyStyle={{ padding: 24 }}
                  >
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                      <div style={{ ...statIconStyle, background: '#E0E0FF', color: '#6f42c1' }}>
                        <FiBox />
                      </div>
                      <div className="text-center">
                        <div className="text-gray-700 text-lg font-medium mb-1">Vật tư y tế (Hết/Sắp hết hạn)</div>
                        <div className="text-gray-900 text-3xl font-bold leading-none flex gap-2 items-center justify-center" style={fontFamily}>
                          <Tooltip title="Vật tư hết hạn">
                            <span className="text-red-500">{lowOrExpiredSupplies.length}</span>
                          </Tooltip>
                        </div>
                        <div className="flex gap-2 mt-1 justify-center">
                          <PercentageChange value={summary.expiredSuppliesChange} />
                          <PercentageChange value={summary.nearlyExpiredSuppliesChange} />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Tooltip>
              </Col>
            </Row>
            {/* Detailed Sections */}
            <Row gutter={[16, 16]}>
              {/* Upcoming Medical Appointments */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <span className="flex items-center gap-2 text-gray-800 font-semibold" style={fontFamily}>
                      <FiCalendar className="text-blue-600" />
                      Lịch khám và lịch tiêm chủng sắp tới
                    </span>
                  }
                  className="!rounded-lg !shadow-md !border !border-gray-200"
                  bodyStyle={{ padding: 24 }}
                >
                  {upcomingAppointments.length > 0 ? (
                    <List
                      itemLayout="horizontal"
                      dataSource={upcomingAppointments}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                icon={item.type === "Tiêm chủng" ? <FaSyringe /> : <FaStethoscope />}
                                style={{ backgroundColor: item.type === "Tiêm chủng" ? "#1890ff" : "#52c41a", color: '#fff' }}
                              />
                            }
                            title={<Text strong style={fontFamily}>{item.title}</Text>}
                            description={
                              <div className="flex items-center gap-2 text-gray-600" style={fontFamily}>
                                <CalendarOutlined />
                                {formatDateVN(item.appointmentTime)}
                                <Tag color={item.type === "Tiêm chủng" ? "blue" : "green"} className="uppercase">
                                  {item.type}
                                </Tag>
                              </div>
                            }
                          />
                          <Text style={fontFamily}>{item.description}</Text>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="Không có cuộc hẹn nào sắp tới" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  )}
                </Card>
              </Col>
              {/* Recent Medical Incidents */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <span className="flex items-center gap-2 text-gray-800 font-semibold" style={fontFamily}>
                      <FiAlertTriangle className="text-red-600" /> Các sự cố y khoa gần đây
                    </span>
                  }
                  className="!rounded-lg !shadow-md !border !border-gray-200"
                  style={cardNeumorph}
                  bodyStyle={{ padding: 24 }}
                  extra={
                    <NavLink className="!text-red-600" to="/nurse/medical-incidents" style={fontFamily}>
                      Xem tất cả <RightOutlined />
                    </NavLink>
                  }
                >
                  {recentMedicalIncidents.length > 0 ? (
                    <List
                      itemLayout="horizontal"
                      dataSource={recentMedicalIncidents}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar icon={<WarningOutlined />} style={{ backgroundColor: '#ff4d4f', color: '#fff' }} />}
                            title={<Text strong className="text-gray-900" style={fontFamily}>{item.student_name}</Text>}
                            description={
                              <div className="flex flex-col text-gray-600 gap-1" style={fontFamily}>
                                <div className="flex items-center gap-2">
                                  <CalendarOutlined />
                                  {formatDateVN(item.incidentTime)}
                                  <Tag color="red">{item.severity}</Tag>
                                </div>
                                <div>💊 {item.medication_used}</div>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="Không có sự cố gần đây" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  )}
                </Card>
              </Col>
              {/* Student Health Alerts */}
              <Col xs={24}>
                <Card
                  title={
                    <span className="flex items-center gap-2 text-gray-800 font-semibold" style={fontFamily}>
                      <FiBell className="text-orange-500" /> Cảnh báo sức khỏe học sinh
                    </span>
                  }
                  className="!rounded-lg !shadow-md !border !border-gray-200"
                  style={cardNeumorph}
                  bodyStyle={{ padding: 24 }}
                >
                  {studentWithDangerHealth.length > 0 ? (
                    <>
                      <List
                        itemLayout="horizontal"
                        dataSource={paginatedStudentWithDangerHealth}
                        renderItem={(item) => {
                          // Xác định màu tag cho health_status
                          let healthColor = 'orange';
                          const status = item.health?.health_status?.toLowerCase() || '';
                          if (["bình thường", "tốt", "bình thu?ng", "t?t", "healthy"].includes(status)) healthColor = 'green';
                          if (["nguy kịch", "nguy hiểm", "critical", "danger"].includes(status)) healthColor = 'red';
                          return (
                            <List.Item
                              style={{
                            
                                marginBottom: 12,
                                background: '#fff',
                                cursor: 'pointer',
                                width: "100%",
                              }}
                              className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                            >
                              <List.Item.Meta
                                avatar={<Avatar icon={<ExclamationCircleOutlined />} style={{ backgroundColor: '#faad14', color: '#fff', fontSize: 22 }} size={48} />}
                                title={
                                  <Text strong className="text-gray-900" style={{ ...fontFamily, fontSize: 20 }}>
                                    {item.student_name}
                                  </Text>
                                }
                                description={
                                  <div className="flex flex-col gap-1 text-gray-600" style={fontFamily}>
                                    <div className="flex items-center gap-2">
                                      <span role="img" aria-label="school">🏫</span>
                                      <b>Lớp:</b> <span className="ml-1">{item.class_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <CalendarOutlined style={{ color: '#1890ff' }} />
                                      <b>Ngày sinh:</b> <span className="ml-1">{formatDateVN(item.student_date_of_birth)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <b>Trạng thái sức khỏe:</b>
                                      <Tag color={healthColor} style={{ fontWeight: 500, fontSize: 15, borderRadius: 8, marginLeft: 4 }}>
                                        {item.health?.health_status ===  "C?n theo dõi" ?  "Cần theo dõi" : "N/A"}
                                      </Tag>
                                    </div>
                                  </div>
                                }
                              />
                            </List.Item>
                          );
                        }}
                      />
                      
                      {/* Phân trang */}
                      <div className="flex justify-center mt-4">
                        <Button
                          disabled={studentHealthPage === 1}
                          onClick={() => setStudentHealthPage((p) => p - 1)}
                          style={{ marginRight: 8 }}
                        >
                          Trang trước
                        </Button>
                        <span style={{ lineHeight: '32px', minWidth: 60, textAlign: 'center' }}>
                          Trang {studentHealthPage} / {Math.ceil(studentWithDangerHealth.length / pageSize)}
                        </span>
                        <Button
                          disabled={studentHealthPage >= Math.ceil(studentWithDangerHealth.length / pageSize)}
                          onClick={() => setStudentHealthPage((p) => p + 1)}
                          style={{ marginLeft: 8 }}
                        >
                          Trang sau
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Empty description="Không có cảnh báo sức khỏe học sinh" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  )}
                </Card>
              </Col>
            </Row>
          </>
        )}
      </div>
    </div>
  );
}
