import { useState, useEffect } from "react";
import { Lock, Heart, Eye, EyeOff, ArrowLeft, Mail, Phone } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  resetPassword,
  clearAuthSuccess,
  clearAuthError,
} from "../redux/auth/authSlice";
import { NavLink } from "react-router-dom";

const ResetPasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token: urlToken } = useParams();
  const { loading, error, success } = useSelector((state) => state.auth);

  const [token, setToken] = useState(urlToken || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  // Get identifier from localStorage
  const [identifier, setIdentifier] = useState("");
  const [identifierType, setIdentifierType] = useState("email");

  useEffect(() => {
    const savedIdentifier = localStorage.getItem("resetIdentifier");
    const savedIdentifierType = localStorage.getItem("resetIdentifierType");
    const savedUserId = localStorage.getItem("resetUserId");

    if (savedIdentifier) {
      setIdentifier(savedIdentifier);
    }

    if (savedIdentifierType) {
      setIdentifierType(savedIdentifierType);
    }

    // Nếu không có userId, điều hướng về trang quên mật khẩu
    if (!savedUserId && !urlToken) {
      toast.error("Vui lòng thực hiện lại quá trình quên mật khẩu");
      navigate("/forgot-password");
    }
  }, [navigate]);

  // Validate inputs
  const validateInputs = () => {
    if (!password) return "Mật khẩu không được để trống";
    if (password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
    if (password.length > 30) return "Mật khẩu không được vượt quá 30 ký tự";
    if (password !== confirmPassword) return "Mật khẩu xác nhận không khớp";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateInputs();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    dispatch(clearAuthError());

    dispatch(
      resetPassword({
        password,
        confirmPassword,
      })
    );
  };

  // Handle success and error
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
    }
    if (success) {
      toast.success("Mật khẩu đã được đặt lại thành công!");
      dispatch(clearAuthSuccess());

      // Clear localStorage items for reset password flow
      localStorage.removeItem("resetIdentifier");
      localStorage.removeItem("resetIdentifierType");
      localStorage.removeItem("resetUserId");

      // Redirect to login page after successful password reset
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    }
  }, [error, success, dispatch, navigate]);

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <Heart className="text-blue-600 w-12 h-12 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 text-center">
            Đặt lại mật khẩu
          </h1>
          <p className="text-gray-600 text-center mt-2">
            Nhập mật khẩu mới của bạn
          </p>
          {identifier && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg w-full">
              <div className="flex items-center">
                {identifierType === "email" ? (
                  <Mail className="h-5 w-5 text-blue-500 mr-2" />
                ) : (
                  <Phone className="h-5 w-5 text-blue-500 mr-2" />
                )}
                <p className="text-sm text-blue-700">
                  {identifierType === "email" ? "Email" : "Số điện thoại"}:{" "}
                  <strong>{identifier}</strong>
                </p>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu mới
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLocalError("");
                }}
                className={`block w-full pl-10 pr-10 py-3 border ${
                  localError ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                placeholder="Nhập mật khẩu mới"
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setLocalError("");
                }}
                className={`block w-full pl-10 pr-10 py-3 border ${
                  localError ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                placeholder="Nhập lại mật khẩu mới"
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
            {localError && (
              <p className="mt-2 text-sm text-red-600">{localError}</p>
            )}
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
            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
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

export default ResetPasswordPage;
