// src/pages/NursePage/ReportsPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Button, Card, Row, Col, Typography, Spin, message, Space } from "antd";
import {
  PieChartOutlined,
  LineChartOutlined,
  BarChartOutlined,
  TableOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { FiBarChart } from "react-icons/fi";
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
import { useSelector } from "react-redux";

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

const { Title } = Typography;

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const studentList = useSelector(
    (state) => state.studentRecord.healthRecords || []
  );

  return (
    <>
      <h1>Hello</h1>
    </>
  );
}
