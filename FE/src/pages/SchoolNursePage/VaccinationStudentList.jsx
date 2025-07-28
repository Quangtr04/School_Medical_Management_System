"use client";

import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchApprovedStudentsByCampaignId,
  updateStudentVaccineDetail,
} from "../../redux/nurse/vaccinations/vaccinationSlice";
import dayjs from "dayjs";
import {
  Table,
  Tag,
  Card,
  Input,
  Button,
  Typography,
  Skeleton,
  Empty,
  Badge,
  Tooltip,
  Row,
  Col,
  Form,
  Modal,
  DatePicker,
  InputNumber,
  Select,
} from "antd";
import {
  SearchOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  MedicineBoxOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  EditOutlined,
  TeamOutlined,
  BarcodeOutlined,
  ContainerOutlined,
  EyeOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import TextArea from "antd/es/input/TextArea";
import { toast } from "react-toastify";

const { Title, Text } = Typography;

// Modern theme configuration
const modernTheme = {
  colors: {
    primary: "#1677ff",
    secondary: "#722ed1",
    success: "#52c41a",
    warning: "#faad14",
    error: "#ff4d4f",
    info: "#13c2c2",
    background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
    cardBackground: "rgba(255, 255, 255, 0.95)",
    glassMorphism: "rgba(255, 255, 255, 0.25)",
  },
  shadows: {
    card: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    hover: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  },
  borderRadius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    full: "9999px",
  },
};

// Enhanced card styles
const modernCardStyle = {
  borderRadius: modernTheme.borderRadius.xl,
  background: modernTheme.colors.cardBackground,
  boxShadow: modernTheme.shadows.card,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  backdropFilter: "blur(20px)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
};

const gradientHeaderStyle = {
  background: `linear-gradient(135deg, ${modernTheme.colors.primary} 0%, ${modernTheme.colors.secondary} 100%)`,
  borderRadius: modernTheme.borderRadius.xl,
  padding: "40px",
  color: "white",
  marginBottom: "32px",
  boxShadow: `0 20px 60px rgba(22, 119, 255, 0.4)`,
  position: "relative",
  overflow: "hidden",
};

// Enhanced status configuration
const statusConfig = {
  COMPLETED: {
    color: modernTheme.colors.success,
    bgColor: "#f6ffed",
    borderColor: "#b7eb8f",
    text: "OK",
    icon: <CheckCircleOutlined />,
  },
  FOLLOW_UP: {
    color: modernTheme.colors.error,
    bgColor: "#fff2f0",
    borderColor: "#ffccc7",
    text: "Cần theo dõi",
    icon: <ExclamationCircleOutlined />,
  },
};

