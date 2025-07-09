/* eslint-disable no-unused-vars */
import {
  PlusOutlined,
  DownloadOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  CloudDownloadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Row,
  Typography,
  Card,
  Table,
  Tag,
  Input,
  Space,
  message, // Sử dụng Ant Design message cho thông báo
  Popconfirm,
} from "antd";
// import { all } from "axios"; // Đã xóa - không sử dụng
import React, { useState, useEffect } from "react"; // <-- Đã thêm useEffect
import { useNavigate } from "react-router-dom";
import DocumentSection from "./DocumentSection";
import { toast } from "react-toastify";
// import { toast } from "react-toastify"; // Đã comment/xóa nếu chỉ dùng Ant Design message

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

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

// Dữ liệu ban đầu - chỉ dùng khi localStorage TRỐNG hoặc lỗi
const initialDataForComponent = [
  {
    key: "1",
    name: "Quy chế đào tạo 2024",
    description: "Quy chế đào tạo đại học và sau đại học năm 2024",
    category: "Quy chế",
    type: "PDF",
    size: "2.5 MB",
    uploader: "Admin",
    downloads: 45,
    status: "Công khai",
  },
  {
    key: "2",
    name: "Mẫu đơn xin nghỉ học",
    description: "Mẫu đơn xin nghỉ học tạm thời cho học sinh",
    category: "Biểu mẫu",
    type: "DOCX",
    size: "150 KB",
    uploader: "Phòng Đào tạo",
    downloads: 128,
    status: "Công khai",
  },
  {
    key: "3",
    name: "Hướng dẫn sử dụng thư viện",
    description: "Hướng dẫn chi tiết cách sử dụng thư viện điện tử",
    category: "Hướng dẫn",
    type: "PDF",
    size: "1.8 MB",
    uploader: "Thư viện",
    downloads: 67,
    status: "Công khai",
  },
  {
    key: "4",
    name: "Báo cáo tài chính Q4/2023",
    description: "Báo cáo tài chính quý 4 năm 2023",
    category: "Báo cáo",
    type: "XLSX",
    size: "3.2 MB",
    uploader: "Phòng Tài chính",
    downloads: 12,
    status: "Riêng tư",
  },
];

export default function FileManagementSection() {
  // const navigate = useNavigate();

  // Effect để lưu allDocuments vào localStorage mỗi khi nó thay đổi

  const getInitialDataFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem("documentData");
      return savedData ? JSON.parse(savedData) : initialDataForComponent;
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return initialDataForComponent; // Trả về dữ liệu mặc định nếu có lỗi
    }
  };
  const [allDocuments, setAllDocuments] = useState(
    getInitialDataFromLocalStorage
  );

  // const handleNavigate = () => {
  //   navigate("/admin/add-document");
  // };

  useEffect(() => {
    try {
      localStorage.setItem("documentData", JSON.stringify(allDocuments));
      // Sau khi allDocuments thay đổi, cần cập nhật lại displayedData
      // để đảm bảo bộ lọc (nếu có searchText) vẫn hoạt động đúng
    } catch (error) {
      console.error("Error saving to localStorage", error);
    }
  }, [allDocuments]);

  const totalDocumentsCount = allDocuments.length;
  const publicDocumentsCount = allDocuments.filter(
    (doc) => doc.status === "Công khai"
  ).length;
  const totalDownloads = allDocuments.reduce(
    (sum, doc) => sum + doc.downloads,
    0
  );

  const HeaderSection = () => {
    return (
      <div className="file-management-header-section">
        <Row
          align="middle"
          justify="space-between"
          style={{ marginBottom: "24px" }}
        >
          <Col>
            {" "}
            <Title level={3} style={{ margin: 0 }}>
              Quản lý Tài liệu{" "}
            </Title>{" "}
            <Paragraph type="secondary" style={{ margin: 0 }}>
              Quản lý các tài liệu, biểu mẫu và hướng dẫn của
            </Paragraph>
          </Col>
          <Col>
            {/* <Button
              onClick={handleNavigate}
              type="primary"
              icon={<PlusOutlined />}
              size="large"
            >
              Thêm tài liệu
            </Button> */}
          </Col>
        </Row>
      </div>
    );
  };

  const TableSection = () => {
    const [displayedData, setDisplayedData] = useState(
      getInitialDataFromLocalStorage
    );
    const [searchText, setSearchText] = useState("");

    // Hàm xử lý tìm kiếm
    const handleSearch = (value) => {
      const lowercasedValue = value.toLowerCase();
      setSearchText(lowercasedValue);

      if (lowercasedValue === "") {
        setDisplayedData(allDocuments); // Hiển thị tất cả từ dữ liệu gốc
      } else {
        const filtered = allDocuments.filter(
          (item) =>
            item.name.toLowerCase().includes(lowercasedValue) ||
            item.description.toLowerCase().includes(lowercasedValue) ||
            item.category.toLowerCase().includes(lowercasedValue) ||
            item.type.toLowerCase().includes(lowercasedValue) ||
            item.uploader.toLowerCase().includes(lowercasedValue) ||
            item.status.toLowerCase().includes(lowercasedValue)
        );
        setDisplayedData(filtered); // Cập nhật dữ liệu hiển thị
      }
    };

    // Hàm xử lý xóa tài liệu
    const handleDeleteDocument = (key) => {
      const updatedAllDocuments = allDocuments.filter(
        (item) => item.key !== key
      );
      setAllDocuments(updatedAllDocuments); // Điều này sẽ kích hoạt useEffect và cập nhật displayedData

      toast.success("Đã xóa tài liệu thành công!");
    };

    // Định nghĩa tableColumns NẰM TRONG TableSection
    const tableColumns = [
      {
        title: "Tên tài liệu",
        dataIndex: "name",
        key: "name",
        render: (text, record) => (
          <Space>
            {getFileIcon(record.type)}
            <div>
              <p style={{ margin: 0, fontWeight: "500" }}>{text}</p>
              <p style={{ margin: 0, color: "gray", fontSize: "0.85em" }}>
                {record.description}
              </p>
            </div>
          </Space>
        ),
      },
      {
        title: "Danh mục",
        dataIndex: "category",
        key: "category",
      },
      {
        title: "Loại file",
        dataIndex: "type",
        key: "type",
      },
      {
        title: "Kích thước",
        dataIndex: "size",
        key: "size",
      },
      {
        title: "Người tải",
        dataIndex: "uploader",
        key: "uploader",
      },
      {
        title: "Lượt tải",
        dataIndex: "downloads",
        key: "downloads",
      },
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
        extra={
          <Space>
            <Search
              placeholder="Tìm kiếm tài liệu..."
              style={{ width: 250 }}
              prefix={<SearchOutlined />}
              allowClear
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
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

  // Tính toán các giá trị thống kê cần thiết

  return (
    <>
      <HeaderSection />
      {/* Truyền các giá trị đã tính toán xuống DocumentSection */}
      <DocumentSection
        allDocumentsCount={totalDocumentsCount}
        publicDocumentsCount={publicDocumentsCount}
        totalDownloads={totalDownloads}
        allDocuments={allDocuments}
      />
      <TableSection />
    </>
  );
}
