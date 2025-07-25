import React, { useEffect, useState } from "react";
import { Card, Typography, Spin, Empty, Button, Table, Tag, Space } from "antd";
import {
  FiFileText,
  FiRefreshCcw,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import {
  LoadingOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
  TeamOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { format, parseISO } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPendingCheckupRequests,
  fetchPendingVaccineCampaigns,
  respondToCheckupRequest,
  respondToVaccineRequest,
} from "../../redux/manager/managerSlice";
import { toast } from "react-toastify";

const { Text } = Typography;

// Helper: columns cho Table
const getColumns = (handleReviewRequest) => [
  {
    title: (
      <Space>
        <FileTextOutlined style={{ color: "#1890ff" }} /> Tiêu đề
      </Space>
    ),
    dataIndex: "title",
    key: "title",
    render: (text) => <Text strong>{text}</Text>,
  },
  {
    title: (
      <Space>
        <UserOutlined style={{ color: "#52c41a" }} /> Người tạo đơn
      </Space>
    ),
    dataIndex: "fullname",
    key: "nurseName",
  },
  {
    title: (
      <Space>
        <FileTextOutlined style={{ color: "#faad14" }} /> Mô tả
      </Space>
    ),
    dataIndex: "description",
    key: "description",
    ellipsis: true,
  },
  {
    title: (
      <Space>
        <CalendarOutlined style={{ color: "#eb2f96" }} /> Ngày tạo đơn
      </Space>
    ),
    dataIndex: "created_at",
    key: "created_at",
    render: (date) =>
      date ? format(parseISO(date), "dd/MM/yyyy HH:mm") : "N/A",
  },
  {
    title: (
      <Space>
        <DollarCircleOutlined style={{ color: "#722ed1" }} /> Nhà tài trợ
      </Space>
    ),
    dataIndex: "sponsor",
    key: "sponsor",
  },
  {
    title: (
      <Space>
        <TeamOutlined style={{ color: "#08979c" }} /> Lớp áp dụng
      </Space>
    ),
    dataIndex: "class",
    key: "class_name",
    render: (text) => <Tag color="blue">{text}</Tag>,
  },
  {
    title: (
      <Space>
        <QuestionCircleOutlined style={{ color: "#d43808" }} /> Loại yêu cầu
      </Space>
    ),
    key: "type",
    render: (record) => {
      const isCheckup = record.type === "CHECKUP";
      return (
        <Tag color={isCheckup ? "geekblue" : "purple"}>
          {isCheckup ? "Khám Sức Khỏe" : "Tiêm chủng"}
        </Tag>
      );
    },
  },
  {
    title: (
      <Space>
        <SettingOutlined style={{ color: "#bfbfbf" }} /> Hành động
      </Space>
    ),
    key: "actions",
    render: (_, record) => (
      <div className="flex flex-col gap-2 items-center">
        <Button
          type="primary"
          icon={<FiCheckCircle />}
          onClick={() => handleReviewRequest(record, "APPROVED")}
          className="!bg-green-500 hover:!bg-green-600"
        >
          Duyệt
        </Button>
        <Button
          type="default"
          icon={<FiXCircle />}
          onClick={() => handleReviewRequest(record, "DECLINED")}
          danger
        >
          Từ chối
        </Button>
      </div>
    ),
  },
];

export default function ManagerDashboardPage() {
  const dispatch = useDispatch();
  const {
    pendingCheckupRequests,
    pendingVaccineCampaigns,
    loading,
    loadingVaccineCampaigns,
  } = useSelector((state) => state.manager);

  // State loading cho từng request
  const [processingId, setProcessingId] = useState(null);
  const [processingType, setProcessingType] = useState(null);

  useEffect(() => {
    dispatch(fetchPendingCheckupRequests());
    dispatch(fetchPendingVaccineCampaigns());
  }, [dispatch]);



  const handleReviewRequest = React.useCallback(
    (record, action) => {       
      setProcessingId(record.checkup_id  ? record.checkup_id : record.campaign_id);
      setProcessingType(record.type);
      if (record.type === "CHECKUP") {
        dispatch(respondToCheckupRequest({ requestId: record.checkup_id, action }))
          .unwrap()
          .then(() => {
            toast.success(`Đã ${action === "APPROVED" ? "duyệt" : "từ chối"} lịch khám thành công`); 
            setProcessingId(null);
            setProcessingType(null);
          })
          .catch((err) => {            
            toast.error(`Đã ${action === "APPROVED" ? "duyệt" : "từ chối"}  lịch khám thất bại`)
            setProcessingId(null);
            setProcessingType(null);
          });
      } else if (record.type === "VACCINE") {
        dispatch(respondToVaccineRequest({
          campaign_id: record.campaign_id,
          action,
        }))
          .unwrap()
          .then(() => {
            toast.success(`Đã ${action === "APPROVED" ? "duyệt" : "từ chối"} chiến dịch tiêm thành công`);   
            setProcessingId(null);
            setProcessingType(null);
          })
          .catch((err) => {
            toast.error(`Đã ${action === "APPROVED" ? "duyệt" : "từ chối"} chiến dịch tiêm thất bại`)
            setProcessingId(null);
            setProcessingType(null);
          });
      }
    },
    [dispatch]
  );

  const combinedRequests = React.useMemo(
    () => [
      ...(pendingCheckupRequests || [])
        .filter(item => item.approval_status === "PENDING")
        .map((item) => ({
          ...item,
          type: "CHECKUP",
        })),
      ...(pendingVaccineCampaigns || [])
        .filter(item => item.approval_status === "PENDING")
        .map((item) => ({
          ...item,
          type: "VACCINE",
        })),
    ],
    [pendingCheckupRequests, pendingVaccineCampaigns]
  );

  // Reset loading khi hết đơn
  useEffect(() => {    
    if (combinedRequests.length === 0) {
      setProcessingId(null);
      setProcessingType(null);
    }
  }, [combinedRequests]);

  const columns = React.useMemo(
    () => [
      ...getColumns((record, action) => handleReviewRequest(record, action)).map(col =>
        col.key === 'actions'
          ? {
              ...col,
              render: (_, record) => (
                <div className="flex flex-col gap-2 items-center">
                  <Button
                    type="primary"
                    icon={<FiCheckCircle />}
                    onClick={() => handleReviewRequest(record, "APPROVED")}
                    className="!bg-green-500 hover:!bg-green-600"
                    loading={
                      processingId === (record.checkup_id ? record.checkup_id : record.campaign_id) &&
                      processingType === record.type
                    }
                    disabled={
                      (processingId && processingId !== (record.checkup_id ? record.checkup_id : record.campaign_id)) ||
                      (processingType && processingType !== record.type)
                    }
                  >
                    Duyệt
                  </Button>
                  <Button
                    type="default"
                    icon={<FiXCircle />}
                    onClick={() => handleReviewRequest(record, "DECLINED")}
                    danger
                    loading={
                      processingId === (record.checkup_id ? record.checkup_id : record.campaign_id) &&
                      processingType === record.type
                    }
                    disabled={
                      (processingId && processingId !== (record.checkup_id ? record.checkup_id : record.campaign_id)) ||
                      (processingType && processingType !== record.type)
                    }
                  >
                    Từ chối
                  </Button>
                </div>
              ),
            }
          : col
      ),
    ],
    [handleReviewRequest, processingId, processingType]
  );

  const isLoading = loading || loadingVaccineCampaigns;

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-5 p-4 rounded-lg bg-blue-600/[.10] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/[.10] rounded-full border border-blue-600">
              <FiFileText className="w-10 h-10 text-3xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-3xl mb-2">
                Bảng điều khiển quản lý
              </h1>
              <p className="text-gray-500 flex items-center gap-2 text-sm">
                <span>⭐</span> Quản lý các yêu cầu y tế từ y tá
              </p>
            </div>
          </div>
          <Button
            type="default"
            icon={<FiRefreshCcw />}
            onClick={() => {
              dispatch(fetchPendingCheckupRequests());
              dispatch(fetchPendingVaccineCampaigns());
            }}
            loading={isLoading}
            className="flex items-center gap-1 px-4 py-2 !border !border-gray-300 !rounded-lg hover:!bg-gray-100 !transition-colors !text-gray-900"
          >
            Làm mới dữ liệu
          </Button>
        </header>

        {isLoading ? (
          <div className="text-center py-8 flex flex-col items-center justify-center gap-4">
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 30 }} spin />}
            />
            <p className="text-gray-500 text-lg">
              Đang tải danh sách yêu cầu...
            </p>
          </div>
        ) : (
          <Card
            title={
              <span className="flex items-center gap-2 text-gray-800 font-semibold">
                <FiFileText className="text-blue-600" />
                Các yêu cầu đang chờ duyệt ({combinedRequests.length})
              </span>
            }
            className="!rounded-lg !shadow-md !border !border-gray-200"
          >
            {combinedRequests.length > 0 ? (
              <Table
                dataSource={combinedRequests}
                columns={columns}
                pagination={{ pageSize: 10 }}
                rowKey={(record) => record.checkup_id || record.campaign_id}
              />
            ) : (
              <Empty
                description="Không có yêu cầu nào đang chờ duyệt"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
