/* eslint-disable no-unused-vars */
import React from "react";
import {
  FileTextIcon,
  DownloadIcon,
  BookOpenIcon,
  // Không cần import các icon category ở đây nếu chúng được truyền qua documentCategories
  // HeartPulseIcon, ClipboardListIcon, SyringeIcon,
} from "lucide-react";
import documentCategories from "../data/documentCatagories"; // Đảm bảo đường dẫn đúng
import { useNavigate } from "react-router-dom";

export function DocumentsSection() {
  const navigate = useNavigate();

  // Hàm xử lý khi bấm vào tên tài liệu để xem chi tiết
  const handleDocumentClick = (docId) => {
    navigate(`/documents/${docId}`); // Điều hướng đến route chi tiết tài liệu
  };

  const handleSupport = () => {
    navigate("/support");
  };
  return (
    <section id="documents-section" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tài liệu sức khỏe học đường
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tổng hợp các tài liệu, hướng dẫn và biểu mẫu cần thiết cho việc chăm
            sóc sức khỏe học sinh
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {documentCategories.map((category, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <div
                  className={`inline-flex p-3 rounded-lg ${category.color} mr-4`}
                >
                  {/* Render icon từ category.icon */}
                  <category.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {category.title}
                </h3>
              </div>
              <div className="space-y-4">
                {category.documents.map((doc, docIndex) => (
                  <div
                    key={docIndex}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <FileTextIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                        <div
                          className="cursor-pointer" // Thêm cursor-pointer để người dùng biết là có thể bấm
                          onClick={() => handleDocumentClick(doc.id)} // Gọi hàm điều hướng
                        >
                          <h4 className="font-medium text-gray-900 mb-1 hover:text-blue-600 transition-colors">
                            {doc.name}
                          </h4>
                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span>{doc.size}</span>
                            <span>•</span>
                            <span>{doc.downloads} lượt tải</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Additional Resources */}
      </div>
    </section>
  );
}
