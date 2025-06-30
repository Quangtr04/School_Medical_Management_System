import {
  DownloadOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import { Col, Row, Card, Typography } from "antd";

const DocumentSection = ({
  allDocumentsCount,
  publicDocumentsCount,
  totalDownloads,
  allDocuments,
}) => {
  const { Title, Paragraph } = Typography; // ĐÚNG

  const data = [
    {
      icon: <FileTextOutlined style={{ fontSize: "28px", color: "#1890ff" }} />,
      title: "Tổng tài liệu",
      count: allDocumentsCount, // <-- Đã cập nhật
    },
    {
      icon: (
        <FolderOpenOutlined style={{ fontSize: "28px", color: "#52c41a" }} />
      ),
      title: "Công khai",
      count: publicDocumentsCount, // <-- Đã cập nhật
    },
    {
      icon: <DownloadOutlined style={{ fontSize: "28px", color: "#722ed1" }} />,
      title: "Lượt tải",
      count: totalDownloads, // <-- Đã cập nhật
    },
    {
      icon: <FileTextOutlined style={{ fontSize: "28px", color: "#fa8c16" }} />,
      title: "Danh mục",
      count: [...new Set(allDocuments.map((doc) => doc.category))].length, // Số danh mục duy nhất
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
      {data.map((item, index) => (
        <Col key={index} xs={24} sm={12} md={6}>
          <Card variant="default">
            <div style={{ display: "flex", alignItems: "center" }}>
              {item.icon}
              <div style={{ marginLeft: "12px" }}>
                <Paragraph
                  type="secondary"
                  style={{ margin: 0, fontSize: "14px" }}
                >
                  {item.title}
                </Paragraph>
                <Title level={4} style={{ margin: 0 }}>
                  {item.count}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default DocumentSection;
