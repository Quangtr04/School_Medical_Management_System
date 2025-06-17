// src/components/BackToTopButton.jsx
import React, { useState, useEffect } from "react";
import { ChevronUpIcon } from "lucide-react"; // Hoặc icon bạn muốn

export function BackToTopButton({ location }) {
  const [isVisible, setIsVisible] = useState(false);

  // Hiển thị nút khi cuộn xuống một khoảng nhất định
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      // Hiển thị nút khi cuộn xuống hơn 300px
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Cuộn về đầu trang
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Cuộn mượt
    });
    setTimeout(() => {
      // Lấy hostname và port từ URL hiện tại
      const origin = window.location.origin; // Ví dụ: "http://localhost:5173"

      // Tạo một URL mới chỉ với origin
      const newUrl = origin;

      // Thay đổi URL trong thanh địa chỉ mà không tải lại trang
      window.history.replaceState({}, document.title, newUrl);
    }, 1000);
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {" "}
      {/* Vị trí cố định ở góc dưới bên phải */}
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-opacity duration-300 ease-in-out"
          aria-label="Back to top"
        >
          <ChevronUpIcon size={24} /> {/* Icon mũi tên lên */}
        </button>
      )}
    </div>
  );
}
