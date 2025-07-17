// src/pages/NursePage/ReportsPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Empty,
  message,
  Popover,
  Select,
  DatePicker,
  Space, // Add Space here
} from "antd";
import {
  PieChartOutlined,
  LineChartOutlined,
  BarChartOutlined,
  FilePdfOutlined,
  LoadingOutlined,
  DownloadOutlined,
  TableOutlined, // Changed header icon to FiBarChart or similar
} from "@ant-design/icons";
import {
  FiBarChart, // Header icon for Reports & Statistics
  FiFileText, // Icon for Available Reports
  FiDownload, // Download button icon
} from "react-icons/fi";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
} from "chart.js";
import { Pie, Line, Bar } from "react-chartjs-2";
import api from "../../configs/config-axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllStudentHealthRecords } from "../../redux/nurse/studentRecords/studentRecord";
import { fetchAllMedicalIncidents } from "../../redux/nurse/medicalIncidents/medicalIncidents";
import { fetchAllVaccineCampaigns } from "../../redux/nurse/vaccinations/vaccinationSlice";
import { fetchAllHealthExaminations } from "../../redux/nurse/heathExaminations/heathExamination";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
);

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  // Lấy dữ liệu từ Redux store
  const studentRecords = useSelector(state => state.studentRecord.healthRecords);
  const medicalIncidents = useSelector(state => state.medicalIncidents.records);
  const vaccineCampaigns = useSelector(state => state.vaccination.campaigns);
  const healthExaminations = useSelector(state => state.examination.records);



  //studentRecords
  const healthStatus = Array.from(
    new Set(studentRecords?.map(child => child?.health?.health_status).filter(Boolean))
  );
  const healthStatusData = healthStatus.map(
    status => studentRecords.filter(child => child?.health?.health_status === status).length
  );


  
  
  
  
  // Gom fetch API vào 1 hàm duy nhất
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        dispatch(fetchAllStudentHealthRecords()),
        dispatch(fetchAllMedicalIncidents({ page: 1, limit: 10 })),
        dispatch(fetchAllVaccineCampaigns()),
        dispatch(fetchAllHealthExaminations()),
      ]);
      // Có thể toast thành công ở đây nếu muốn
    } catch (error) {
      // toast lỗi nếu muốn
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Xử lý dữ liệu cho chart (ví dụ mẫu, bạn có thể thay bằng xử lý thực tế)
  // Pie chart: Tình trạng sức khỏe học sinh

  // Dự liệu cho Chart Pie 🩺 Trạng thái sức khỏe học sinh
  const studentHealthData = {
    labels: healthStatus,
    datasets: [
      {
        data: healthStatusData,
        backgroundColor: ["#4CAF50", "#FFC107", "#F44336"],
        borderColor: ["#ffffff", "#ffffff", "#ffffff"],
        borderWidth: 2,
      },
    ],
  };

  const studentHealthOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          font: {
            size: 14,
          },
          color: "#374151",
          generateLabels: (chart) => {
            const data = chart.data.datasets[0].data;
            return chart.data.labels.map((label, i) => ({
              text: `${label}: ${data[i]}`,
              fillStyle: chart.data.datasets[0].backgroundColor[i],
              strokeStyle: chart.data.datasets[0].borderColor[i],
              lineWidth: 2,
              hidden: chart.getDatasetMeta(0).data[i].hidden,
              index: i,
            }));
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.parsed;
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  // Monthly Incidents & Checkups Line Chart (dữ liệu giả)
  const monthlyData = {
    labels: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6"],
    datasets: [
      {
        label: "Sự cố",
        data: [15, 20, 18, 12, 14, 16],
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        tension: 0.3,
        pointBackgroundColor: "rgb(255, 99, 132)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(255, 99, 132)",
      },
      {
        label: "Khám bệnh",
        data: [40, 48, 45, 52, 58, 55],
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        tension: 0.3,
        pointBackgroundColor: "rgb(54, 162, 235)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(54, 162, 235)",
      },
    ],
  };

  const monthlyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          font: {
            size: 14,
          },
          color: "#374151",
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6B7280", // Tailwind gray-500
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(203, 213, 224, 0.3)", // Tailwind gray-200 with transparency
        },
        ticks: {
          color: "#6B7280", // Tailwind gray-500
        },
      },
    },
  };

  // BMI Distribution by Grade Stacked Bar Chart (dữ liệu giả)
  const bmiData = {
    labels: ["Khối 1", "Khối 2", "Khối 3", "Khối 4", "Khối 5"],
    datasets: [
      {
        label: "Thiếu cân",
        data: [5, 7, 6, 8, 5],
        backgroundColor: "#60A5FA",
      },
      {
        label: "Bình thường",
        data: [70, 75, 72, 70, 78],
        backgroundColor: "#4CAF50",
      },
      {
        label: "Thừa cân",
        data: [15, 10, 12, 15, 10],
        backgroundColor: "#FFC107",
      },
      {
        label: "Béo phì",
        data: [10, 8, 10, 7, 7],
        backgroundColor: "#F44336",
      },
    ],
  };

  const bmiOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: {
            size: 14,
          },
          color: "#374151",
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        max: 100, // Assuming data is percentage
        grid: {
          color: "rgba(203, 213, 224, 0.3)",
        },
        ticks: {
          callback: function (value) {
            return value + "%";
          },
          color: "#6B7280",
        },
      },
    },
  };

  const handleGenerateReport = () => {
    message.info("Đã nhấp 'Tạo báo cáo'!");
    // Implement report generation logic (e.g., open a modal with options)
    // Thực hiện logic tạo báo cáo (ví dụ: mở modal với các tùy chọn)
  };

  const renderLoadingState = () => (
    <div className="text-center py-8 flex flex-col items-center justify-center gap-4">
      <Spin indicator={<LoadingOutlined style={{ fontSize: 30 }} spin />} />
      <p className="text-gray-500 text-lg">Đang tải dữ liệu báo cáo...</p>
    </div>
  );

  return (
    <div
      className={`min-h-screen bg-white p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCcgdmlld0JveD0nMCAwIDQwIDQwJz48ZyBmaWxsPSdyZ2JhKDEzLDExMCwyNTMsMC4xKScgZmlsbC1ydWxlPSdldmVub2RkJz48Y2lyY2xlIGN4PScyMCcgY3k9JzIwJyByPScyJy8+PC9nPjwvc3ZnPg==')] bg-fixed`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header
          className={`mb-5 p-4 rounded-lg bg-purple-600/[.10] to-transparent flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-3 bg-purple-600/[.10] rounded-full border border-purple-600`}
            >
              <FiBarChart className={`w-10 h-10 text-3xl text-purple-600`} />
            </div>
            <div>
              <h1 className={`text-gray-900 font-semibold text-3xl mb-2`}>
                📊 Báo cáo & Thống kê
              </h1>
              <p className={`text-gray-500 flex items-center gap-2 text-sm`}>
                <span>✨</span>
                Tạo và xem các báo cáo và thống kê sức khỏe
              </p>
            </div>
          </div>
          <Space>
            <Button
              type="default"
              icon={<TableOutlined />} // Đổi icon thành TableOutlined để gợi ý tạo dữ liệu
              onClick={handleGenerateReport}
              className="flex items-center gap-1 px-4 py-2 !rounded-lg !border !border-gray-300 hover:!bg-gray-100 !transition-colors !text-gray-900"
            >
              📑 Tạo báo cáo
            </Button>
          </Space>
        </header>

        {loading ? (
          renderLoadingState()
        ) : (
          <>
            {/* Charts Section */}
            <Row gutter={[16, 16]} className="mb-6">
              {/* Student Health Status */}
              <Col xs={24} lg={8}>
                <Card
                  title={
                    <span className="flex items-center gap-2 text-gray-800 font-semibold">
                      🩺 Trạng thái sức khỏe học sinh
                    </span>
                  }
                  className="!rounded-lg !shadow-md !border !border-gray-200 h-96 flex flex-col"
                >
                  <div className="flex-grow flex items-center justify-center">
                    <Pie
                    width={300}
                    height={300}
                      data={studentHealthData}
                      options={studentHealthOptions}
          
                    />
                  </div>
                </Card>
              </Col>

              {/* Medical Incidents */}
              <Col xs={24} lg={8}>
                <Card
                  title={
                    <span className="flex items-center gap-2 text-gray-800 font-semibold">
                      <BarChartOutlined className="text-red-500" /> 🚑 Sự cố y tế trong trường
                    </span>
                  }
                  className="!rounded-lg !shadow-md !border !border-gray-200 h-96 flex flex-col"
                  extra={<span className="text-xs text-gray-500">Thống kê số lượng sự cố, sơ cứu, chuyển viện</span>}
                >
                  <div className="flex-grow flex items-center justify-center">
                    {/* Placeholder: Replace with real chart/data */}
                    <Bar
                      data={{
                        labels: ["Té ngã", "Chấn thương", "Ngộ độc", "Khác"],
                        datasets: [
                          {
                            label: "Số sự cố",
                            data: [8, 3, 1, 2],
                            backgroundColor: ["#F87171", "#FBBF24", "#60A5FA", "#A78BFA"],
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } },
                      }}
                    />
                  </div>
                </Card>
              </Col>

              {/* Vaccination Status */}
              <Col xs={24} lg={8}>
                <Card
                  title={
                    <span className="flex items-center gap-2 text-gray-800 font-semibold">
                      <PieChartOutlined className="text-green-500" /> 💉 Các đợt tiêm chủng đã tiến hành
                    </span>
                  }
                  className="!rounded-lg !shadow-md !border !border-gray-200 h-96 flex flex-col"
                >
                  <div className="flex-grow flex items-center justify-center">
                    {/* Placeholder: Replace with real chart/data */}
                    <Pie
                      data={{
                        labels: ["Đã tiêm đủ", "Chưa đủ mũi", "Chưa tiêm"],
                        datasets: [
                          {
                            data: [75, 15, 10],
                            backgroundColor: ["#4ADE80", "#FBBF24", "#F87171"],
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: { legend: { position: "bottom" } },
                      }}
                      height={50}
                    />
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Health Checkup & BMI Section */}
            <Row gutter={[16, 16]} className="mb-6">
              {/* Health Checkup */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <span className="flex items-center gap-2 text-gray-800 font-semibold">
                      <LineChartOutlined className="text-blue-600" /> 🩻 Khám sức khỏe định kỳ
                    </span>
                  }
                  className="!rounded-lg !shadow-md !border !border-gray-200 h-96 flex flex-col"
                  extra={<span className="text-xs text-gray-500">Số lượng học sinh đã khám, phát hiện vấn đề qua khám</span>}
                >
                  <div className="flex-grow flex items-center justify-center">
                    {/* Placeholder: Replace with real chart/data */}
                    <Line
                      data={{
                        labels: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6"],
                        datasets: [
                          {
                            label: "Đã khám",
                            data: [120, 130, 140, 135, 150, 145],
                            borderColor: "#6366F1",
                            backgroundColor: "#A5B4FC",
                            tension: 0.3,
                          },
                          {
                            label: "Phát hiện vấn đề",
                            data: [5, 7, 6, 8, 4, 6],
                            borderColor: "#F59E42",
                            backgroundColor: "#FDE68A",
                            tension: 0.3,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: { legend: { position: "bottom" } },
                        scales: { y: { beginAtZero: true } },
                      }}
                    />
                  </div>
                </Card>
              </Col>

              {/* BMI Distribution by Grade */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <span className="flex items-center gap-2 text-gray-800 font-semibold">
                      <BarChartOutlined className="text-green-600" /> 🏫 Phân bố BMI theo khối lớp
                    </span>
                  }
                  className="mb-6 !rounded-lg !shadow-md !border !border-gray-200 h-96 flex flex-col"
                  extra={<span className="text-xs text-gray-500">Tỷ lệ học sinh thiếu cân, bình thường, thừa cân, béo phì</span>}
                >
                  <div className="flex-grow flex items-center justify-center">
                    <Bar data={bmiData} options={bmiOptions} />
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Medicine & Supplies, Prescription, Education Section */}
            <Row gutter={[16, 16]} className="mb-6">
              {/* Medicine & Supplies */}
              <Col xs={24} lg={8}>
                <Card
                  title={<span className="flex items-center gap-2 text-gray-800 font-semibold"><FilePdfOutlined className="text-blue-500" /> 💊 Quản lý thuốc & vật tư</span>}
                  className="!rounded-lg !shadow-md !border !border-gray-200 h-60 flex flex-col"
                  extra={<span className="text-xs text-gray-500">Số lượng thuốc, vật tư đã sử dụng, tồn kho</span>}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    {/* Placeholder: Replace with real data */}
                    <p className="text-lg font-semibold text-green-600">Tồn kho: 120 hộp thuốc, 50 băng gạc</p>
                    <p className="text-sm text-gray-500">Đã sử dụng tháng này: 30 hộp thuốc, 10 băng gạc</p>
                  </div>
                </Card>
              </Col>
              {/* Prescription Requests */}
              <Col xs={24} lg={8}>
                <Card
                  title={<span className="flex items-center gap-2 text-gray-800 font-semibold"><FilePdfOutlined className="text-pink-500" /> 📝 Đơn thuốc & chăm sóc đặc biệt</span>}
                  className="!rounded-lg !shadow-md !border !border-gray-200 h-60 flex flex-col"
                  extra={<span className="text-xs text-gray-500">Số đơn thuốc, học sinh cần uống thuốc tại trường</span>}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    {/* Placeholder: Replace with real data */}
                    <p className="text-lg font-semibold text-blue-600">Đơn thuốc tháng này: 12</p>
                    <p className="text-sm text-gray-500">Học sinh cần uống thuốc tại trường: 5</p>
                  </div>
                </Card>
              </Col>
              {/* Health Education */}
              <Col xs={24} lg={8}>
                <Card
                  title={<span className="flex items-center gap-2 text-gray-800 font-semibold"><FilePdfOutlined className="text-yellow-500" /> 📢 Truyền thông & giáo dục sức khỏe</span>}
                  className="!rounded-lg !shadow-md !border !border-gray-200 h-60 flex flex-col"
                  extra={<span className="text-xs text-gray-500">Các buổi truyền thông, giáo dục sức khỏe đã tổ chức</span>}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    {/* Placeholder: Replace with real data */}
                    <p className="text-lg font-semibold text-purple-600">Số buổi truyền thông: 3</p>
                    <p className="text-sm text-gray-500">Chủ đề: Vệ sinh cá nhân, phòng chống dịch, dinh dưỡng</p>
                  </div>
                </Card>
              </Col>
            </Row>
          
          </>
        )}
      </div>
    </div>
  );
}
