import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
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
  CircularProgress,
  IconButton,
  Chip,
} from "@mui/material";
import {
  MedicalServices,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import {
  getParentChildren,
  getChildDetails,
  getCheckupHistory,
  getCheckupDetails,
  setSelectedCheckup,
  getPendingConsents,
  respondToConsentForm,
} from "../../redux/parent/parentSlice";
import { Alert, Modal, Form, Input, Radio, Space, message } from "antd";

const { TextArea } = Input;

function HealthRecordsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { children, selectedChild, checkups, loading, error, success } =
    useSelector((state) => state.parent);

  const [tabValue, setTabValue] = useState(0);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openConsentDialog, setOpenConsentDialog] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState(null);
  const [consentForm] = Form.useForm();

  // Fetch children data if not already loaded
  useEffect(() => {
    if (!children || children.length === 0) {
      dispatch(getParentChildren());
    }
  }, [dispatch, children]);

  // Select first child if none selected
  useEffect(() => {
    if (children && children.length > 0 && !selectedChild) {
      dispatch(getChildDetails(children[0].id));
    }
  }, [dispatch, children, selectedChild]);

  // Fetch checkup data when child is selected
  useEffect(() => {
    if (selectedChild) {
      dispatch(getCheckupHistory(selectedChild.id));
      dispatch(getPendingConsents());
    }
  }, [dispatch, selectedChild]);

  // Handle success from API
  useEffect(() => {
    if (success) {
      message.success("Thao tác thành công!");
      setOpenConsentDialog(false);
      consentForm.resetFields();
    }
  }, [success, consentForm]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDetailsDialog = (checkup) => {
    dispatch(setSelectedCheckup(checkup));
    setOpenDetailsDialog(true);
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
  };

  const handleOpenConsentDialog = (consent) => {
    setSelectedConsent(consent);
    setOpenConsentDialog(true);
    consentForm.resetFields();
  };

  const handleCloseConsentDialog = () => {
    setOpenConsentDialog(false);
  };

  const handleSubmitConsent = (values) => {
    if (!selectedConsent) return;

    dispatch(
      respondToConsentForm({
        form_id: selectedConsent.id,
        response: values.response === "approve" ? "approved" : "rejected",
        notes: values.notes || "",
      })
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "scheduled":
        return "info";
      case "pending":
        return "warning";
      case "requested":
        return "secondary";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Đã hoàn thành";
      case "scheduled":
        return "Đã xếp lịch";
      case "pending":
        return "Chờ xác nhận";
      case "requested":
        return "Đã yêu cầu";
      case "approved":
        return "Đã đồng ý";
      case "rejected":
        return "Đã từ chối";
      default:
        return "Không xác định";
    }
  };

  const renderPendingConsentsTab = () => {
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
          Vui lòng chọn học sinh để xem phiếu đồng ý kiểm tra sức khỏe
        </Typography>
      );
    }

    const pendingConsents = checkups.pending.filter(
      (consent) => consent.studentId === selectedChild.id
    );

    if (pendingConsents.length === 0) {
      return (
        <Typography variant="body1" align="center" mt={3}>
          Không có phiếu đồng ý kiểm tra sức khỏe nào chờ xác nhận
        </Typography>
      );
    }

    return (
      <Grid container spacing={2} mt={1}>
        {pendingConsents.map((consent) => (
          <Grid item xs={12} md={6} key={consent.id}>
            <Card>
              <CardHeader
                title={consent.type}
                subheader={
                  <Chip
                    label="Chờ phản hồi"
                    color="warning"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                }
              />
              <Divider />
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <CalendarToday fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Ngày khám: {consent.date}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <AccessTime fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Giờ khám: {consent.time}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <Person fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Bác sĩ: {consent.doctor || "Chưa phân công"}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <LocationOn fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Địa điểm: {consent.location || "Phòng y tế trường học"}
                  </Typography>
                </Box>
                {consent.description && (
                  <Box display="flex" alignItems="flex-start" mb={1}>
                    <Description fontSize="small" sx={{ mr: 1, mt: 0.5 }} />
                    <Typography variant="body2">
                      Mô tả: {consent.description}
                    </Typography>
                  </Box>
                )}
                <Box mt={2} display="flex" justifyContent="space-between">
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => handleOpenDetailsDialog(consent)}
                  >
                    Xem chi tiết
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleOpenConsentDialog(consent)}
                  >
                    Phản hồi
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderHistoryTab = () => {
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
          Vui lòng chọn học sinh để xem lịch sử khám
        </Typography>
      );
    }

    if (checkups.history.length === 0) {
      return (
        <Typography variant="body1" align="center" mt={3}>
          Không có lịch sử khám
        </Typography>
      );
    }

    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ngày khám</TableCell>
              <TableCell>Loại khám</TableCell>
              <TableCell>Bác sĩ</TableCell>
              <TableCell>Kết quả</TableCell>
              <TableCell>Chi tiết</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {checkups.history.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.date}</TableCell>
                <TableCell>{record.type}</TableCell>
                <TableCell>{record.doctor}</TableCell>
                <TableCell>{record.result}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDetailsDialog(record)}
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

  const renderCheckupDetails = () => {
    const checkup = checkups.selectedCheckup;

    if (!checkup) return null;

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          {checkup.type}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Ngày khám:</Typography>
            <Typography variant="body2">{checkup.date}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Giờ khám:</Typography>
            <Typography variant="body2">{checkup.time}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Bác sĩ:</Typography>
            <Typography variant="body2">
              {checkup.doctor || "Chưa phân công"}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Địa điểm:</Typography>
            <Typography variant="body2">
              {checkup.location || "Phòng y tế trường học"}
            </Typography>
          </Grid>

          {checkup.status === "completed" && (
            <>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Kết quả:</Typography>
                <Typography variant="body2">
                  {checkup.result || "Không có kết quả"}
                </Typography>
              </Grid>

              {checkup.details && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Chi tiết:</Typography>
                  <Typography variant="body2">{checkup.details}</Typography>
                </Grid>
              )}

              {checkup.height && (
                <Grid item xs={4}>
                  <Typography variant="subtitle2">Chiều cao:</Typography>
                  <Typography variant="body2">{checkup.height} cm</Typography>
                </Grid>
              )}

              {checkup.weight && (
                <Grid item xs={4}>
                  <Typography variant="subtitle2">Cân nặng:</Typography>
                  <Typography variant="body2">{checkup.weight} kg</Typography>
                </Grid>
              )}

              {checkup.bmi && (
                <Grid item xs={4}>
                  <Typography variant="subtitle2">BMI:</Typography>
                  <Typography variant="body2">{checkup.bmi}</Typography>
                </Grid>
              )}

              {checkup.bloodPressure && (
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Huyết áp:</Typography>
                  <Typography variant="body2">
                    {checkup.bloodPressure}
                  </Typography>
                </Grid>
              )}

              {checkup.vision && (
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Thị lực:</Typography>
                  <Typography variant="body2">{checkup.vision}</Typography>
                </Grid>
              )}

              {checkup.recommendations && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Khuyến nghị:</Typography>
                  <Typography variant="body2">
                    {checkup.recommendations}
                  </Typography>
                </Grid>
              )}
            </>
          )}

          {checkup.description && (
            <Grid item xs={12}>
              <Typography variant="subtitle2">Mô tả:</Typography>
              <Typography variant="body2">{checkup.description}</Typography>
            </Grid>
          )}

          {checkup.consentRequired && (
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                Cần có sự đồng ý của phụ huynh trước{" "}
                {checkup.consentDeadline || "ngày khám"}
              </Alert>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Hồ sơ sức khỏe
      </Typography>

      <Paper sx={{ mt: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Phiếu đồng ý kiểm tra" />
          <Tab label="Lịch sử khám" />
        </Tabs>

        <Box p={2}>
          {tabValue === 0 && renderPendingConsentsTab()}
          {tabValue === 1 && renderHistoryTab()}
        </Box>
      </Paper>

      {/* Dialog chi tiết khám */}
      <Dialog
        open={openDetailsDialog}
        onClose={handleCloseDetailsDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <MedicalServices sx={{ mr: 1 }} />
            Chi tiết khám sức khỏe
          </Box>
        </DialogTitle>
        <DialogContent dividers>{renderCheckupDetails()}</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog phản hồi đồng ý kiểm tra sức khỏe */}
      <Modal
        title="Phản hồi phiếu đồng ý kiểm tra sức khỏe"
        open={openConsentDialog}
        onCancel={handleCloseConsentDialog}
        footer={null}
        width={600}
      >
        {selectedConsent && (
          <>
            <Alert
              message="Thông tin kiểm tra sức khỏe"
              description={
                <div>
                  <p>
                    <strong>Loại khám:</strong> {selectedConsent.type}
                  </p>
                  <p>
                    <strong>Ngày khám:</strong> {selectedConsent.date}
                  </p>
                  <p>
                    <strong>Giờ khám:</strong> {selectedConsent.time}
                  </p>
                  <p>
                    <strong>Địa điểm:</strong>{" "}
                    {selectedConsent.location || "Phòng y tế trường học"}
                  </p>
                  <p>
                    <strong>Mô tả:</strong>{" "}
                    {selectedConsent.description || "Không có mô tả"}
                  </p>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Form
              form={consentForm}
              layout="vertical"
              onFinish={handleSubmitConsent}
            >
              <Form.Item
                name="response"
                label="Phản hồi của bạn"
                rules={[
                  { required: true, message: "Vui lòng chọn phản hồi của bạn" },
                ]}
              >
                <Radio.Group>
                  <Space direction="vertical">
                    <Radio value="approve">
                      <Space>
                        <CheckCircleIcon color="success" fontSize="small" />
                        Đồng ý cho con tham gia kiểm tra sức khỏe
                      </Space>
                    </Radio>
                    <Radio value="reject">
                      <Space>
                        <CancelIcon color="error" fontSize="small" />
                        Không đồng ý cho con tham gia kiểm tra sức khỏe
                      </Space>
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>

              <Form.Item name="notes" label="Ghi chú (nếu có)">
                <TextArea
                  rows={4}
                  placeholder="Nhập ghi chú của bạn (nếu có)"
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Gửi phản hồi
                </Button>
                <Button
                  style={{ marginLeft: 8 }}
                  onClick={handleCloseConsentDialog}
                >
                  Hủy
                </Button>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </Box>
  );
}

export default HealthRecordsPage;
