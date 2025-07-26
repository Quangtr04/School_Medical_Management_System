import React from "react";
import { Modal, Table, Descriptions, Typography } from "antd";
import moment from "moment";

const { Text } = Typography;

const CheckupHistoryDetail = ({ visible, onClose, student, data = [] }) => {
  // Sắp xếp theo ngày mới nhất -> cũ
  const sortedData = [...data].sort(
    (a, b) => new Date(b.checked_at) - new Date(a.checked_at)
  );

  const latest = sortedData[0];
  const previous = sortedData[1];

  const getColoredValue = (label, key, unit = "") => {
    const latestValue = latest?.[key];
    const previousValue = previous?.[key];

    let color = "inherit";
    if (latestValue != null && previousValue != null) {
      if (latestValue > previousValue) color = "green";
      else if (latestValue < previousValue) color = "red";
    }

    return (
      <>
        <Descriptions.Item label={`${label} (Mới)`}>
          <Text style={{ color }}>
            {latestValue ?? "-"} {unit}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label={`${label} (Trước đó)`}>
          <Text>
            {previousValue ?? "-"} {unit}
          </Text>
        </Descriptions.Item>
      </>
    );
  };

  const columns = [
    {
      title: "Ngày khám",
      dataIndex: "checked_at",
      key: "checked_at",
      render: (text) => (text ? moment(text).format("DD/MM/YYYY HH:mm") : "-"),
      sorter: (a, b) => new Date(a.checked_at) - new Date(b.checked_at),
      defaultSortOrder: "descend",
    },
    {
      title: "Chiều cao (cm)",
      dataIndex: "height_cm",
      key: "height_cm",
      render: (v) => v ?? "-",
    },
    {
      title: "Cân nặng (kg)",
      dataIndex: "weight_kg",
      key: "weight_kg",
      render: (v) => v ?? "-",
    },
    {
      title: "Thị lực trái",
      dataIndex: "vision_left",
      key: "vision_left",
      render: (v) => v ?? "-",
    },
    {
      title: "Thị lực phải",
      dataIndex: "vision_right",
      key: "vision_right",
      render: (v) => v ?? "-",
    },
    {
      title: "Thính lực trái",
      dataIndex: "hearing_left",
      key: "hearing_left",
      render: (v) => v ?? "-",
    },
    {
      title: "Thính lực phải",
      dataIndex: "hearing_right",
      key: "hearing_right",
      render: (v) => v ?? "-",
    },
    {
      title: "Huyết áp",
      dataIndex: "blood_pressure",
      key: "blood_pressure",
      render: (v) => v ?? "-",
    },
    {
      title: "Dấu hiệu bất thường",
      dataIndex: "abnormal_signs",
      key: "abnormal_signs",
      render: (v) => v ?? "Không có bất thường",
    },
    {
      title: "Cần tư vấn",
      dataIndex: "needs_counseling",
      key: "needs_counseling",
      render: (value) => (value ? "Có" : "Không"),
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      render: (v) => (
        <div style={{ whiteSpace: "pre-line", maxWidth: 300 }}>
          {v ?? "Không có ghi chú"}
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={`Lịch sử khám sức khỏe - ${student?.full_name || "Học sinh"}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      destroyOnClose
    >
      {latest && previous && (
        <>
          <Descriptions
            title="🔍 So sánh hai lần khám gần nhất"
            bordered
            column={2}
            style={{ marginBottom: 24 }}
          >
            <Descriptions.Item label="Ngày khám (Mới)">
              {moment(latest.checked_at).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày khám (Trước đó)">
              {moment(previous.checked_at).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>

            {getColoredValue("Chiều cao", "height_cm", "cm")}
            {getColoredValue("Cân nặng", "weight_kg", "kg")}
            {getColoredValue("Thị lực trái", "vision_left")}
            {getColoredValue("Thị lực phải", "vision_right")}
            {getColoredValue("Thính lực trái", "hearing_left")}
            {getColoredValue("Thính lực phải", "hearing_right")}
          </Descriptions>
        </>
      )}

      <Table
        columns={columns}
        dataSource={sortedData.map((item) => ({
          ...item,
          key: item.record_id || item.id || Math.random(),
        }))}
        pagination={{ pageSize: 5 }}
        scroll={{ x: "max-content" }}
      />
    </Modal>
  );
};

export default CheckupHistoryDetail;
