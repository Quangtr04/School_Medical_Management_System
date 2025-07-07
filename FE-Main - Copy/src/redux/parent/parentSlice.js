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
  medicationRequests: [],
  notifications: [],
  loading: false,
  error: null,
  success: false,
};

// Async Thunks for API calls
// Student Information
export const getParentChildren = createAsyncThunk("parent/getChildren", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/parent/students");
    console.log("Parent children API response:", response.data);

    // Return list of children from response data or direct response
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      // Make sure each child has an id property
      return response.data.data.map((child) => ({
        ...child,
        id: child.student_id || child.id, // Ensure id exists for compatibility
      }));
    }
    if (Array.isArray(response.data)) {
      // Make sure each child has an id property
      return response.data.map((child) => ({
        ...child,
        id: child.student_id || child.id, // Ensure id exists for compatibility
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching children:", error);
    return rejectWithValue(error.response?.data?.message || "Failed to fetch children information");
  }
});

export const getChildDetails = createAsyncThunk("parent/getChildDetails", async (student_id, { rejectWithValue }) => {
  try {
    // Check if student_id is valid before making the API call
    if (!student_id) {
      console.warn("Attempted to fetch child details with undefined student_id");
      return null;
    }

    const response = await api.get(`/parent/students/${student_id}`);
    // Extract payload where student details reside
    const payload = response.data.data ?? response.data;
    // If payload is array, find matching student_id
    if (Array.isArray(payload)) {
      return payload.find((item) => item.student_id === student_id) || null;
    }
    // Otherwise payload is object
    return payload;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch child details");
  }
});

export const getParentProfile = createAsyncThunk("parent/getProfile", async (_, { rejectWithValue }) => {
  try {
    console.log("Fetching profile using token");
    // Thêm timestamp để tránh cache
    const timestamp = new Date().getTime();
    const response = await api.get(`/parent/profile?_t=${timestamp}`);
    console.log("Profile data received:", response.data);

    // Trả về dữ liệu người dùng từ mảng data
    if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
      return response.data.data[0]; // Lấy phần tử đầu tiên từ mảng data
    }

    return response.data;
  } catch (error) {
    console.error("Get profile error:", error.response || error);
    return rejectWithValue(error.response?.data?.message || "Failed to fetch profile");
  }
});

export const updateParentProfile = createAsyncThunk(
  "parent/updateProfile",
  async ({ profileData, token }, { rejectWithValue }) => {
    try {
      console.log("Sending profile update with data:", profileData);
      console.log("To endpoint: /parent/profile");

      const response = await api.patch("/parent/profile", {
        profileData,
        token,
      });

      console.log("Update response:", response);
      return response.data;
    } catch (error) {
      console.error("Update profile error:", error);

      if (error.response) {
        // Lỗi từ server (status code không phải 2xx)
        console.error("Server error status:", error.response.status);
        console.error("Server error data:", error.response.data);
        return rejectWithValue(error.response.data?.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        // Không nhận được response từ server
        console.error("No response received:", error.request);
        return rejectWithValue("Không nhận được phản hồi từ máy chủ");
      } else {
        // Lỗi khi thiết lập request
        console.error("Request setup error:", error.message);
        return rejectWithValue(`Lỗi kết nối: ${error.message}`);
      }
    }
  }
);

// Health Checkups
export const getApprovedCheckups = createAsyncThunk("parent/getApprovedCheckups", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/parent/checkups/approved");
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch approved checkups");
  }
});

export const getApprovedConsents = createAsyncThunk("parent/getApprovedConsents", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/parent/consents-checkups/approved");
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch approved consents");
  }
});

export const getCheckupDetails = createAsyncThunk("parent/getCheckupDetails", async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/parent/consents-checkups/${id}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch checkup details");
  }
});

export const getPendingConsents = createAsyncThunk("parent/getPendingConsents", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/parent/consents-checkups/pending");
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch pending consents");
  }
});

