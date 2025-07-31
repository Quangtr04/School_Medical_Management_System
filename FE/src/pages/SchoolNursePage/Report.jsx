// src/pages/NursePage/ReportsPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { fetchAllMedicationSubmissions } from "../../redux/nurse/medicalSubmission/medicalSubmisstionSlice";

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

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  // Lấy dữ liệu từ Redux store
  const studentRecords = useSelector(
    (state) => state.studentRecord.healthRecords
  );
  const medicalIncidents = useSelector(
    (state) => state.medicalIncidents.records
  );
  const vaccineCampaigns = useSelector((state) => state.vaccination.campaigns);
  const healthExaminations = useSelector((state) => state.examination.records);
  const medicationSubmissions = useSelector(
    (state) => state.medicationSubmission?.data || []
  );

  // Tạo dữ liệu cho biểu đồ BMI
  const khoiList = [1, 2, 3, 4, 5];

  const getStudentsByKhoi = (studentRecords, khoi) => {
    if (!Array.isArray(studentRecords)) return [];
    return studentRecords.filter(
      (student) => student.class_name && student.class_name[0] === String(khoi)
    );
  };

  const studentsByKhoi = khoiList.map((khoi) => ({
    khoi,
    students: getStudentsByKhoi(studentRecords, khoi),
  }));

  const chronoicDesease = Array.isArray(studentRecords)
    ? Array.from(
        new Set(
          studentRecords
            .map((child) => child?.health?.chronic_disease)
            .filter(Boolean)
        )
      )
    : ["Hen suyễn", "Tiểu đường", "Tim mạch", "Dị ứng", "Không có"];

  //studentRecords
  const healthStatus = Array.from(
    new Set(
      studentRecords
        ?.map((child) => child?.health?.health_status)
        .filter(Boolean)
    )
  );
  const healthStatusData = healthStatus.map(
    (status) =>
      studentRecords.filter((child) => child?.health?.health_status === status)
        .length
  );

  // Xử lý dữ liệu tiêm chủng theo năm hiện tại
  const vaccinationDataByYear = useMemo(() => {
    if (!vaccineCampaigns || vaccineCampaigns.length === 0) {
      return {
        labels: [
          "Tháng 1",
          "Tháng 2",
          "Tháng 3",
          "Tháng 4",
          "Tháng 5",
          "Tháng 6",
          "Tháng 7",
          "Tháng 8",
          "Tháng 9",
          "Tháng 10",
          "Tháng 11",
          "Tháng 12",
        ],
        datasets: [
          {
            label: "Số chiến dịch tiêm chủng đã duyệt",
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgb(54, 162, 235)",
            borderWidth: 1,
          },
        ],
      };
    }

    // Lấy năm hiện tại
    const currentYear = new Date().getFullYear();

    // Khởi tạo mảng dữ liệu cho 12 tháng
    const campaignsByMonth = Array(12).fill(0);

    // Xử lý từng chiến dịch tiêm chủng
    vaccineCampaigns.forEach((campaign) => {
      // Chỉ xử lý các chiến dịch có trạng thái APPROVED
      if (
        campaign.status !== "APPROVED" &&
        campaign.approval_status !== "APPROVED"
      ) {
        return;
      }

      if (campaign.scheduled_date) {
        const campaignDate = new Date(campaign.scheduled_date);
        const campaignYear = campaignDate.getFullYear();
        const campaignMonth = campaignDate.getMonth(); // 0-11

        // Chỉ tính các chiến dịch trong năm hiện tại
        if (campaignYear === currentYear) {
          // Tăng số lượng chiến dịch trong tháng
          campaignsByMonth[campaignMonth]++;
        }
      }
    });

    return {
      labels: [
        "Tháng 1",
        "Tháng 2",
        "Tháng 3",
        "Tháng 4",
        "Tháng 5",
        "Tháng 6",
        "Tháng 7",
        "Tháng 8",
        "Tháng 9",
        "Tháng 10",
        "Tháng 11",
        "Tháng 12",
      ],
      datasets: [
        {
          label: "Số chiến dịch tiêm chủng đã duyệt",
          data: campaignsByMonth,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgb(54, 162, 235)",
          borderWidth: 1,
        },
      ],
    };
  }, [vaccineCampaigns]);

  // Xử lý dữ liệu phân bố tiêm chủng theo lớp
  const vaccinationDataByClass = useMemo(() => {
    if (!vaccineCampaigns || vaccineCampaigns.length === 0) {
      return {
        labels: ["Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5"],
        datasets: [
          {
            label: "Số chiến dịch tiêm chủng",
            data: [0, 0, 0, 0, 0],
            backgroundColor: [
              "rgba(255, 99, 132, 0.7)",
              "rgba(54, 162, 235, 0.7)",
              "rgba(255, 206, 86, 0.7)",
              "rgba(75, 192, 192, 0.7)",
              "rgba(153, 102, 255, 0.7)",
            ],
            borderWidth: 1,
          },
        ],
      };
    }

    // Khởi tạo dữ liệu theo lớp
    const classCounts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    // Xử lý từng chiến dịch
    vaccineCampaigns.forEach((campaign) => {
      // Chỉ xử lý các chiến dịch có trạng thái APPROVED
      if (
        campaign.status !== "APPROVED" &&
        campaign.approval_status !== "APPROVED"
      ) {
        return;
      }

      if (campaign.class && classCounts.hasOwnProperty(campaign.class)) {
        // Đếm số chiến dịch theo lớp
        classCounts[campaign.class]++;
      }
    });

    return {
      labels: ["Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5"],
      datasets: [
        {
          label: "Số chiến dịch tiêm chủng đã duyệt",
          data: Object.values(classCounts),
          backgroundColor: [
            "rgba(255, 99, 132, 0.7)",
            "rgba(54, 162, 235, 0.7)",
            "rgba(255, 206, 86, 0.7)",
            "rgba(75, 192, 192, 0.7)",
            "rgba(153, 102, 255, 0.7)",
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [vaccineCampaigns]);

  // Xử lý dữ liệu tiêm chủng theo loại vắc-xin
  const vaccinationDataByType = useMemo(() => {
    if (!vaccineCampaigns || vaccineCampaigns.length === 0) {
      return {
        labels: ["Không có dữ liệu"],
        datasets: [
          {
            data: [1],
            backgroundColor: ["#e0e0e0"],
            borderWidth: 1,
          },
        ],
      };
    }

    // Đếm số lượng theo loại vắc-xin
    const vaccineTypes = {};

    vaccineCampaigns.forEach((campaign) => {
      // Chỉ xử lý các chiến dịch có trạng thái APPROVED
      if (
        campaign.status !== "APPROVED" &&
        campaign.approval_status !== "APPROVED"
      ) {
        return;
      }

      const vaccineType = campaign.title || "Không xác định";

      if (!vaccineTypes[vaccineType]) {
        vaccineTypes[vaccineType] = 0;
      }

      // Đếm số chiến dịch theo loại vắc-xin
      vaccineTypes[vaccineType]++;
    });

    // Sắp xếp và lấy top 5 loại vắc-xin phổ biến nhất
    const sortedTypes = Object.entries(vaccineTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const colors = [
      "rgba(255, 99, 132, 0.7)",
      "rgba(54, 162, 235, 0.7)",
      "rgba(255, 206, 86, 0.7)",
      "rgba(75, 192, 192, 0.7)",
      "rgba(153, 102, 255, 0.7)",
    ];

    return {
      labels: sortedTypes.map((item) => item[0]),
      datasets: [
        {
          label: "Số chiến dịch tiêm chủng đã duyệt",
          data: sortedTypes.map((item) => item[1]),
          backgroundColor: colors.slice(0, sortedTypes.length),
          borderWidth: 1,
        },
      ],
    };
  }, [vaccineCampaigns]);

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
    dispatch(fetchAllMedicationSubmissions());
  }, [fetchReportData, dispatch]);

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

  // BMI Distribution by Grade Stacked Bar Chart (dữ liệu bệnh mãn tính theo khối)
  const filteredChronicDiseases =
    chronoicDesease && Array.isArray(chronoicDesease)
      ? chronoicDesease.filter((item) => item !== "Không có")
      : [];
  const bmiColors = [
    "#4F46E5", // Indigo-600
    "#10B981", // Emerald-500
    "#F59E0B", // Amber-500
    "#EF4444", // Red-500
    "#8B5CF6", // Violet-500
    "#EC4899", // Pink-500
    "#06B6D4", // Cyan-500
    "#F97316", // Orange-500
    "#84CC16", // Lime-500
    "#6366F1", // Indigo-500
  ];
  const bmiData = {
    labels:
      khoiList && Array.isArray(khoiList)
        ? khoiList.map((khoi) => `Khối ${khoi}`)
        : [],
    datasets: filteredChronicDiseases.map((disease, idx) => ({
      label: disease,
      data:
        khoiList && Array.isArray(khoiList)
          ? khoiList.map((khoi) => {
              const khoiObj =
                studentsByKhoi && Array.isArray(studentsByKhoi)
                  ? studentsByKhoi.find((stu) => stu?.khoi === khoi)
                  : null;
              return khoiObj && Array.isArray(khoiObj.students)
                ? khoiObj.students.filter(
                    (stu) => stu?.health?.chronic_disease === disease
                  ).length
                : 0;
            })
          : [],
      backgroundColor: bmiColors[idx % bmiColors.length],
      borderColor: "#ffffff",
      borderWidth: 1,
      borderRadius: 4,
      hoverOffset: 4,
    })),
  };

  const bmiOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          boxHeight: 10,
          padding: 15,
          font: {
            size: 12,
            weight: "600",
            family: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
          },
          color: "#374151",
        },
        title: {
          display: true,
          text: "Bệnh mãn tính theo khối lớp",
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.parsed.y || 0;
            return `${label}: ${value} học sinh`;
          },
          title: function (context) {
            return context[0].label;
          },
        },
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
        },
        padding: 10,
        cornerRadius: 6,
        displayColors: true,
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
          color: "#1F2937",
          font: {
            weight: "600",
            size: 13,
          },
        },
        border: {
          color: "rgba(203, 213, 224, 0.5)",
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        max: undefined, // Tự động điều chỉnh theo dữ liệu
        grid: {
          color: "rgba(203, 213, 224, 0.3)",
          lineWidth: 1,
        },
        ticks: {
          precision: 0,
          callback: function (value) {
            return value;
          },
          color: "#4B5563",
          font: {
            size: 12,
          },
        },
        border: {
          dash: [4, 4],
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
    layout: {
      padding: 10,
    },
    barPercentage: 0.8,
    categoryPercentage: 0.8,
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

  // Xử lý dữ liệu sự cố y tế theo mức độ nghiêm trọng
  const medicalIncidentsBySeverity = useMemo(() => {
    if (
      !medicalIncidents ||
      !Array.isArray(medicalIncidents) ||
      medicalIncidents.length === 0
    ) {
      return {
        labels: ["Không có dữ liệu"],
        datasets: [
          {
            label: "Số sự cố",
            data: [0],
            backgroundColor: ["#e0e0e0"],
          },
        ],
      };
    }

    console.log("Medical Incidents Data:", medicalIncidents);

    // Phân loại sự cố y tế theo mức độ nghiêm trọng
    const severityCounts = {
      "Nguy kịch": 0,
      Vừa: 0,
      Nhẹ: 0,
    };

    medicalIncidents.forEach((incident) => {
      // Lấy mức độ nghiêm trọng từ dữ liệu
      let severity = "Nhẹ"; // Mặc định là nhẹ

      if (incident.severity_level) {
        const sevValue = incident.severity_level.toUpperCase();
        if (sevValue === "NGUY KỊCH" || sevValue === "HIGH") {
          severity = "Nguy kịch";
        } else if (sevValue === "VỪA" || sevValue === "MEDIUM") {
          severity = "Vừa";
        }
      } else if (incident.status) {
        // Phân loại dựa trên status
        const status = incident.status.toUpperCase();
        if (status === "IN_PROGRESS" || status === "CRITICAL") {
          severity = "Nguy kịch";
        } else if (status === "UNDER_TREATMENT" || status === "MONITORED") {
          severity = "Vừa";
        }
      } else if (incident.description) {
        // Phân loại dựa trên mô tả
        const desc = incident.description.toLowerCase();
        if (
          desc.includes("nguy kịch") ||
          desc.includes("cấp cứu") ||
          desc.includes("nghiêm trọng")
        ) {
          severity = "Nguy kịch";
        } else if (
          desc.includes("theo dõi") ||
          desc.includes("điều trị") ||
          desc.includes("vừa")
        ) {
          severity = "Vừa";
        }
      }

      // Tăng số lượng cho mức độ nghiêm trọng tương ứng
      severityCounts[severity]++;
    });

    // Màu sắc cho từng mức độ nghiêm trọng
    const colors = {
      "Nguy kịch": "#DC2626", // Đỏ đậm
      Vừa: "#F97316", // Cam đậm
      Nhẹ: "#10B981", // Xanh lá
    };

    // Chuyển đổi dữ liệu thành định dạng cho biểu đồ
    const labels = Object.keys(severityCounts);
    const data = Object.values(severityCounts);
    const backgroundColor = labels.map((label) => colors[label]);

    return {
      labels,
      datasets: [
        {
          label: "Số sự cố",
          data,
          backgroundColor,
        },
      ],
    };
  }, [medicalIncidents]);

  // Prescription requests per month
  // State for displayMonths
  const [displayMonths, setDisplayMonths] = useState(() => {
    const currentMonth = new Date().getMonth() + 1;
    return currentMonth < 6 ? [1, 2, 3, 4, 5, 6] : [6, 7, 8, 9, 10, 11, 12];
  });

  // Đếm số lượng đơn thuốc gửi cho từng tháng trong displayMonths
  const prescriptionByMonth = {};
  displayMonths.forEach((month) => {
    prescriptionByMonth[month] = 0;
  });

  if (medicationSubmissions && Array.isArray(medicationSubmissions)) {
    medicationSubmissions.forEach((req) => {
      if (!req.created_at) return;
      const date = new Date(req.created_at);
      if (displayMonths.includes(date.getMonth() + 1)) {
        prescriptionByMonth[date.getMonth() + 1]++;
      }
    });
  }

  // Tạo nhãn tháng dạng "Tháng 1", "Tháng 2", ...
  const sortedMonths = displayMonths.map((m) => `Tháng ${m}`);

  // Tạo dữ liệu cho chart
  const prescriptionChartData = {
    labels: sortedMonths,
    datasets: [
      {
        label: "Đơn thuốc gửi",
        data: displayMonths.map((m) => prescriptionByMonth[m]),
        backgroundColor: "#60A5FA",
      },
    ],
  };

  const prescriptionChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
      x: {
        ticks: {
          font: { weight: "bold", size: 14 },
          color: "#1F2937",
        },
      },
    },
  };

  // Xử lý dữ liệu khám sức khỏe định kỳ theo tháng
  const healthExaminationsByMonth = useMemo(() => {
    if (
      !healthExaminations ||
      !Array.isArray(healthExaminations) ||
      healthExaminations.length === 0
    ) {
      return {
        labels: [
          "Tháng 1",
          "Tháng 2",
          "Tháng 3",
          "Tháng 4",
          "Tháng 5",
          "Tháng 6",
          "Tháng 7",
        ],
        datasets: [
          {
            label: "Đã duyệt",
            data: [0, 0, 0, 0, 0, 0, 0],
            borderColor: "#10B981", // Emerald-500
            backgroundColor: "rgba(16, 185, 129, 0.5)",
            tension: 0.3,
          },
          {
            label: "Đã từ chối",
            data: [0, 0, 0, 0, 0, 0, 0],
            borderColor: "#EF4444", // Red-500
            backgroundColor: "rgba(239, 68, 68, 0.5)",
            tension: 0.3,
          },
          {
            label: "Đang chờ",
            data: [0, 0, 0, 0, 0, 0, 0],
            borderColor: "#F59E0B", // Amber-500
            backgroundColor: "rgba(245, 158, 11, 0.5)",
            tension: 0.3,
          },
        ],
      };
    }

    console.log("Health Examinations:", healthExaminations);

    // Khởi tạo dữ liệu cho 12 tháng
    const months = Array(12)
      .fill(0)
      .map((_, i) => i + 1);
    const approvedByMonth = Array(12).fill(0);
    const rejectedByMonth = Array(12).fill(0);
    const pendingByMonth = Array(12).fill(0);

    // Xử lý từng bản ghi khám sức khỏe
    healthExaminations.forEach((exam) => {
      if (exam.scheduled_date || exam.created_at) {
        const examDate = new Date(exam.scheduled_date || exam.created_at);
        const month = examDate.getMonth(); // 0-11

        // Đếm số lượng theo trạng thái
        const status = exam.approval_status
          ? exam.approval_status.toUpperCase()
          : "";

        if (status.includes("APPROVED") || status === "APPROVED") {
          approvedByMonth[month]++;
        } else if (
          status.includes("DECLINED") ||
          status.includes("REJECTED") ||
          status === "DECLINED"
        ) {
          rejectedByMonth[month]++;
        } else if (
          status.includes("PENDING") ||
          status === "PENDING" ||
          status === ""
        ) {
          pendingByMonth[month]++;
        }
      }
    });

    // Lấy 6 tháng gần nhất hoặc 6 tháng đầu năm nếu không đủ dữ liệu
    const currentMonth = new Date().getMonth(); // 0-11
    let displayMonths;

    if (currentMonth < 5) {
      // Nếu hiện tại là tháng 1-6
      displayMonths = months.slice(0, 7); // Lấy 7 tháng đầu năm
    } else {
      displayMonths = months.slice(
        Math.max(0, currentMonth - 5),
        currentMonth + 2
      ); // Lấy 7 tháng gần nhất
    }

    const displayLabels = displayMonths.map((month) => `Tháng ${month}`);
    const displayApproved = displayMonths.map(
      (month) => approvedByMonth[month - 1]
    );
    const displayRejected = displayMonths.map(
      (month) => rejectedByMonth[month - 1]
    );
    const displayPending = displayMonths.map(
      (month) => pendingByMonth[month - 1]
    );

    console.log("Chart Data:", {
      labels: displayLabels,
      approved: displayApproved,
      rejected: displayRejected,
      pending: displayPending,
    });

    return {
      labels: displayLabels,
      datasets: [
        {
          label: "Đã duyệt",
          data: displayApproved,
          borderColor: "#10B981", // Emerald-500
          backgroundColor: "#10B981",
          tension: 0.3,
          pointBackgroundColor: "#10B981",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#10B981",
          pointRadius: 5,
          pointHoverRadius: 7,
        },
        {
          label: "Đã từ chối",
          data: displayRejected,
          borderColor: "#EF4444", // Red-500
          backgroundColor: "#EF4444",
          tension: 0.3,
          pointBackgroundColor: "#EF4444",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#EF4444",
          pointRadius: 5,
          pointHoverRadius: 7,
        },
        {
          label: "Đang chờ",
          data: displayPending,
          borderColor: "#F59E0B", // Amber-500
          backgroundColor: "#F59E0B",
          tension: 0.3,
          pointBackgroundColor: "#F59E0B",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#F59E0B",
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    };
  }, [healthExaminations]);

  const healthExaminationOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          boxHeight: 10,
          padding: 15,
          font: {
            size: 12,
            weight: "600",
            family: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
          },
          color: "#374151",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.parsed.y || 0;
            return `${label}: ${value} lịch khám`;
          },
        },
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
        },
        padding: 10,
        cornerRadius: 6,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#1F2937",
          font: {
            weight: "600",
            size: 13,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(203, 213, 224, 0.3)",
          lineWidth: 1,
        },
        ticks: {
          precision: 0,
          stepSize: 1,
          color: "#4B5563",
          font: {
            size: 12,
          },
        },
        border: {
          dash: [4, 4],
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
    elements: {
      line: {
        borderWidth: 3,
      },
      point: {
        radius: 5,
        hoverRadius: 7,
        borderWidth: 2,
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-white to-blue-50 p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCcgdmlld0JveD0nMCAwIDQwIDQwJz48ZyBmaWxsPSdyZ2JhKDEzLDExMCwyNTMsMC4wNSknIGZpbGwtcnVsZT0nZXZlbm9kZCc+PGNpcmNsZSBjeD0nMjAnIGN5PScyMCcgcj0nMicvPjwvZz48L3N2Zz4=')] bg-fixed`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header
          className={`mb-8 p-6 rounded-xl bg-gradient-to-r from-indigo-600/[.15] to-purple-600/[.05] flex items-center justify-between shadow-sm`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`p-4 bg-indigo-600/[.15] rounded-full border border-indigo-600/[.25] shadow-inner`}
            >
              <FiBarChart className={`w-10 h-10 text-3xl text-indigo-600`} />
            </div>
            <div>
              <h1 className={`text-gray-900 font-bold text-3xl mb-2`}>
                📊 Báo cáo & Thống kê Y tế
              </h1>
              <p className={`text-gray-600 flex items-center gap-2 text-sm`}>
                <span className="inline-flex items-center justify-center bg-indigo-100 text-indigo-800 p-1 rounded-full">
                  ✨
                </span>
                Tổng quan về tình hình sức khỏe học sinh và hoạt động y tế
                trường học
              </p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-16 flex flex-col items-center justify-center gap-6 bg-white/80 rounded-xl shadow-sm">
            <Spin
              indicator={
                <LoadingOutlined
                  style={{ fontSize: 42, color: "#4F46E5" }}
                  spin
                />
              }
            />
            <p className="text-gray-600 text-lg font-medium">
              Đang tải dữ liệu báo cáo...
            </p>
          </div>
        ) : (
          <>
            {/* Thống kê tổng quan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl shadow-sm border border-emerald-200/50 flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-full">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-500 text-white text-xl">
                    🩺
                  </div>
                </div>
                <div>
                  <p className="text-emerald-700 font-medium text-sm">
                    Tổng số học sinh
                  </p>
                  <h3 className="text-2xl font-bold text-emerald-900">
                    {studentRecords?.length || 0}
                  </h3>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200/50 flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white text-xl">
                    💉
                  </div>
                </div>
                <div>
                  <p className="text-blue-700 font-medium text-sm">
                    Chiến dịch tiêm chủng
                  </p>
                  <h3 className="text-2xl font-bold text-blue-900">
                    {vaccineCampaigns?.length || 0}
                  </h3>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl shadow-sm border border-amber-200/50 flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-full">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-500 text-white text-xl">
                    🚑
                  </div>
                </div>
                <div>
                  <p className="text-amber-700 font-medium text-sm">
                    Sự cố y tế
                  </p>
                  <h3 className="text-2xl font-bold text-amber-900">
                    {medicalIncidents?.length || 0}
                  </h3>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <Row gutter={[16, 16]} className="mb-8">
              {/* Student Health Status */}
              <Col xs={24} lg={8}>
                <Card
                  title={
                    <span className="flex items-center gap-2 text-gray-800 font-semibold">
                      🩺 Trạng thái sức khỏe học sinh
                    </span>
                  }
                  className="!rounded-xl !shadow-md !border !border-gray-200 hover:!shadow-lg transition-all duration-300 h-96 flex flex-col overflow-hidden"
                  headStyle={{
                    borderBottom: "1px solid rgba(229, 231, 235, 0.6)",
                    padding: "16px 24px",
                    background:
                      "linear-gradient(to right, rgba(249, 250, 251, 0.8), rgba(255, 255, 255, 0.8))",
                  }}
                  bodyStyle={{
                    padding: "20px",
                    background:
                      "linear-gradient(to bottom right, rgba(255, 255, 255, 0.9), rgba(249, 250, 251, 0.8))",
                  }}
                >
                  <div className="flex-grow flex items-center justify-center">
                    <Pie
                      data={studentHealthData}
                      options={studentHealthOptions}
                    />
                  </div>
                </Card>
              </Col>

              {/* Vaccination by Type */}
              <Col xs={24} lg={8}>
                <Card
                  title={
                    <span className="flex items-center gap-2 text-gray-800 font-semibold">
                      <PieChartOutlined className="text-blue-500" /> 💉 Chiến
                      dịch tiêm chủng đã duyệt theo loại vắc-xin
                    </span>
                  }
                  className="!rounded-xl !shadow-md !border !border-gray-200 hover:!shadow-lg transition-all duration-300 h-96 flex flex-col overflow-hidden"
                  extra={
                    <span className="text-xs text-gray-500">
                      Số lượng chiến dịch tiêm chủng đã duyệt theo từng loại
                      vắc-xin
                    </span>
                  }
                  headStyle={{
                    borderBottom: "1px solid rgba(229, 231, 235, 0.6)",
                    padding: "16px 24px",
                    background:
                      "linear-gradient(to right, rgba(249, 250, 251, 0.8), rgba(255, 255, 255, 0.8))",
                  }}
                  bodyStyle={{
                    padding: "20px",
                    background:
                      "linear-gradient(to bottom right, rgba(255, 255, 255, 0.9), rgba(249, 250, 251, 0.8))",
                  }}
                >
                  <div className="flex-grow flex items-center justify-center">
                    {loading ? (
                      <Spin
                        indicator={
                          <LoadingOutlined style={{ fontSize: 30 }} spin />
                        }
                      />
                    ) : vaccineCampaigns && vaccineCampaigns.length > 0 ? (
                      <Pie
                        data={vaccinationDataByType}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: {
                                boxWidth: 12,
                                padding: 8,
                                font: {
                                  size: 12,
                                },
                              },
                            },
                            tooltip: {
                              callbacks: {
                                label: function (context) {
                                  const label = context.label || "";
                                  const value = context.raw || 0;
                                  const total =
                                    context.chart.data.datasets[0].data.reduce(
                                      (a, b) => a + b,
                                      0
                                    );
                                  const percentage =
                                    total > 0
                                      ? Math.round((value / total) * 100)
                                      : 0;
                                  return `${label}: ${value} học sinh (${percentage}%)`;
                                },
                              },
                            },
                          },
                        }}
                      />
                    ) : (
                      <Empty
                        description={
                          <span className="text-gray-500">
                            Không có dữ liệu tiêm chủng
                          </span>
                        }
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div>
                </Card>
              </Col>

              {/* Vaccination by Class */}
              <Col xs={24} lg={8}>
                <Card
                  title={
                    <span className="flex items-center gap-2 text-gray-800 font-semibold">
                      <PieChartOutlined className="text-green-500" /> 💉 Chiến
                      dịch tiêm chủng đã duyệt theo lớp
                    </span>
                  }
                  className="!rounded-xl !shadow-md !border !border-gray-200 hover:!shadow-lg transition-all duration-300 h-96 flex flex-col overflow-hidden"
                  extra={
                    <span className="text-xs text-gray-500">
                      Số lượng chiến dịch tiêm chủng đã duyệt cho từng lớp
                    </span>
                  }
                  headStyle={{
                    borderBottom: "1px solid rgba(229, 231, 235, 0.6)",
                    padding: "16px 24px",
                    background:
                      "linear-gradient(to right, rgba(249, 250, 251, 0.8), rgba(255, 255, 255, 0.8))",
                  }}
                  bodyStyle={{
                    padding: "20px",
                    background:
                      "linear-gradient(to bottom right, rgba(255, 255, 255, 0.9), rgba(249, 250, 251, 0.8))",
                  }}
                >
                  <div className="flex-grow flex items-center justify-center">
                    {loading ? (
                      <Spin
                        indicator={
                          <LoadingOutlined style={{ fontSize: 30 }} spin />
                        }
                      />
                    ) : vaccineCampaigns && vaccineCampaigns.length > 0 ? (
                      <Pie
                        data={vaccinationDataByClass}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: {
                                boxWidth: 12,
                                padding: 8,
                                font: {
                                  size: 12,
                                },
                              },
                            },
                          },
                        }}
                      />
                    ) : (
                      <Empty
                        description={
                          <span className="text-gray-500">
                            Không có dữ liệu tiêm chủng theo lớp
                          </span>
                        }
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Vaccination By Year Chart */}
            <Row gutter={[16, 16]} className="mb-8">
              <Col xs={24}>
                <Card
                  title={
                    <span className="flex items-center gap-2 text-gray-800 font-semibold">
                      <BarChartOutlined className="text-purple-500" /> 📊 Thống
                      kê chiến dịch tiêm chủng đã duyệt theo tháng trong năm{" "}
                      {new Date().getFullYear()}
                    </span>
                  }
                  className="!rounded-xl !shadow-md !border !border-gray-200 hover:!shadow-lg transition-all duration-300 h-96 flex flex-col overflow-hidden"
                  extra={
                    <span className="text-xs text-gray-500">
                      Số lượng chiến dịch tiêm chủng đã duyệt theo từng tháng
                    </span>
                  }
                  headStyle={{
                    borderBottom: "1px solid rgba(229, 231, 235, 0.6)",
                    padding: "16px 24px",
                    background:
                      "linear-gradient(to right, rgba(249, 250, 251, 0.8), rgba(255, 255, 255, 0.8))",
                  }}
                  bodyStyle={{
                    padding: "20px",
                    background:
                      "linear-gradient(to bottom right, rgba(255, 255, 255, 0.9), rgba(249, 250, 251, 0.8))",
                  }}
                >
                  <div className="flex-grow flex items-center justify-center">
                    {loading ? (
                      <Spin
                        indicator={
                          <LoadingOutlined style={{ fontSize: 30 }} spin />
                        }
                      />
                    ) : vaccineCampaigns && vaccineCampaigns.length > 0 ? (
                      <Bar
                        data={vaccinationDataByYear}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "top",
                              align: "end",
                            },
                            tooltip: {
                              mode: "index",
                              intersect: false,
                            },
                          },
                          scales: {
                            x: {
                              grid: {
                                display: false,
                              },
                            },
                            y: {
                              beginAtZero: true,
                              grid: {
                                color: "rgba(0,0,0,0.05)",
                              },
                              ticks: {
                                precision: 0,
                              },
                            },
                          },
                        }}
                      />
                    ) : (
                      <Empty
                        description={
                          <span className="text-gray-500">
                            Không có dữ liệu tiêm chủng theo tháng
                          </span>
                        }
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Medical Incidents & Health Checkups */}
            <Row gutter={[16, 16]} className="mb-8">
              {/* Medical Incidents by Severity */}
              <Col xs={24} lg={8}>
                <Card
                  title={
                    <span className="flex items-center gap-2 text-gray-800 font-semibold">
                      <BarChartOutlined className="text-red-500" /> 🚑 Sự cố y
                      tế theo mức độ
                    </span>
                  }
                  className="!rounded-xl !shadow-md !border !border-gray-200 hover:!shadow-lg transition-all duration-300 h-[480px] flex flex-col overflow-hidden"
                  headStyle={{
                    borderBottom: "1px solid rgba(229, 231, 235, 0.6)",
                    padding: "16px 24px",
                    background:
                      "linear-gradient(to right, rgba(249, 250, 251, 0.8), rgba(255, 255, 255, 0.8))",
                  }}
                  bodyStyle={{
                    padding: "20px",
                    background:
                      "linear-gradient(to bottom right, rgba(255, 255, 255, 0.9), rgba(249, 250, 251, 0.8))",
                  }}
                >
                  <div className="flex-grow flex items-center justify-center">
                    {loading ? (
                      <Spin
                        indicator={
                          <LoadingOutlined style={{ fontSize: 30 }} spin />
                        }
                      />
                    ) : medicalIncidents && medicalIncidents.length > 0 ? (
                      <Pie
                        data={medicalIncidentsBySeverity}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: {
                                boxWidth: 12,
                                padding: 8,
                                font: {
                                  size: 12,
                                },
                              },
                            },
                            tooltip: {
                              callbacks: {
                                label: function (context) {
                                  const label = context.label || "";
                                  const value = context.raw || 0;
                                  const total =
                                    context.chart.data.datasets[0].data.reduce(
                                      (a, b) => a + b,
                                      0
                                    );
                                  const percentage =
                                    total > 0
                                      ? Math.round((value / total) * 100)
                                      : 0;
                                  return `${label}: ${value} sự cố (${percentage}%)`;
                                },
                              },
                            },
                          },
                        }}
                      />
                    ) : (
                      <Empty
                        description={
                          <span className="text-gray-500">
                            Không có dữ liệu sự cố y tế
                          </span>
                        }
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div>
                </Card>
              </Col>

              {/* Health Checkup */}
              <Col xs={24} lg={16}>
                <Card
                  title={
                    <span className="flex items-center gap-2 text-gray-800 font-semibold">
                      <LineChartOutlined className="text-blue-600" /> 🩻 Khám sức
                      khỏe định kỳ
                    </span>
                  }
                  className="!rounded-xl !shadow-md !border !border-gray-200 hover:!shadow-lg transition-all duration-300 h-[480px] flex flex-col overflow-hidden"
                  extra={
                    <span className="text-xs text-gray-500">
                      Số lượng lịch khám đã duyệt, đã từ chối và đang chờ theo
                      tháng
                    </span>
                  }
                  headStyle={{
                    borderBottom: "1px solid rgba(229, 231, 235, 0.6)",
                    padding: "16px 24px",
                    background:
                      "linear-gradient(to right, rgba(249, 250, 251, 0.8), rgba(255, 255, 255, 0.8))",
                  }}
                  bodyStyle={{
                    padding: "20px",
                    background:
                      "linear-gradient(to bottom right, rgba(255, 255, 255, 0.9), rgba(249, 250, 251, 0.8))",
                  }}
                >
                  <div
                    className="flex-grow flex items-center justify-center rounded-lg p-4"
                    style={{ minHeight: 300 }}
                  >
                    {loading ? (
                      <Spin
                        indicator={
                          <LoadingOutlined style={{ fontSize: 30 }} spin />
                        }
                      />
                    ) : healthExaminations && healthExaminations.length > 0 ? (
                      <Line
                        data={healthExaminationsByMonth}
                        options={healthExaminationOptions}
                        style={{ height: "100%" }}
                      />
                    ) : (
                      <Empty
                        description={
                          <span className="text-gray-500">
                            Không có dữ liệu lịch khám sức khỏe
                          </span>
                        }
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div>
                </Card>
              </Col>
            </Row>

            {/* BMI Distribution by Grade */}
            <Row gutter={[16, 16]} className="mb-8">
              <Col xs={24}>
                <Card
                  title={
                    <span className="flex items-center gap-2 text-gray-800 font-semibold">
                      <BarChartOutlined className="text-green-600" /> 🏫 Phân bố
                      bệnh mãn tính theo khối lớp
                    </span>
                  }
                  className="!rounded-xl !shadow-md !border !border-gray-200 hover:!shadow-lg transition-all duration-300 h-[480px] flex flex-col overflow-hidden"
                  extra={
                    <span className="text-xs text-gray-500">
                      Số lượng học sinh mắc bệnh mãn tính theo từng khối lớp
                    </span>
                  }
                  headStyle={{
                    borderBottom: "1px solid rgba(229, 231, 235, 0.6)",
                    padding: "16px 24px",
                    background:
                      "linear-gradient(to right, rgba(249, 250, 251, 0.8), rgba(255, 255, 255, 0.8))",
                  }}
                  bodyStyle={{
                    padding: "20px",
                    background:
                      "linear-gradient(to bottom right, rgba(255, 255, 255, 0.9), rgba(249, 250, 251, 0.8))",
                  }}
                >
                  <div
                    className="flex-grow flex items-center justify-center rounded-lg p-4"
                    style={{ minHeight: 300 }}
                  >
                    {loading ? (
                      <Spin
                        indicator={
                          <LoadingOutlined style={{ fontSize: 30 }} spin />
                        }
                      />
                    ) : filteredChronicDiseases &&
                      filteredChronicDiseases.length > 0 ? (
                      <Bar
                        data={bmiData}
                        options={bmiOptions}
                        style={{ height: "100%" }}
                      />
                    ) : (
                      <Empty
                        description={
                          <span className="text-gray-500">
                            Không có dữ liệu bệnh mãn tính
                          </span>
                        }
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Phần này đã được xóa theo yêu cầu */}

            {/*💊 Đơn thuốc gửi trong tháng */}
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} lg={24}>
                <Card
                  title={
                    <span className="flex items-center gap-2 text-gray-800 font-semibold">
                      <BarChartOutlined className="text-green-600" /> 💊 Những
                      đơn thuốc gửi cho con em trong tháng này
                    </span>
                  }
                  className="!rounded-xl !shadow-md !border !border-gray-200 hover:!shadow-lg transition-all duration-300 h-[100%] flex flex-col overflow-hidden"
                  extra={
                    <span className="text-xs text-gray-500">
                      Số lượng đơn thuốc phụ huynh gửi cho con em theo từng
                      tháng
                    </span>
                  }
                  headStyle={{
                    borderBottom: "1px solid rgba(229, 231, 235, 0.6)",
                    padding: "16px 24px",
                    background:
                      "linear-gradient(to right, rgba(249, 250, 251, 0.8), rgba(255, 255, 255, 0.8))",
                  }}
                  bodyStyle={{
                    padding: "20px",
                    background:
                      "linear-gradient(to bottom right, rgba(255, 255, 255, 0.9), rgba(249, 250, 251, 0.8))",
                  }}
                >
                  <div className="mb-4 flex justify-end gap-2">
                    <button
                      className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition shadow-sm font-medium"
                      onClick={() => setDisplayMonths([1, 2, 3, 4, 5, 6])}
                    >
                      Hiển thị tháng 1-6
                    </button>
                    <button
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition shadow-sm font-medium"
                      onClick={() => setDisplayMonths([6, 7, 8, 9, 10, 11, 12])}
                    >
                      Hiển thị tháng 6-12
                    </button>
                  </div>
                  <div
                    className="flex-grow flex items-center justify-center bg-white rounded-lg p-6 shadow-inner"
                    style={{ minHeight: 300 }}
                  >
                    {loading ? (
                      <Spin
                        indicator={
                          <LoadingOutlined style={{ fontSize: 30 }} spin />
                        }
                      />
                    ) : medicationSubmissions &&
                      medicationSubmissions.length > 0 ? (
                      <Bar
                        data={prescriptionChartData}
                        options={prescriptionChartOptions}
                        style={{ height: "100%", width: "100%" }}
                      />
                    ) : (
                      <Empty
                        description={
                          <span className="text-gray-500">
                            Không có dữ liệu đơn thuốc
                          </span>
                        }
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Hệ thống Quản lý Y tế Trường học</p>
        </div>
      </div>
    </div>
  );
}
