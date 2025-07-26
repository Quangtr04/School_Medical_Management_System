import { BookOpenIcon, PhoneCall } from "lucide-react";
import React from "react";

export default function SupportSection() {

  return (
    <section id="supoort-section" className="px-20 bg-gray-50">
      <div className=" bg-blue-600 rounded-2xl p-8 text-white text-center">
        <BookOpenIcon className="h-24 w-24 mx-auto mb-4 text-white-900" />
        <h3 className="text-2xl font-bold mb-4" style={{ fontWeight: 600 }}>Cần hỗ trợ thêm?</h3>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
          Nếu bạn không tìm thấy tài liệu cần thiết hoặc cần hỗ trợ thêm, vui
          lòng liên hệ với phòng y tế nhà trường thông qua số điện thoại:
        </p>
        <div className="flex items-center justify-center gap-2 text-lg font-bold text-yellow-300 mb-4">
          <PhoneCall className="w-6 h-6" />
          Hotline: 1900 1234
        </div>
      </div>
    </section>
  );
}