export const respondToConsentForm = createAsyncThunk(
  "parent/respondToConsentForm",
  async ({ form_id, response, notes }, { rejectWithValue, dispatch }) => {
    try {
      const apiResponse = await api.post(`/parent/consents-checkups/${form_id}/respond`, { response, notes });

      // Sau khi phản hồi thành công, cập nhật danh sách
      dispatch(getApprovedConsents());
      dispatch(getPendingConsents());

      return apiResponse.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to respond to consent form");
    }
  }
);

export const updateConsentStatus = createAsyncThunk(
  "parent/updateConsentStatus",
  async ({ checkup_id, status, notes }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.patch(`/parent/checkups/${checkup_id}/consent`, { status, notes });

      // Sau khi cập nhật thành công, cập nhật danh sách
      dispatch(getApprovedConsents());
      dispatch(getPendingConsents());

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update consent status");
    }
  }
);

// Health Declarations
export const getHealthDeclaration = createAsyncThunk(
  "parent/getHealthDeclaration",
  async (student_id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/parent/students/${student_id}/health-declaration`);
      return { student_id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch health declaration");
    }
  }
);

export const updateHealthDeclaration = createAsyncThunk(
  "parent/updateHealthDeclaration",
  async ({ studentId, declarationData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/parent/students/${studentId}/health-declaration`, declarationData);
      return { studentId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update health declaration");
    }
  }
);

