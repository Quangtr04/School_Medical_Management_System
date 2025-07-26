/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Table, Button, Modal, Form, Input, Space, Tooltip } from "antd";
import {
  PlusCircleFilled,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { FaChalkboardTeacher } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const initialClasses = [
  { id: 1, name: "Khối lớp 1" },
  { id: 2, name: "Khối lớp 2" },
  { id: 3, name: "Khối lớp 3" },
  { id: 4, name: "Khối lớp 4" },
  { id: 5, name: "Khối lớp 5" },
];

export default function ClassMangerPage() {
  const [classes, setClasses] = useState(initialClasses);

  const [selectedRow, setSelectedRow] = useState(null);

  const navigate = useNavigate();

  // Responsive: bảng cuộn ngang trên mobile
  const tableContainerStyle = {
    overflowX: "auto",
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 2px 12px #e3f2fd",
    marginBottom: 32,
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      align: "center",
      render: (id) => (
        <span style={{ fontWeight: 600, color: "#1677ff" }}>{id}</span>
      ),
    },
    {
      title: "Tên khối lớp",
      dataIndex: "name",
      key: "name",
      render: (name) => (
        <span style={{ fontWeight: 500, fontSize: 16 }}>{name}</span>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 160,
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem thông tin khối lớp" color="#1677ff">
            <Button
              shape="circle"
              icon={<EyeOutlined />}
              style={{
                background: "#e3f2fd",
                color: "#1677ff",
                border: "none",
                transition: "all 0.2s",
              }}
              onClick={() => {
                navigate(`/admin/class-manager/${record.id}`);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f6fafd 0%, #e3f2fd 100%)",
        fontFamily: "Poppins, Roboto, sans-serif",
        padding: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 32,
          padding: "32px 0 24px 0",
          background: "linear-gradient(90deg, #e3f2fd 0%, #f6fafd 100%)",
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          boxShadow: "0 4px 24px #e0f0ff",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "50%",
            width: 64,
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px #e0f0ff",
          }}
        >
          <FaChalkboardTeacher style={{ fontSize: 36, color: "#1677ff" }} />
        </div>
        <div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              margin: 0,
              color: "#1677ff",
              letterSpacing: 1,
            }}
          >
            Quản lý khối lớp
          </h1>
          <div
            style={{
              color: "#607d8b",
              fontSize: 17,
              marginTop: 8,
              fontWeight: 500,
            }}
          >
            Chỉnh sử thông tin các khối lớp 1-5.
          </div>
        </div>
      </div>
      {/* Content */}
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "32px 16px",
          borderRadius: 24,
        }}
      >
        <div style={tableContainerStyle}>
          <Table
            columns={columns}
            dataSource={classes}
            rowKey="id"
            pagination={false}
            bordered
            size="middle"
            rowClassName={(record) =>
              selectedRow === record.id ? "ant-table-row-selected" : ""
            }
            onRow={(record) => ({
              onClick: () => setSelectedRow(record.id),
              onMouseLeave: () => setSelectedRow(null),
            })}
            style={{ minWidth: 400 }}
            scroll={{ x: 400 }}
          />
        </div>
        {/* Đã loại bỏ phần render danh sách học sinh theo từng khối */}
        {/* Xóa toàn bộ logic/modal liên quan đến viewModal, selectedKhoi, Modal xem thông tin khối lớp */}
      </div>
    </div>
  );
}
