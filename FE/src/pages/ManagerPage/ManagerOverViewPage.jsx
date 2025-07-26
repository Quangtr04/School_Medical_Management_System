import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPendingCheckupRequests,
  fetchPendingVaccineCampaigns,
  fetchApprovedCheckupRequests,
  fetchDeclinedCheckupRequests,
  fetchApprovedVaccineCampaigns,
  fetchDeclinedVaccineCampaigns,
} from "../../redux/manager/managerSlice";
import { Card, Statistic, Row, Col } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#1890ff", "#52c41a", "#ff4d4f"];

export default function ManagerOverViewPage() {
  const dispatch = useDispatch();
  const {
    pendingCheckupRequests,
    pendingVaccineCampaigns,
    approvedCheckupRequests,
    declinedCheckupRequests,
    approvedVaccineCampaigns,
    declinedVaccineCampaigns,
  } = useSelector((state) => state.manager);

  useEffect(() => {
    dispatch(fetchPendingCheckupRequests());
    dispatch(fetchPendingVaccineCampaigns());
    dispatch(fetchApprovedCheckupRequests());
    dispatch(fetchDeclinedCheckupRequests());
    dispatch(fetchApprovedVaccineCampaigns());
    dispatch(fetchDeclinedVaccineCampaigns());
  }, [dispatch]);

  // Tổng hợp số liệu
  const pending =
    (pendingCheckupRequests?.length || 0) +
    (pendingVaccineCampaigns?.length || 0);
  const approved =
    (approvedCheckupRequests?.length || 0) +
    (approvedVaccineCampaigns?.length || 0);
  const declined =
    (declinedCheckupRequests?.length || 0) +
    (declinedVaccineCampaigns?.length || 0);

  const data = [
    { name: "Đang chờ duyệt", value: pending },
    { name: "Đã duyệt", value: approved },
    { name: "Đã từ chối", value: declined },
  ];

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">
        Tổng quan phê duyệt đơn
      </h1>
      <Row gutter={24} className="mb-8">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Đơn đang chờ duyệt"
              value={pending}
              valueStyle={{ color: COLORS[0] }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Đơn đã duyệt trong tháng"
              value={approved}
              valueStyle={{ color: COLORS[1] }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Đơn đã từ chối trong tháng"
              value={declined}
              valueStyle={{ color: COLORS[2] }}
            />
          </Card>
        </Col>
      </Row>
      <Card title="Biểu đồ tỷ lệ phê duyệt đơn">
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}


