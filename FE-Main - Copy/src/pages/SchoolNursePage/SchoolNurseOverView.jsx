// src/pages/NursePage/NurseDashboardPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  List,
  Typography,
  Tag,
  Spin,
  Empty,
  Button,
  Avatar, // <--- Add Avatar here as it's used in List.Item.Meta
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
} from "@ant-design/icons";
import {
  FiUsers, // Total Students
  FiHeart, // Students with Health Issues
  FiFeather, // Vaccinations Due
  FiAlertTriangle, // Recent Incidents
  FiCalendar, // Upcoming Appointments
  FiBell, // Health Alerts
  FiActivity, // General Dashboard Icon
  FiRefreshCcw, // Refresh button
} from "react-icons/fi";
import { format, parseISO } from "date-fns";
import api from "../../configs/config-axios"; // Đảm bảo đường dẫn này đúng
import { message } from "antd"; // Import message từ antd
import { IoWarningOutline } from "react-icons/io5";

const { Title, Text } = Typography;

export default function NurseDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalStudents: 0,
    studentsWithHealthIssues: 0,
    vaccinationsDue: 0,
    totalStudentsChange: 0, // Thêm trường này cho phần trăm thay đổi
    studentsWithHealthIssuesChange: 0, // Thêm trường này cho phần trăm thay đổi
    vaccinationsDueChange: 0, // Thêm trường này cho phần trăm thay đổi
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [studentHealthAlerts, setStudentHealthAlerts] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(false); // Set loading to true at the start of fetch
    try {
      // Fetch Dashboard Summary
      // Giả lập dữ liệu từ API cho các trường thay đổi phần trăm
      const summaryRes = await api.get("/api/nurse/dashboard-summary");
      setSummary({
        ...summaryRes.data.data,
        totalStudentsChange: 5, // Giả định +5%
        studentsWithHealthIssuesChange: -12, // Giả định -12%
        vaccinationsDueChange: 3, // Giả định +3%
      });

      // Fetch Upcoming Appointments
      const appointmentsRes = await api.get("/api/nurse/upcoming-appointments");
      setUpcomingAppointments(appointmentsRes.data.data.slice(0, 5)); // Limit to 5

      // Fetch Recent Incidents
      const incidentsRes = await api.get("/api/nurse/recent-incidents");
      setRecentIncidents(incidentsRes.data.data.slice(0, 5)); // Limit to 5

      // Fetch Student Health Alerts
      const alertsRes = await api.get("/api/nurse/student-health-alerts");
      setStudentHealthAlerts(alertsRes.data.data.slice(0, 5)); // Limit to 5

      message.success("Dashboard data refreshed!");
    } catch (error) {
      console.error("Error fetching nurse dashboard data:", error);
      message.error("Failed to load dashboard data.");
    } finally {
      setLoading(false); // Set loading to false at the end
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderLoadingState = () => (
    <div className="text-center py-8 flex flex-col items-center justify-center gap-4">
      <Spin indicator={<LoadingOutlined style={{ fontSize: 30 }} spin />} />
      <p className="text-gray-500 text-lg">Loading dashboard data...</p>
    </div>
  );

  // Helper component for the percentage change text
  const PercentageChange = ({ value }) => {
    const isPositive = value >= 0;
    const colorClass = isPositive ? "text-green-500" : "text-red-500";
    const sign = isPositive ? "+" : "";
    return (
      <p className={`text-sm ${colorClass} mt-1`}>
        {sign}
        {value}% from last month
      </p>
    );
  };

  return (
    <div
      className={`min-h-screen bg-white p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCcgdmlld0JveD0nMCAwIDQwIDQwJz48ZyBmaWxsPSdyZ2JhKDEzLDExMCwyNTMsMC4xKScgZmlsbC1ydWxlPSdldmVub2RkJz48Y2lyY2xlIGN4PScyMCcgY3k9JzIwJyByPScyJy8+PC9nPjwvc3ZnPg==')] bg-fixed`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header
          className={`mb-5 p-4 rounded-lg bg-red-600/[.10] to-transparent flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-3 bg-red-600/[.10] rounded-full border border-red-600`}
            >
              <FiActivity className={`w-10 h-10 text-3xl text-red-600`} />
            </div>
            <div>
              <h1 className={`text-gray-900 font-bold text-3xl mb-2`}>
                Bảng điều khiển y tá
              </h1>
              <p className={`text-gray-500 flex items-center gap-2 text-sm`}>
                <span>✨</span>
                Tổng quan về hoạt động y tế trường học
              </p>
            </div>
          </div>
          <Button
            type="default"
            icon={<FiRefreshCcw />}
            onClick={fetchData}
            loading={loading}
            className="flex items-center gap-1 px-4 py-2 !border !border-gray-300 !rounded-lg hover:!bg-gray-100 !transition-colors !text-gray-900"
          >
            Refresh Data
          </Button>
        </header>

        {loading ? (
          renderLoadingState()
        ) : (
          <>
            {/* Overview Statistics */}
            <Row gutter={[16, 16]} className="mb-6">
              {/* Total Students Card */}
              <Col xs={24} sm={12} lg={8}>
                <Card className="!rounded-lg !shadow-md !border !border-gray-200">
                  <div className="flex items-center gap-4">
                    {/* Icon Section */}
                    <div className="flex-shrink-0 p-3 rounded-lg bg-blue-600 flex items-center justify-center">
                      <FiUsers className="text-white text-3xl" />
                    </div>
                    {/* Statistic Content */}
                    <div>
                      <div className="text-gray-700 text-lg font-medium mb-1">
                        {" "}
                        {/* Changed from text-sm to text-lg */}
                        Tổng học sinh
                      </div>
                      <div className="text-gray-900 text-3xl font-bold leading-none">
                        {summary.totalStudents}
                      </div>
                      <PercentageChange value={summary.totalStudentsChange} />
                    </div>
                  </div>
                </Card>
              </Col>

              {/* Students with Health Issues Card */}
              <Col xs={24} sm={12} lg={8}>
                <Card className="!rounded-lg !shadow-md !border !border-gray-200">
                  <div className="flex items-center gap-4">
                    {/* Icon Section */}
                    <div className="flex-shrink-0 p-3 rounded-lg bg-green-600 flex items-center justify-center">
                      <FiHeart className="text-white text-3xl" />
                    </div>
                    {/* Statistic Content */}
                    <div>
                      <div className="text-gray-700 text-base font-medium mb-1">
                        {" "}
                        {/* Changed from text-sm to text-base */}
                        Học sinh có vấn đề về sức khỏe
                      </div>
                      <div className="text-gray-900 text-3xl font-bold leading-none">
                        {summary.studentsWithHealthIssues}
                      </div>
                      <PercentageChange
                        value={summary.studentsWithHealthIssuesChange}
                      />
                    </div>
                  </div>
                </Card>
              </Col>

              {/* Incident Due Card */}
              <Col xs={24} sm={12} lg={8}>
                <Card className="!rounded-lg !shadow-md !border !border-gray-200">
                  <div className="flex items-center gap-4">
                    {/* Icon Section */}
                    <div className="flex-shrink-0 p-3 rounded-lg bg-red-600 flex items-center justify-center">
                      <IoWarningOutline className="text-white text-3xl" />
                    </div>
                    {/* Statistic Content */}
                    <div>
                      <div className="text-gray-700 text-lg font-medium mb-1">
                        {" "}
                        {/* Changed from text-sm to text-lg */}
                        Sự cố y tế
                      </div>
                      <div className="text-gray-900 text-3xl font-bold leading-none">
                        {summary.vaccinationsDue}
                      </div>
                      <PercentageChange value={summary.vaccinationsDueChange} />
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Detailed Sections */}
            <Row gutter={[16, 16]}>
              {/* Upcoming Medical Appointments */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <span className="flex items-center gap-2 text-gray-800 font-semibold">
                      <FiCalendar className="text-blue-600" />
                      Cuộc hẹn khám bệnh sắp tới
                    </span>
                  }
                  className="!rounded-lg !shadow-md !border !border-gray-200"
                  extra={
                    <Button
                      type="link"
                      className="!text-blue-600"
                      href="/nurse/appointments"
                    >
                      Xem tất cả <RightOutlined />
                    </Button>
                  }
                >
                  {upcomingAppointments.length > 0 ? (
                    <List
                      itemLayout="horizontal"
                      dataSource={upcomingAppointments}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar icon={<UserOutlined />} />}
                            title={
                              <Text strong className="text-gray-900">
                                {item.studentName}
                              </Text>
                            }
                            description={
                              <div className="flex items-center gap-2 text-gray-600">
                                <CalendarOutlined />{" "}
                                {format(
                                  parseISO(item.appointmentTime),
                                  "MMM dd, yyyy HH:mm"
                                )}
                                <Tag color="blue">{item.type}</Tag>
                              </div>
                            }
                          />
                          <Text className="text-gray-700">{item.reason}</Text>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty
                      description="No upcoming appointments"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                </Card>
              </Col>

              {/* Recent Medical Incidents */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <span className="flex items-center gap-2 text-gray-800 font-semibold">
                      <FiAlertTriangle className="text-red-600" /> Recent Các sự
                      cố y khoa gần đây
                    </span>
                  }
                  className="!rounded-lg !shadow-md !border !border-gray-200"
                  extra={
                    <Button
                      type="link"
                      className="!text-red-600"
                      href="/nurse/incidents"
                    >
                      Xem tất cả <RightOutlined />
                    </Button>
                  }
                >
                  {recentIncidents.length > 0 ? (
                    <List
                      itemLayout="horizontal"
                      dataSource={recentIncidents}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar icon={<WarningOutlined />} />}
                            title={
                              <Text strong className="text-gray-900">
                                {item.studentName}
                              </Text>
                            }
                            description={
                              <div className="flex items-center gap-2 text-gray-600">
                                <CalendarOutlined />{" "}
                                {format(
                                  parseISO(item.incidentTime),
                                  "MMM dd, yyyy HH:mm"
                                )}
                                <Tag color="red">{item.severity}</Tag>
                              </div>
                            }
                          />
                          <Text className="text-gray-700">
                            {item.description}
                          </Text>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty
                      description="No recent incidents"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                </Card>
              </Col>

              {/* Student Health Alerts */}
              <Col xs={24}>
                <Card
                  title={
                    <span className="flex items-center gap-2 text-gray-800 font-semibold">
                      <FiBell className="text-orange-500" /> Cảnh báo sức khỏe
                      học sinh
                    </span>
                  }
                  className="!rounded-lg !shadow-md !border !border-gray-200"
                  extra={
                    <Button
                      type="link"
                      className="!text-orange-500"
                      href="/nurse/health-alerts"
                    >
                      Xem tất cả <RightOutlined />
                    </Button>
                  }
                >
                  {studentHealthAlerts.length > 0 ? (
                    <List
                      itemLayout="horizontal"
                      dataSource={studentHealthAlerts}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <Avatar icon={<ExclamationCircleOutlined />} />
                            }
                            title={
                              <Text strong className="text-gray-900">
                                {item.studentName} - {item.alertType}
                              </Text>
                            }
                            description={
                              <div className="flex items-center gap-2 text-gray-600">
                                <Text className="text-gray-700">
                                  {item.details}
                                </Text>
                                <Tag color="orange">
                                  Priority: {item.priority}
                                </Tag>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty
                      description="No student health alerts"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
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