// Medical Incidents
export const getParentIncidents = createAsyncThunk("parent/getIncidents", async (_, { rejectWithValue }) => {
  try {
    console.log("Fetching parent incidents with token");
    // The token is automatically added by the axios interceptor
    const response = await api.get("/parent/incidents");
    console.log("Incidents data received:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return rejectWithValue(error.response?.data?.message || "Failed to fetch medical incidents");
  }
});

export const getIncidentDetails = createAsyncThunk(
  "parent/getIncidentDetails",
  async (incidentId, { rejectWithValue }) => {
    try {
      console.log(`Fetching incident details for ID: ${incidentId}`);

      // Extract numeric ID if it's an object
      const id = typeof incidentId === "object" ? incidentId.id : incidentId;

      // Make sure we're using the correct endpoint format without trailing slash
      // The token is automatically added by the axios interceptor
      const response = await api.get(`/parent/incidents/${id}`);

      console.log("Incident details API response:", response);
      console.log("Incident details data:", response.data);

      // Return the data in the expected format
      if (response.data && typeof response.data === "object") {
        // If response.data is an object with a data property, return that
        if (response.data.data) {
          return response.data.data;
        }
        // Otherwise return the whole response.data object
        return response.data;
      }

      // If response.data is not an object, wrap it
      return { data: response.data };
    } catch (error) {
      console.error("Error fetching incident details:", error);
      console.error("Error response:", error.response);
      console.error("Error request:", error.request);
      console.error("Error config:", error.config);

      // Return a more detailed error message
      return rejectWithValue({
        message: error.response?.data?.message || "Failed to fetch incident details",
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method,
      });
    }
  }
);

// Medical Submissions
export const submitMedicationRequest = createAsyncThunk(
  "parent/submitMedicationRequest",
  async (requestData, { rejectWithValue }) => {
    try {
      // Dựa trên schema đã cung cấp
      const MedicalSubmissionRequestSchema = {
        parent_id: { type: "int", required: true },
        student_id: { type: "int", required: true },
        status: {
          type: "string",
          required: true,
          enum: ["OPEN", "IN_PROGRESS", "RESOLVED"],
          default: "PENDING",
        },
        nurse_id: { type: "int", required: true },
        note: { type: "string", required: false },
        image_url: { type: "string", required: false },
        start_date: { type: "date", required: true },
        end_date: { type: "date", required: true },
      };

      // Luôn đảm bảo nurse_id có giá trị mặc định là 3
      const dataWithDefaults = {
        ...requestData,
        nurse_id: 3, // Luôn gán nurse_id mặc định là 3
        status: requestData.status || "PENDING",
      };

      // Kiểm tra các trường bắt buộc theo schema
      const requiredFields = Object.keys(MedicalSubmissionRequestSchema).filter(
        (key) => MedicalSubmissionRequestSchema[key].required
      );

      const missingFields = requiredFields.filter((field) => !dataWithDefaults[field]);

      if (missingFields.length > 0) {
        console.error("Missing required fields:", missingFields);
        return rejectWithValue({
          message: `Missing required fields: ${missingFields.join(", ")}`,
          errors: missingFields.map((field) => `Missing field: ${field}`),
        });
      }

      // Đảm bảo tất cả các trường không bắt buộc có giá trị mặc định
      const sanitizedData = {
        ...dataWithDefaults,
        note: dataWithDefaults.note || "",
        image_url: dataWithDefaults.image_url || "",
        medication_name:
          dataWithDefaults.medication_name || (dataWithDefaults.note ? dataWithDefaults.note.split("\n")[0] : "Thuốc"),
        dosage: dataWithDefaults.dosage || "",
        frequency: dataWithDefaults.frequency || "",
      };

      console.log("Submitting medication request with data:", sanitizedData);

      const response = await api.post("/parent/medical-submissions", sanitizedData);

      console.log("Medication request response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error submitting medication request:", error);

      // Check for validation errors in the response
      if (error.response?.data?.errors) {
        return rejectWithValue({
          message: "Validation failed",
          errors: error.response.data.errors,
        });
      }

      return rejectWithValue(error.response?.data?.message || "Failed to submit medication request");
    }
  }
);

export const getMedicationRequestDetail = createAsyncThunk(
  "parent/getMedicationRequests",
  async (id_req, { rejectWithValue }) => {
    try {
      // Don't make API call if studentId is undefined or null

      const response = await api.get(`/parent/medical-submissions/${id_req}`);
      console.log("Medication requests response:", response.data.data);

      // Trả về đối tượng chi tiết, giả sử nó nằm trong response.data
      // Hoặc response.data.data nếu API trả về cấu trúc đó
      return response.data.data[0];
    } catch (error) {
      // Return empty array instead of rejecting to prevent UI errors
      return rejectWithValue(error.message);
    }
  }
);

export const getAllMedicationRequest = createAsyncThunk(
  "parent/getAllMedicationRequest",
  async (accessToken, { rejectWithValue }) => {
    console.log(accessToken);

    // Thêm accessToken làm tham số đầu tiên
    try {
      // Đảm bảo rằng API của bạn sử dụng accessToken để xác thực
      // Ví dụ: thêm nó vào header Authorization
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const response = await api.get("/parent/medical-submissions", config);
      console.log(response.data.data);
      // Điều chỉnh endpoint và truyền config
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch medication requests");
    }
  }
);

// Vaccinations
export const getVaccineCampaigns = createAsyncThunk("parent/getVaccineCampaigns", async (_, { rejectWithValue }) => {
  try {
    // Skip API call if student_id is undefined or null
    const response = await api.get("/parent/vaccine-campaigns");
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching vaccine campaigns:", error);
    // Return empty array instead of rejecting to prevent UI errors
    return [];
  }
});

export const getVaccineCampaignDetails = createAsyncThunk(
  "parent/getVaccineCampaignDetails",
  async (id, { rejectWithValue }) => {
    try {
      // Don't make API call if id is undefined or null
      if (!id) {
        console.log("Skipping getVaccineCampaignDetails - No ID provided");
        return null;
      }

      console.log(`Fetching campaign details for ID ${id}...`);
      const response = await api.get(`/parent/vaccine-campaign/${id}`);
      console.log("Campaign details response:", response);
      return response.data?.data || response.data;
    } catch (error) {
      console.error(`Error fetching campaign details for ID ${id}:`, error);
      // Return null instead of rejecting to prevent UI errors
      return null;
    }
  }
);

export const getApprovedCampaigns = createAsyncThunk("parent/getApprovedCampaigns", async (_, { rejectWithValue }) => {
  try {
    console.log("Fetching approved campaigns...");
    const response = await api.get("/parent/vaccine-campaign-approved");
    console.log("Approved campaigns response:", response);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching approved campaigns:", error);
    // Return empty array instead of rejecting to prevent UI errors
    return [];
  }
});

export const getDeclinedCampaigns = createAsyncThunk("parent/getDeclinedCampaigns", async (_, { rejectWithValue }) => {
  try {
    console.log("Fetching declined campaigns...");
    const response = await api.get("/parent/vaccine-campaign-declined");
    console.log("Declined campaigns response:", response);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching declined campaigns:", error);
    // Return empty array instead of rejecting to prevent UI errors
    return [];
  }
});

export const getStudentVaccinations = createAsyncThunk(
  "parent/getStudentVaccinations",
  async (studentId = null, { rejectWithValue }) => {
    try {
      // Don't make API call if studentId is undefined or null
      if (!studentId) {
        console.log("Skipping getStudentVaccinations - No student ID provided");
        return { studentId: null, vaccinations: [] };
      }

      console.log(`Fetching vaccinations for student ${studentId}...`);
      const response = await api.get(`/parent/vaccine-campaign/${studentId}`);
      console.log("Student vaccinations response:", response);
      return {
        studentId,
        vaccinations: response.data?.data || response.data || [],
      };
    } catch (error) {
      console.error(`Error fetching vaccinations for student ${studentId}:`, error);
      // Return empty results instead of rejecting to prevent UI errors
      return { studentId, vaccinations: [] };
    }
  }
);

export const respondToVaccinationConsent = createAsyncThunk(
  "parent/respondToVaccinationConsent",
  async ({ notificationId, studentId, campaignId, consent }, { rejectWithValue }) => {
    try {
      // Validate required parameters
      if (!campaignId) {
        return rejectWithValue("Campaign ID is required");
      }

      const response = await api.post(`/parent/vaccine-campaigns/${campaignId}/respond`, {
        notification_id: notificationId,
        student_id: studentId,
        consent: consent,
      });
      return response.data;
    } catch (error) {
      console.error("Error responding to vaccination consent:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to submit vaccination consent");
    }
  }
);

export const updateVaccinationResponse = createAsyncThunk(
  "parent/updateVaccinationResponse",
  async ({ id, status, studentId }, { rejectWithValue, dispatch }) => {
    try {
      // Validate required parameters
      if (!id) {
        return rejectWithValue("Campaign ID is required");
      }

      const response = await api.patch(`/parent/vaccine-campaigns/${id}/status`, { status, studentId });

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
      console.error("Error updating vaccination response:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to update vaccination response");
    }
  }
);

// Notifications
export const getParentNotifications = createAsyncThunk("parent/getNotifications", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/parent/notifications");
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch notifications");
  }
});

