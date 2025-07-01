import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/config-axios";

// Initial state
const initialState = {
  children: [],
  selectedChild: null,
  profile: null,
  checkups: {
    approved: [],
    pending: [],
    selectedCheckup: null,
    appointments: [],
    history: [],
  },
  healthDeclarations: {},
  incidents: [],
  selectedIncident: null,
  vaccinations: {
    campaigns: [],
    approved: [],
    declined: [],
    selectedCampaign: null,
    studentVaccinations: {},
  },
  notifications: [],
  loading: false,
  error: null,
  success: false,
};

// Async Thunks for API calls
// Student Information
export const getParentChildren = createAsyncThunk(
  "parent/getChildren",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/parent/students");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch children information"
      );
    }
  }
);

export const getChildDetails = createAsyncThunk(
  "parent/getChildDetails",
  async (student_id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/parent/students/${student_id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch child details"
      );
    }
  }
);

export const getParentProfile = createAsyncThunk(
  "parent/getProfile",
  async (user_id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/parent/profile/${user_id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile"
      );
    }
  }
);

export const updateParentProfile = createAsyncThunk(
  "parent/updateProfile",
  async ({ user_id, profileData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/parent/profile/${user_id}`,
        profileData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

// Health Checkups
export const getApprovedCheckups = createAsyncThunk(
  "parent/getApprovedCheckups",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/parent/checkups/approved");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch approved checkups"
      );
    }
  }
);

export const getApprovedConsents = createAsyncThunk(
  "parent/getApprovedConsents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/parent/consents-checkups/approved");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch approved consents"
      );
    }
  }
);

export const getCheckupDetails = createAsyncThunk(
  "parent/getCheckupDetails",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/parent/consents-checkups/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch checkup details"
      );
    }
  }
);

export const getPendingConsents = createAsyncThunk(
  "parent/getPendingConsents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/parent/consents-checkups/pending");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch pending consents"
      );
    }
  }
);

export const respondToConsentForm = createAsyncThunk(
  "parent/respondToConsentForm",
  async ({ form_id, response, notes }, { rejectWithValue, dispatch }) => {
    try {
      const apiResponse = await api.post(
        `/parent/consents-checkups/${form_id}/respond`,
        { response, notes }
      );

      // Sau khi phản hồi thành công, cập nhật danh sách
      dispatch(getApprovedConsents());
      dispatch(getPendingConsents());

      return apiResponse.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to respond to consent form"
      );
    }
  }
);

export const updateConsentStatus = createAsyncThunk(
  "parent/updateConsentStatus",
  async ({ checkup_id, status, notes }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.patch(
        `/parent/checkups/${checkup_id}/consent`,
        { status, notes }
      );

      // Sau khi cập nhật thành công, cập nhật danh sách
      dispatch(getApprovedConsents());
      dispatch(getPendingConsents());

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update consent status"
      );
    }
  }
);

// Health Declarations
export const getHealthDeclaration = createAsyncThunk(
  "parent/getHealthDeclaration",
  async (student_id, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/parent/students/${student_id}/health-declaration`
      );
      return { student_id, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch health declaration"
      );
    }
  }
);

