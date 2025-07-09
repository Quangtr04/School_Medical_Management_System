// src/AdminComponent/DocumentTableSection.jsx
import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Table,
  Tag,
  Input, // Import Input để dùng Input.Search
  Space,
  message,
  Popconfirm,
  Typography,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CloudDownloadOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { Paragraph } = Typography;

// Hàm hỗ trợ lấy icon file
const getFileIcon = (fileType) => {
  switch (fileType.toUpperCase()) {
    case "PDF":
      return <FilePdfOutlined style={{ color: "#ff4d4f" }} />;
    case "DOCX":
      return <FileWordOutlined style={{ color: "#1890ff" }} />;
    case "XLSX":
      return <FileExcelOutlined style={{ color: "#52c41a" }} />;
    default:
      return <FileTextOutlined style={{ color: "#8c8c8c" }} />;
  }
};

const DocumentTableSection = ({ allDocuments, setAllDocuments }) => {
  // State quản lý giá trị của ô tìm kiếm
  const [searchText, setSearchText] = useState("");
  // State quản lý dữ liệu hiển thị trong bảng (đã lọc)
  const [displayedData, setDisplayedData] = useState([]);

  // useEffect để lọc dữ liệu mỗi khi allDocuments HOẶC searchText thay đổi
  useEffect(() => {
    const lowercasedValue = searchText.toLowerCase();
    const filtered = allDocuments.filter(
      (item) =>
        item.name.toLowerCase().includes(lowercasedValue) ||
        item.description.toLowerCase().includes(lowercasedValue) ||
        item.category.toLowerCase().includes(lowercasedValue) ||
        item.type.toLowerCase().includes(lowercasedValue) ||
        item.uploader.toLowerCase().includes(lowercasedValue) ||
        item.status.toLowerCase().includes(lowercasedValue)
    );
    setDisplayedData(filtered);
  }, [allDocuments, searchText]); // Dependencies: allDocuments và searchText

  // Hàm xử lý khi giá trị ô tìm kiếm thay đổi

  // Hàm xử lý xóa tài liệu
  const handleDeleteDocument = (key) => {
    const updatedAllDocuments = allDocuments.filter((item) => item.key !== key);
    setAllDocuments(updatedAllDocuments); // Cập nhật state gốc ở component cha
    message.success("Đã xóa tài liệu thành công!");
  };

  // Cột của bảng
  const tableColumns = [
    {
      title: "Tên tài liệu",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          {getFileIcon(record.type)}
          <div>
            <Paragraph style={{ margin: 0, fontWeight: "500" }}>
              {text}
            </Paragraph>
            <Paragraph
              type="secondary"
              style={{ margin: 0, fontSize: "0.85em" }}
            >
              {record.description}
            </Paragraph>
          </div>
        </Space>
      ),
    },
    { title: "Danh mục", dataIndex: "category", key: "category" },
    { title: "Loại file", dataIndex: "type", key: "type" },
    { title: "Kích thước", dataIndex: "size", key: "size" },
    { title: "Người tải", dataIndex: "uploader", key: "uploader" },
    { title: "Lượt tải", dataIndex: "downloads", key: "downloads" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Công khai" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="text"
            icon={<CloudDownloadOutlined style={{ color: "#1890ff" }} />}
            size="small"
          />
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "#faad14" }} />}
            size="small"
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa tài liệu này?"
            onConfirm={() => handleDeleteDocument(record.key)}
            okText="Có"
            cancelText="Không"
            placement="left"
          >
            <Button
              type="text"
              icon={<DeleteOutlined style={{ color: "#ff4d4f" }} />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Danh sách tài liệu"
      variant="default"
      extra={
        <Space>
          <Input.Search // Sử dụng Input.Search
            placeholder="Tìm kiếm tài liệu..."
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
            allowClear
            value={searchText} // Gán giá trị từ state searchText
            onChange={(e) => setSearchText(e.target.value)} // Cập nhật searchText mỗi khi input thay đổi
          />
        </Space>
      }
    >
      <Table
        columns={tableColumns}
        dataSource={displayedData}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default DocumentTableSection;
