import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button, Table } from "antd";
import { ArrowLeftOutlined, RiseOutlined, UserOutlined } from "@ant-design/icons";
import { FaUserGraduate } from "react-icons/fa";

const getStudentsByKhoi = (studentRecords, khoi) => {
  if (!Array.isArray(studentRecords)) return [];
  return studentRecords.filter(
    (student) => student.class_name && student.class_name[0] === String(khoi)
  );
};

export default function ClassMangerPageDetail() {
  const { id } = useParams(); // id là số khối
  const navigate = useNavigate();
  const studentRecord = useSelector((state) => state.studentRecord.healthRecords);
  const students = getStudentsByKhoi(studentRecord, id);
    
  const columns = [
    {
      title: "",
      dataIndex: "icon",
      key: "icon",
      width: 40,
      render: () => <UserOutlined style={{ color: '#90caf9', fontSize: 18 }} />,
      align: 'center',
    },
    {
      title: "Mã HS",
      dataIndex: "student_code",
      key: "student_code",
      width: 100,
    },
    {
      title: "Họ tên",
      dataIndex: "student_name",
      key: "student_name",
      width: 180,
    },
    {
      title: "Lớp",
      dataIndex: "class_name",
      key: "class_name",
      width: 100,
    },
  ];

  return (
    <div style={{
        width: '100%',
        minHeight: 'calc(100vh - 64px)',
        background: '#fff',
        padding: '40px 24px',
        boxShadow: '0 2px 12px #e3f2fd',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FaUserGraduate style={{ fontSize: 36, color: '#1677ff', marginRight: 12 }} />
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1677ff', margin: 0 }}>Danh sách học sinh khối {id}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
         
          <Button type="link" icon={<ArrowLeftOutlined style={{ fontSize: 18, color: '#1677ff' }} />} onClick={() => navigate(-1)} style={{ fontWeight: 600, fontSize: 16, color: '#1677ff', display: 'flex', alignItems: 'center', gap: 4 }}>
            Quay lại
          </Button>
        </div>
      </div>
      <div style={{ marginBottom: 16, color: '#607d8b', fontWeight: 500 }}>
        Số lượng học sinh: <span style={{ color: '#388e3c', fontWeight: 700 }}>{students.length}</span>
      </div>
      <div style={{ flex: 1, overflowX: 'auto' }}>
        <Table
          columns={columns}
          dataSource={students}
          rowKey="student_id"
          pagination={false}
          bordered
          size="middle"
          scroll={{ x: 600 }}
          locale={{ emptyText: 'Không có học sinh nào thuộc khối này.' }}
        />
      </div>
    </div>
  );
}