export const updateHealthDeclaration = createAsyncThunk(
  "parent/updateHealthDeclaration",
  async ({ studentId, declarationData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/parent/students/${studentId}/health-declaration`,
        declarationData
      );
      return { studentId, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update health declaration"
      );
    }
  }
);

// Medical Incidents
export const getIncidentsByUser = createAsyncThunk(
  "parent/getIncidentsByUser",
  async (user_id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/parent/incidents/${user_id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch incidents"
      );
    }
  }
);

export const getIncidentDetails = createAsyncThunk(
  "parent/getIncidentDetails",
  async (incident_id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/parent/incidents/${incident_id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch incident details"
      );
    }
  }
);

// Medical Submissions
export const submitMedicationRequest = createAsyncThunk(
  "parent/submitMedicationRequest",
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/parent/medical-submissions",
        requestData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit medication request"
      );
    }
  }
);

// Vaccinations
export const getVaccineCampaigns = createAsyncThunk(
  "parent/getVaccineCampaigns",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/parent/vaccine-campaigns");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch vaccine campaigns"
      );
    }
  }
);

export const getVaccineCampaignDetails = createAsyncThunk(
  "parent/getVaccineCampaignDetails",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/parent/vaccine-campaigns/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch campaign details"
      );
    }
  }
);

export const getApprovedCampaigns = createAsyncThunk(
  "parent/getApprovedCampaigns",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/parent/vaccine-campaigns/approved");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch approved campaigns"
      );
    }
  }
);

export const getDeclinedCampaigns = createAsyncThunk(
  "parent/getDeclinedCampaigns",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/parent/vaccine-campaigns/declined");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch declined campaigns"
      );
    }
  }
);

export const getStudentVaccinations = createAsyncThunk(
  "parent/getStudentVaccinations",
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/parent/students/${studentId}/vaccinations`
      );
      return { studentId, vaccinations: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch student vaccinations"
      );
    }
  }
);

export const respondToVaccinationConsent = createAsyncThunk(
  "parent/respondToVaccinationConsent",
  async ({ id, responseData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post(
        `/parent/vaccine-campaigns/${id}/respond`,
        responseData
      );

      // After successful response, refresh the campaign lists
      dispatch(getVaccineCampaigns());
      dispatch(getApprovedCampaigns());
      dispatch(getDeclinedCampaigns());

      // Also refresh student vaccinations if available
      if (responseData.studentId) {
        dispatch(getStudentVaccinations(responseData.studentId));
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to respond to vaccination consent"
      );
    }
  }
);

export const updateVaccinationResponse = createAsyncThunk(
  "parent/updateVaccinationResponse",
  async ({ id, status, studentId }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.patch(
        `/parent/vaccine-campaigns/${id}/status`,
        { status, studentId }
      );

      // After successful update, refresh the campaign lists
      dispatch(getVaccineCampaigns());
      dispatch(getApprovedCampaigns());
      dispatch(getDeclinedCampaigns());

      // Also refresh student vaccinations if available
      if (studentId) {
        dispatch(getStudentVaccinations(studentId));
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update vaccination response"
      );
    }
  }
);

// Notifications
export const getParentNotifications = createAsyncThunk(
  "parent/getNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/parent/notifications");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch notifications"
      );
    }
  }
);

// Thêm thunks cho lịch khám sức khỏe
export const requestCheckupAppointment = createAsyncThunk(
  "parent/requestCheckupAppointment",
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/parent/checkups/request",
        appointmentData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to request appointment"
      );
    }
  }
);

export const getCheckupHistory = createAsyncThunk(
  "parent/getCheckupHistory",
  async (student_id, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/parent/students/${student_id}/checkup-history`
      );
      return { studentId: student_id, history: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch checkup history"
      );
    }
  }
);

export const getCheckupAppointments = createAsyncThunk(
  "parent/getCheckupAppointments",
  async (student_id, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/parent/students/${student_id}/appointments`
      );
      return { studentId: student_id, appointments: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch appointments"
      );
    }
  }
);

