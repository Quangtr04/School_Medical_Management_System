import React from "react";
import { Modal, Table, Tag, Typography, Empty, Row, Col, Card } from "antd";
import {
  MedicineBoxOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { Title, Text } = Typography;

const VaccinationHistoryDetail = ({ visible, onClose, student, data = [] }) => {
  // Define columns for vaccination history table
  const totalDoses = data?.reduce(
    (sum, item) => sum + Number(item.dose_number || 0),
    0
  );

  const columns = [
    {
      title: "Tên vắc xin",
      dataIndex: "vaccine_name",
      key: "vaccine_name",
      render: (text) => <Text strong>{text ? text : "Chưa tiêm"}</Text>,
    },
    {
      title: "Tên học sinh",
      dataIndex: "full_name",
      key: "full_name",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (text) => <Text strong>{text === "MALE" ? "Nam" : "Nữ"}</Text>,
    },
    {
      title: "Lớp",
      dataIndex: "class_name",
      key: "class_name",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Số mũi",
      dataIndex: "dose_number",
      key: "dose_number",
      render: (number) => <Text strong>{number ? number : "Chưa tiêm"}</Text>,
    },
    {
      title: "Ngày tiêm",
      dataIndex: "vaccinated_at",
      key: "vaccinated_at",
      render: (date) =>
        date ? (
          <Text strong>{moment(date).format("DD/MM/YYYY")}</Text>
        ) : (
          <Text strong>Chưa tiêm</Text>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "follow_up_required",
      key: "follow_up_required",
      render: (text) => <Text strong>{text ? text : "Chưa tiêm"}</Text>,
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (text) => text || "--",
    },
  ];

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <FileTextOutlined style={{ marginRight: 8, color: "#1890ff" }} />
          <span>Lịch sử tiêm chủng - {student?.full_name || "Học sinh"}</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      {data && data.length > 0 ? (
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div
                className="history-item"
                style={{ display: "flex", alignItems: "center" }}
              >
                <CalendarOutlined
                  className="history-icon"
                  style={{ marginRight: 8, fontSize: 16 }}
                />
                <Text strong style={{ marginRight: 8 }}>
                  Tổng số mũi đã tiêm:
                </Text>
                <Tag color="green" style={{ fontWeight: "bold", fontSize: 14 }}>
                  {totalDoses}
                </Tag>
              </div>
            </Col>
          </Row>

          <Table
            dataSource={data.map((item, index) => ({ ...item, key: index }))}
            columns={columns}
            pagination={{ pageSize: 5 }}
            style={{ marginTop: 16 }}
          />
        </Card>
      ) : (
        <Empty description="Không có dữ liệu tiêm chủng" />
      )}

      <style jsx>{`
        .history-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        .history-icon {
          margin-right: 8px;
          color: #1890ff;
        }
      `}</style>
    </Modal>
  );
};

export default VaccinationHistoryDetail;
