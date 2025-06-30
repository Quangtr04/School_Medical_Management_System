import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Select,
  Tag,
  Modal,
  Form,
  message,
  Typography,
  Tooltip,
  Spin,
  Empty,
  Card,
  Row,
  Col,
  InputNumber,
  DatePicker,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  EditOutlined, // Sử dụng cho Xem danh sách học sinh
  DeleteOutlined,
  LoadingOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { FiFilePlus } from "react-icons/fi";
import { format, parseISO } from "date-fns";
import moment from "moment";
import api from "../../configs/config-axios"; // Đảm bảo đường dẫn đúng tới axios instance
import { toast } from "react-toastify";

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input; // Import TextArea cho mô tả

export default function HealthExaminationsPage() {
  const [loading, setLoading] = useState(false);
  const [examinations, setExaminations] = useState([]); // examinations giờ là các "đơn khám"
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState(null); // Filter theo lớp nào đó trong đơn khám
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentExamination, setCurrentExamination] = useState(null); // Lưu thông tin "đơn khám" khi chỉnh sửa
  const [form] = Form.useForm();

  // Mảng các lớp từ 1A đến 5A cho Select
  const classOptions = Array.from({ length: 5 }, (_, i) => ({
    label: `Lớp ${i + 1}`,
    value: `${i + 1}`,
  }));

  const fetchExaminations = useCallback(async () => {
    setLoading(true); // Đặt loading là true khi bắt đầu fetch
    try {
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchQuery,
        class: classFilter, // Có thể lọc các đơn khám theo lớp mà chúng áp dụng cho
      };
      // Giả định API này trả về danh sách các "đơn khám sức khỏe định kỳ"
      const res = await api.get("/nurse/checkups");
      console.log(res.data.checkups);
      const data = res.data.checkups;
      // Đổi endpoint cho rõ ràng hơn
      setExaminations(data);
      setPagination((prev) => ({
        ...prev,
      }));
    } catch (error) {
      toast.error("Error fetching health checkup campaigns:", error);
      message.error("Tải danh sách đơn khám sức khỏe thất bại.");
    } finally {
      setLoading(false); // Đặt loading là false khi kết thúc
    }
  }, [pagination.current, pagination.pageSize, searchQuery, classFilter]);

  useEffect(() => {
    fetchExaminations();
  }, [fetchExaminations]);

  const handleTableChange = (newPagination) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleClassFilterChange = (value) => {
    setClassFilter(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // Hàm này giờ sẽ dùng để tạo/chỉnh sửa một "đơn khám sức khỏe định kỳ"
  const showModal = (record = null) => {
    setCurrentExamination(record);
    if (record) {
      form.setFieldsValue({
        title: record.title,
        description: record.description,
        scheduled_date: record.scheduled_date
          ? moment(record.scheduled_date)
          : null,
        sponsor: record.sponsor,
        className: record.class_name, // Giả định trường tên lớp trong dữ liệu là class_name
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formattedValues = {
        ...values,
        scheduled_date: values.scheduled_date
          ? values.scheduled_date.format("YYYY-MM-DD")
          : null,
        // Thêm trường created_at nếu backend không tự tạo
        // created_at: moment().format("YYYY-MM-DD HH:mm:ss"), // Hoặc tùy thuộc vào backend
      };

      if (currentExamination) {
        // Chỉnh sửa đơn khám sức khỏe
        await api.put(
          `/nurse/checkups/${currentExamination.id}`,
          formattedValues
        ); // Đổi endpoint
        message.success("Cập nhật đơn khám sức khỏe thành công!");
      } else {
        // Tạo đơn khám sức khỏe mới
        await api.post("/nurse/checkups/create", formattedValues); // Đổi endpoint
        message.success("Tạo đơn khám sức khỏe thành công!");
      }
      setIsModalVisible(false);
      fetchExaminations(); // Tải lại dữ liệu sau khi thêm/sửa
    } catch (error) {
      console.error("Failed to save examination campaign:", error);
      message.error("Lưu đơn khám sức khỏe thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentExamination(null);
    form.resetFields();
  };

  // **This is the handler for successful form submission**
  const handleFormSubmit = async (values) => {
    setLoading(true);
    try {
      const formattedValues = {
        ...values,
        scheduled_date: values.scheduled_date
          ? values.scheduled_date.format("YYYY-MM-DD")
          : null,
      };

      if (currentExamination) {
        // Chỉnh sửa đơn khám sức khỏe
        await api.put(
          `/nurse/checkups/${currentExamination.id}}`,
          formattedValues
        );
        message.success("Cập nhật đơn khám sức khỏe thành công!");
      } else {
        // Tạo đơn khám sức khỏe mới
        await api.post("/nurse/checkups/create", formattedValues);
        toast.success("Tạo đơn khám sức khỏe thành công!");
      }
      setIsModalVisible(false);
      fetchExaminations(); // Tải lại dữ liệu sau khi thêm/sửa
    } catch (error) {
      console.error("Failed to save examination campaign:", error);
      message.error("Lưu đơn khám sức khỏe thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content:
        "Bạn có chắc chắn muốn xóa đơn khám sức khỏe này? Thao tác này có thể ảnh hưởng đến các bản ghi khám của học sinh thuộc đơn này.",
      okText: "Xóa",
      okType: "danger",
      onOk: async () => {
        try {
          setLoading(true);
          await api.delete(`/nurse/checkups/${id}`); // Đổi endpoint
          message.success("Xóa đơn khám sức khỏe thành công!");
          fetchExaminations(); // Tải lại dữ liệu
        } catch (error) {
          console.error("Failed to delete examination campaign:", error);
          message.error("Xóa đơn khám sức khỏe thất bại.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Các hàm getBmiTag và getVisionTag không còn cần thiết cho bảng "đơn khám"
  // vì bảng này không hiển thị BMI hay Thị lực trực tiếp.
  // Bạn có thể giữ lại nếu chúng được dùng ở nơi khác, hoặc xóa đi.

  const columns = [
    {
      title: "ID",
      dataIndex: "checkup_id", // ID của đơn khám, ví dụ: "DXSK001"
      key: "checkup_id", // Đổi key cho đúng dataIndex
      sorter: (a, b) => (a.checkup_id || "").localeCompare(b.checkup_id || ""), // Xử lý null/undefined
      className: "!font-semibold !text-gray-700",
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => (a.title || "").localeCompare(b.title || ""),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      className: "!font-semibold !text-gray-700",
      // Có thể render Tooltip nếu mô tả quá dài
      render: (text) => (
        <Tooltip title={text}>
          <div
            style={{
              maxWidth: "200px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {text}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Ngày khám", // Ngày được lên lịch để khám
      dataIndex: "scheduled_date",
      key: "scheduled_date",
      render: (date) => (date ? format(parseISO(date), "yyyy-MM-dd") : "N/A"),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: "Ngày tạo", // Ngày tạo đơn trong hệ thống
      dataIndex: "created_at",
      key: "created_at",
      className: "!font-semibold !text-gray-700",
      render: (created_at) =>
        created_at ? format(parseISO(created_at), "yyyy-MM-dd") : "N/A",
    },
    {
      title: "Trạng thái",
      dataIndex: "approval_status",
      key: "approval_status",
      className: "!font-semibold !text-gray-700",
      render: (status) => {
        let color = "blue"; // Màu mặc định
        if (status === "APPROVED") {
          color = "green";
        } else if (status === "PENDING") {
          color = "gold";
        } else if (status === "DECLINED") {
          color = "red";
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Nhà tài trợ",
      dataIndex: "sponsor",
      key: "sponsor",
      className: "!font-semibold !text-gray-700",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          {/* Nút này sẽ dẫn đến trang/modal quản lý học sinh của đơn khám này */}
          <Tooltip title="Xem danh sách học sinh">
            <Button
              icon={<EyeOutlined />} // Thay đổi icon cho phù hợp hơn với "xem"
              onClick={() => {
                // TODO: Chuyển hướng hoặc mở modal để xem danh sách học sinh của đơn khám này
                message.info(`Xem danh sách học sinh cho đơn: ${record.title}`);
                // Ví dụ: history.push(`/health-examinations/${record.id}/students`);
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa đơn khám">
            <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          </Tooltip>
          <Tooltip title="Xóa đơn khám">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
      className: "!font-semibold !text-gray-700",
    },
  ];

  const renderLoadingState = () => (
    <div className="text-center py-8 flex flex-col items-center justify-center gap-4">
      <Spin indicator={<LoadingOutlined style={{ fontSize: 30 }} spin />} />
      <p className="text-gray-500 text-lg">
        Đang tải danh sách đơn khám sức khỏe...
      </p>
    </div>
  );

  // Giả định dữ liệu category cho filter
  // mockClasses giờ có thể đại diện cho các "phạm vi" của đơn khám
  const mockClassesForFilter = [
    { id: "class-1", name: "1", value: "1" },
    { id: "class-2", name: "2", value: "2" },
    { id: "class-3", name: "3", value: "3" },
    { id: "class-4", name: "4", value: "4" },
    { id: "class-5", name: "5", value: "5" },
  ];

  return (
    <div
      className={`min-h-screen bg-white p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCcgdmlld0JveD0nMCAwIDQwIDQwJz48ZyBmaWxsPSdyZ2JhKDEzLDExMCwyNTMsMC4xKScgZmlsbC1ydWxlPSdldmVub2RkJz48Y2lyY2xlIGN4PScyMCcgY3k9JzIwJyByPScyJy8+PC9nPg==')] bg-fixed`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header
          className={`mb-5 p-4 rounded-lg bg-blue-500/[.10] to-transparent flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-3 bg-blue-500/[.10] rounded-full border border-blue-500`}
            >
              <FiFilePlus className={`w-10 h-10 text-3xl text-blue-600`} />
            </div>
            <div>
              <h1 className={`text-gray-900 font-bold text-3xl mb-2`}>
                Đơn khám sức khỏe
              </h1>
              <p className={`text-gray-500 flex items-center gap-2 text-sm`}>
                <span>📝</span>
                Quản lý các đợt khám sức khỏe định kỳ của học sinh
              </p>
            </div>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
              className="flex items-center gap-1 px-4 py-2 !rounded-lg !bg-blue-500 hover:!bg-blue-600 !transition-colors"
            >
              Tạo đơn khám sức khỏe định kỳ
            </Button>
          </Space>
        </header>

        {loading ? (
          renderLoadingState()
        ) : (
          <>
            {/* Filters and Search */}
            <Card className="mb-6 !rounded-lg !shadow-md !border !border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <Input
                  placeholder="Tìm kiếm đơn khám (Tiêu đề, Mô tả...)"
                  prefix={<SearchOutlined className="text-gray-400" />}
                  className="flex-grow max-w-sm rounded-lg h-10"
                  onPressEnter={(e) => handleSearch(e.target.value)}
                  onBlur={(e) => handleSearch(e.target.value)}
                />
                <Button
                  icon={<FilterOutlined />}
                  className="flex items-center gap-1 px-4 py-2 !border !border-gray-300 !rounded-lg hover:!bg-gray-100 !transition-colors !text-gray-900 h-10"
                >
                  Lọc
                </Button>
                <Select
                  placeholder="Lọc theo lớp áp dụng"
                  onChange={handleClassFilterChange}
                  allowClear
                  className="w-40 rounded-lg h-10"
                >
                  {mockClassesForFilter.map((cls) => (
                    <Option key={cls.id} value={cls.value}>
                      {cls.label}
                    </Option>
                  ))}
                </Select>
              </div>
            </Card>

            {/* Health Examinations Table */}
            <Card className="!rounded-lg !shadow-md !border !border-gray-200">
              <Table
                columns={columns}
                dataSource={examinations}
                rowKey="id" // Giả định mỗi đơn khám có một ID duy nhất
                pagination={{
                  ...pagination,
                  showSizeChanger: true,
                  showTotal: (total, range) =>
                    `Hiển thị ${range[0]}-${range[1]} trên ${total} mục`,
                  className: "ant-pagination-custom",
                }}
                onChange={handleTableChange}
                className="custom-table"
                locale={{
                  emptyText: (
                    <Empty
                      description="Không tìm thấy đơn khám sức khỏe nào"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ),
                }}
              />
              <div className="text-sm text-gray-600 mt-4">
                Hiển thị{" "}
                {pagination.current * pagination.pageSize -
                  pagination.pageSize +
                  1}{" "}
                -
                {Math.min(
                  pagination.current * pagination.pageSize,
                  pagination.total
                )}{" "}
                trên {pagination.total} mục
              </div>
            </Card>
          </>
        )}

        {/* Modal for Add/Edit Examination Campaign */}
        <Modal
          title={
            currentExamination
              ? "Chỉnh sửa đơn khám sức khỏe"
              : "Tạo đơn khám sức khỏe định kỳ mới"
          }
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          okText={currentExamination ? "Cập nhật" : "Tạo mới"}
          confirmLoading={loading}
          width={600} // Tăng chiều rộng modal nếu cần
        >
          <Form
            onFinish={handleFormSubmit}
            form={form}
            layout="vertical"
            name="health_campaign_form"
          >
            <Form.Item
              name="title"
              label="Tiêu đề đơn khám"
              rules={[{ required: true, message: "Vui lòng nhập Tiêu đề!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
            >
              <TextArea rows={3} />
            </Form.Item>

            <Form.Item
              name="scheduled_date"
              label="Ngày lên lịch khám"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn Ngày lên lịch khám!",
                },
              ]}
            >
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>

            <Form.Item
              name="sponsor"
              label="Nhà tài trợ"
              rules={[
                { required: true, message: "Vui lòng nhập Nhà tài trợ!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="className" // Đổi tên 'name' trong form item để phù hợp với dữ liệu khi chỉnh sửa nếu bạn muốn lưu là class_name
              label="Lớp áp dụng"
              rules={[
                { required: true, message: "Vui lòng chọn Lớp áp dụng!" },
              ]}
            >
              <Select placeholder="Chọn lớp áp dụng">
                {classOptions.map((cls) => (
                  <Option key={cls.value} value={cls.value}>
                    {cls.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