export default function VaccinationStudentList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const campaigns = useSelector((state) => state.vaccination.campaigns);
  const campaignWithId = campaigns.find(
    (cam) => cam.campaign_id === Number(id)
  );
  console.log(campaignWithId);

  const [approvedStudentList, setApprovedStudentList] = useState([]);

  const [updateStudentRecModal, setUpdateStudentRecModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [updateVaccineForm] = Form.useForm();

  const [searchTerm, setSearchTerm] = useState("");

  // Filter students based on search term
  const filteredStudents = approvedStudentList?.filter((stu) => {
    const query = searchTerm?.toLowerCase().trim();
    if (!query) return true; // Nếu không có searchTerm, trả về toàn bộ danh sách

    return (
      stu.full_name?.toLowerCase().includes(query) ||
      stu.student_code?.toLowerCase().includes(query) ||
      stu.class_name?.toLowerCase().includes(query)
    );
  });

  const columns = [
    {
      title: (
        <div className="flex items-center gap-2">
          <UserOutlined style={{ color: modernTheme.colors.info }} />
          <span className="font-semibold">Mã lịch khám</span>
        </div>
      ),
      dataIndex: "campaign_id",
      key: "campaign_id",
      render: (text) => (
        <Text
          code
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: modernTheme.colors.info,
          }}
        >
          {text}
        </Text>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <UserOutlined style={{ color: modernTheme.colors.secondary }} />
          <span className="font-semibold">Mã HS</span>
        </div>
      ),
      dataIndex: "student_code",
      key: "student_code",
      render: (text) => (
        <Tag
          color="purple"
          style={{
            borderRadius: modernTheme.borderRadius.md,
            fontWeight: 600,
            padding: "4px 10px",
            fontSize: "12px",
          }}
        >
          {text}
        </Tag>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <UserOutlined style={{ color: modernTheme.colors.success }} />
          <span className="font-semibold">Họ và tên</span>
        </div>
      ),
      dataIndex: "full_name",
      key: "full_name",
      render: (text) => (
        <Text
          strong
          style={{ color: "#1f2937", fontSize: "14px", whiteSpace: "nowrap" }}
        >
          {text}
        </Text>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <TeamOutlined style={{ color: modernTheme.colors.warning }} />
          <span className="font-semibold">Lớp</span>
        </div>
      ),
      dataIndex: "class_name",
      key: "class_name",
      render: (text) => (
        <Tag
          color="gold"
          style={{
            borderRadius: modernTheme.borderRadius.sm,
            fontWeight: 600,
            fontSize: "12px",
          }}
        >
          {text}
        </Tag>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <CalendarOutlined style={{ color: "#8b5cf6" }} />
          <span className="font-semibold">Ngày sinh</span>
        </div>
      ),
      dataIndex: "date_of_birth",
      key: "date_of_birth",
      render: (dob) =>
        dob ? (
          dayjs(dob).format("DD/MM/YYYY")
        ) : (
          <span style={{ color: "#9ca3af" }}>N/A</span>
        ),
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <MedicineBoxOutlined style={{ color: modernTheme.colors.error }} />
          <span className="font-semibold">Thời gian tiêm</span>
        </div>
      ),
      dataIndex: "vaccinated_at",
      key: "vaccinated_at",
      render: (date) =>
        date ? (
          <Tag
            color="green"
            style={{
              borderRadius: modernTheme.borderRadius.sm,
              fontSize: "12px",
              fontWeight: 500,
            }}
          >
            {dayjs(date).format("DD/MM/YYYY HH:mm")}
          </Tag>
        ) : (
          <span style={{ color: "#9ca3af" }}>Chưa tiêm</span>
        ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          style={{
            background: modernTheme.colors.info,
            borderColor: modernTheme.colors.info,
            borderRadius: modernTheme.borderRadius.md,
          }}
          onClick={() => {
            setSelectedStudent(record);
            setUpdateStudentRecModal(true);
          }}
        >
          Cập nhật
        </Button>
      ),
    },
  ];

  const handleFinishUpdateStudentDetail = useCallback(
    async (values) => {
      if (!selectedStudent?.id) {
        toast.error("Không tìm thấy học sinh để cập nhật.");
        return;
      }
      const formData = {
        vaccinated_at: values.vaccinated_at
          ? values.vaccinated_at.format("YYYY-MM-DD")
          : null,
        vaccine_name: values.vaccine_name || "",
        dose_number: values.dose_number || null,
        reaction: values.reaction || "",
        follow_up_required:
          !!values.follow_up_require === "Có" ? "Có" : "Không",
        note: values.note || "",
      };
      try {
        await dispatch(
          updateStudentVaccineDetail({
            vaccine_id: selectedStudent.id,
            values: formData,
          })
        ).unwrap();
        toast.success("Cập nhật ghi chú tiêm thành công!");
        setUpdateStudentRecModal(false);
      } catch (error) {
        toast.error(
          "Cập nhật thất bại: " + (error.message || "Lỗi không xác định")
        );
      }
    },
    [dispatch, selectedStudent]
  );

  useEffect(() => {
    const fetchStudents = async () => {
      if (campaignWithId) {
        const data = await dispatch(
          fetchApprovedStudentsByCampaignId(id)
        ).unwrap();
        setApprovedStudentList(data);
      }
    };

    fetchStudents();
  }, [id, navigate, campaignWithId, updateStudentRecModal, dispatch]);

  useEffect(() => {
    if (selectedStudent) {
      updateVaccineForm.setFieldsValue({
        full_name: selectedStudent.full_name,
        class_name: selectedStudent.class_name,
        date_of_birth: selectedStudent.date_of_birth
          ? dayjs(selectedStudent.date_of_birth)
          : null,
        address: selectedStudent.address,
        vaccinated_at: selectedStudent.vaccinated_at
          ? dayjs(selectedStudent.vaccinated_at)
          : null,
        vaccine_name: selectedStudent.vaccine_name,
        dose_number: selectedStudent.dose_number,
        follow_up_required: selectedStudent.follow_up_required,
        note: selectedStudent.note,
        reaction: selectedStudent.reaction,
      });
    }
  }, [selectedStudent, updateVaccineForm]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: modernTheme.colors.background,
        padding: "24px",
      }}
    >
      {/* Header Card */}
      <Card style={gradientHeaderStyle}>
        <Row justify="space-between" align="middle">
          <Col>
            <div>
              <Title
                level={2}
                style={{
                  color: "white",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontWeight: 700,
                }}
              >
                <MedicineBoxOutlined
                  style={{ color: "#fbbf24", fontSize: "32px" }}
                />
                {campaignWithId?.name || "Chiến dịch tiêm chủng"}
              </Title>
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.9)",
                  fontSize: "16px",
                  marginTop: "8px",
                }}
              >
                Quản lý danh sách học sinh được duyệt tiêm chủng vào ngày{" "}
                {dayjs(campaignWithId?.scheduled_date).format("DD-MM-YYYY")}
              </Text>
            </div>
          </Col>
          <Col>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/nurse")}
              style={{
                height: "40px",
                padding: "0 16px",
                borderRadius: modernTheme.borderRadius.lg,
                background: modernTheme.colors.glassMorphism,
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "white",
                backdropFilter: "blur(10px)",
                fontWeight: 500,
              }}
            >
              Quay lại
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Main Content Card */}
      <Card style={modernCardStyle}>
        {/* Table Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            borderBottom: "1px solid #e2e8f0",
            padding: "24px",
            borderRadius: `${modernTheme.borderRadius.xl} ${modernTheme.borderRadius.xl} 0 0`,
          }}
        >
          <Row
            justify="space-between"
            align="middle"
            style={{ flexWrap: "wrap", gap: "16px" }}
          >
            <Col>
              <div>
                <Title
                  level={3}
                  style={{
                    color: "#1e293b",
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: 600,
                  }}
                >
                  <UserOutlined
                    style={{
                      color: modernTheme.colors.primary,
                      fontSize: "20px",
                    }}
                  />
                  Danh sách học sinh được duyệt
                </Title>
                <Text style={{ color: "#64748b", marginTop: "4px" }}>
                  Tổng cộng {filteredStudents.length} học sinh
                </Text>
              </div>
            </Col>
            <Col>
              <Input
                placeholder="Tìm kiếm học sinh..."
                prefix={<SearchOutlined style={{ color: "#64748b" }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "320px",
                  minWidth: "280px",
                }}
                allowClear
              />
            </Col>
          </Row>
        </div>

        {/* Table Content */}
        <div style={{ overflow: "hidden" }}>
          <Table
            columns={columns}
            dataSource={filteredStudents}
            rowKey="id"
            pagination={{
              pageSize: 5,
              showSizeChanger: false,
              showQuickJumper: true,
              showTotal: (total, range) => (
                <span style={{ color: "#64748b", fontWeight: 500 }}>
                  Hiển thị {range[0]}-{range[1]} trong tổng số {total} học sinh
                </span>
              ),
              style: {
                padding: "12",
                borderRadius: `0 0 ${modernTheme.borderRadius.xl} ${modernTheme.borderRadius.xl}`,
              },
            }}
            locale={{
              emptyText: (
                <div style={{ padding: "64px 0" }}>
                  <Empty
                    image={
                      <UserOutlined
                        style={{
                          fontSize: "64px",
                          color: "#d1d5db",
                          marginBottom: "16px",
                        }}
                      />
                    }
                    description={
                      <div style={{ marginBottom: "24px" }}>
                        <Title
                          level={4}
                          style={{ color: "#64748b", marginBottom: "8px" }}
                        >
                          {searchTerm
                            ? "Không tìm thấy học sinh"
                            : "Chưa có học sinh nào"}
                        </Title>
                        <Text
                          style={{
                            color: "#9ca3af",
                            maxWidth: "400px",
                            display: "block",
                            margin: "0 auto",
                          }}
                        >
                          {searchTerm
                            ? `Không có học sinh nào phù hợp với từ khóa "${searchTerm}"`
                            : "Danh sách học sinh sẽ hiển thị ở đây khi có dữ liệu."}
                        </Text>
                        {searchTerm && (
                          <div style={{ marginTop: "16px" }}>
                            <Button
                              onClick={() => setSearchTerm("")}
                              style={{
                                height: "36px",
                                padding: "0 16px",
                                borderRadius: modernTheme.borderRadius.lg,
                                border: "1px solid #d1d5db",
                                color: "#64748b",
                              }}
                            >
                              Xóa bộ lọc
                            </Button>
                          </div>
                        )}
                      </div>
                    }
                  />
                </div>
              ),
            }}
          />
        </div>

        <Modal
          title="Cập nhật thông tin tiêm chủng"
          open={updateStudentRecModal} // Đổi state tên rõ ràng hơn: isUpdateModalVisible
          onCancel={() => setUpdateStudentRecModal(false)}
          footer={null}
          centered
        >
          <Form
            layout="vertical"
            form={updateVaccineForm}
            onFinish={handleFinishUpdateStudentDetail}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <UserOutlined
                        style={{ color: modernTheme.colors.primary }}
                      />
                      Họ và tên học sinh
                    </span>
                  }
                >
                  <Input
                    readOnly
                    value={selectedStudent?.full_name}
                    style={{
                      borderRadius: modernTheme.borderRadius.md,
                      height: "48px",
                      fontSize: "14px",
                      backgroundColor: "#f9fafb",
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <BarcodeOutlined
                        style={{ color: modernTheme.colors.secondary }}
                      />
                      Mã học sinh
                    </span>
                  }
                >
                  <Input
                    readOnly
                    value={selectedStudent?.student_code}
                    style={{
                      borderRadius: modernTheme.borderRadius.md,
                      height: "48px",
                      fontSize: "14px",
                      backgroundColor: "#f9fafb",
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <TeamOutlined
                        style={{ color: modernTheme.colors.success }}
                      />
                      Lớp
                    </span>
                  }
                >
                  <Input
                    readOnly
                    value={selectedStudent?.class_name}
                    style={{
                      borderRadius: modernTheme.borderRadius.md,
                      height: "48px",
                      fontSize: "14px",
                      backgroundColor: "#f9fafb",
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span
                      className="flex items-center gap-2"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      <CalendarOutlined style={{ color: "#f59e0b" }} />
                      Ngày sinh
                    </span>
                  }
                >
                  <DatePicker
                    readOnly
                    value={
                      selectedStudent?.date_of_birth
                        ? dayjs(selectedStudent.date_of_birth)
                        : null
                    }
                    style={{
                      width: "100%",
                      borderRadius: modernTheme.borderRadius.md,
                      height: "48px",
                      fontSize: "14px",
                      backgroundColor: "#f9fafb",
                    }}
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label={
                <span
                  className="flex items-center gap-2"
                  style={{ fontWeight: "600", color: "#374151" }}
                >
                  <BarcodeOutlined style={{ color: "#06b6d4" }} />
                  Mã lịch khám
                </span>
              }
            >
              <Input
                readOnly
                value={selectedStudent?.campaign_id}
                style={{
                  borderRadius: modernTheme.borderRadius.md,
                  height: "48px",
                  fontSize: "14px",
                  backgroundColor: "#f9fafb",
                }}
              />
            </Form.Item>

            <Form.Item
              name="vaccinated_at"
              label={
                <span
                  className="flex items-center gap-2"
                  style={{ fontWeight: "600", color: "#374151" }}
                >
                  <CalendarOutlined style={{ color: "#ec4899" }} />
                  Ngày tiêm chủng
                </span>
              }
              rules={[
                { required: true, message: "Vui lòng chọn ngày tiêm chủng!" },
              ]}
            >
              <DatePicker
                style={{
                  width: "100%",
                  borderRadius: modernTheme.borderRadius.md,
                  height: "48px",
                  fontSize: "14px",
                  border: "2px solid #f3f4f6",
                }}
                format="YYYY-MM-DD HH:mm"
                showTime={{
                  format: "HH:mm",
                  disabledHours: () => {
                    const hours = [];
                    for (let i = 0; i < 24; i++) {
                      if (i < 7 || i > 17) {
                        hours.push(i);
                      }
                    }
                    return hours;
                  },
                }}
                disabledDate={(current) => {
                  return current && current < dayjs().startOf("day");
                }}
              />
            </Form.Item>

            <Form.Item
              name="vaccine_name"
              label={
                <span
                  className="flex items-center gap-2"
                  style={{ fontWeight: "600", color: "#374151" }}
                >
                  <MedicineBoxOutlined
                    style={{ color: modernTheme.colors.success }}
                  />
                  Tên vắc xin
                </span>
              }
              rules={[
                { required: true, message: "Vui lòng nhập tên vắc xin!" },
              ]}
            >
              <Input
                placeholder="Tên vắc xin đã tiêm"
                style={{
                  borderRadius: modernTheme.borderRadius.md,
                  height: "48px",
                  fontSize: "14px",
                  border: "2px solid #f3f4f6",
                }}
              />
            </Form.Item>

            <Form.Item
              name="dose_number"
              label={
                <span
                  className="flex items-center gap-2"
                  style={{ fontWeight: "600", color: "#374151" }}
                >
                  <ContainerOutlined style={{ color: "#8b5cf6" }} />
                  Số mũi
                </span>
              }
              rules={[{ required: true, message: "Vui lòng nhập số mũi!" }]}
            >
              <InputNumber
                min={1}
                style={{
                  width: "100%",
                  borderRadius: modernTheme.borderRadius.md,
                  height: "48px",
                  fontSize: "14px",
                }}
                placeholder="Số mũi đã tiêm"
              />
            </Form.Item>

            <Form.Item
              name="follow_up_required"
              label={
                <span
                  className="flex items-center gap-2"
                  style={{ fontWeight: "600", color: "#374151" }}
                >
                  <EyeOutlined style={{ color: "#f97316" }} />
                  Cần theo dõi thêm
                </span>
              }
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn trạng thái theo dõi!",
                },
              ]}
            >
              <Select
                placeholder="Chọn trạng thái"
                style={{
                  height: "48px",
                  fontSize: "14px",
                }}
              >
                <Option value="Có">Có</Option>
                <Option value="Không">Không</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="reaction"
              label={
                <span
                  className="flex items-center gap-2"
                  style={{ fontWeight: "600", color: "#374151" }}
                >
                  <CommentOutlined style={{ color: "#ec4899" }} />
                  Phản ứng sau tiêm
                </span>
              }
            >
              <TextArea
                rows={3}
                placeholder="Mô tả phản ứng (nếu có)"
                style={{
                  borderRadius: modernTheme.borderRadius.md,
                  fontSize: "14px",
                  border: "2px solid #f3f4f6",
                }}
              />
            </Form.Item>

            <Form.Item
              name="note"
              label={
                <span
                  className="flex items-center gap-2"
                  style={{ fontWeight: "600", color: "#374151" }}
                >
                  <EditOutlined style={{ color: "#06b6d4" }} />
                  Ghi chú
                </span>
              }
            >
              <TextArea
                rows={3}
                placeholder="Thêm ghi chú khác"
                style={{
                  borderRadius: modernTheme.borderRadius.md,
                  fontSize: "14px",
                  border: "2px solid #f3f4f6",
                }}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Lưu
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
}

