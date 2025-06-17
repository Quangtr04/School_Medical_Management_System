import React, { useEffect } from "react";
import { Header } from "../User-HomePage-components/Header";
import { AboutSection } from "../User-HomePage-components/AboutSection";
import { DocumentsSection } from "../User-HomePage-components/DocumentSection";
import { BlogSection } from "../User-HomePage-components/BlogSection";
import { Footer } from "../User-HomePage-components/Footer";
import { useLocation } from "react-router-dom";
import { BackToTopButton } from "../User-HomePage-components/BackToTop";
import SupportSection from "../User-HomePage-components/SupportSection";

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
