/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Table, Tag, Empty, Button, Tooltip } from "antd";
import {
  FaEdit,
  FaTrashAlt,
  FaUserGraduate,
  FaBirthdayCake,
  FaVenusMars,
  FaHome,
  FaBarcode,
} from "react-icons/fa"; // Added more icons
import { MdBloodtype } from "react-icons/md";
import { IoHeartCircleSharp } from "react-icons/io5";
import { Modal, Form, Input, InputNumber, Select } from "antd";
import { updateStudentHealthRecord } from "../../redux/nurse/studentRecords/studentRecord"; // Điều chỉnh path cho đúng
import { message } from "antd";
import {
  SmileOutlined,
  FireOutlined,
  HeartOutlined,
  EyeOutlined,
  AudioOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { PiChalkboardTeacherFill } from "react-icons/pi"; // icon thay cho lớp

import { toast } from "react-toastify";

export default function StudentRecordPageDetail() {
  const token = useSelector((state) => state.auth.token); // Tùy slice của bạn
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const student = useSelector((state) =>
    state.studentRecord.healthRecords.find(
      (stu) => String(stu.student_id) === id
    )
  );

  const [form] = Form.useForm();
  const [modalStudentRecord, setModalStudentRecord] = useState(false);

  const handleToggleModal = () => {
    if (student.health) {
      form.setFieldsValue(student.health); // Gán giá trị ban đầu khi mở modal
    }
    setModalStudentRecord(!modalStudentRecord);
  };

  const handleUpdateHealthRecord = async (values) => {
    const cleanedValues = {
      ...values,
      vision_left: values.vision_left?.toString(),
      vision_right: values.vision_right?.toString(),
      // có thể ép thêm nếu các trường khác backend cũng yêu cầu là string
    };

    try {
      const actionResult = await dispatch(
        updateStudentHealthRecord({
          studentId: student.student_id,
          healthData: cleanedValues,
        })
      );

      if (updateStudentHealthRecord.fulfilled.match(actionResult)) {
        toast.success("Cập nhật hồ sơ sức khỏe thành công!");
        navigate("/nurse/students-record");
        setModalStudentRecord(false);
      } else {
        message.error(actionResult.payload || "Cập nhật thất bại.");
      }
    } catch (error) {
      message.error("Lỗi không xác định!");
    }
  };

  if (!student)
    return (
      <div className="p-6 text-center text-gray-600 bg-gray-50 min-h-screen flex items-center justify-center">
        <Empty description="Không tìm thấy học sinh! 😔" />
      </div>
    );

  // Ensure healthRecords is an array. If student.health is a single object, wrap it.
  // If student.health could be an array of multiple records, just use `student.health || []`
  const healthRecords = student.health ? [student.health] : [];

  const columns = [
    {
      title: <>🩸 Nhóm máu</>,
      dataIndex: "blood_type",
      key: "blood_type",
    },
    {
      title: <>📏 Chiều cao (cm)</>,
      dataIndex: "height_cm",
      key: "height_cm",
    },
    {
      title: <>⚖️ Cân nặng (kg)</>,
      dataIndex: "weight_kg",
      key: "weight_kg",
    },
    {
      title: <>👁️ Thị lực (Trái)</>,
      dataIndex: "vision_left",
      key: "vision_left",
    },
    {
      title: <>👁️ Thị lực (Phải)</>,
      dataIndex: "vision_right",
      key: "vision_right",
    },
    {
      title: <>👂 Thính lực (Trái)</>,
      dataIndex: "hearing_left",
      key: "hearing_left",
    },
    {
      title: <>👂 Thính lực (Phải)</>,
      dataIndex: "hearing_right",
      key: "hearing_right",
    },
    {
      title: <>❤️‍🩹 Tình trạng sức khỏe</>,
      dataIndex: "health_status",
      key: "health_status",
      render: (status) => {
        let color = "default";
        let emoji = "🤔";
        if (
          status?.toLowerCase().includes("healthy") ||
          status?.toLowerCase().includes("tốt")
        ) {
          color = "green";
          emoji = "😊";
        } else if (
          status?.toLowerCase().includes("moderate") ||
          status?.toLowerCase().includes("trung bình")
        ) {
          color = "gold";
          emoji = "😐";
        } else if (
          status?.toLowerCase().includes("serious") ||
          status?.toLowerCase().includes("nghiêm trọng")
        ) {
          color = "red";
          emoji = "😷";
        }
        return (
          <Tag color={color}>
            {status || "N/A"} {emoji}
          </Tag>
        );
      },
    },
    {
      title: <>🤧 Dị ứng</>,
      dataIndex: "allergy",
      key: "allergy",
      render: (val) =>
        val ? <Tag color="blue">{val}</Tag> : <Tag>Không có</Tag>,
    },
    {
      title: <>🏥 Bệnh mãn tính</>,
      dataIndex: "chronic_disease",
      key: "chronic_disease",
      render: (val) =>
        val ? <Tag color="volcano">{val}</Tag> : <Tag>Không có</Tag>,
    },

    {
      title: <>⚙️ Hành động</>,
      key: "actions",
      align: "center",
      render: () => (
        <div className="flex justify-center space-x-2">
          <Tooltip title="Cập nhập hồ sơ học sinh">
            <Button
              type="primary"
              icon={<FaEdit />}
              size="small"
              onClick={handleToggleModal}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div
      className="p-6 bg-cover bg-center bg-fixed min-h-screen"
      style={{ backgroundImage: "url('/images/health-bg.jpg')" }}
    >
      <div className="bg-white bg-opacity-90 rounded-lg shadow-xl max-w-7xl mx-auto my-8 p-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 border-b pb-4 flex items-center">
          <MdBloodtype className="mr-3 text-blue-600" /> Chi tiết Hồ sơ Sức khỏe
          Học sinh
        </h1>

        {/* Student General Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 text-gray-800">
          {/* Họ tên */}
          <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
            <span className="p-2 bg-purple-100 rounded-full text-purple-600 text-xl">
              <FaUserGraduate />
            </span>
            <div>
              <p className="text-sm text-gray-500">Họ tên</p>
              <p className="text-base font-semibold">{student.student_name}</p>
            </div>
          </div>

          {/* Lớp */}
          <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
            <span className="p-2 bg-green-100 rounded-full text-green-600 text-xl">
              <PiChalkboardTeacherFill />
            </span>
            <div>
              <p className="text-sm text-gray-500">Lớp</p>
              <p className="text-base font-semibold">{student.class_name}</p>
            </div>
          </div>

          {/* Ngày sinh */}
          <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
            <span className="p-2 bg-pink-100 rounded-full text-pink-600 text-xl">
              <FaBirthdayCake />
            </span>
            <div>
              <p className="text-sm text-gray-500">Ngày sinh</p>
              <p className="text-base font-semibold">
                {dayjs(student.student_date_of_birth).format("DD/MM/YYYY")}
              </p>
            </div>
          </div>

          {/* Giới tính */}
          <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
            <span className="p-2 bg-teal-100 rounded-full text-teal-600 text-xl">
              <FaVenusMars />
            </span>
            <div>
              <p className="text-sm text-gray-500">Giới tính</p>
              <p className="text-base font-semibold">
                {student.student_gender}
              </p>
            </div>
          </div>

          {/* Địa chỉ */}
          <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
            <span className="p-2 bg-orange-100 rounded-full text-orange-600 text-xl">
              <FaHome />
            </span>
            <div>
              <p className="text-sm text-gray-500">Địa chỉ</p>
              <p className="text-base font-semibold">
                {student.student_address}
              </p>
            </div>
          </div>

          {/* Mã học sinh */}
          <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
            <span className="p-2 bg-gray-200 rounded-full text-gray-600 text-xl">
              <FaBarcode />
            </span>
            <div>
              <p className="text-sm text-gray-500">Mã học sinh</p>
              <p className="text-base font-semibold">{student.student_code}</p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-5 border-b pb-3 flex items-center">
          <IoHeartCircleSharp className="mr-2 text-blue-600" /> Thông tin sức
          khỏe
        </h2>

        {healthRecords.length === 0 ? (
          <Empty
            description="Chưa có thông tin hồ sơ sức khỏe nào. 🧐"
            className="py-10"
          />
        ) : (
          <Table
            columns={columns}
            dataSource={healthRecords}
            rowKey="record_id"
            pagination={false}
            bordered
            className="ant-table-striped"
            scroll={{ x: "max-content" }} // Custom class for striped rows via Ant Design's theming or custom CSS
          />
        )}
      </div>

      <Modal
        open={modalStudentRecord}
        onCancel={() => setModalStudentRecord(false)}
        onOk={() => form.submit()}
        title="🩺 Cập nhật hồ sơ sức khỏe"
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateHealthRecord}
          requiredMark={false}
        >
          <Form.Item
            name="height_cm"
            label="📏 Chiều cao (cm)"
            rules={[{ required: true, message: "Vui lòng nhập chiều cao" }]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              addonAfter="cm"
              prefix={<SmileOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="weight_kg"
            label="⚖️ Cân nặng (kg)"
            rules={[{ required: true, message: "Vui lòng nhập cân nặng" }]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              addonAfter="kg"
              prefix={<FireOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="blood_type"
            label="🩸 Nhóm máu"
            rules={[{ required: true, message: "Vui lòng chọn nhóm máu" }]}
          >
            <Select placeholder="Chọn nhóm máu">
              <Option value="A">A</Option>
              <Option value="B">B</Option>
              <Option value="AB">AB</Option>
              <Option value="O">O</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="vision_left"
            label="👁️ Thị lực (Trái)"
            rules={[{ required: true, message: "Vui lòng nhập thị lực trái" }]}
          >
            <InputNumber
              min={1}
              max={10}
              step={0.1}
              style={{ width: "100%" }}
              addonBefore={<EyeOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="vision_right"
            label="👁️ Thị lực (Phải)"
            rules={[{ required: true, message: "Vui lòng nhập thị lực phải" }]}
          >
            <InputNumber
              min={1}
              max={10}
              step={0.1}
              style={{ width: "100%" }}
              addonBefore={<EyeOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="hearing_left"
            label="👂 Thính lực (Trái)"
            rules={[
              { required: true, message: "Vui lòng nhập thính lực trái" },
            ]}
          >
            <Input prefix={<AudioOutlined />} />
          </Form.Item>

          <Form.Item
            name="hearing_right"
            label="👂 Thính lực (Phải)"
            rules={[
              { required: true, message: "Vui lòng nhập thính lực phải" },
            ]}
          >
            <Input prefix={<AudioOutlined />} />
          </Form.Item>

          <Form.Item
            name="health_status"
            label="🧠 Tình trạng sức khỏe"
            rules={[
              { required: true, message: "Vui lòng chọn tình trạng sức khỏe" },
            ]}
          >
            <Select>
              <Option value="Healthy">💪 Tốt</Option>
              <Option value="Moderate">😐 Trung bình</Option>
              <Option value="Serious">🤒 Nghiêm trọng</Option>
            </Select>
          </Form.Item>

          <Form.Item name="allergy" label="🌾 Dị ứng">
            <Input
              prefix={<InfoCircleOutlined />}
              placeholder="Nhập dị ứng nếu có"
            />
          </Form.Item>

          <Form.Item name="chronic_disease" label="🏥 Bệnh mãn tính">
            <Input
              prefix={<HeartOutlined />}
              placeholder="Nhập bệnh mãn tính nếu có"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