{
  /* Enhanced Custom Styles */
}
<style jsx global>{`
  .ant-table-thead > tr > th {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-bottom: 2px solid #e2e8f0;
    font-weight: 700;
    color: #1e293b;
    padding: 20px 16px;
    font-size: 14px;
  }
  .ant-table-tbody > tr > td {
    border-bottom: 1px solid #f1f5f9;
    padding: 20px 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .ant-table-tbody > tr:hover > td {
    background-color: #f8fafc;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  .ant-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .ant-card-head {
    border: none !important;
  }
  .ant-card:hover {
    transform: translateY(-4px);
    box-shadow: ${modernTheme.shadows.hover} !important;
  }
  .ant-btn {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .ant-btn:hover {
    transform: translateY(-2px);
  }
  .ant-input {
    border-radius: ${modernTheme.borderRadius.lg} !important;
    border: 2px solid #f3f4f6 !important;
    height: 48px !important;
  }
  .ant-input:focus,
  .ant-input-focused {
    border-color: ${modernTheme.colors.primary} !important;
    box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1) !important;
  }
  .ant-pagination-item {
    border-radius: ${modernTheme.borderRadius.md} !important;
    border: 1px solid #e5e7eb !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  .ant-pagination-item:hover {
    border-color: ${modernTheme.colors.primary} !important;
    transform: translateY(-1px) !important;
  }
  .ant-pagination-item-active {
    background: ${modernTheme.colors.primary} !important;
    border-color: ${modernTheme.colors.primary} !important;
  }
  .ant-pagination-item-active a {
    color: white !important;
  }
  .ant-pagination-prev,
  .ant-pagination-next {
    border-radius: ${modernTheme.borderRadius.md} !important;
    border: 1px solid #e5e7eb !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  .ant-pagination-prev:hover,
  .ant-pagination-next:hover {
    border-color: ${modernTheme.colors.primary} !important;
    transform: translateY(-1px) !important;
  }
`}</style>;
