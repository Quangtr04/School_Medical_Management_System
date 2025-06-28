/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  Select,
  DatePicker,
  Tag,
  message,
  Tooltip,
  Card,
  Spin,
  Empty,
  InputNumber,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  LoadingOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  // IMPORT CÁC ICON MỚI Ở ĐÂY
  IdcardOutlined, // Ví dụ cho 'Mã sự cố' hoặc 'ID'
  UserOutlined, // Cho 'Học sinh'
  TeamOutlined, // Cho 'Lớp'
  WarningOutlined, // Cho 'Loại' (mức độ nghiêm trọng)
  ClockCircleOutlined, // Cho 'Thời gian xảy ra'
  FileTextOutlined, // Cho 'Mô tả'
  CheckCircleOutlined, // Cho 'Trạng thái'
  SyncOutlined,
  EyeOutlined,
  ThunderboltOutlined, // Có thể dùng cho 'Hành động'
} from "@ant-design/icons";
import { FiPlusCircle, FiAlertTriangle } from "react-icons/fi";
import moment from "moment";
import { format, parseISO } from "date-fns";

// Import actions from medicalIncidents slice
import {
  fetchAllMedicalIncidents,
  createMedicalIncident,
  updateMedicalIncident,
  deleteMedicalIncident,
  setMedicalIncidentPagination,
  clearMedicalIncidentsSuccess,
  clearMedicalIncidentsError,
} from "../../redux/nurse/medicalIncidents/medicalIncidents"; // Đảm bảo đường dẫn đúng

// Import actions and selector from medicalSupplies slice
import { fetchMedicalSupplies } from "../../redux/nurse/medicalSupplies/medicalSupplies"; // Đảm bảo đường dẫn đúng

const { Option } = Select;

