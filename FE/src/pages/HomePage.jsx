import React, { useEffect } from "react";
import { Header } from "../Components/Header";
import { AboutSection } from "../Components/AboutSection";
import { DocumentsSection } from "../Components/DocumentSection";
import { BlogSection } from "../Components/BlogSection";
import { Footer } from "../Components/Footer";
import { useLocation } from "react-router-dom";
import { BackToTopButton } from "../Components/BackToTop";
import SupportSection from "../Components/SupportSection";

export default function HomePage() {
  const location = useLocation(); // Khởi tạo useLocation

  useEffect(() => {
    // Kiểm tra xem có hash trong URL không
    if (location.hash) {
      // Lấy id từ hash (bỏ dấu '#')
      const id = location.hash.substring(1);
      const element = document.getElementById(id);

      if (element) {
        // Cuộn mượt đến phần tử
        requestAnimationFrame(() => {
          // Sử dụng requestAnimationFrame để đảm bảo DOM đã sẵn sàng
          element.scrollIntoView({ behavior: "smooth" });
        });
      }
    }
  }, [location.hash]); // Chạy lại hiệu ứng khi hash trong URL thay đổi
  return (
    <div className="min-h-screen bg-white">
      <Header></Header>
      <AboutSection></AboutSection>
      <DocumentsSection />
      <SupportSection />
      <BlogSection />
      <Footer />
      <BackToTopButton />
    </div>
  );
}
