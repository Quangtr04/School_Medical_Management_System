/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Card,
  Modal,
  Form,
  DatePicker,
  Select,
  Tooltip,
  message,
  Tag,
  Empty,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  // FilterOutlined, // Không cần thiết nếu bạn dùng Select thay cho nút lọc tĩnh
  EyeOutlined,
  LoadingOutlined,
  // === Các Icon Mới Thêm Vào ===
  IdcardOutlined, // For ID
  FileTextOutlined, // For Tiêu đề (Title) and Mô tả (Description)
  CalendarOutlined, // For Ngày khám (Scheduled Date) and Ngày tạo (Created At)
  CheckCircleOutlined, // For Trạng thái (Status)
  DollarCircleOutlined, // For Nhà tài trợ (Sponsor)
  SettingOutlined, // For Hành động (Actions)
} from "@ant-design/icons";
import moment from "moment";
import { format, parseISO } from "date-fns";
import { FiFilePlus } from "react-icons/fi";
import { toast } from "react-toastify";

import { useDispatch, useSelector } from "react-redux";
import {
  createHealthExaminationSchedule,
  fetchAllHealthExaminations,
  updateHealthExaminationSchedule,
  deleteHealthExaminationSchedule,
  clearHealthExaminationsError,
  clearHealthExaminationsSuccess,
} from "../../redux/nurse/heathExaminations/heathExamination"; // <-- ĐÃ SỬA LỖI CHÍNH TẢ Ở ĐÂY

const { TextArea } = Input;
const { Option } = Select;

