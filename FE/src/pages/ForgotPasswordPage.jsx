import { useState, useEffect, useCallback } from "react";
import { Mail, Heart, ArrowLeft, AlertCircle, Phone } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  sendOtp,
  clearAuthSuccess,
  clearAuthError,
} from "../redux/auth/authSlice";
import { NavLink } from "react-router-dom";

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, success } = useSelector((state) => state.auth);

  const [identifier, setIdentifier] = useState("");
  const [localError, setLocalError] = useState("");
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [identifierType, setIdentifierType] = useState("email"); // "email" hoặc "phone"

  // Client-side input validation
  const validateInput = (value, type) => {
    // Email regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Phone regex cho số điện thoại Việt Nam
    const phoneRegex = /^0(3|5|7|8|9)\d{8}$/;

    if (!value) return "Thông tin không được để trống";

    if (type === "email") {
      if (value.length > 50) return "Email không được vượt quá 50 ký tự";
      if (!emailRegex.test(value)) {
        return "Định dạng email không hợp lệ";
      }
    } else if (type === "phone") {
      if (!phoneRegex.test(value)) {
        return "Định dạng số điện thoại không hợp lệ";
      }
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trim the input to remove any whitespace
    const trimmedIdentifier = identifier.trim();

    const validationError = validateInput(trimmedIdentifier, identifierType);
    if (validationError) {
      setLocalError(validationError);
      setShowErrorAlert(true);
      return;
    }

    // Clear any previous Redux error before dispatching
    dispatch(clearAuthError());
    setShowErrorAlert(false);

    // Dispatch the Redux thunk with identifier
    console.log(`Sending forgot password request with ${identifierType}:`, {
      [identifierType]: trimmedIdentifier,
    });
    dispatch(sendOtp({ identifier: trimmedIdentifier, type: identifierType }));
  };

  // Handle navigation on success - using useCallback to avoid dependency array issues
  const handleSuccess = useCallback(() => {
    if (success) {
      toast.success(
        "Yêu cầu đã được gửi thành công! Vui lòng nhập mật khẩu mới."
      );
      dispatch(clearAuthSuccess());
      setLocalError("");
      setIdentifier("");

      // Redirect to reset password page
      setTimeout(() => {
        // Store the identifier in localStorage to pass it to the reset password page
        localStorage.setItem("resetIdentifier", identifier);
        localStorage.setItem("resetIdentifierType", identifierType);
        navigate("/reset-password");
      }, 1500);
    }
  }, [success, dispatch, navigate, identifier, identifierType]);

  // Handle error display
  const handleError = useCallback(() => {
    if (error) {
      toast.error(error);
      setShowErrorAlert(true);
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  // Effect to handle Redux errors and success messages
  useEffect(() => {
    handleError();
    handleSuccess();
  }, [handleError, handleSuccess]);

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <Heart className="text-blue-600 w-12 h-12 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 text-center">
            Quên mật khẩu
          </h1>
          <p className="text-gray-600 text-center mt-2">
            Nhập email hoặc số điện thoại của bạn để tiến hành khôi phục mật
            khẩu
          </p>
        </div>

        {showErrorAlert && (localError || error) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-600">
                {localError || "Không tìm thấy tài khoản với thông tin này"}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Phương thức xác thực
              </label>
            </div>

            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => setIdentifierType("email")}
                className={`flex-1 py-2 px-4 rounded-lg border ${
                  identifierType === "email"
                    ? "bg-blue-100 border-blue-500 text-blue-700"
                    : "bg-white border-gray-300 text-gray-700"
                } transition-colors`}
              >
                <div className="flex items-center justify-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>Email</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIdentifierType("phone")}
                className={`flex-1 py-2 px-4 rounded-lg border ${
                  identifierType === "phone"
                    ? "bg-blue-100 border-blue-500 text-blue-700"
                    : "bg-white border-gray-300 text-gray-700"
                } transition-colors`}
              >
                <div className="flex items-center justify-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>Điện thoại</span>
                </div>
              </button>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              {identifierType === "email" ? "Địa chỉ Email" : "Số điện thoại"}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {identifierType === "email" ? (
                  <Mail className="h-5 w-5 text-gray-400" />
                ) : (
                  <Phone className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <input
                type={identifierType === "email" ? "email" : "tel"}
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setLocalError("");
                  setShowErrorAlert(false);
                  dispatch(clearAuthError());
                }}
                className={`block w-full pl-10 pr-3 py-3 border ${
                  showErrorAlert && (localError || error)
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                placeholder={
                  identifierType === "email"
                    ? "example@email.com"
                    : "0912345678"
                }
                maxLength={50}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
          >
            {loading ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <NavLink
            to="/login"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại đăng nhập
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
