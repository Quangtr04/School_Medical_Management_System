/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  SearchOutlined,
  FilterOutlined,
  LoadingOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  IdcardOutlined,
  UserOutlined,
  TeamOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { FiPlusCircle, FiAlertTriangle } from "react-icons/fi";
import moment from "moment";
import { format, parseISO } from "date-fns";
import { toast } from "react-toastify";
import {
  fetchAllMedicalIncidents,
  createMedicalIncident,
  updateMedicalIncident,
  deleteMedicalIncident,
  setMedicalIncidentPagination,
  clearMedicalIncidentsSuccess,
  clearMedicalIncidentsError,
  updateMedicalIncidentStatus,
} from "../../redux/nurse/medicalIncidents/medicalIncidents";
import { fetchMedicalSupplies } from "../../redux/nurse/medicalSupplies/medicalSupplies";

const { Option } = Select;

// Helper: Trạng thái
const STATUS_MAP = {
  NEW: "Mới",
  IN_PROGRESS: "Đang tiến hành",
  RESOLVED: "Đã giải quyết",
  MONITORING: "Đang theo dõi",
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
          {STATUS_MAP[status]}
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
          {STATUS_MAP[status]}
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
          {STATUS_MAP[status]}
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
          {STATUS_MAP[status]}
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
          {STATUS_MAP[status] || status}
        </Tag>
      );
  }
};

const renderLoadingState = () => (
  <div className="text-center py-8 flex flex-col items-center justify-center gap-4">
    <Spin indicator={<LoadingOutlined style={{ fontSize: 30 }} spin />} />
    <p className="text-gray-500 text-lg">Đang tải dữ liệu sự kiện y tế...</p>
  </div>
);

const fontFamily = { fontFamily: "Poppins, Roboto, sans-serif" };
const cardNeumorph = {
  borderRadius: 24,
  boxShadow: "8px 8px 24px #e0f0ff, -8px -8px 24px #fff",
  background: "#fff",
  border: "1.5px solid #e0f0ff",
  transition: "box-shadow 0.2s, transform 0.2s",
};
const statIconStyle = {
  borderRadius: "50%",
  background: "#FFE0E0",
  boxShadow: "0 2px 8px #e0f0ff",
  width: 56,
  height: 56,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 28,
};

