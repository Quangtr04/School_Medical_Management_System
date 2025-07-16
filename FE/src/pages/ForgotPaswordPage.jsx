import { useState, useEffect } from "react";
import { Mail, Heart, ArrowLeft } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux"; // Import Redux hooks
import {
  sendOtp,
  clearAuthSuccess,
  clearAuthError,
} from "../redux/auth/authSlice";

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.auth); // Assuming 'auth' is the slice name in your store

  const [input, setInput] = useState("");
  const [localError, setLocalError] = useState(""); // Use a local error for client-side validation

  // Client-side input validation
  const validateInput = (value) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

    if (!value) return "This field is required";
    if (value.length > 50) return "Maximum 50 characters allowed";
    if (!emailRegex.test(value) && !phoneRegex.test(value)) {
      return "Please enter a valid email or phone number";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateInput(input);
    if (validationError) {
      setLocalError(validationError); // Set local validation error
      return;
    }

    // Clear any previous Redux error before dispatching
    dispatch(clearAuthError());

    // Dispatch the Redux thunk
    dispatch(sendOtp({ username: input })); // 'identifier' could be 'email' or 'phone' based on your API
  };

  // Effect to handle Redux errors and success messages
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthError()); // Clear the error after displaying
    }
    if (success) {
      toast.success("OTP sent successfully!");
      dispatch(clearAuthSuccess()); // Clear the success state after displaying
      setLocalError(""); // Clear any local validation errors on success
      // Optionally clear input here or redirect
      // setInput('');
    }
  }, [error, success, dispatch]);

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <Heart className="text-blue-600 w-12 h-12 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back!</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhập Email hoặc số điện thoại
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setLocalError(""); // Clear local error on input change
                  dispatch(clearAuthError()); // Also clear Redux error on input change
                }}
                className={`block w-full pl-10 pr-3 py-3 border ${
                  localError || error ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                placeholder="Nhập Email hoặc số điện thoại để tạo mật khẩu mới"
                maxLength={50}
              />
            </div>
            {localError && (
              <p className="mt-2 text-sm text-red-600">{localError}</p>
            )}
            {/* Redux error will be shown via toast, but if you want it here as well: */}
            {/* {error && !localError && <p className="mt-2 text-sm text-red-600">{error}</p>} */}
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
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/login"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
