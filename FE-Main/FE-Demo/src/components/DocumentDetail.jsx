import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  DownloadIcon,
  ChevronLeftIcon,
  Share2Icon,
  BookmarkIcon,
  FileTextIcon,
  HeartPulseIcon,
  ClipboardListIcon,
  SyringeIcon,
} from "lucide-react";
import documentCategories from "../data/documentCatagories";
import DOMPurify from "dompurify";
import { marked } from "marked";

function DocumentDetail() {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [relatedDocuments, setRelatedDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    let foundDoc = null;
    let currentCategoryDocuments = [];

    for (const category of documentCategories) {
      const doc = category.documents.find((d) => d.id === id);
      if (doc) {
        foundDoc = doc;
        currentCategoryDocuments = category.documents.filter(
          (d) => d.id !== id
        );
        break;
      }
    }

    if (foundDoc) {
      setDocument(foundDoc);
      setRelatedDocuments(currentCategoryDocuments.slice(0, 3)); // Lấy 3 tài liệu liên quan
    } else {
      setError("Không tìm thấy tài liệu này.");
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-xl text-gray-700">Đang tải tài liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <p className="text-xl text-red-600 mb-4">{error}</p>
        <Link
          to="/documents"
          className="text-blue-600 hover:underline flex items-center"
        >
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          Quay lại danh sách tài liệu
        </Link>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <p className="text-xl text-red-600 mb-4">
          Đã xảy ra lỗi không xác định hoặc tài liệu không tồn tại.
        </p>
        <Link
          to="/documents"
          className="text-blue-600 hover:underline flex items-center"
        >
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          Quay lại danh sách tài liệu
        </Link>
      </div>
    );
  }

  const rawMarkup = marked.parse(document.content || "");
  const sanitizedContent = DOMPurify.sanitize(rawMarkup);
  console.log(rawMarkup);

  console.log(sanitizedContent);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cột trái: Nội dung tài liệu chính */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-lg p-8">
          {/* Nút quay lại */}
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 text-base font-medium mb-6"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-2" />
            Quay lại tài liệu
          </Link>

          {/* Header tài liệu */}
          <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4">
            <span className="flex items-center mr-4 mb-2 md:mb-0">
              <FileTextIcon className="h-4 w-4 mr-1" />
              Cập nhật: {document.datePublished}
            </span>
            <span className="mr-4 mb-2 md:mb-0">
              • Kích thước: {document.size}
            </span>
            <span className="mr-4 mb-2 md:mb-0">
              • {document.views || 0} lượt xem
            </span>{" "}
            {/* Sử dụng document.views nếu có */}
            <span className="mr-4 mb-2 md:mb-0">
              • {document.downloads || 0} lượt tải
            </span>{" "}
            {/* Sử dụng document.downloads nếu có */}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {document.name}
          </h1>

          {/* Các nút hành động */}
          <div className="flex flex-wrap items-center space-x-2 sm:space-x-4 mb-8">
            <a
              href={document.filePath || "#"}
              download
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md text-sm sm:text-base mb-2 sm:mb-0"
            >
              <DownloadIcon className="h-5 w-5 mr-2" />
              Tải xuống PDF
            </a>
            <button className="inline-flex items-center text-gray-700 bg-gray-100 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm sm:text-base mb-2 sm:mb-0">
              <Share2Icon className="h-5 w-5 mr-2" />
              Chia sẻ
            </button>
            <button className="inline-flex items-center text-gray-700 bg-gray-100 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm sm:text-base mb-2 sm:mb-0">
              <BookmarkIcon className="h-5 w-5 mr-2" />
              Lưu tài liệu
            </button>
          </div>

          {/* Nội dung chính của tài liệu */}
          {document.content ? (
            <div
              className="prose max-w-none leading-loose text-gray-1000" // leading-loose sẽ đặt line-height ~2.0
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          ) : (
            <p className="text-gray-600">
              Nội dung chi tiết của tài liệu này đang được cập nhật.
            </p>
          )}
        </div>

        {/* Cột phải: Thông tin tài liệu và tài liệu liên quan */}
        <div className="md:col-span-1 space-y-8">
          {/* Thông tin tài liệu */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Thông tin tài liệu
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex justify-between items-baseline">
                {" "}
                {/* Sử dụng flex để căn chỉnh */}
                <span className="font-medium mr-2 whitespace-nowrap">
                  Tác giả:
                </span>{" "}
                <span className="text-right truncate">
                  {document.author || "Đang cập nhật"}
                </span>{" "}
                {/* Truncate nếu quá dài */}
              </li>
              <li className="flex justify-between items-baseline">
                <span className="font-medium mr-2 whitespace-nowrap">
                  Chuyên khoa:
                </span>{" "}
                <span className="text-right truncate">
                  {document.topic || "Đang cập nhật"}
                </span>
              </li>
              <li className="flex justify-between items-baseline">
                <span className="font-medium mr-2 whitespace-nowrap">
                  Ngày xuất bản:
                </span>{" "}
                <span className="text-right truncate">
                  {document.datePublished || "Đang cập nhật"}
                </span>
              </li>
              <li className="flex justify-between items-baseline">
                <span className="font-medium mr-2 whitespace-nowrap">
                  Phiên bản:
                </span>{" "}
                <span className="text-right truncate">
                  {document.pageCount ? `${document.pageCount} (trang)` : "N/A"}
                </span>
              </li>
              <li className="flex justify-between items-baseline">
                <span className="font-medium mr-2 whitespace-nowrap">
                  Định dạng:
                </span>{" "}
                <span className="text-right truncate">
                  {document.fileType || "Đang cập nhật"}
                </span>
              </li>
              <li className="flex justify-between items-baseline">
                <span className="font-medium mr-2 whitespace-nowrap">
                  Ngôn ngữ:
                </span>{" "}
                <span className="text-right truncate">
                  {document.language || "Đang cập nhật"}
                </span>
              </li>
            </ul>
          </div>

          {/* Tài liệu liên quan */}
          {relatedDocuments.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Tài liệu liên quan
              </h3>
              <div className="space-y-4">
                {relatedDocuments.map((relatedDoc) => {
                  const relatedCategory = documentCategories.find((cat) =>
                    cat.documents.some((d) => d.id === relatedDoc.id)
                  );
                  const iconMap = {
                    "cat-1": HeartPulseIcon,
                    "cat-2": ClipboardListIcon,
                    "cat-3": SyringeIcon,
                  };
                  const IconComponent = relatedCategory?.id
                    ? iconMap[relatedCategory.id]
                    : FileTextIcon;
                  const categoryColorClass = relatedCategory
                    ? relatedCategory.color
                    : "text-gray-500";

                  return (
                    <Link
                      key={relatedDoc.id}
                      to={`/documents/${relatedDoc.id}`}
                      className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center mb-1">
                        <div className={`mr-2 ${categoryColorClass}`}>
                          <IconComponent className="h-5 w-5 flex-shrink-0" />{" "}
                          {/* flex-shrink-0 để icon không bị co */}
                        </div>
                        <h4 className="font-medium text-gray-900 line-clamp-1 break-all">
                          {" "}
                          {/* line-clamp-1 và break-all */}
                          {relatedDoc.name}
                        </h4>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 space-x-2">
                        <span>{relatedDoc.size}</span>
                        <span className="mx-1">•</span>
                        <span>{relatedDoc.downloads} lượt tải</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-6 text-center">
                <Link
                  to="/"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Xem tất cả tài liệu
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DocumentDetail;
