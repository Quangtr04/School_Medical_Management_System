import { MenuIcon, XIcon, HeartIcon } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link và useNavigate
import { AboutSection } from "./AboutSection";
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate(); // Khởi tạo hook useNavigate

  // Hàm xử lý đóng menu mobile sau khi nhấp vào liên kết
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  // Hàm xử lý điều hướng cho nút Đăng nhập
  const handleLoginClick = () => {
    navigate("/login"); // Điều hướng đến trang đăng nhập
    setIsMenuOpen(false); // Đóng menu mobile sau khi điều hướng
  };

  // Hàm xử lý điều hướng cho nút Đăng ký
  const handleRegisterClick = () => {
    navigate("/register"); // Điều hướng đến trang đăng ký
    setIsMenuOpen(false); // Đóng menu mobile sau khi điều hướng
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Sử dụng Link để điều hướng về trang chủ */}
          <Link to="/" className="flex items-center" onClick={handleLinkClick}>
            <HeartIcon className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              SchoolHealth
            </span>
          </Link>

          {/* Login Buttons (Desktop) */}
          <div className="hidden md:flex items-center md:gap-4">
            <button
              onClick={handleLoginClick}
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
            >
              Đăng nhập
            </button>
            <button
              onClick={handleRegisterClick}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Đăng ký
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600"
              aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"} // Cải thiện accessibility
            >
              {isMenuOpen ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link
                to="/"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                onClick={handleLinkClick}
              >
                Trang chủ
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                onClick={handleLinkClick}
              >
                Giới thiệu
              </Link>
              <Link
                to="/documents"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                onClick={handleLinkClick}
              >
                Tài liệu
              </Link>
              <Link
                to="/blog"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                onClick={handleLinkClick}
              >
                Blog
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                onClick={handleLinkClick}
              >
                Liên hệ
              </Link>

              <div className="hidden md:flex items-center md:gap-4">
                <button
                  onClick={handleLoginClick}
                  className="text-gray-700 hover:text-blue-600 text-sm font-medium"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={handleRegisterClick}
                  // ĐÃ CHỈNH SỬA: Đổi rounded-md thành rounded-full, thêm flex để căn giữa chính xác
                  className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-700 flex items-center justify-center"
                >
                  Đăng ký
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
