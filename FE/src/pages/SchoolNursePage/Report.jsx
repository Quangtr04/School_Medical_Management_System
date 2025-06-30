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
import { format } from "date-fns";

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
  const [reportData, setReportData] = useState({
    studentHealthStatus: {},
    monthlyIncidentsCheckups: {},
    bmiDistribution: {},
    availableReports: [],
  });

  const fetchReportData = useCallback(async () => {
    setLoading(true); // Đặt loading về true khi bắt đầu fetch
    try {
      // Giả lập cuộc gọi API cho từng biểu đồ và báo cáo có sẵn
      const [
        healthStatusRes,
        incidentsCheckupsRes,
        bmiDistRes,
        reportsListRes,
      ] = await Promise.all([
        api.get("/api/nurse/reports/student-health-status"),
        api.get("/api/nurse/reports/monthly-incidents-checkups"),
        api.get("/api/nurse/reports/bmi-distribution"),
        api.get("/api/nurse/reports/available-reports"),
      ]);

      setReportData({
        studentHealthStatus: healthStatusRes.data.data,
        monthlyIncidentsCheckups: incidentsCheckupsRes.data.data,
        bmiDistribution: bmiDistRes.data.data,
        availableReports: reportsListRes.data.data,
      });
      message.success("Tải dữ liệu báo cáo thành công!");
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu báo cáo:", error);
      message.error("Tải dữ liệu báo cáo thất bại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Data for Student Health Status Pie Chart
  const studentHealthData = {
    labels: reportData.studentHealthStatus.labels || [
      "Khỏe mạnh",
      "Vấn đề nhỏ",
      "Cần chú ý",
    ],
    datasets: [
      {
        data: reportData.studentHealthStatus.data || [78, 15, 7], // Dữ liệu ví dụ
        backgroundColor: ["#4CAF50", "#FFC107", "#F44336"], // Xanh lá, Hổ phách, Đỏ
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
              text: `${label}: ${data[i]}%`,
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
            return `${label}: ${value}%`;
          },
        },
      },
    },
  };

  // Data for Monthly Incidents & Checkups Line Chart
  const monthlyData = {
    labels: reportData.monthlyIncidentsCheckups.labels || [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
    ], // Tháng ví dụ
    datasets: [
      {
        label: "Sự cố",
        data: reportData.monthlyIncidentsCheckups.incidents || [
          15, 20, 18, 12, 14, 16,
        ], // Dữ liệu ví dụ
        borderColor: "rgb(255, 99, 132)", // Đỏ cho sự cố
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        tension: 0.3,
        pointBackgroundColor: "rgb(255, 99, 132)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(255, 99, 132)",
      },
      {
        label: "Khám bệnh",
        data: reportData.monthlyIncidentsCheckups.checkups || [
          40, 48, 45, 52, 58, 55,
        ], // Dữ liệu ví dụ
        borderColor: "rgb(54, 162, 235)", // Xanh dương cho khám bệnh
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

  // Data for BMI Distribution by Grade Stacked Bar Chart
  const bmiData = {
    labels: reportData.bmiDistribution.labels || [
      "Khối 1",
      "Khối 2",
      "Khối 3",
      "Khối 4",
      "Khối 5",
    ], // Khối ví dụ
    datasets: [
      {
        label: "Thiếu cân",
        data: reportData.bmiDistribution.underweight || [5, 7, 6, 8, 5],
        backgroundColor: "#60A5FA", // Xanh dương
      },
      {
        label: "Bình thường",
        data: reportData.bmiDistribution.normal || [70, 75, 72, 70, 78],
        backgroundColor: "#4CAF50", // Xanh lá
      },
      {
        label: "Thừa cân",
        data: reportData.bmiDistribution.overweight || [15, 10, 12, 15, 10],
        backgroundColor: "#FFC107", // Hổ phách/Cam
      },
      {
        label: "Béo phì",
        data: reportData.bmiDistribution.obese || [10, 8, 10, 7, 7],
        backgroundColor: "#F44336", // Đỏ
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

  const handleExportData = () => {
    message.info("Đã nhấp 'Xuất dữ liệu'!");
    // Implement data export logic (e.g., select format, date range)
    // Thực hiện logic xuất dữ liệu (ví dụ: chọn định dạng, khoảng ngày)
  };

  const handleDownloadReport = async (reportId) => {
    try {
      // Simulate PDF download
      // Giả lập tải xuống PDF
      message.loading("Đang tải báo cáo...", 0);
      const res = await api.get(`/api/nurse/reports/download/${reportId}`, {
        responseType: "blob", // Important for file downloads - Quan trọng cho việc tải file
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report-${reportId}.pdf`); // Hoặc lấy tên file từ headers
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      message.success("Tải báo cáo thành công!");
    } catch (error) {
      console.error("Lỗi khi tải báo cáo:", error);
      message.error("Tải báo cáo thất bại.");
    } finally {
      message.destroy(); // Hide loading message - Ẩn thông báo đang tải
    }
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
              <FiBarChart className={`w-10 h-10 text-3xl text-purple-600`} />{" "}
              {/* Changed icon to FiBarChart for reports - Đổi icon thành FiBarChart cho báo cáo */}
            </div>
            <div>
              <h1 className={`text-gray-900 font-semibold text-3xl mb-2`}>
                Báo cáo & Thống kê
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
              icon={<TableOutlined />} // Changed icon to TableOutlined to suggest data generation - Đổi icon thành TableOutlined để gợi ý tạo dữ liệu
              onClick={handleGenerateReport}
              className="flex items-center gap-1 px-4 py-2 !rounded-lg !border !border-gray-300 hover:!bg-gray-100 !transition-colors !text-gray-900"
            >
              Tạo báo cáo
            </Button>
            <Button
              type="primary"
              icon={<FiDownload />}
              onClick={handleExportData}
              className="flex items-center gap-1 px-4 py-2 !rounded-lg !bg-blue-600 hover:!bg-blue-700 !transition-colors"
            >
              Xuất dữ liệu
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
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <span className="flex items-center gap-2 text-gray-800 font-semibold">
                      <PieChartOutlined className="text-purple-600" /> Tình
                      trạng sức khỏe học sinh
                    </span>
                  }
                  className="!rounded-lg !shadow-md !border !border-gray-200 h-96 flex flex-col"
                >
                  <div className="flex-grow flex items-center justify-center">
                    <Pie
                      data={studentHealthData}
                      options={studentHealthOptions}
                    />
                  </div>
                </Card>
              </Col>

              {/* Monthly Incidents & Checkups */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <span className="flex items-center gap-2 text-gray-800 font-semibold">
                      <LineChartOutlined className="text-blue-600" /> Sự cố &
                      Khám bệnh hàng tháng
                    </span>
                  }
                  className="!rounded-lg !shadow-md !border !border-gray-200 h-96 flex flex-col"
                >
                  <div className="flex-grow flex items-center justify-center">
                    <Line data={monthlyData} options={monthlyOptions} />
                  </div>
                </Card>
              </Col>
            </Row>

            {/* BMI Distribution by Grade */}
            <Card
              title={
                <span className="flex items-center gap-2 text-gray-800 font-semibold">
                  <BarChartOutlined className="text-green-600" /> Phân bố BMI
                  theo khối lớp
                </span>
              }
              className="mb-6 !rounded-lg !shadow-md !border !border-gray-200 h-96 flex flex-col"
            >
              <div className="flex-grow flex items-center justify-center">
                <Bar data={bmiData} options={bmiOptions} />
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
