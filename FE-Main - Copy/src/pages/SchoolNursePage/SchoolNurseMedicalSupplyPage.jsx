// src/pages/NursePage/MedicalSuppliesPage.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
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
  Tooltip,
  Spin,
  Empty,
  Card,
  DatePicker,
  Tabs,
  InputNumber,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  LoadingOutlined,
  BarcodeOutlined,
  TagOutlined,
  FolderOutlined,
  MinusSquareOutlined,
  ContainerOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { FiPlusCircle } from "react-icons/fi";
import { IoStorefront } from "react-icons/io5";
import dayjs from "dayjs";
import { format, parseISO } from "date-fns";
import {
  addNewMedicalSupply,
  fetchMedicalSupplies,
  setMedicalSuppliesPagination,
  updateExpiredDate,
  // Thunks placeholder (bạn cần tạo trong slice)
  // addNewMedicalSupply,
  // addQuantityToExistingSupply,
} from "../../redux/nurse/medicalSupplies/medicalSupplies";

import { toast } from "react-toastify";

export default function MedicalSuppliesPage() {
  const dispatch = useDispatch();
  const { supplies, loading, error, pagination } = useSelector(
    (s) => s.medicalSupplies
  );

  console.log(supplies);

  const [searchQuery, setSearchQuery] = useState("");

  const [isStockModalVisible, setIsStockModalVisible] = useState(false);
  const [stockForm] = Form.useForm();
  const [addForm] = Form.useForm();
  const [isSubmittingStock, setIsSubmittingStock] = useState(false);

  const [selectedSupply, setSelectedSupply] = useState(null);
  const [updatingDate, setUpdatingDate] = useState(false);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  useEffect(() => {
    dispatch(
      fetchMedicalSupplies({
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchQuery,
      })
    );
  }, [dispatch, pagination.current, pagination.pageSize, searchQuery]);

  const handleTableChange = (pagination) => {
    dispatch(
      setMedicalSuppliesPagination({
        current: pagination.current,
        pageSize: pagination.pageSize,
      })
    );
  };

  const generateNextSupplyId = () => {
    if (!supplies || supplies.length === 0) return 1;

    const maxId = supplies.length + 1;

    return maxId + 1;
  };

  const showStockModal = () => {
    const nextId = generateNextSupplyId();

    stockForm.resetFields();
    addForm.resetFields(); // reset trước

    addForm.setFieldsValue({
      supply_id: nextId,
    });

    setIsStockModalVisible(true);
  };

  //chức năng thêm loại thuốc mới
  const handleAddNewSubmit = async (values) => {
    setIsSubmittingStock(true);
    try {
      await dispatch(
        addNewMedicalSupply({
          ...values,
          is_active: true, // ép luôn trạng thái mặc định
        })
      ).unwrap(); // ✅ dùng dispatch
      message.success("✅ Thêm vật tư mới thành công!");
      setIsStockModalVisible(false);

      dispatch(
        fetchMedicalSupplies({
          page: pagination.current,
          pageSize: pagination.pageSize,
          search: searchQuery,
        })
      );
    } catch (error) {
      message.error(error || "❌ Thêm vật tư thất bại!");
    } finally {
      setIsSubmittingStock(false);
    }
  };

  //chức năng cập nhập lại ngày hết hạn
  const handleUpdateExpiredDate = async (values) => {
    console.log("giá trị:", values.quantity);

    try {
      setUpdatingDate(true);

      const isActive = values.quantity > 0 ? values.is_active : false;

      await dispatch(
        updateExpiredDate({
          supplyId: selectedSupply.supply_id,
          expired_date: values.expired_date.format("YYYY-MM-DD"),
          quantity: values.quantity,
          is_active: isActive, // Gán theo điều kiện
        })
      ).unwrap();

      toast.success("✅ Cập nhật thành công");
      setSelectedSupply(null);

      await dispatch(
        fetchMedicalSupplies({
          page: pagination.current,
          pageSize: pagination.pageSize,
          search: searchQuery,
        })
      );
    } catch (err) {
      message.error(err || "❌ Cập nhật thất bại");
    } finally {
      setUpdatingDate(false);
    }
  };

  const getStatusTag = (status) => {
    if (typeof status === "boolean") {
      return status ? (
        <Tag icon={<CheckCircleOutlined />} color="green">
          Còn nhiều
        </Tag>
      ) : (
        <Tag icon={<CloseCircleOutlined />} color="red">
          Hết hàng
        </Tag>
      );
    }
    const map = {
      Resolved: ["green", <CheckCircleOutlined />, "Đã giải quyết"],
      "In Progress": ["orange", <SyncOutlined spin />, "Đang tiến hành"],
      New: ["blue", <ClockCircleOutlined />, "Mới"],
      Warning: ["volcano", <ExclamationCircleOutlined />, "Cảnh báo"],
    };
    const [color, icon, text] = map[status] || ["default", null, status];
    return (
      <Tag icon={icon} color={color}>
        {text}
      </Tag>
    );
  };

  const columns = [
    {
      title: (
        <Space>
          <BarcodeOutlined style={{ color: "#1890ff" }} /> {/* Xanh dương */}
          Mã vật tư
        </Space>
      ),
      dataIndex: "supply_id",
      key: "supply_id",
    },
    {
      title: (
        <Space>
          <TagOutlined style={{ color: "#52c41a" }} /> {/* Xanh lá */}
          Tên
        </Space>
      ),
      dataIndex: "name",
      key: "name",
    },
    {
      title: (
        <Space>
          <FolderOutlined style={{ color: "#faad14" }} /> {/* Vàng cam */}
          Thể loại
        </Space>
      ),
      dataIndex: "type",
      key: "type",
    },
    {
      title: (
        <Space>
          <MinusSquareOutlined style={{ color: "#eb2f96" }} /> {/* Hồng đậm */}
          Đơn vị
        </Space>
      ),
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: (
        <Space>
          <ContainerOutlined style={{ color: "#722ed1" }} /> {/* Tím */}
          Số lượng
        </Space>
      ),
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: (
        <Space>
          <FileTextOutlined style={{ color: "#d43808" }} /> {/* Đỏ cam */}
          Mô tả
        </Space>
      ),
      dataIndex: "description",
      key: "description",
    },
    {
      title: (
        <Space>
          <CalendarOutlined style={{ color: "#08979c" }} /> {/* Cyan đậm */}
          Ngày hết hạn
        </Space>
      ),
      dataIndex: "expired_date",
      key: "expired_date",
      render: (date) => (date ? format(parseISO(date), "yyyy-MM-dd") : "N/A"),
    },
    {
      title: (
        <Space>
          <CheckCircleOutlined style={{ color: "#13c2c2" }} /> {/* Teal */}
          Trạng thái
        </Space>
      ),
      dataIndex: "is_active",
      key: "status",
      render: getStatusTag,
    },
    {
      title: (
        <Space>
          <CalendarOutlined style={{ color: "#08979c" }} />
          Hành động
        </Space>
      ),
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Tooltip title="Cập nhật hạn dùng">
          <Button
            icon={<CalendarOutlined />}
            onClick={() => setSelectedSupply(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-6 p-4 bg-yellow-50 flex justify-between items-center rounded-lg">
            <div className="flex items-center gap-3">
              <IoStorefront className="w-10 h-10 text-yellow-600" />
              <div>
                <h1 className="text-2xl font-bold">Kho vật tư y tế</h1>
                <p className="text-sm text-gray-600">
                  ✨ Quản lý nhập kho & theo dõi vật tư
                </p>
              </div>
            </div>
            <Button
              type="primary"
              icon={<FiPlusCircle />}
              onClick={showStockModal}
            >
              Nhập kho
            </Button>
          </header>

          <Card>
            <Input.Search
              placeholder="Tìm kiếm vật tư..."
              enterButton={<SearchOutlined />}
              className="mb-4 "
              style={{ width: 240 }}
              onSearch={(handleVal) => setSearchQuery(handleVal)}
            />
            {loading ? (
              <Spin tip="Đang tải...">
                <Table
                  columns={columns}
                  dataSource={supplies}
                  rowKey="supply_id"
                  pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    onChange: (page, pageSize) => {
                      dispatch(
                        setMedicalSuppliesPagination({
                          current: page,
                          pageSize,
                        })
                      );
                    },
                  }}
                  onChange={handleTableChange} // nếu bạn muốn xử lý thêm
                  locale={{
                    emptyText: <Empty description="Không có vật tư" />,
                  }}
                />
              </Spin>
            ) : (
              <Table
                columns={columns}
                dataSource={supplies}
                rowKey="supply_id"
                pagination={pagination}
                onChange={handleTableChange}
                locale={{ emptyText: <Empty description="Không có vật tư" /> }}
              />
            )}
          </Card>
        </div>
      </div>

      {/* Modal nhập vật tư mới vào kho */}
      <Modal
        title="➕ Thêm vật tư mới vào kho"
        visible={isStockModalVisible}
        footer={null}
        onCancel={() => setIsStockModalVisible(false)}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddNewSubmit}
          requiredMark={false}
        >
          <Form.Item
            name="supply_id"
            label="🆔 Mã vật tư"
            rules={[{ required: true }]}
          >
            <Input readOnly />
          </Form.Item>

          <Form.Item
            name="name"
            label="🏷️ Tên vật tư"
            rules={[{ required: true }]}
          >
            <Input placeholder="Nhập tên vật tư (ví dụ: Găng tay y tế)" />
          </Form.Item>

          <Form.Item
            name="type"
            label="📦 Loại vật tư"
            rules={[{ required: true }]}
          >
            <Select placeholder="Chọn loại vật tư">
              <Select.Option value="Thuốc">💊 Thuốc</Select.Option>
              <Select.Option value="Vật tư">🧰 Vật tư</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="unit"
            label="⚖️ Đơn vị tính"
            rules={[{ required: true }]}
          >
            <Select placeholder="Chọn đơn vị">
              <Select.Option value="vỉ">🧃 Vỉ</Select.Option>
              <Select.Option value="hộp">📦 Hộp</Select.Option>
              <Select.Option value="viên">💊 Viên</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="quantity"
            label="🔢 Số lượng"
            rules={[{ required: true, type: "number", min: 1 }]}
          >
            <InputNumber
              type="number"
              min={1}
              placeholder="Nhập số lượng cần nhập kho"
              style={{ width: "100%" }} // ✅ Đây là cách đúng
            />
          </Form.Item>

          <Form.Item
            name="expired_date"
            label="📅 Ngày hết hạn"
            rules={[{ required: true }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              disabledDate={(d) => d && d < dayjs().startOf("day")}
              placeholder="Chọn ngày hết hạn"
            />
          </Form.Item>

          <Form.Item name="description" label="📝 Mô tả chi tiết">
            <Input.TextArea
              rows={3}
              placeholder="Ghi chú thêm nếu có (ví dụ: chỉ dùng trong trường hợp khẩn cấp)"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmittingStock}
              block
              icon={<FiPlusCircle />}
            >
              Thêm mới vật tư
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal cập nhập ngày hết hạn */}
      <Modal
        title="🛠️ Cập nhật ngày hết hạn"
        open={!!selectedSupply}
        onCancel={() => setSelectedSupply(null)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={handleUpdateExpiredDate}
          initialValues={{
            expired_date: selectedSupply?.expired_date
              ? dayjs(selectedSupply.expired_date)
              : null,
          }}
          key={selectedSupply?.supply_id} // giúp reset Form khi thay đổi supply
        >
          <Form.Item
            name="quantity"
            label="🔢Cập nhập lại số lượng"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} style={{ width: 470 }} />
          </Form.Item>

          <Form.Item
            name="expired_date"
            label="📅 Ngày hết hạn mới"
            rules={[{ required: true }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              disabledDate={(d) => d && d < dayjs().startOf("day")}
            />
          </Form.Item>

          <Form.Item
            hidden
            name="is_active"
            label="🔘 Trạng thái"
            initialValue={true} // Mặc định là true
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select>
              <Select.Option value={true}>🟢Còn thuốc</Select.Option>
              <Select.Option value={false}>🔴Hết thuốc</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={updatingDate}
            >
              ✅ Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>

    //Modal cập nhập ngày hết hạn
  );
}