export default function Examination() {
  const dispatch = useDispatch();
  const examinations = useSelector((state) => state.examination.records);
  const loading = useSelector((state) => state.examination.loading);
  const error = useSelector((state) => state.examination.error);
  const success = useSelector((state) => state.examination.success);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentExamination, setCurrentExamination] = useState(null);
  const [form] = Form.useForm();

  // Dữ liệu cho Select lớp áp dụng trong form tạo/sửa
  const classOptions = Array.from({ length: 5 }, (_, i) => ({
    label: `Lớp ${i + 1}`,
    value: `${i + 1}`,
  }));

  const fetchExaminations = useCallback(async () => {
    const resultAction = await dispatch(
      fetchAllHealthExaminations({
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchQuery,
        class: classFilter, // Tham số lọc theo lớp
        status: statusFilter, // Tham số lọc theo trạng thái
      })
    );
    if (fetchAllHealthExaminations.fulfilled.match(resultAction)) {
      setPagination((prev) => ({
        ...prev,
        total: resultAction.payload.total || prev.total,
      }));
    }
  }, [
    dispatch,
    pagination.current,
    pagination.pageSize,
    searchQuery,
    classFilter, // Dependency cho classFilter
    statusFilter, // Dependency cho statusFilter
  ]);

  useEffect(() => {
    fetchExaminations();
  }, [fetchExaminations]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearHealthExaminationsError());
    }
    if (success) {
      dispatch(clearHealthExaminationsSuccess());
      fetchExaminations(); // Re-fetch data after a successful operation
    }
  }, [error, success, dispatch, fetchExaminations]); // Added fetchExaminations to dependencies

  const handleTableChange = (newPagination) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPagination((prev) => ({ ...prev, current: 1 })); // Reset về trang 1 khi tìm kiếm
  };

  // Hàm xử lý khi thay đổi filter trạng thái
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, current: 1 })); // Reset về trang 1 khi lọc
  };

  const showModal = (record = null) => {
    setCurrentExamination(record);
    if (record) {
      form.setFieldsValue({
        title: record.title,
        description: record.description,
        // Đảm bảo date được chuyển đổi đúng định dạng moment
        scheduled_date: record.scheduled_date
          ? moment(record.scheduled_date)
          : null,
        sponsor: record.sponsor,
        className: record.class_name, // Đảm bảo trường này khớp với API
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleFormSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        // Định dạng ngày tháng về YYYY-MM-DD trước khi gửi đi
        scheduled_date: values.scheduled_date
          ? values.scheduled_date.format("YYYY-MM-DD")
          : null,
      };

      if (currentExamination) {
        await dispatch(
          updateHealthExaminationSchedule({
            id: currentExamination.id,
            scheduleData: formattedValues,
          })
        ).unwrap();
        // message.success("Cập nhật đơn khám sức khỏe thành công!"); // Message handled by useEffect
      } else {
        await dispatch(
          createHealthExaminationSchedule(formattedValues)
        ).unwrap();
        // toast.success("Tạo đơn khám sức khỏe thành công!"); // Message handled by useEffect
      }
      setIsModalVisible(false);
      // fetchExaminations(); // Re-fetch is already triggered by success useEffect
    } catch (error) {
      console.error("Failed to save examination campaign:", error);
      // message.error(error.message || "Đã xảy ra lỗi khi lưu đơn khám."); // Optional: specific error message
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentExamination(null);
    form.resetFields();
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
          await dispatch(deleteHealthExaminationSchedule(id)).unwrap();
          message.success("Xóa đơn khám sức khỏe thành công!");
          fetchExaminations(); // Re-fetch after successful deletion
        } catch (error) {
          console.error("Failed to delete examination campaign:", error);
          message.error(error.message || "Đã xảy ra lỗi khi xóa đơn khám.");
        }
      },
    });
  };

  const columns = [
    {
      title: (
        <Space>
          <IdcardOutlined style={{ color: "#1890ff" }} /> {/* Blue */}
          ID
        </Space>
      ),
      dataIndex: "checkup_id",
      key: "checkup_id",
      sorter: (a, b) => (a.checkup_id || "").localeCompare(b.checkup_id || ""),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: (
        <Space>
          <FileTextOutlined style={{ color: "#52c41a" }} /> {/* Green */}
          Tiêu đề
        </Space>
      ),
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => (a.title || "").localeCompare(b.title || ""),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: (
        <Space>
          <FileTextOutlined style={{ color: "#faad14" }} /> {/* Orange */}
          Mô tả
        </Space>
      ),
      dataIndex: "description",
      key: "description",
      className: "!font-semibold !text-gray-700",
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
      title: (
        <Space>
          <CalendarOutlined style={{ color: "#eb2f96" }} /> {/* Magenta */}
          Ngày khám
        </Space>
      ),
      dataIndex: "scheduled_date",
      key: "scheduled_date",
      render: (date) => (date ? format(parseISO(date), "yyyy-MM-dd") : "N/A"),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: (
        <Space>
          <CalendarOutlined style={{ color: "#722ed1" }} /> {/* Purple */}
          Ngày tạo
        </Space>
      ),
      dataIndex: "created_at",
      key: "created_at",
      className: "!font-semibold !text-gray-700",
      render: (created_at) =>
        created_at ? format(parseISO(created_at), "yyyy-MM-dd") : "N/A",
    },
    {
      title: (
        <Space>
          <CheckCircleOutlined style={{ color: "#08979c" }} /> {/* Cyan */}
          Trạng thái
        </Space>
      ),
      dataIndex: "approval_status",
      key: "approval_status",
      className: "!font-semibold !text-gray-700",
      render: (status) => {
        let color = "blue";
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
      title: (
        <Space>
          <DollarCircleOutlined style={{ color: "#d43808" }} />{" "}
          {/* Red-orange */}
          Nhà tài trợ
        </Space>
      ),
      dataIndex: "sponsor",
      key: "sponsor",
      className: "!font-semibold !text-gray-700",
    },
    {
      title: (
        <Space>
          <SettingOutlined style={{ color: "#bfbfbf" }} /> {/* Grey */}
          Hành động
        </Space>
      ),
      key: "actions",
      align: "center", // Căn giữa nội dung cột
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem danh sách học sinh">
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                message.info(`Xem danh sách học sinh cho đơn: ${record.title}`);
                // TODO: Chuyển hướng hoặc mở modal để xem danh sách học sinh của đơn khám này
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

  return (
    <div
      className={`min-h-screen bg-white p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCcgdmlld0JveD0nMCAwIDQwIDQwJz48ZyBmaWxsPSdyZ2JhKDEzLDExMCwyNTMsMC4xKScgZmlsbC1ydWxlPSdldmVub2RkJz48Y2lyY2xlIGN4PScyMCcgY3k9JzIwJyByPScyJy8+PC9nPg==')] bg-fixed`}
    >
      <div className="max-w-7xl mx-auto">
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

        {loading && examinations.length === 0 ? (
          renderLoadingState()
        ) : (
          <>
            <Card className="mb-6 !rounded-lg !shadow-md !border !border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <Input
                  placeholder="Tìm kiếm đơn khám (Tiêu đề, Mô tả...)"
                  prefix={<SearchOutlined className="text-gray-400" />}
                  className="flex-grow max-w-sm rounded-lg h-10"
                  onPressEnter={(e) => handleSearch(e.target.value)}
                  onBlur={(e) => handleSearch(e.target.value)}
                />
                {/* Select cho trạng thái */}
                <Select
                  placeholder="Lọc theo trạng thái"
                  onChange={handleStatusFilterChange}
                  allowClear
                  className="w-40 rounded-lg h-10"
                  value={statusFilter} // Đảm bảo hiển thị giá trị đã chọn
                >
                  <Option value="PENDING">Đang chờ</Option>
                  <Option value="APPROVED">Đã duyệt</Option>
                  <Option value="DECLINED">Đã từ chối</Option>
                </Select>
                {/* Select cho lớp áp dụng */}
              </div>
            </Card>

            <Card className="!rounded-lg !shadow-md !border !border-gray-200">
              <Table
                columns={columns}
                dataSource={examinations}
                rowKey="id"
                pagination={{
                  ...pagination,
                  showSizeChanger: true,
                  showTotal: (total, range) =>
                    `Hiển thị ${range[0]}-${range[1]} trên ${total} mục`,
                  className: "ant-pagination-custom",
                }}
                onChange={handleTableChange}
                className="custom-table"
                loading={loading}
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

        <Modal
          title={
            currentExamination
              ? "Chỉnh sửa đơn khám sức khỏe"
              : "Tạo đơn khám sức khỏe định kỳ mới"
          }
          open={isModalVisible}
          onCancel={handleCancel}
          okText={currentExamination ? "Cập nhật" : "Tạo mới"}
          confirmLoading={loading}
          width={600}
          footer={null}
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
              name="className"
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

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="mt-4"
              >
                {currentExamination ? "Cập nhật" : "Tạo mới"}
              </Button>
              <Button onClick={handleCancel} className="ml-2">
                Hủy
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
