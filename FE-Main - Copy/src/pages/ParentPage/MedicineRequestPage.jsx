import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Chip,
  Stack,
} from "@mui/material";
import {
  MedicalServices,
  CalendarToday,
  AccessTime,
  LocationOn,
  Person,
  Description,
  LocalHospital,
  Warning,
  Visibility as VisibilityIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import {
  getParentChildren,
  getChildDetails,
  submitMedicationRequest,
  setSelectedIncident,
  setSelectedChild,
} from "../../redux/parent/parentSlice";
import moment from "moment";
import {
  Form,
  Modal,
  message,
  Input as AntInput,
  Upload,
  DatePicker,
  TimePicker,
  Divider as AntDivider,
} from "antd";

const { TextArea } = AntInput;

function MedicineRequestPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    children,
    selectedChild,
    incidents,
    selectedIncident,
    loading,
    error,
    success,
  } = useSelector((state) => state.parent);

  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [openIncidentDialog, setOpenIncidentDialog] = useState(false);
  const [medicineRequests, setMedicineRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Fetch children data
  useEffect(() => {
    dispatch(getParentChildren());
  }, [dispatch]);

  // Select first child if none selected
  useEffect(() => {
    if (children && children.length > 0 && !selectedChild) {
      dispatch(getChildDetails(children[0].id));
    }
  }, [dispatch, children, selectedChild]);

  // Fetch incidents when child is selected
  useEffect(() => {
    if (selectedChild) {
      dispatch(getIncidentsByUser(selectedChild.id));
      fetchMedicineRequests(selectedChild.id);
    }
  }, [dispatch, selectedChild]);

  // Handle success from API
  useEffect(() => {
    if (success) {
      message.success("Gửi yêu cầu thuốc thành công!");
      setIsModalVisible(false);
      form.resetFields();

      // Refresh medicine requests
      if (selectedChild) {
        fetchMedicineRequests(selectedChild.id);
      }
    }
  }, [success, form, selectedChild]);

  // Mock function to fetch medicine requests - in a real app, this would be a Redux action
  const fetchMedicineRequests = (childId) => {
    setRequestsLoading(true);
    // Simulating API call
    setTimeout(() => {
      const mockRequests = [
        {
          id: 1,
          childId: childId,
          childName: selectedChild?.name || "Học sinh",
          medicineName: "Paracetamol",
          dosage: "5ml",
          frequency: "3 lần/ngày",
          duration: "3 ngày",
          time: "8:00, 12:00, 18:00",
          notes: "Uống sau ăn",
          status: "pending",
          requestDate: moment().subtract(2, "days").format("YYYY-MM-DD"),
          prescription: null,
        },
        {
          id: 2,
          childId: childId,
          childName: selectedChild?.name || "Học sinh",
          medicineName: "Vitamin C",
          dosage: "1 viên",
          frequency: "1 lần/ngày",
          duration: "7 ngày",
          time: "8:00",
          notes: "Uống sau bữa sáng",
          status: "approved",
          requestDate: moment().subtract(5, "days").format("YYYY-MM-DD"),
          prescription: null,
        },
      ];
      setMedicineRequests(mockRequests);
      setRequestsLoading(false);
    }, 1000);
  };

  const handleSubmit = (values) => {
    if (!selectedChild) {
      message.error("Vui lòng chọn con em");
      return;
    }

    // Format the time values into a string if they're array of moments
    let formattedTime = values.time;
    if (
      Array.isArray(values.time) &&
      values.time.every((t) => moment.isMoment(t))
    ) {
      formattedTime = values.time.map((t) => t.format("HH:mm")).join(", ");
    }

    const requestData = {
      childId: selectedChild.id,
      childName: selectedChild.name,
      ...values,
      time: formattedTime,
      requestDate: moment().format("YYYY-MM-DD"),
      status: "pending",
    };

    // Dispatch action to submit the request
    dispatch(submitMedicationRequest(requestData));
  };

  const handleEdit = (record) => {
    const childToEdit = children.find((child) => child.id === record.childId);
    if (childToEdit) {
      dispatch(setSelectedChild(childToEdit));
    }

    // Parse times from string to array of moments if needed
    let timeValues = record.time;
    if (typeof record.time === "string") {
      timeValues = record.time.split(", ").map((t) => moment(t, "HH:mm"));
    }

    form.setFieldsValue({
      ...record,
      time: timeValues,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa yêu cầu này?",
      onOk: () => {
        setMedicineRequests(medicineRequests.filter((req) => req.id !== id));
        message.success("Đã xóa yêu cầu thuốc");
      },
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenIncidentDialog = (incident) => {
    dispatch(setSelectedIncident(incident));
    setOpenIncidentDialog(true);
  };

  const handleCloseIncidentDialog = () => {
    setOpenIncidentDialog(false);
  };

  const handleOpenMedicineModal = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "nhẹ":
        return "success";
      case "trung bình":
        return "warning";
      case "nặng":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "success";
      case "ongoing":
        return "warning";
      case "pending":
        return "info";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "resolved":
        return "Đã giải quyết";
      case "ongoing":
        return "Đang xử lý";
      case "pending":
        return "Chờ xử lý";
      default:
        return "Không xác định";
    }
  };

  const renderMedicineRequests = () => {
    if (requestsLoading || loading) {
      return (
        <Box display="flex" justifyContent="center" mt={3}>
          <CircularProgress />
        </Box>
      );
    }

    if (!selectedChild) {
      return (
        <Typography variant="body1" align="center" mt={3}>
          Vui lòng chọn học sinh để xem yêu cầu thuốc
        </Typography>
      );
    }

    return (
      <>
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenMedicineModal}
          >
            Gửi yêu cầu thuốc mới
          </Button>
        </Box>

        {medicineRequests.length === 0 ? (
          <Typography variant="body1" align="center" mt={3}>
            Không có yêu cầu thuốc nào
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ngày yêu cầu</TableCell>
                  <TableCell>Tên thuốc</TableCell>
                  <TableCell>Liều lượng</TableCell>
                  <TableCell>Tần suất</TableCell>
                  <TableCell>Thời gian</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {medicineRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.requestDate}</TableCell>
                    <TableCell>{request.medicineName}</TableCell>
                    <TableCell>{request.dosage}</TableCell>
                    <TableCell>{request.frequency}</TableCell>
                    <TableCell>{request.time}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          request.status === "pending"
                            ? "Chờ xử lý"
                            : request.status === "approved"
                            ? "Đã duyệt"
                            : "Từ chối"
                        }
                        color={
                          request.status === "pending"
                            ? "warning"
                            : request.status === "approved"
                            ? "success"
                            : "error"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(request)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        {request.status === "pending" && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(request.id)}
                          >
                            <Warning fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </>
    );
  };

  const renderActiveIncidents = () => {
    const activeIncidents = incidents.filter(
      (inc) => inc.status !== "resolved"
    );

    if (loading) {
      return (
        <Box display="flex" justifyContent="center" mt={3}>
          <CircularProgress />
        </Box>
      );
    }

    if (!selectedChild) {
      return (
        <Typography variant="body1" align="center" mt={3}>
          Vui lòng chọn học sinh để xem sự cố y tế
        </Typography>
      );
    }

    if (activeIncidents.length === 0) {
      return (
        <Typography variant="body1" align="center" mt={3}>
          Không có sự cố y tế đang xử lý
        </Typography>
      );
    }

    return (
      <Grid container spacing={2} mt={1}>
        {activeIncidents.map((incident) => (
          <Grid item xs={12} md={6} key={incident.id}>
            <Card>
              <CardHeader
                title={incident.type}
                subheader={
                  <Stack direction="row" spacing={1} mt={0.5}>
                    <Chip
                      label={getStatusText(incident.status)}
                      color={getStatusColor(incident.status)}
                      size="small"
                    />
                    <Chip
                      label={incident.severity}
                      color={getSeverityColor(incident.severity)}
                      size="small"
                    />
                  </Stack>
                }
                action={
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenIncidentDialog(incident)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                }
              />
              <Divider />
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <CalendarToday fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">Ngày: {incident.date}</Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <AccessTime fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">Giờ: {incident.time}</Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <LocationOn fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Địa điểm: {incident.location}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="flex-start" mb={1}>
                  <Description fontSize="small" sx={{ mr: 1, mt: 0.5 }} />
                  <Typography variant="body2">
                    Mô tả: {incident.description}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <LocalHospital fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Xử lý: {incident.treatment}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderIncidentHistory = () => {
    const resolvedIncidents = incidents.filter(
      (inc) => inc.status === "resolved"
    );

    if (loading) {
      return (
        <Box display="flex" justifyContent="center" mt={3}>
          <CircularProgress />
        </Box>
      );
    }

    if (!selectedChild) {
      return (
        <Typography variant="body1" align="center" mt={3}>
          Vui lòng chọn học sinh để xem lịch sử sự cố y tế
        </Typography>
      );
    }

    if (resolvedIncidents.length === 0) {
      return (
        <Typography variant="body1" align="center" mt={3}>
          Không có lịch sử sự cố y tế
        </Typography>
      );
    }

    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ngày</TableCell>
              <TableCell>Loại sự cố</TableCell>
              <TableCell>Mức độ</TableCell>
              <TableCell>Xử lý</TableCell>
              <TableCell>Chi tiết</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resolvedIncidents.map((incident) => (
              <TableRow key={incident.id}>
                <TableCell>{incident.date}</TableCell>
                <TableCell>{incident.type}</TableCell>
                <TableCell>
                  <Chip
                    label={incident.severity}
                    color={getSeverityColor(incident.severity)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{incident.treatment}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenIncidentDialog(incident)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderIncidentDetails = () => {
    const incident = selectedIncident;

    if (!incident) return null;

    return (
      <Box>
        <Box display="flex" alignItems="center" mb={1}>
          <Typography variant="h6" component="span" mr={1}>
            {incident.type}
          </Typography>
          <Chip
            label={incident.severity}
            color={getSeverityColor(incident.severity)}
            size="small"
          />
          <Chip
            label={getStatusText(incident.status)}
            color={getStatusColor(incident.status)}
            size="small"
            sx={{ ml: 1 }}
          />
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Ngày:</Typography>
            <Typography variant="body2">{incident.date}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Giờ:</Typography>
            <Typography variant="body2">{incident.time}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Địa điểm:</Typography>
            <Typography variant="body2">{incident.location}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Mô tả sự cố:</Typography>
            <Typography variant="body2">{incident.description}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Xử lý:</Typography>
            <Typography variant="body2">{incident.treatment}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Người báo cáo:</Typography>
            <Typography variant="body2">{incident.reportedBy}</Typography>
          </Grid>
          {incident.nurseNotes && (
            <Grid item xs={12}>
              <Typography variant="subtitle2">Ghi chú của y tá:</Typography>
              <Typography variant="body2">{incident.nurseNotes}</Typography>
            </Grid>
          )}
          {incident.followUpRequired && (
            <Grid item xs={12}>
              <Typography variant="subtitle2">Theo dõi thêm:</Typography>
              <Typography variant="body2">
                Cần theo dõi thêm{" "}
                {incident.followUpDate
                  ? `đến ngày ${incident.followUpDate}`
                  : ""}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Quản lý thuốc và sự cố y tế
      </Typography>

      <Paper sx={{ mt: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Yêu cầu thuốc" />
          <Tab label="Sự cố đang xử lý" />
          <Tab label="Lịch sử sự cố" />
        </Tabs>

        <Box p={2}>
          {tabValue === 0 && renderMedicineRequests()}
          {tabValue === 1 && renderActiveIncidents()}
          {tabValue === 2 && renderIncidentHistory()}
        </Box>
      </Paper>

      {/* Modal gửi yêu cầu thuốc */}
      <Modal
        title="Gửi yêu cầu thuốc cho con"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="medicineName"
            label="Tên thuốc"
            rules={[{ required: true, message: "Vui lòng nhập tên thuốc" }]}
          >
            <AntInput placeholder="Nhập tên thuốc" />
          </Form.Item>

          <Form.Item
            name="dosage"
            label="Liều lượng"
            rules={[{ required: true, message: "Vui lòng nhập liều lượng" }]}
          >
            <AntInput placeholder="VD: 5ml, 1 viên, 1 gói..." />
          </Form.Item>

          <Form.Item
            name="frequency"
            label="Tần suất"
            rules={[{ required: true, message: "Vui lòng nhập tần suất" }]}
          >
            <AntInput placeholder="VD: 3 lần/ngày, 1 lần/ngày..." />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Thời gian dùng"
            rules={[
              { required: true, message: "Vui lòng nhập thời gian dùng" },
            ]}
          >
            <AntInput placeholder="VD: 3 ngày, 1 tuần..." />
          </Form.Item>

          <Form.Item
            name="time"
            label="Thời điểm uống thuốc"
            rules={[
              { required: true, message: "Vui lòng nhập thời điểm uống thuốc" },
            ]}
          >
            <AntInput placeholder="VD: 8:00, 12:00, 18:00" />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú">
            <TextArea
              rows={4}
              placeholder="Thêm ghi chú về cách dùng thuốc (nếu có)"
            />
          </Form.Item>

          <Form.Item name="prescription" label="Đơn thuốc (nếu có)">
            <Upload>
              <Button icon={<UploadOutlined />}>Tải lên đơn thuốc</Button>
            </Upload>
          </Form.Item>

          <AntDivider />

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Gửi yêu cầu
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => setIsModalVisible(false)}
            >
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Dialog chi tiết sự cố */}
      <Dialog
        open={openIncidentDialog}
        onClose={handleCloseIncidentDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Warning sx={{ mr: 1, color: "warning.main" }} />
            Chi tiết sự cố y tế
          </Box>
        </DialogTitle>
        <DialogContent dividers>{renderIncidentDetails()}</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseIncidentDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MedicineRequestPage;
