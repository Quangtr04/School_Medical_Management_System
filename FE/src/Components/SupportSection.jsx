import { BookOpenIcon } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

export default function SupportSection() {
  const navigate = useNavigate();
  const handleSupport = () => {
    navigate("/support");
  };
  return (
    <section id="supoort-section" className="px-20 bg-gray-50">
      <div className=" bg-blue-600 rounded-2xl p-8 text-white text-center">
        <BookOpenIcon className="h-16 w-16 mx-auto mb-4 text-blue-200" />
        <h3 className="text-2xl font-bold mb-4">Cần hỗ trợ thêm?</h3>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
          Nếu bạn không tìm thấy tài liệu cần thiết hoặc cần hỗ trợ thêm, vui
          lòng liên hệ với phòng y tế nhà trường
        </p>
        <button
          onClick={handleSupport}
          className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
        >
          Liên hệ phòng y tế
        </button>
      </div>
    </section>
  );
}