// Create the slice
const parentSlice = createSlice({
  name: "parent",
  initialState,
  reducers: {
    clearParentErrors: (state) => {
      state.error = null;
    },
    clearParentSuccess: (state) => {
      state.success = false;
    },
    setSelectedChild: (state, action) => {
      state.selectedChild = action.payload;
    },
    setSelectedIncident: (state, action) => {
      state.selectedIncident = action.payload;
    },
    setSelectedCheckup: (state, action) => {
      state.checkups.selectedCheckup = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Children List
      .addCase(getParentChildren.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getParentChildren.fulfilled, (state, action) => {
        state.loading = false;
        state.children = action.payload;
      })
      .addCase(getParentChildren.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Child Details
      .addCase(getChildDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getChildDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedChild = action.payload;
      })
      .addCase(getChildDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Parent Profile
      .addCase(getParentProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getParentProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(getParentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Parent Profile
      .addCase(updateParentProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateParentProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.success = true;
      })
      .addCase(updateParentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Health Checkups
      .addCase(getApprovedCheckups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getApprovedCheckups.fulfilled, (state, action) => {
        state.loading = false;
        state.checkups.approved = action.payload;
      })
      .addCase(getApprovedCheckups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getApprovedConsents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getApprovedConsents.fulfilled, (state, action) => {
        state.loading = false;
        state.checkups.approved = action.payload;
      })
      .addCase(getApprovedConsents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getCheckupDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCheckupDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.checkups.selectedCheckup = action.payload;
      })
      .addCase(getCheckupDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getPendingConsents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingConsents.fulfilled, (state, action) => {
        state.loading = false;
        state.checkups.pending = action.payload;
      })
      .addCase(getPendingConsents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(respondToConsentForm.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(respondToConsentForm.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        // Cập nhật checkup nếu có trong response
        if (action.payload.checkup) {
          const checkup = action.payload.checkup;

          // Cập nhật danh sách phù hợp dựa trên trạng thái
          if (checkup.status === "approved") {
            // Thêm vào danh sách approved nếu chưa có
            const existingIndex = state.checkups.approved.findIndex(
              (c) => c.id === checkup.id
            );
            if (existingIndex === -1) {
              state.checkups.approved.push(checkup);
            } else {
              state.checkups.approved[existingIndex] = checkup;
            }

            // Xóa khỏi danh sách pending nếu có
            state.checkups.pending = state.checkups.pending.filter(
              (c) => c.id !== checkup.id
            );
          } else if (checkup.status === "rejected") {
            // Xóa khỏi danh sách pending
            state.checkups.pending = state.checkups.pending.filter(
              (c) => c.id !== checkup.id
            );
          }
        }
      })
      .addCase(respondToConsentForm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      .addCase(updateConsentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateConsentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        // Cập nhật checkup nếu có trong response
        if (action.payload.checkup) {
          const checkup = action.payload.checkup;

          // Cập nhật trong danh sách phù hợp
          const lists = ["approved", "pending", "appointments", "history"];

          lists.forEach((listName) => {
            const index = state.checkups[listName].findIndex(
              (c) => c.id === checkup.id
            );
            if (index !== -1) {
              state.checkups[listName][index] = checkup;
            }
          });
        }
      })
      .addCase(updateConsentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Checkup Appointments
      .addCase(requestCheckupAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(requestCheckupAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        // Thêm lịch hẹn mới vào danh sách
        if (action.payload.appointment) {
          state.checkups.appointments.push(action.payload.appointment);
        }
      })
      .addCase(requestCheckupAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Checkup History
      .addCase(getCheckupHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCheckupHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.checkups.history = action.payload.history;
      })
      .addCase(getCheckupHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Checkup Appointments
      .addCase(getCheckupAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCheckupAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.checkups.appointments = action.payload.appointments;
      })
      .addCase(getCheckupAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Health Declarations
      .addCase(getHealthDeclaration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHealthDeclaration.fulfilled, (state, action) => {
        state.loading = false;
        state.healthDeclarations[action.payload.student_id] =
          action.payload.data;
      })
      .addCase(getHealthDeclaration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateHealthDeclaration.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateHealthDeclaration.fulfilled, (state, action) => {
        state.loading = false;
        state.healthDeclarations[action.payload.studentId] =
          action.payload.data;
        state.success = true;
      })
      .addCase(updateHealthDeclaration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Medical Incidents
      .addCase(getIncidentsByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getIncidentsByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.incidents = action.payload;
      })
      .addCase(getIncidentsByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getIncidentDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getIncidentDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedIncident = action.payload;
      })
      .addCase(getIncidentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Medical Submissions
      .addCase(submitMedicationRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitMedicationRequest.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(submitMedicationRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Vaccinations
      .addCase(getVaccineCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVaccineCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.vaccinations.campaigns = action.payload;
      })
      .addCase(getVaccineCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getVaccineCampaignDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVaccineCampaignDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.vaccinations.selectedCampaign = action.payload;
      })
      .addCase(getVaccineCampaignDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getApprovedCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getApprovedCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.vaccinations.approved = action.payload;
      })
      .addCase(getApprovedCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getDeclinedCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDeclinedCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.vaccinations.declined = action.payload;
      })
      .addCase(getDeclinedCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getStudentVaccinations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStudentVaccinations.fulfilled, (state, action) => {
        state.loading = false;
        state.vaccinations.studentVaccinations[action.payload.studentId] =
          action.payload.vaccinations;
      })
      .addCase(getStudentVaccinations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(respondToVaccinationConsent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(respondToVaccinationConsent.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        // If the response includes campaign data, update it
        if (action.payload.campaign) {
          const campaignIndex = state.vaccinations.campaigns.findIndex(
            (c) => c.id === action.payload.campaign.id
          );

          if (campaignIndex !== -1) {
            state.vaccinations.campaigns[campaignIndex] =
              action.payload.campaign;
          }
        }

        // If the response includes student response data, update it
        if (action.payload.studentResponse) {
          const { studentId, status } = action.payload.studentResponse;

          // Update approved/declined lists based on response
          if (status === "approved") {
            // Check if campaign is already in approved list
            const existingApprovedIndex = state.vaccinations.approved.findIndex(
              (c) =>
                c.id === action.payload.campaign.id && c.studentId === studentId
            );

            if (existingApprovedIndex === -1) {
              state.vaccinations.approved.push({
                ...action.payload.campaign,
                responseStatus: "approved",
                studentId,
              });
            }

            // Remove from declined list if exists
            state.vaccinations.declined = state.vaccinations.declined.filter(
              (c) =>
                !(
                  c.id === action.payload.campaign.id &&
                  c.studentId === studentId
                )
            );
          } else if (status === "declined") {
            // Check if campaign is already in declined list
            const existingDeclinedIndex = state.vaccinations.declined.findIndex(
              (c) =>
                c.id === action.payload.campaign.id && c.studentId === studentId
            );

            if (existingDeclinedIndex === -1) {
              state.vaccinations.declined.push({
                ...action.payload.campaign,
                responseStatus: "declined",
                studentId,
              });
            }

            // Remove from approved list if exists
            state.vaccinations.approved = state.vaccinations.approved.filter(
              (c) =>
                !(
                  c.id === action.payload.campaign.id &&
                  c.studentId === studentId
                )
            );
          }
        }
      })
      .addCase(respondToVaccinationConsent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      .addCase(updateVaccinationResponse.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateVaccinationResponse.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        // If the response includes updated vaccination data, update it
        if (action.payload.updatedVaccination) {
          const { studentId } = action.payload.updatedVaccination;

          if (state.vaccinations.studentVaccinations[studentId]) {
            const vaccinationIndex = state.vaccinations.studentVaccinations[
              studentId
            ].findIndex((v) => v.id === action.payload.updatedVaccination.id);

            if (vaccinationIndex !== -1) {
              state.vaccinations.studentVaccinations[studentId][
                vaccinationIndex
              ] = action.payload.updatedVaccination;
            }
          }
        }
      })
      .addCase(updateVaccinationResponse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Notifications
      .addCase(getParentNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getParentNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(getParentNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearParentErrors,
  clearParentSuccess,
  setSelectedChild,
  setSelectedIncident,
  setSelectedCheckup,
} = parentSlice.actions;

export default parentSlice.reducer;
