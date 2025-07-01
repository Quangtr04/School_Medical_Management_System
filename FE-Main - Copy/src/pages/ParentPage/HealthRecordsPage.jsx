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
} from "@mui/material";
import {
  CalendarToday,
  AccessTime,
  Person,
  LocationOn,
  Description,
  MedicalServices,
  Add as AddIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import viLocale from "date-fns/locale/vi";
import { format } from "date-fns";
import {
  getCheckupHistory,
  getCheckupAppointments,
  requestCheckupAppointment,
  getCheckupDetails,
  setSelectedCheckup,
} from "../../redux/parent/parentSlice";

function HealthRecordsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { children, selectedChild, checkups, loading, error } = useSelector(
    (state) => state.parent
  );

  const [tabValue, setTabValue] = useState(0);
  const [openAppointmentDialog, setOpenAppointmentDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    studentId: selectedChild?.id || "",
    date: null,
    time: null,
    type: "",
    description: "",
  });

  useEffect(() => {
    if (selectedChild) {
      dispatch(getCheckupHistory(selectedChild.id));
      dispatch(getCheckupAppointments(selectedChild.id));
    }
  }, [dispatch, selectedChild]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenAppointmentDialog = () => {
    setAppointmentData({
      ...appointmentData,
      studentId: selectedChild?.id || "",
    });
    setOpenAppointmentDialog(true);
  };

  const handleCloseAppointmentDialog = () => {
    setOpenAppointmentDialog(false);
  };

  const handleOpenDetailsDialog = (checkup) => {
    dispatch(setSelectedCheckup(checkup));
    setOpenDetailsDialog(true);
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
  };

  const handleAppointmentInputChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData({
      ...appointmentData,
      [name]: value,
    });
  };

  const handleDateChange = (date) => {
    setAppointmentData({
      ...appointmentData,
      date: date,
    });
  };

  const handleTimeChange = (time) => {
    setAppointmentData({
      ...appointmentData,
      time: time,
    });
  };

  const handleSubmitAppointment = () => {
    const formattedDate = format(appointmentData.date, "yyyy-MM-dd");
    const formattedTime = format(appointmentData.time, "HH:mm");

    const requestData = {
      ...appointmentData,
      date: formattedDate,
      time: formattedTime,
    };

    dispatch(requestCheckupAppointment(requestData));
    handleCloseAppointmentDialog();
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
      default:
        return "default";
    }
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

  const renderAppointmentsTab = () => {
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
          Vui lòng chọn học sinh để xem lịch hẹn
        </Typography>
      );
    }

    return (
      <>
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAppointmentDialog}
          >
            Đặt lịch khám
          </Button>
        </Box>

        {checkups.appointments.length === 0 ? (
          <Typography variant="body1" align="center" mt={3}>
            Không có lịch hẹn
          </Typography>
        ) : (
          <Grid container spacing={2} mt={1}>
            {checkups.appointments.map((appointment) => (
              <Grid item xs={12} md={6} key={appointment.id}>
                <Card>
                  <CardHeader
                    title={appointment.type}
                    subheader={
                      <Chip
                        label={
                          appointment.status === "scheduled"
                            ? "Đã xếp lịch"
                            : "Đang chờ xác nhận"
                        }
                        color={getStatusColor(appointment.status)}
                        size="small"
                      />
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <CalendarToday fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Ngày: {appointment.date}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <AccessTime fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Giờ: {appointment.time}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Person fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Bác sĩ: {appointment.doctor || "Chưa phân công"}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <LocationOn fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Địa điểm:{" "}
                        {appointment.location || "Phòng y tế trường học"}
                      </Typography>
                    </Box>
                    {appointment.description && (
                      <Box display="flex" alignItems="flex-start" mb={1}>
                        <Description fontSize="small" sx={{ mr: 1, mt: 0.5 }} />
                        <Typography variant="body2">
                          Mô tả: {appointment.description}
                        </Typography>
                      </Box>
                    )}
                    <Box mt={2}>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleOpenDetailsDialog(appointment)}
                      >
                        Xem chi tiết
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </>
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
          <Tab label="Lịch sử khám" />
          <Tab label="Lịch hẹn khám" />
        </Tabs>

        <Box p={2}>
          {tabValue === 0 && renderHistoryTab()}
          {tabValue === 1 && renderAppointmentsTab()}
        </Box>
      </Paper>

      {/* Dialog đặt lịch khám */}
      <Dialog
        open={openAppointmentDialog}
        onClose={handleCloseAppointmentDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Đặt lịch khám</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="appointment-type-label">Loại khám</InputLabel>
              <Select
                labelId="appointment-type-label"
                name="type"
                value={appointmentData.type}
                onChange={handleAppointmentInputChange}
                label="Loại khám"
                required
              >
                <MenuItem value="Khám tổng quát">Khám tổng quát</MenuItem>
                <MenuItem value="Khám răng">Khám răng</MenuItem>
                <MenuItem value="Khám mắt">Khám mắt</MenuItem>
                <MenuItem value="Tư vấn dinh dưỡng">Tư vấn dinh dưỡng</MenuItem>
                <MenuItem value="Khám chuyên khoa">Khám chuyên khoa</MenuItem>
              </Select>
            </FormControl>

            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={viLocale}
            >
              <Box mt={2}>
                <DatePicker
                  label="Ngày khám"
                  value={appointmentData.date}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  disablePast
                />
              </Box>

              <Box mt={2}>
                <TimePicker
                  label="Giờ khám"
                  value={appointmentData.time}
                  onChange={handleTimeChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Box>
            </LocalizationProvider>

            <TextField
              margin="normal"
              name="description"
              label="Mô tả"
              multiline
              rows={4}
              fullWidth
              value={appointmentData.description}
              onChange={handleAppointmentInputChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAppointmentDialog}>Hủy</Button>
          <Button
            onClick={handleSubmitAppointment}
            variant="contained"
            color="primary"
            disabled={
              !appointmentData.type ||
              !appointmentData.date ||
              !appointmentData.time
            }
          >
            Đặt lịch
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
}

export default HealthRecordsPage;