export const markNotificationAsRead = createAsyncThunk(
  "parent/markNotificationAsRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/parent/notifications/${notificationId}/read`);
      return { notificationId, response: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark notification as read");
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "parent/markAllNotificationsAsRead",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.put("/parent/notifications/read-all");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark all notifications as read");
    }
  }
);

export const respondToCheckupConsent = createAsyncThunk(
  "parent/respondToCheckupConsent",
  async ({ notificationId, studentId, checkupId, consent }, { rejectWithValue }) => {
    try {
      const response = await api.post("/parent/checkups/consent", {
        notification_id: notificationId,
        student_id: studentId,
        checkup_id: checkupId,
        consent: consent,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to submit checkup consent");
    }
  }
);

// Thêm thunks cho lịch khám sức khỏe
export const requestCheckupAppointment = createAsyncThunk(
  "parent/requestCheckupAppointment",
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await api.post("/parent/checkups/request", appointmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to request appointment");
    }
  }
);

export const getCheckupHistory = createAsyncThunk(
  "parent/getCheckupHistory",
  async (student_id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/parent/students/${student_id}/checkup-history`);
      return { studentId: student_id, history: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch checkup history");
    }
  }
);

export const getCheckupAppointments = createAsyncThunk(
  "parent/getCheckupAppointments",
  async (student_id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/parent/students/${student_id}/appointments`);
      return { studentId: student_id, appointments: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch appointments");
    }
  }
);

