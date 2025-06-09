import { ClipboardListIcon, HeartPulseIcon, SyringeIcon } from "lucide-react";

const documentCategories = [
  {
    id: "cat-1",
    title: "Hướng dẫn sức khỏe",
    icon: HeartPulseIcon,
    color: "bg-red-100 text-red-600",
    documents: [
      {
        id: "doc-1-1",
        name: "Hướng dẫn dinh dưỡng cho trẻ em",
        size: "2.5 MB",
        downloads: "1,234",
        description: "Tài liệu cung cấp thông tin về chế độ ăn uống hợp lý cho trẻ em.",
        datePublished: "2024-01-05",
        author: "BS. Nguyễn Thị Lan",
        topic: "Dinh dưỡng Nhi",
        pageCount: 21,
        fileType: "PDF",
        language: "Tiếng Việt",
        content: `## Tổng quan
Dinh dưỡng đóng vai trò quan trọng trong sự phát triển toàn diện của trẻ em. Tài liệu này cung cấp hướng dẫn chi tiết về cách xây dựng chế độ ăn uống cân bằng, đảm bảo cung cấp đủ các chất dinh dưỡng cần thiết cho sự phát triển thể chất và trí tuệ của trẻ.

## Nội dung chính

#### 1. Nguyên tắc dinh dưỡng cơ bản
- Cân bằng các nhóm chất dinh dưỡng: protein, lipid, glucid, vitamin và khoáng chất.
- Bữa ăn hợp lý đảm bảo lượng phù hợp với độ tuổi và hoạt động của trẻ.
- Ưu tiên bữa ăn trong ngày: 3 bữa chính và 2-3 bữa phụ.
- Đủ nước, ưu tiên nước lọc và sữa, hạn chế nước ngọt có đường.

#### 2. Thực đơn mẫu theo độ tuổi
**Trẻ 6-12 tháng tuổi** 
Giai đoạn chuyển tiếp từ sữa mẹ sang thức ăn đặc. Bắt đầu với các loại bột, cháo loãng, rau củ nghiền mịn. Tăng dần độ đặc và đa dạng thực phẩm.

**Trẻ 1-3 tuổi** 
Có thể ăn đa dạng với đầy đủ các nhóm thực phẩm. Khuyến khích trẻ tự ăn, tạo thói quen ăn uống lành mạnh.

**Trẻ học đường (6-12 tuổi)** 
Tăng cường năng lượng để hỗ trợ hoạt động học tập. Chú ý bữa sáng đầy đủ, bữa trưa cân bằng và bữa tối nhẹ nhàng.

📌 **Lưu ý quan trọng:** 
Luôn tham khảo ý kiến bác sĩ dinh dưỡng hoặc nhi khoa khi có thắc mắc về chế độ ăn của trẻ. Một số trẻ cần điều chỉnh khẩu phần tùy thuộc vào tình trạng sức khỏe và phát triển.

#### 3. Các lỗi thường gặp
- Cho trẻ ăn quá nhiều đồ ngọt và thức ăn nhanh.
- Thiếu rau xanh và trái cây trong khẩu phần ăn.
- Ép trẻ ăn đồ trẻ không thích, ăn trong khi xem TV.
- Không đảm bảo vệ sinh an toàn thực phẩm.

#### 4. Dấu hiệu cần chú ý
Phụ huynh nên theo dõi và đưa trẻ đến cơ sở y tế khi xuất hiện các dấu hiệu:
- Trẻ biếng ăn kéo dài hoặc sụt cân
- Nôn ói, nóng, tiêu chảy kéo dài theo chế độ ăn
- Ngủ kém, chiều cao chậm tăng theo thời gian
- Rối loạn tiêu hóa, thiếu máu, chậm phát triển
- Nghi ngờ lão hóa hoặc trưởng thành sớm
`,
      },
      {
        id: "doc-1-2",
        name: "Chăm sóc sức khỏe mùa đông",
        size: "1.8 MB",
        downloads: "987",
        description: "Mẹo và hướng dẫn giữ ấm, phòng bệnh trong mùa lạnh.",
        datePublished: "2024-11-10",
        author: "BS. Trần Minh Anh",
        topic: "Chăm sóc mùa đông",
        pageCount: 15,
        fileType: "PDF",
        language: "Tiếng Việt",
        content: `
## Giới thiệu
Mùa đông là thời điểm dễ bùng phát các bệnh về đường hô hấp, đặc biệt ở trẻ nhỏ. Tài liệu này hướng dẫn cách chăm sóc trẻ đúng cách để phòng ngừa bệnh và giữ ấm hiệu quả.

### Nội dung chính

#### 1. Biện pháp giữ ấm hiệu quả
- Mặc đủ ấm, đội mũ, đeo khăn, đi tất khi ra ngoài.
- Tránh để trẻ thay đổi nhiệt độ đột ngột.
- Giữ nhiệt độ phòng ổn định, khoảng 25–28°C.

#### 2. Dinh dưỡng hỗ trợ đề kháng
- Tăng cường rau xanh, trái cây chứa vitamin C.
- Cho trẻ uống đủ nước, đặc biệt là nước ấm.

#### 3. Phòng ngừa bệnh hô hấp
- Hạn chế tiếp xúc nơi đông người, giữ khoảng cách.
- Đeo khẩu trang khi ra ngoài.
- Vệ sinh tay thường xuyên bằng xà phòng.

📌 **Lưu ý:** Theo dõi dấu hiệu cảm sốt, ho kéo dài. Đưa trẻ đi khám nếu tình trạng không cải thiện sau 2–3 ngày.
 `,
      },
      {
        id: "doc-1-3",
        name: "Phòng chống bệnh cúm mùa",
        size: "3.2 MB",
        downloads: "2,156",
        description: "Cách nhận biết, phòng tránh và điều trị cúm mùa.",
        datePublished: "2024-10-20",
        author: "BS. Lê Văn Hoàng",
        topic: "Bệnh truyền nhiễm",
        pageCount: 18,
        fileType: "PDF",
        language: "Tiếng Việt",
        content: `
## Nội dung

#### 1. Cúm mùa là gì?
- Là bệnh truyền nhiễm do virus cúm A, B gây ra.
- Lây truyền qua đường hô hấp.

#### 2. Triệu chứng điển hình
- Sốt, ho, sổ mũi, đau cơ, mệt mỏi.

#### 3. Cách phòng chống
- Tiêm vaccine cúm hằng năm.
- Đeo khẩu trang, rửa tay thường xuyên.
- Hạn chế tụ tập nơi đông người.

#### 4. Khi nào cần đi khám?
- Sốt cao kéo dài trên 3 ngày.
- Có bệnh nền hoặc triệu chứng nghiêm trọng.
 `,
      },
    ],
  },
  {
    id: "cat-2",
    title: "Biểu mẫu y tế",
    icon: ClipboardListIcon,
    color: "bg-blue-100 text-blue-600",
    documents: [
      {
        id: "doc-2-1",
        name: "Phiếu khai báo tình trạng sức khỏe",
        size: "1.2 MB",
        downloads: "3,456",
        description: "Biểu mẫu khai báo tình trạng sức khỏe học sinh.",
        datePublished: "2024-03-15",
        author: "Trung tâm Y tế Huyện",
        topic: "Khai báo y tế",
        pageCount: 7,
        fileType: "PDF",
        language: "Tiếng Việt",
        content: `
### Các mục cần khai báo

- Họ tên học sinh, lớp
- Triệu chứng (sốt, ho, mệt mỏi...)
- Lịch sử tiếp xúc F0
- Tình trạng tiêm vaccine

📌 Cần nộp mẫu hằng ngày trước khi đến lớp trong mùa dịch.
 `,
      },
      {
        id: "doc-2-2",
        name: "Đơn xin nghỉ học vì bệnh",
        size: "0.8 MB",
        downloads: "2,789",
        description: "Mẫu đơn xin nghỉ học có lý do sức khỏe.",
        datePublished: "2024-02-10",
        author: "Phòng Giáo dục & Đào tạo",
        topic: "Nghỉ học",
        pageCount: 5,
        fileType: "PDF",
        language: "Tiếng Việt",
        content: `
### Nội dung đơn gồm:

- Thông tin học sinh: họ tên, lớp
- Lý do nghỉ học và thời gian dự kiến nghỉ
- Cam kết từ phụ huynh
- Chữ ký và xác nhận từ nhà trường (nếu cần)
 `,
      },
      {
        id: "doc-2-3",
        name: "Phiếu đồng ý tiêm chủng",
        size: "1.5 MB",
        downloads: "1,876",
        description: "Phiếu thu thập sự đồng ý của phụ huynh về việc tiêm chủng.",
        datePublished: "2024-04-05",
        author: "Trung tâm Y tế Huyện",
        topic: "Tiêm chủng",
        pageCount: 9,
        fileType: "PDF",
        language: "Tiếng Việt",
        content: `
        ### Nội dung phiếu

        - Thông tin học sinh
        - Danh sách vaccine dự kiến
        - Thông tin người giám hộ
        - Chữ ký xác nhận đồng ý
          `,
      },
    ],
  },
  {
    id: "cat-3",
    title: "Lịch tiêm chủng",
    icon: SyringeIcon,
    color: "bg-green-100 text-green-600",
    documents: [
      {
        id: "doc-3-1",
        name: "Lịch tiêm chủng mở rộng 2024",
        size: "2.1 MB",
        downloads: "1,654",
        description: "Chi tiết các mốc tiêm chủng bắt buộc và khuyến nghị.",
        datePublished: "2023-12-20",
        author: "Bộ Y tế",
        topic: "Lịch tiêm chủng",
        pageCount: 12,
        fileType: "PDF",
        language: "Tiếng Việt",
        content: `
        ### Lịch cụ thể theo độ tuổi

        - Sơ sinh: Viêm gan B, Lao
        - 2-4 tháng: Bạch hầu, Ho gà, Uốn ván, Bại liệt
        - 9 tháng: Sởi
        - 18 tháng: Nhắc lại Sởi – Rubella

        📌 Tiêm miễn phí tại các trạm y tế xã, phường.
          `,
      },
      {
        id: "doc-3-2",
        name: "Hướng dẫn chuẩn bị trước tiêm",
        size: "1.7 MB",
        downloads: "1,234",
        description: "Những lưu ý cần biết trước khi đi tiêm.",
        datePublished: "2024-01-10",
        author: "Bộ Y tế",
        topic: "Hướng dẫn tiêm chủng",
        pageCount: 8,
        fileType: "PDF",
        language: "Tiếng Việt",
        content: `
        ### Trước khi tiêm

        - Đảm bảo trẻ khỏe mạnh, không sốt, không ho.
        - Không tiêm nếu đang dùng kháng sinh liều cao.
        - Báo với bác sĩ tiền sử dị ứng, co giật, hoặc phản ứng vaccine.

        📌 Mang đầy đủ giấy tờ, sổ tiêm chủng.
          `,
      },
      {
        id: "doc-3-3",
        name: "Theo dõi sau tiêm chủng",
        size: "1.9 MB",
        downloads: "1,098",
        description: "Cách theo dõi và xử lý các phản ứng sau tiêm.",
        datePublished: "2024-02-20",
        author: "Bộ Y tế",
        topic: "Theo dõi tiêm chủng",
        pageCount: 10,
        fileType: "PDF",
        language: "Tiếng Việt",
        content: `
        ### Sau tiêm cần theo dõi
        - Sốt nhẹ, sưng đau chỗ tiêm là bình thường.
        - Theo dõi trong 30 phút tại nơi tiêm.
        - Gọi cấp cứu nếu có dấu hiệu phản vệ: khó thở, tím tái, mạch nhanh.
        📌 Luôn giữ số điện thoại bác sĩ hoặc y tế gần nhất.
          `,
      },
    ],
  },
];

export default documentCategories;