export default function MedicalIncident() {
  const dispatch = useDispatch();
  const {
    records: incidents,
    loading,
    error,
    success,
    pagination,
  } = useSelector((state) => state.medicalIncidents);
  const { supplies: medicalSupplies } = useSelector((state) => state.medicalSupplies);
  const children = useSelector((state) => state.studentRecord.healthRecords);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [addMedicalIncidentModal, setIsModalVisible] = useState(false);
  const [currentIncident, setCurrentIncident] = useState(null);
  const [form] = Form.useForm();
  const [selectedParentName, setSelectedParentName] = useState("");
  const [medicalIncidentsDetailModal, setMedicalIncidentsDetailModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const medicationUsed = Form.useWatch("medication_used", form) || [];
  const [selectedStatus, setSelectedStatus] = useState();

  // Fetch medical supplies (chỉ cần gọi một lần khi component mount)
  useEffect(() => {
    dispatch(fetchMedicalSupplies({ page: 1, pageSize: 1000 }));
  }, [dispatch]);

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
  }, [dispatch, pagination.current, pagination.pageSize, searchQuery, statusFilter]);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  const handleTableChange = useCallback((newPagination) => {
    dispatch(
      setMedicalIncidentPagination({
        current: newPagination.current,
        pageSize: newPagination.pageSize,
      })
    );
  }, [dispatch]);

  const handleSearch = useCallback((value) => {
    setSearchQuery(value);
    dispatch(setMedicalIncidentPagination({ current: 1 }));
  }, [dispatch]);

  const handleStatusFilterChange = useCallback((value) => {
    setStatusFilter(value);
    dispatch(setMedicalIncidentPagination({ current: 1 }));
  }, [dispatch]);

  const showModal = useCallback((incident) => {
    if (incident) {
      setCurrentIncident(incident);
      form.setFieldsValue({
        ...incident,
        occurred_at: incident.occurred_at ? moment(incident.occurred_at) : null,
        resolved_at: incident.resolved_at ? moment(incident.resolved_at) : null,
        medication_used: incident.medication_used?.map((item) => ({
          supply_name: item.supply_name,
          quantity_used: item.quantity_used,
        })),
        parent_name: incident.parent_name,
      });
      setSelectedParentName(incident.parent_name || "");
    } else {
      setCurrentIncident(null);
      form.resetFields();
      setSelectedParentName("");
    }
    setIsModalVisible(true);
  }, [form]);

  const showIncidentDetailModal = useCallback((incident) => {
    setMedicalIncidentsDetailModal(true);
    setSelectedIncident(incident);
  }, []);

  const handleModalOk = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        occurred_at: values.occurred_at ? values.occurred_at.format("YYYY-MM-DDTHH:mm:ss") : null,
        resolved_at: values.resolved_at ? values.resolved_at.format("YYYY-MM-DDTHH:mm:ss") : null,
        medication_used:
          values.medication_used?.filter(
            (item) => item.supply_name && item.quantity_used > 0
          ) || [],
      };
      if (currentIncident) {
        dispatch(
          updateMedicalIncident({
            id: currentIncident.id,
            incidentData: payload,
          })
        )
          .unwrap()
          .then(() => {
            toast.success("Cập nhật sự kiện thành công!");
            form.resetFields();
            setIsModalVisible(false);
            dispatch(fetchAllMedicalIncidents());
            setCurrentIncident(null);
            setSelectedParentName("");
          })
          .catch((err) => {
            toast.error("Đã có lỗi xảy ra khi cập nhật sự kiện!");
          });
      } else {
        dispatch(createMedicalIncident(payload))
          .unwrap()
          .then(() => {
            toast.success("Ghi nhận sự kiện thành công!");
            form.resetFields();
            setIsModalVisible(false);
            dispatch(fetchAllMedicalIncidents());
            setCurrentIncident(null);
            setSelectedParentName("");
          })
          .catch((err) => {
            toast.error("Đã có lỗi xảy ra khi ghi nhận sự kiện!");
          });
      }
    } catch (info) {
      message.error("Vui lòng điền đầy đủ và chính xác thông tin!");
    }
  }, [form, currentIncident, dispatch]);

  const handleModalCancel = useCallback(() => {
    setIsModalVisible(false);
    setCurrentIncident(null);
    form.resetFields();
    setSelectedParentName("");
    dispatch(clearMedicalIncidentsError());
    dispatch(clearMedicalIncidentsSuccess());
  }, [form, dispatch]);

  // Cập nhật trạng thái
  const handleUpdateStatus = useCallback(async () => {
    if (!selectedIncident) return;
    const statusToUpdate = selectedStatus || selectedIncident.status;
    await dispatch(updateMedicalIncidentStatus({
      event_id: selectedIncident.event_id,
      status: statusToUpdate,
    }))
      .unwrap()
      .then(() => {
        toast.success("Cập nhật trạng thái thành công!");
        setMedicalIncidentsDetailModal(false);
        setSelectedIncident(null);
        setSelectedStatus(undefined);
        dispatch(fetchAllMedicalIncidents({
          page: pagination.current,
          pageSize: pagination.pageSize,
        }));
      })
      .catch(() => {
        toast.error("Cập nhật trạng thái thất bại!");
      });
  }, [dispatch, selectedIncident, selectedStatus, pagination.current, pagination.pageSize]);

  // Table columns
  const columns = useMemo(() => [
    {
      title: (
        <Space>
          <IdcardOutlined style={{ color: "#1890ff" }} /> Mã sự cố
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
          <UserOutlined style={{ color: "#52c41a" }} /> Học sinh
        </Space>
      ),
      dataIndex: "student_name",
      key: "studentName",
      className: "!font-semibold !text-gray-700",
    },
    {
      title: (
        <Space>
          <TeamOutlined style={{ color: "#faad14" }} /> Lớp
        </Space>
      ),
      dataIndex: "class_name",
      key: "className",
      className: "!font-semibold !text-gray-700",
    },
    {
      title: (
        <Space>
          <WarningOutlined style={{ color: "#ff4d4f" }} /> Loại
        </Space>
      ),
      dataIndex: "severity_level",
      key: "type",
      className: "!font-semibold !text-gray-700",
    },
    {
      title: (
        <Space>
          <ClockCircleOutlined style={{ color: "#7cb305" }} /> Thời gian xảy ra
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
          <FileTextOutlined style={{ color: "#d43808" }} /> Mô tả
        </Space>
      ),
      dataIndex: "description",
      key: "description",
      className: "!font-semibold !text-gray-700",
    },
    {
      title: (
        <Space>
          <CheckCircleOutlined style={{ color: "#08979c" }} /> Trạng thái
        </Space>
      ),
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
      className: "!font-semibold !text-gray-700",
    },
    {
      title: (
        <>
          <EyeOutlined style={{ color: "#8c8c8c", marginRight: 4 }} /> Hành động
        </>
      ),
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết sự cố">
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => showIncidentDetailModal(record)}
            />
          </Tooltip>
        </Space>
      ),
      className: "!font-semibold !text-gray-700 ",
    },
  ], [showIncidentDetailModal]);

  return (
    <div
      className="min-h-screen p-6 bg-fixed"
      style={{
        background: "#E0F0FF",
        fontFamily: "Poppins, Roboto, sans-serif",
        minHeight: "100vh",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <header
          className="mb-5 p-4 flex items-center justify-between"
          style={{
            borderRadius: 24,
            background: "#fff",
            boxShadow: "8px 8px 24px #e0f0ff, -8px -8px 24px #fff",
            border: "1.5px solid #e0f0ff",
          }}
        >
          <div className="flex items-center gap-3">
            <div style={{ ...statIconStyle, fontSize: 36, background: '#FFE0E0', color: '#ff4d4f' }}>
              <FiAlertTriangle />
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-3xl mb-2" style={fontFamily}>
                Sự kiện y tế
              </h1>
              <p className="text-gray-500 flex items-center gap-2 text-sm" style={fontFamily}>
                <span>✨</span>
                Theo dõi và quản lý các sự kiện y tế tại trường
              </p>
            </div>
          </div>
          <Button
            type="primary"
            icon={<FiPlusCircle />}
            onClick={() => showModal(null)}
            className="flex items-center gap-1 px-4 py-2 !rounded-lg !bg-blue-600 hover:!bg-blue-700 hover:shadow-lg hover:scale-105 transition-all duration-200"
            style={fontFamily}
          >
            Sự kiện y tế
          </Button>
        </header>
        {loading && incidents?.length === 0 ? (
          renderLoadingState()
        ) : (
          <>
            <Card style={cardNeumorph} bodyStyle={{ padding: 24 }}>
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <Input
                  placeholder="Tìm kiếm sự cố..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  className="flex-grow max-w-sm rounded-lg h-10"
                  onPressEnter={(e) => handleSearch(e.target.value)}
                  onBlur={(e) => handleSearch(e.target.value)}
                  defaultValue={searchQuery}
                  style={{
              
                  }}
                />
                <Button
                  icon={<FilterOutlined />}
                  className="flex items-center gap-1 px-4 py-2 !border !border-gray-300 !rounded-lg hover:!bg-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-200 !transition-colors !text-gray-900 h-10"
                >
                  Lọc
                </Button>
                <Select
                  placeholder="Tất cả trạng thái"
                  onChange={handleStatusFilterChange}
                  allowClear
                  className="w-40 rounded-lg h-10"
                  value={statusFilter}
                  style={{ borderRadius: 16, background: '#E0F0FF', fontFamily: 'Poppins, Roboto, sans-serif' }}
                  options={[
                    { value: "Đã giải quyết", label: "Đã giải quyết" },
                    { value: "Đang tiến hành", label: "Đang tiến hành" },
                    { value: "Mới", label: "Mới" },
                    { value: "Đang theo dõi", label: "Đang theo dõi" },
                  ]}
                />
              </div>
              <Table
                columns={columns}
                dataSource={incidents}
                rowKey="event_id"
                pagination={{
                  ...pagination,
                  showSizeChanger: true,
                  showTotal: (total, range) =>
                    `Hiển thị ${range[0]}-${range[1]} trên tổng số ${total} sự cố`,
                  className: "ant-pagination-custom",
                  loading: loading,
                }}
                onChange={handleTableChange}
                className="rounded-lg"
                style={{
                  borderRadius: 16,
                  boxShadow: "0 2px 8px #e0f0ff",
                  fontFamily: 'Poppins, Roboto, sans-serif',
                  background: '#fff',
                }}
                locale={{
                  emptyText: (
                    <Empty
                      description="Không tìm thấy sự kiện y tế nào"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ),
                }}
              />
              <div className="text-sm text-gray-600 mt-4" style={fontFamily}>
                Hiển thị {pagination.current * pagination.pageSize - pagination.pageSize + 1} - {Math.min(pagination.current * pagination.pageSize, pagination.total)} trên tổng số {pagination.total} sự cố
              </div>
            </Card>
            {/* Modal thêm sự cố */}
            <Modal
              title={<span>🏥 Ghi lại sự kiện y tế mới</span>}
              open={addMedicalIncidentModal}
              onOk={handleModalOk}
              onCancel={handleModalCancel}
              okText={currentIncident ? "Cập nhật sự cố" : "Ghi lại sự cố"}
              confirmLoading={loading}
              maskClosable={!loading}
              width={700}
              style={{ borderRadius: 24 }}
              bodyStyle={{ borderRadius: 24, background: '#F8FBFF', fontFamily: 'Poppins, Roboto, sans-serif' }}
              maskStyle={{ background: 'rgba(224,240,255,0.5)' }}
            >
              <Form form={form} layout="vertical" name="incident_form" style={fontFamily}>
                <Form.Item
                  name="description"
                  label={<span>📝 Tên sự cố</span>}
                  rules={[{ required: true, message: "Vui lòng nhập tên sự cố!" }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="student_id"
                  label={<span>👤 Chọn học sinh</span>}
                  rules={[{ required: true, message: "Vui lòng chọn học sinh!" }]}
                >
                  <Select
                    showSearch
                    placeholder="Chọn học sinh"
                    optionLabelProp="label"
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                    onChange={(studentId) => {
                      const selectedStudent = children.find((c) => c.student_id === studentId);
                      if (selectedStudent) {
                        form.setFieldsValue({
                          parent_name: selectedStudent.parent_name,
                          student_name: selectedStudent.student_name,
                        });
                      }
                    }}
                  >
                    {children.map((child) => (
                      <Select.Option
                        key={child.student_id}
                        value={child.student_id}
                        label={child.student_name}
                      >
                        {child.student_name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                
                <Form.Item name="parent_name" label={<span>👪 Phụ huynh</span>}>
                  <Input readOnly />
                </Form.Item>
                <Form.Item
                  name="severity_level"
                  label={<span>⚠️ Mức độ nghiêm trọng</span>}
                  rules={[
                    { required: true, message: "Vui lòng chọn Mức độ nghiêm trọng!" },
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
                  label={<span>⏰ Thời gian xảy ra</span>}
                  rules={[{ required: true, message: "Vui lòng chọn Ngày & Giờ!" }]}
                >
                  <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: "100%" }} />
                </Form.Item>
                <Form.List name="medication_used">
                  {(fields, { add, remove }) => (
                    <>
                      <p className="ant-form-item-label" style={{ marginBottom: "8px" }}>
                        💊 Thuốc sử dụng
                      </p>
                      {fields.map(({ key, name, ...restField }) => {
                        const currentSupplyName = medicationUsed[name]?.supply_name;
                        const selectedSupplyInfo = medicalSupplies?.find((supply) => supply.name === currentSupplyName);
                        const availableQuantity = selectedSupplyInfo?.quantity || 0;
                        return (
                          <Space key={key} style={{ display: "flex", marginBottom: 8, alignItems: "baseline" }} align="baseline">
                            <Form.Item
                              {...restField}
                              name={[name, "supply_name"]}
                              rules={[{ required: true, message: "Vui lòng chọn thuốc!" }]}
                              style={{ flex: 3 }}
                            >
                              <Select
                                showSearch
                                placeholder="Chọn thuốc"
                                optionFilterProp="children"
                                filterOption={(input, option) => option.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                onChange={() => {
                                  form.setFields([{ name: [name, "quantity_used"], value: undefined }]);
                                }}
                              >
                                {medicalSupplies?.map((supply) => (
                                  <Option key={supply.id} value={supply.name}>
                                    {supply.name}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, "quantity_used"]}
                              rules={[
                                { required: true, message: "Nhập số lượng!" },
                                { type: "number", min: 1, message: "Số lượng phải lớn hơn 0" },
                                ({ getFieldValue }) => ({
                                  validator(_, value) {
                                    if (!selectedSupplyInfo || !value || value <= availableQuantity) {
                                      return Promise.resolve();
                                    }
                                    return Promise.reject(new Error(`Số lượng còn lại trong kho: ${availableQuantity}.`));
                                  },
                                }),
                              ]}
                              style={{ flex: 1 }}
                            >
                              <InputNumber
                                min={1}
                                max={selectedSupplyInfo ? availableQuantity : Infinity}
                                placeholder="Số lượng"
                                style={{ width: "100%" }}
                                disabled={!currentSupplyName}
                              />
                            </Form.Item>
                            <MinusCircleOutlined onClick={() => remove(name)} />
                            {selectedSupplyInfo && (
                              <span style={{ marginLeft: 8, whiteSpace: "nowrap", minWidth: "80px", color: "#595959" }}>
                                (Còn: {availableQuantity})
                              </span>
                            )}
                          </Space>
                        );
                      })}
                      <Form.Item>
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                          Thêm thuốc
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
                <Form.Item
                  name="resolution_notes"
                  label={<span>🛠️ Hướng giải quyết</span>}
                  rules={[{ required: true, message: "Vui lòng nhập giải pháp!" }]}
                >
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item name="resolved_at" label={<span>✅ Thời gian giải quyết</span>}>
                  <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item name="description_detail" label={<span>📄 Mô tả chi tiết (Tùy chọn)</span>}>
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item
                  name="status"
                  label={<span>🔘 Trạng thái</span>}
                  rules={[{ required: true, message: "Vui lòng chọn Trạng thái!" }]}
                >
                  <Select placeholder="Chọn một trạng thái">
                    {Object.entries(STATUS_MAP).map(([key, label]) => (
                      <Option key={key} value={key}>{label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Form>
            </Modal>
            {/* Modal hiển thị chi tiết sự cố ý tế */}
            <Modal
              title={<span>🔎 Chi tiết sự cố y tế</span>}
              open={medicalIncidentsDetailModal}
              onCancel={() => {
                setMedicalIncidentsDetailModal(false);
                setSelectedIncident(null);
                setSelectedStatus(undefined);
              }}
              footer={[
                <Button
                  key="close"
                  onClick={() => {
                    setMedicalIncidentsDetailModal(false);
                    setSelectedIncident(null);
                    setSelectedStatus(undefined);
                  }}
                >
                  Đóng
                </Button>,
                <Button
                  key="edit"
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleUpdateStatus}
                  disabled={!selectedStatus || selectedStatus === selectedIncident?.status}
                  className="hover:shadow-lg hover:scale-105 transition-all duration-200"
                  style={{ borderRadius: 12, fontFamily: 'Poppins, Roboto, sans-serif' }}
                >
                  Cập nhật
                </Button>,
              ]}
              width={700}
              style={{ borderRadius: 24 }}
              bodyStyle={{ borderRadius: 24, background: '#F8FBFF', fontFamily: 'Poppins, Roboto, sans-serif' }}
              maskStyle={{ background: 'rgba(224,240,255,0.5)' }}
            >
              {selectedIncident ? (
                <Form
                  layout="vertical"
                  initialValues={{
                    ...selectedIncident,
                    occurred_at: selectedIncident.occurred_at ? moment(selectedIncident.occurred_at) : null,
                    resolved_at: selectedIncident.resolved_at ? moment(selectedIncident.resolved_at) : null,
                    parent_name: selectedIncident.parent_name,
                  }}
                >
                  <Form.Item label={<span>🆔 Mã sự kiện</span>}>
                    <Input value={selectedIncident.event_id} readOnly />
                  </Form.Item>
                  <Form.Item label={<span>👤 Học sinh</span>}>
                    <Input value={selectedIncident.student_name} readOnly />
                  </Form.Item>
                  <Form.Item label={<span>👪 Phụ huynh</span>}>
                    <Input value={selectedIncident.parent_name || "Không rõ"} readOnly />
                  </Form.Item>
                  <Form.Item label={<span>🏫 Lớp</span>}>
                    <Input value={selectedIncident.class_name} readOnly />
                  </Form.Item>
                  <Form.Item label={<span>⏰ Thời gian xảy ra</span>}>
                    <DatePicker
                      value={selectedIncident.occurred_at ? moment(selectedIncident.occurred_at) : null}
                      showTime
                      format="YYYY-MM-DD HH:mm"
                      disabled
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                  <Form.Item label={<span>⚠️ Mức độ nghiêm trọng</span>}>
                    <Input value={selectedIncident.severity_level} readOnly />
                  </Form.Item>
                  <Form.Item label={<span>📝 Mô tả</span>}>
                    <Input.TextArea value={selectedIncident.description} readOnly />
                  </Form.Item>
                  <Form.Item label={<span>🔘 Trạng thái</span>} name="status">
                    <Select
                      value={selectedStatus || selectedIncident.status}
                      onChange={(value) => setSelectedStatus(value)}
                      style={{ width: '100%' }}
                    >
                      {Object.entries(STATUS_MAP).map(([key, label]) => (
                        <Option key={key} value={key}>{label}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item label={<span>💊 Vật tư đã sử dụng</span>}>
                    {Array.isArray(selectedIncident.medication_used) && selectedIncident.medication_used.length > 0 ? (
                      <ul>
                        {selectedIncident.medication_used.map((item, index) => (
                          <li key={index}>
                            {item.supply_name}: {item.quantity_used}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Input.TextArea value="Chưa có" readOnly />
                    )}
                  </Form.Item>
                  <Form.Item label={<span>🛠️ Hướng giải quyết</span>}>
                    <Input.TextArea value={selectedIncident.resolution_notes || "Chưa có"} readOnly />
                  </Form.Item>
                  <Form.Item label={<span>✅ Thời gian giải quyết</span>}>
                    <DatePicker
                      value={selectedIncident.resolved_at ? moment(selectedIncident.resolved_at) : null}
                      showTime
                      format="YYYY-MM-DD HH:mm"
                      disabled
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                  <Form.Item label={<span>📄 Mô tả chi tiết</span>}>
                    <Input.TextArea value={selectedIncident.description_detail || "Không có"} readOnly />
                  </Form.Item>
                </Form>
              ) : (
                <Spin />
              )}
            </Modal>
          </>
        )}
      </div>
    </div>
  );
}