// Create the slice
const parentSlice = createSlice({
  name: "parent",
  initialState,
  reducers: {
    resetParentState: (state) => {
      return initialState;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
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
    setLoading: (state, action) => {
      state.loading = action.payload;
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
        console.log("Profile updated in Redux:", action.payload);
      })
      .addCase(getParentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch profile";
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
            const existingIndex = state.checkups.approved.findIndex((c) => c.id === checkup.id);
            if (existingIndex === -1) {
              state.checkups.approved.push(checkup);
            } else {
              state.checkups.approved[existingIndex] = checkup;
            }

            // Xóa khỏi danh sách pending nếu có
            state.checkups.pending = state.checkups.pending.filter((c) => c.id !== checkup.id);
          } else if (checkup.status === "rejected") {
            // Xóa khỏi danh sách pending
            state.checkups.pending = state.checkups.pending.filter((c) => c.id !== checkup.id);
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
            const index = state.checkups[listName].findIndex((c) => c.id === checkup.id);
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
        state.healthDeclarations[action.payload.student_id] = action.payload.data;
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
        state.healthDeclarations[action.payload.studentId] = action.payload.data;
        state.success = true;
      })
      .addCase(updateHealthDeclaration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Medical Incidents
      .addCase(getParentIncidents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getParentIncidents.fulfilled, (state, action) => {
        state.loading = false;
        state.incidents = action.payload;
      })
      .addCase(getParentIncidents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Incident Details
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

      // Get Medication Requests
      .addCase(getMedicationRequestDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMedicationRequestDetail.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(getMedicationRequestDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
        if (action.payload.studentId) {
          state.vaccinations.studentVaccinations[action.payload.studentId] = action.payload.vaccinations;
        } else {
          // When studentId is null, just store the vaccinations in the campaigns array
          state.vaccinations.campaigns = action.payload.vaccinations;
        }
      })
      .addCase(getStudentVaccinations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
      })

      // Mark notification as read
      .addCase(markNotificationAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.loading = false;

        // Update the notification in the state
        const notificationId = action.payload.notificationId;

        // Handle case where notifications has a structure like {items: [...]}
        if (state.notifications && state.notifications.items) {
          const index = state.notifications.items.findIndex((notification) => notification.id === notificationId);
          if (index !== -1) {
            state.notifications.items[index].isRead = true;
          }
        } else if (Array.isArray(state.notifications)) {
          const index = state.notifications.findIndex((notification) => notification.id === notificationId);
          if (index !== -1) {
            state.notifications[index].isRead = true;
          }
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Mark all notifications as read
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.loading = false;

        // Update all notifications in the state
        if (state.notifications && state.notifications.items) {
          state.notifications.items.forEach((notification) => {
            notification.isRead = true;
          });
        } else if (Array.isArray(state.notifications)) {
          state.notifications.forEach((notification) => {
            notification.isRead = true;
          });
        }
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Vaccination consent response
      .addCase(respondToVaccinationConsent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(respondToVaccinationConsent.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(respondToVaccinationConsent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Checkup consent response
      .addCase(respondToCheckupConsent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(respondToCheckupConsent.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(respondToCheckupConsent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Get Medication Requests ---
      .addCase(getAllMedicationRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllMedicationRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.medicationRequests = action.payload; // Update the state with the fetched data
      })
      .addCase(getAllMedicationRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  resetParentState,
  setProfile,
  clearParentErrors,
  clearParentSuccess,
  setSelectedChild,
  setSelectedIncident,
  setSelectedCheckup,
  setLoading,
} = parentSlice.actions;

// Thêm action creator để cập nhật profile trực tiếp
export const updateProfileDirect = (profileData) => (dispatch) => {
  dispatch(setProfile(profileData));
};

export default parentSlice.reducer;