export default function MedicalIncident() {
  const dispatch = useDispatch();
  const {
    records: incidents,
    loading,
    error,
    success,
    pagination,
  } = useSelector((state) => state.medicalIncidents);

  // Lấy dữ liệu vật tư y tế từ slice
  const { supplies: medicalSupplies } = useSelector(
    (state) => state.medicalSupplies
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentIncident, setCurrentIncident] = useState(null);
  const [form] = Form.useForm();

  // Hook để theo dõi giá trị của Form.List 'medication_used'
  // Điều này cần thiết để bạn có thể truy cập supply_name của dòng hiện tại
  // và lấy thông tin tồn kho
  // Lưu ý: Tên trường trong Form.List Watch phải khớp với tên trong Form.Item
  const medicationUsed = Form.useWatch("medication_used", form) || [];

  // Fetch incidents based on current pagination, search, and filter
  const loadIncidents = useCallback(() => {
    dispatch(
      fetchAllMedicalIncidents({
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchQuery,
        status: statusFilter,
      })
    );
  }, [
    dispatch,
    pagination.current,
    pagination.pageSize,
    searchQuery,
    statusFilter,
  ]);

  // Fetch medical supplies (chỉ cần gọi một lần khi component mount)
  useEffect(() => {
    dispatch(fetchMedicalSupplies({ page: 1, pageSize: 1000 })); // Tăng pageSize để lấy đủ supplies nếu có nhiều
  }, [dispatch]);

  // Load incidents khi các tham số thay đổi
  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  // Handle success/error messages from Redux
  useEffect(() => {
    if (success) {
      message.success(
        currentIncident
          ? "Đã cập nhật sự kiện y tế thành công!"
          : "Đã ghi lại sự kiện y tế thành công!"
      );
      dispatch(clearMedicalIncidentsSuccess());
      setIsModalVisible(false);
      loadIncidents(); // Tải lại danh sách sau khi tạo/cập nhật
    }
    if (error) {
      message.error(error);
      dispatch(clearMedicalIncidentsError());
    }
  }, [success, error, dispatch, currentIncident, loadIncidents]);

  const handleTableChange = (newPagination) => {
    dispatch(
      setMedicalIncidentPagination({
        current: newPagination.current,
        pageSize: newPagination.pageSize,
      })
    );
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    dispatch(setMedicalIncidentPagination({ current: 1 }));
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    dispatch(setMedicalIncidentPagination({ current: 1 }));
  };

  const showModal = (incident = null) => {
    setCurrentIncident(incident);

    form.resetFields(); // Reset form trước khi set giá trị

    if (incident) {
      form.setFieldsValue({
        ...incident,
        // Đảm bảo ánh xạ đúng nếu tên trường trên backend khác trong form
        occurred_at: incident.occurred_at ? moment(incident.occurred_at) : null,
        resolved_at: incident.resolved_at ? moment(incident.resolved_at) : null,
        // Ánh xạ dữ liệu thuốc sử dụng từ incident vào Form.List
        // Dựa trên MedicalIncidentSchema, backend mong đợi supply_name và quantity_used
        medication_used:
          incident?.medication_used?.length > 0
            ? incident.medication_used.map((item) => ({
                supply_name: item.supply_name, // Lấy tên thuốc từ backend
                quantity_used: item.quantity_used, // Lấy số lượng đã dùng từ backend
              }))
            : [], // Khởi tạo mảng rỗng nếu không có thuốc
      });
    } else {
      // Khi tạo mới, khởi tạo một hàng thuốc trống để người dùng có thể thêm
      form.setFieldsValue({
        medication_used: [{ supply_name: null, quantity_used: null }], // Đã đổi sang quantity_used
      });
    }
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      console.log(values);

      const payload = {
        ...values,

        // Ensure occurred_at and resolved_at are formatted correctly
        occurred_at: values.occurred_at
          ? values.occurred_at.format("YYYY-MM-DDTHH:mm:ss")
          : null,
        resolved_at: values.resolved_at
          ? values.resolved_at.format("YYYY-MM-DDTHH:mm:ss")
          : null,
        // Lọc bỏ các item thuốc không có tên hoặc số lượng
        // Đảm bảo tên trường trong payload là supply_name và quantity_used
        medication_used:
          values.medication_used?.filter(
            (item) => item.supply_name && item.quantity_used > 0
          ) || [], // Đã đổi sang quantity_used
      };
      console.log("Payload gửi đi:", payload);

      // Log the filtered medication_used array to debug
      console.log("medication_used for payload:", payload.medication_used);

      if (currentIncident) {
        dispatch(
          updateMedicalIncident({
            id: currentIncident.id,
            incidentData: payload,
            // KHÔNG TRUYỀN TOKEN TRỰC TIẾP Ở ĐÂY - Axios interceptor đã xử lý
          })
        );
      } else {
        dispatch(createMedicalIncident(payload));
      }
    } catch (info) {
      console.log("Validate Failed:", info);
      message.error("Vui lòng điền đầy đủ và chính xác thông tin!");
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setCurrentIncident(null);
    form.resetFields();
    dispatch(clearMedicalIncidentsError());
    dispatch(clearMedicalIncidentsSuccess());
  };

  const handleDeleteIncident = (incidentId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa bản ghi sự kiện y tế này không?",
      okText: "Xóa",
      okType: "danger",
      onOk: () => {
        dispatch(deleteMedicalIncident(incidentId));
      },
    });
  };

  const getStatusTag = (status) => {
    const baseStyle = {
      borderRadius: "20px",
      padding: "4px 12px",
      fontWeight: 600,
      fontSize: "12px",
      textTransform: "uppercase",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
    };

    switch (status) {
      case "RESOLVED":
        return (
          <Tag
            icon={<CheckCircleOutlined />}
            style={{
              ...baseStyle,
              backgroundColor: "#f6ffed",
              borderColor: "#b7eb8f",
              color: "#389e0d",
            }}
          >
            Đã giải quyết
          </Tag>
        );

      case "MONITORING":
        return (
          <Tag
            icon={<EyeOutlined />}
            style={{
              ...baseStyle,
              backgroundColor: "#e6f7ff",
              borderColor: "#91d5ff",
              color: "#1890ff",
            }}
          >
            Đang theo dõi
          </Tag>
        );

      case "NEW":
        return (
          <Tag
            icon={<ClockCircleOutlined />}
            style={{
              ...baseStyle,
              backgroundColor: "#fafafa",
              borderColor: "#d9d9d9",
              color: "#595959",
            }}
          >
            Mới
          </Tag>
        );

      case "IN_PROGRESS":
        return (
          <Tag
            icon={<SyncOutlined spin />}
            style={{
              ...baseStyle,
              backgroundColor: "#fffbe6",
              borderColor: "#ffe58f",
              color: "#faad14",
            }}
          >
            Đang tiến hành
          </Tag>
        );

      default:
        return (
          <Tag
            style={{
              ...baseStyle,
              backgroundColor: "#f0f0f0",
              borderColor: "#d9d9d9",
              color: "#595959",
            }}
          >
            {status}
          </Tag>
        );
    }
  };
  const columns = [
    {
      title: (
        <Space>
          <IdcardOutlined style={{ color: "#1890ff" }} />{" "}
          {/* Màu xanh dương Ant Design */}
          Mã sự cố
        </Space>
      ),
      dataIndex: "event_id",
      key: "incidentId",
      sorter: (a, b) => a.event_id?.localeCompare(b.event_id),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: (
        <Space>
          <UserOutlined style={{ color: "#52c41a" }} /> {/* Màu xanh lá */}
          Học sinh
        </Space>
      ),
      dataIndex: "student_name",
      key: "studentName",
      className: "!font-semibold !text-gray-700",
    },
    {
      title: (
        <Space>
          <TeamOutlined style={{ color: "#faad14" }} /> {/* Màu vàng */}
          Lớp
        </Space>
      ),
      dataIndex: "class_name",
      key: "className",
      className: "!font-semibold !text-gray-700",
    },
    {
      title: (
        <Space>
          <WarningOutlined style={{ color: "#ff4d4f" }} /> {/* Màu đỏ */}
          Loại
        </Space>
      ),
      dataIndex: "severity_level",
      key: "type",
      className: "!font-semibold !text-gray-700",
    },
    {
      title: (
        <Space>
          <ClockCircleOutlined style={{ color: "#7cb305" }} />{" "}
          {/* Màu xanh lá cây đậm */}
          Thời gian xảy ra
        </Space>
      ),
      dataIndex: "occurred_at",
      key: "incidentTime",
      render: (time) =>
        time ? format(parseISO(time), "yyyy-MM-dd HH:mm") : "N/A",
      className: "!font-semibold !text-gray-700",
    },
    {
      title: (
        <Space>
          <FileTextOutlined style={{ color: "#d43808" }} /> {/* Màu cam */}
          Mô tả
        </Space>
      ),
      dataIndex: "description",
      key: "description",
      className: "!font-semibold !text-gray-700",
    },
    {
      title: (
        <Space>
          <CheckCircleOutlined style={{ color: "#08979c" }} />{" "}
          {/* Màu xanh ngọc */}
          Trạng thái
        </Space>
      ),
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: (
        <Space>
          <EditOutlined style={{ color: "#bfbfbf" }} /> {/* Màu tím */}
          Hành động
        </Space>
      ),
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => showModal(record)}>
            Xem chi tiết
          </Button>
          <Tooltip title="Chỉnh sửa sự cố">
            <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          </Tooltip>
          <Tooltip title="Xóa sự cố">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDeleteIncident(record.id)}
            />
          </Tooltip>
        </Space>
      ),
      className: "!font-semibold !text-gray-700 ",
    },
  ];
  const renderLoadingState = () => (
    <div className="text-center py-8 flex flex-col items-center justify-center gap-4">
      <Spin indicator={<LoadingOutlined style={{ fontSize: 30 }} spin />} />
      <p className="text-gray-500 text-lg">Đang tải dữ liệu sự kiện y tế...</p>
    </div>
  );

  return (
    <div
      className={`min-h-screen bg-white p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCcgdmlld0JveD0nMCAwIDQwIDQwJz48ZyBmaWxsPSdyZ2JhKDEzLDExMCwyNTMsMC4xKScgZmlsbC1ydWxlPSdldmVub2RkJz48Y2lyY2xlIGN4PScyMCcgY3k9JzIwJyByPScyJy8+PC9zdmc+')] bg-fixed`}
    >
      <div className="max-w-7xl mx-auto">
        <header
          className={`mb-5 p-4 rounded-lg bg-red-600/[.10] to-transparent flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-3 bg-red-600/[.10] rounded-full border border-red-600`}
            >
              <FiAlertTriangle className={`w-10 h-10 text-3xl text-red-600`} />
            </div>
            <div>
              <h1 className={`text-gray-900 font-bold text-3xl mb-2`}>
                Sự kiện y tế
              </h1>
              <p className={`text-gray-500 flex items-center gap-2 text-sm`}>
                <span>✨</span>
                Theo dõi và quản lý các sự kiện y tế tại trường
              </p>
            </div>
          </div>
          <Button
            type="primary"
            icon={<FiPlusCircle />}
            onClick={() => showModal(null)}
            className="flex items-center gap-1 px-4 py-2 !rounded-lg !bg-blue-600 hover:!bg-blue-700 !transition-colors"
          >
            Sự kiện y tế
          </Button>
        </header>

        {loading && incidents?.length === 0 ? (
          renderLoadingState()
        ) : (
          <>
            <Card className="!rounded-lg !shadow-md !border !border-gray-200">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <Input
                  placeholder="Tìm kiếm sự cố..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  className="flex-grow max-w-sm rounded-lg h-10"
                  onPressEnter={(e) => handleSearch(e.target.value)}
                  onBlur={(e) => handleSearch(e.target.value)}
                  defaultValue={searchQuery}
                />
                <Button
                  icon={<FilterOutlined />}
                  className="flex items-center gap-1 px-4 py-2 !border !border-gray-300 !rounded-lg hover:!bg-gray-100 !transition-colors !text-gray-900 h-10"
                >
                  Lọc
                </Button>
                <Select
                  placeholder="Tất cả trạng thái"
                  onChange={handleStatusFilterChange}
                  allowClear
                  className="w-40 rounded-lg h-10"
                  value={statusFilter}
                  options={[
                    { value: "RESOLVED", label: "Đã giải quyết" },
                    { value: "IN_PROGRESS", label: "Đang tiến hành" },
                    { value: "NEW", label: "Mới" },
                    { value: "MONITORING", label: "Đang theo dõi" },
                  ]}
                />
              </div>
              <Table
                columns={columns}
                dataSource={incidents}
                rowKey="id" // Đảm bảo rowKey là 'id' để tránh lỗi key
                pagination={{
                  ...pagination,
                  showSizeChanger: true,
                  showTotal: (total, range) =>
                    `Hiển thị ${range[0]}-${range[1]} trên tổng số ${total} sự cố`,
                  className: "ant-pagination-custom",
                  loading: loading,
                }}
                onChange={handleTableChange}
                className="custom-table"
                locale={{
                  emptyText: (
                    <Empty
                      description="Không tìm thấy sự kiện y tế nào"
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
                -{" "}
                {Math.min(
                  pagination.current * pagination.pageSize,
                  pagination.total
                )}{" "}
                trên tổng số {pagination.total} sự cố
              </div>
            </Card>
          </>
        )}

        <Modal
          title={
            currentIncident
              ? "Chỉnh sửa sự kiện y tế"
              : "Ghi lại sự kiện y tế mới"
          }
          visible={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText={currentIncident ? "Cập nhật sự cố" : "Ghi lại sự cố"}
          confirmLoading={loading}
          maskClosable={!loading}
          width={700} // Tăng chiều rộng modal cho tiện xem
        >
          <Form form={form} layout="vertical" name="incident_form">
            <Form.Item
              name="description"
              label="Tên sự cố"
              rules={[{ required: true, message: "Vui lòng nhập tên sự cố!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="student_name"
              label="Tên học sinh"
              rules={[
                { required: true, message: "Vui lòng nhập Tên học sinh!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="severity_level"
              label="Mức độ nghiêm trọng"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn Mức độ nghiêm trọng!",
                },
              ]}
            >
              <Select placeholder="Chọn mức độ nghiêm trọng">
                <Option value="Nặng">Nặng</Option>
                <Option value="Nguy kịch">Nguy kịch</Option>
                <Option value="Nhẹ">Nhẹ</Option>
                <Option value="Vừa">Vừa</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="occurred_at"
              label="Thời gian xảy ra"
              rules={[{ required: true, message: "Vui lòng chọn Ngày & Giờ!" }]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                style={{ width: "100%" }}
              />
            </Form.Item>

            {/* START - Phần Thuốc sử dụng đã chỉnh sửa để khớp với Schema */}
            <Form.List name="medication_used">
              {(fields, { add, remove }) => (
                <>
                  <p
                    className="ant-form-item-label"
                    style={{ marginBottom: "8px" }}
                  >
                    Thuốc sử dụng
                  </p>
                  {fields.map(({ key, name, ...restField }) => {
                    // Lấy TÊN thuốc đã chọn trong dòng hiện tại từ form's values
                    // Dùng 'supply_name' vì schema backend mong đợi 'supply_name'
                    const currentSupplyName = medicationUsed[name]?.supply_name;

                    // Tìm thông tin đầy đủ của loại thuốc đã chọn từ Redux store
                    // Tìm theo TÊN vì Select giờ lưu TÊN
                    const selectedSupplyInfo = medicalSupplies?.find(
                      (supply) => supply.name === currentSupplyName
                    );

                    // Số lượng tồn kho của loại thuốc này. Mặc định là 0 nếu không tìm thấy.
                    const availableQuantity = selectedSupplyInfo?.quantity || 0;

                    return (
                      <Space
                        key={key}
                        style={{
                          display: "flex",
                          marginBottom: 8,
                          alignItems: "baseline",
                        }}
                        align="baseline"
                      >
                        <Form.Item
                          {...restField}
                          // Tên trường trong Form.List phải là supply_name để gửi về backend
                          name={[name, "supply_name"]} // KHỚP VỚI SCHEMA: supply_name
                          rules={[
                            { required: true, message: "Vui lòng chọn thuốc!" },
                          ]}
                          style={{ flex: 3 }}
                        >
                          <Select
                            showSearch
                            placeholder="Chọn thuốc"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.children
                                ?.toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                            }
                            // Khi Select thay đổi, reset quantity_used của dòng đó
                            onChange={() => {
                              form.setFields([
                                {
                                  name: [name, "quantity_used"], // KHỚP VỚI SCHEMA: quantity_used
                                  value: undefined,
                                },
                              ]);
                            }}
                          >
                            {medicalSupplies?.map((supply) => (
                              <Option
                                key={supply.id} // Vẫn dùng ID làm key trong React để hiệu suất
                                value={supply.name} // GỬI TÊN CỦA THUỐC VỀ BACKEND (KHỚP SCHEMA)
                              >
                                {supply.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "quantity_used"]} // KHỚP VỚI SCHEMA: quantity_used
                          rules={[
                            { required: true, message: "Nhập số lượng!" },
                            {
                              type: "number",
                              min: 1,
                              message: "Số lượng phải lớn hơn 0",
                            },
                            // Thêm rule để kiểm tra số lượng sử dụng không vượt quá số lượng tồn kho
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                // Nếu chưa chọn thuốc hoặc không có giá trị, hoặc giá trị hợp lệ
                                if (
                                  !selectedSupplyInfo ||
                                  !value ||
                                  value <= availableQuantity
                                ) {
                                  return Promise.resolve();
                                }
                                // Nếu vượt quá số lượng tồn kho
                                return Promise.reject(
                                  new Error(
                                    `Số lượng còn lại trong kho: ${availableQuantity}.`
                                  )
                                );
                              },
                            }),
                          ]}
                          style={{ flex: 1 }} // Độ rộng cho InputNumber
                        >
                          <InputNumber
                            min={1}
                            // Set max là số lượng tồn kho của thuốc đã chọn
                            // Nếu chưa chọn thuốc, hoặc không có thông tin tồn kho, max là Infinity
                            max={
                              selectedSupplyInfo ? availableQuantity : Infinity
                            }
                            placeholder="Số lượng"
                            style={{ width: "100%" }}
                            disabled={!currentSupplyName} // Tắt InputNumber nếu chưa chọn thuốc
                          />
                        </Form.Item>

                        <MinusCircleOutlined onClick={() => remove(name)} />

                        {/* HIỂN THỊ SỐ LƯỢNG TỒN KHO BÊN CẠNH INPUT */}
                        {selectedSupplyInfo && (
                          <span
                            style={{
                              marginLeft: 8,
                              whiteSpace: "nowrap",
                              minWidth: "80px",
                              color: "#595959",
                            }}
                          >
                            (Còn: {availableQuantity})
                          </span>
                        )}
                      </Space>
                    );
                  })}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Thêm thuốc
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
            {/* END - Phần Thuốc sử dụng đã chỉnh sửa */}

            <Form.Item
              name="resolution_notes"
              label="Hướng giải quyết"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập giải pháp!",
                },
              ]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item name="resolved_at" label="Thời gian giải quyết">
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              name="description_detail"
              label="Mô tả chi tiết (Tùy chọn)"
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: "Vui lòng chọn Trạng thái!" }]}
            >
              <Select placeholder="Chọn một trạng thái">
                <Option value="NEW">Mới</Option>
                <Option value="IN_PROGRESS">Đang tiến hành</Option>
                <Option value="RESOLVED">Đã giải quyết</Option>
                <Option value="MONITORING">Đang theo dõi</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
