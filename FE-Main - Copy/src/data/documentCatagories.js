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

### 1. Nguyên tắc dinh dưỡng cơ bản
- Cân bằng các nhóm chất dinh dưỡng: protein, lipid, glucid, vitamin và khoáng chất.
- Bữa ăn hợp lý đảm bảo lượng phù hợp với độ tuổi và hoạt động của trẻ.
- Ưu tiên bữa ăn trong ngày: 3 bữa chính và 2-3 bữa phụ.
- Đủ nước, ưu tiên nước lọc và sữa, hạn chế nước ngọt có đường.

### 2. Thực đơn mẫu theo độ tuổi
**Trẻ 6-12 tháng tuổi** 
Giai đoạn chuyển tiếp từ sữa mẹ sang thức ăn đặc. Bắt đầu với các loại bột, cháo loãng, rau củ nghiền mịn. Tăng dần độ đặc và đa dạng thực phẩm.

**Trẻ 1-3 tuổi** 
Có thể ăn đa dạng với đầy đủ các nhóm thực phẩm. Khuyến khích trẻ tự ăn, tạo thói quen ăn uống lành mạnh.

**Trẻ học đường (6-12 tuổi)** 
Tăng cường năng lượng để hỗ trợ hoạt động học tập. Chú ý bữa sáng đầy đủ, bữa trưa cân bằng và bữa tối nhẹ nhàng.

📌 **Lưu ý quan trọng:** 
Luôn tham khảo ý kiến bác sĩ dinh dưỡng hoặc nhi khoa khi có thắc mắc về chế độ ăn của trẻ. Một số trẻ cần điều chỉnh khẩu phần tùy thuộc vào tình trạng sức khỏe và phát triển.

### 3. Các lỗi thường gặp
- Cho trẻ ăn quá nhiều đồ ngọt và thức ăn nhanh.
- Thiếu rau xanh và trái cây trong khẩu phần ăn.
- Ép trẻ ăn đồ trẻ không thích, ăn trong khi xem TV.
- Không đảm bảo vệ sinh an toàn thực phẩm.

### 4. Dấu hiệu cần chú ý
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

### 1. Biện pháp giữ ấm hiệu quả
- Mặc đủ ấm, đội mũ, đeo khăn, đi tất khi ra ngoài.
- Tránh để trẻ thay đổi nhiệt độ đột ngột.
- Giữ nhiệt độ phòng ổn định, khoảng 25–28°C.

### 2. Dinh dưỡng hỗ trợ đề kháng
- Tăng cường rau xanh, trái cây chứa vitamin C.
- Cho trẻ uống đủ nước, đặc biệt là nước ấm.

### 3. Phòng ngừa bệnh hô hấp
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

### 1. Cúm mùa là gì?
- Là bệnh truyền nhiễm do virus cúm A, B gây ra.
- Lây truyền qua đường hô hấp.

### 2. Triệu chứng điển hình
- Sốt, ho, sổ mũi, đau cơ, mệt mỏi.

### 3. Cách phòng chống
- Tiêm vaccine cúm hằng năm.
- Đeo khẩu trang, rửa tay thường xuyên.
- Hạn chế tụ tập nơi đông người.

### 4. Khi nào cần đi khám?
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
## Phiếu khai báo tình trạng sức khỏe học sinh

Phiếu này được sử dụng để học sinh hoặc phụ huynh khai báo định kỳ về tình hình sức khỏe nhằm đảm bảo môi trường học đường an toàn và kịp thời phát hiện các vấn đề sức khỏe.

### Hướng dẫn khai báo

Vui lòng điền đầy đủ và chính xác các thông tin sau:

1.  **Thông tin cá nhân:**
    * Họ và tên học sinh
    * Lớp học
    * Ngày tháng năm sinh

2.  **Tình trạng sức khỏe hiện tại:**
    * Các triệu chứng bất thường (sốt, ho, khó thở, đau họng, mệt mỏi, mất vị giác/khứu giác,...)
    * Tình trạng sức khỏe chung (tốt, trung bình, yếu)
    * Các bệnh lý nền (nếu có)

3.  **Lịch sử tiếp xúc:**
    * Bạn có tiếp xúc gần với người bị sốt, ho, khó thở hoặc có chẩn đoán mắc bệnh truyền nhiễm trong 14 ngày qua không?
    * Bạn có đi đến/về từ vùng dịch tễ trong 14 ngày qua không?

4.  **Tình trạng tiêm chủng:**
    * Loại vaccine và số mũi đã tiêm (đối với các bệnh truyền nhiễm liên quan)

### Lưu ý quan trọng

* Phiếu khai báo cần được nộp định kỳ theo yêu cầu của nhà trường hoặc cơ quan y tế.
* Thông tin khai báo là cơ sở để nhà trường và cơ quan y tế có biện pháp phòng ngừa, kiểm soát dịch bệnh và chăm sóc sức khỏe học sinh một cách hiệu quả.
* Mọi thông tin cá nhân sẽ được bảo mật theo quy định.

Xin chân thành cảm ơn sự hợp tác của quý phụ huynh và các em học sinh.
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
# Đơn Xin Nghỉ Học Vì Bệnh

Đây là mẫu đơn chuẩn dùng để xin phép nhà trường cho học sinh nghỉ học với lý do sức khỏe. Việc điền đầy đủ và chính xác thông tin trên đơn sẽ giúp quá trình duyệt đơn được thuận tiện và nhanh chóng.

## Mục đích của Đơn xin nghỉ học vì bệnh

Mẫu đơn này giúp phụ huynh/người giám hộ thông báo chính thức đến nhà trường về tình trạng sức khỏe của học sinh, đồng thời xin phép cho học sinh vắng mặt trong một khoảng thời gian nhất định để điều trị hoặc nghỉ ngơi.

### Các phần chính của đơn

Một mẫu đơn xin nghỉ học chuẩn thường bao gồm các phần sau:

1.  **Kính gửi:** Tên cơ quan, tổ chức, hoặc cá nhân nhận đơn (ví dụ: Ban Giám hiệu, Giáo viên chủ nhiệm).
2.  **Thông tin cá nhân học sinh:**
    * Họ và tên học sinh
    * Ngày sinh
    * Lớp học
    * Tên trường
3.  **Lý do nghỉ học:**
    * Mô tả chi tiết về tình trạng sức khỏe (ví dụ: sốt, cảm cúm, đau bụng...).
    * **Lưu ý:** Nên có xác nhận từ bác sĩ hoặc giấy khám bệnh nếu thời gian nghỉ dài hoặc bệnh nặng.
4.  **Thời gian nghỉ học:**
    * Thời gian bắt đầu nghỉ (ngày/tháng/năm).
    * Thời gian kết thúc nghỉ dự kiến (ngày/tháng/năm).
    * Tổng số ngày nghỉ.
5.  **Cam kết của phụ huynh/người giám hộ:**
    * Đảm bảo học sinh sẽ theo dõi sức khỏe và trở lại học tập khi đủ điều kiện.
    * Chịu trách nhiệm về việc học của học sinh trong thời gian nghỉ.
6.  **Chữ ký và xác nhận:**
    * Chữ ký của phụ huynh/người giám hộ.
    * Xác nhận của nhà trường (nếu có yêu cầu) hoặc giáo viên chủ nhiệm.
7.  **Phần ghi chú (nếu có):** Bất kỳ thông tin bổ sung nào cần thiết.

## Lưu ý quan trọng khi nộp đơn

* Nộp đơn **sớm nhất có thể** để nhà trường nắm bắt tình hình và có phương án hỗ trợ.
* Giữ một bản sao của đơn đã nộp (nếu cần).
* Đảm bảo chữ ký rõ ràng và thông tin liên hệ chính xác.

Mẫu đơn này nhằm mục đích đơn giản hóa thủ tục hành chính, giúp phụ huynh và nhà trường phối hợp tốt hơn trong việc quản lý sức khỏe và học tập của học sinh.
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
# Phiếu Đồng Ý Tiêm Chủng

Bạn đang xem **Phiếu đồng ý tiêm chủng**, một tài liệu quan trọng nhằm thu thập sự chấp thuận của phụ huynh hoặc người giám hộ trước khi thực hiện các mũi tiêm chủng cho trẻ em.

## Mục đích của Phiếu đồng ý tiêm chủng

Phiếu này đảm bảo rằng phụ huynh/người giám hộ đã được cung cấp đầy đủ thông tin về loại vắc-xin, lợi ích, rủi ro tiềm ẩn, và các tác dụng phụ có thể xảy ra.

### Các thông tin chính trên phiếu

1.  **Thông tin cá nhân:** Tên, tuổi, địa chỉ của người được tiêm chủng và người giám hộ.
2.  **Lịch sử sức khỏe:** Các bệnh lý nền, dị ứng, phản ứng với vắc-xin trước đó.
3.  **Chi tiết vắc-xin:** Tên vắc-xin, nhà sản xuất, số lô, ngày hết hạn.
4.  **Thông tin về tác dụng phụ:** Mô tả các phản ứng có thể xảy ra sau tiêm chủng và cách xử lý.
5.  **Chữ ký xác nhận:** Sự đồng ý của phụ huynh/người giám hộ sau khi đã hiểu rõ.

## Quy trình tiêm chủng an toàn

Để đảm bảo an toàn tối đa cho người được tiêm chủng, quy trình tiêm chủng luôn tuân thủ các bước sau:

* **Khám sàng lọc trước tiêm:** Đánh giá tình trạng sức khỏe tổng quát, tiền sử dị ứng.
* **Tư vấn kỹ lưỡng:** Giải thích về vắc-xin, lịch tiêm, các lưu ý sau tiêm.
* **Theo dõi sau tiêm:** Yêu cầu ở lại cơ sở y tế ít nhất 30 phút để theo dõi phản ứng tức thì.
* **Cung cấp số điện thoại liên hệ:** Để phụ huynh/người giám hộ có thể liên hệ ngay khi cần.

### Tầm quan trọng của việc tiêm chủng

Tiêm chủng là một trong những biện pháp hiệu quả nhất để phòng ngừa các bệnh truyền nhiễm nguy hiểm. Nó không chỉ bảo vệ cá nhân mà còn tạo miễn dịch cộng đồng, giúp bảo vệ những người không thể tiêm chủng.

Với bất kỳ thắc mắc nào, xin vui lòng liên hệ với cơ sở y tế gần nhất để được tư vấn chi tiết.
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
# Lịch Tiêm Chủng Mở Rộng 2024

Lịch tiêm chủng mở rộng quốc gia năm 2024 là chương trình tiêm chủng miễn phí cho trẻ em và phụ nữ mang thai, nhằm phòng ngừa các bệnh truyền nhiễm nguy hiểm. Việc tuân thủ lịch tiêm chủng sẽ giúp bảo vệ sức khỏe cộng đồng.

## Các vắc-xin bắt buộc theo độ tuổi

Chương trình tiêm chủng mở rộng cung cấp các loại vắc-xin thiết yếu, được khuyến nghị mạnh mẽ cho mọi trẻ em Việt Nam.

### Lịch cụ thể theo độ tuổi và mũi tiêm

* **Sơ sinh:**
    * **Vắc-xin Viêm gan B:** Mũi 1 trong 24 giờ đầu sau sinh.
    * **Vắc-xin Lao (BCG):** Tiêm càng sớm càng tốt sau sinh.
* **2 tháng tuổi:**
    * **Vắc-xin 5 trong 1 (Bạch hầu, Ho gà, Uốn ván, Bại liệt, Viêm phổi/Viêm màng não do Hib):** Mũi 1.
* **3 tháng tuổi:**
    * **Vắc-xin 5 trong 1:** Mũi 2.
* **4 tháng tuổi:**
    * **Vắc-xin 5 trong 1:** Mũi 3.
* **9 tháng tuổi:**
    * **Vắc-xin Sởi:** Mũi 1.
* **18 tháng tuổi:**
    * **Vắc-xin Sởi – Rubella:** Mũi 2 (nhắc lại).
    * **Vắc-xin DPT (Bạch hầu – Ho gà – Uốn ván):** Nhắc lại.
    * **Vắc-xin Bại liệt (OPV/IPV):** Nhắc lại (có thể là uống hoặc tiêm).

## Địa điểm và chi phí tiêm chủng

📌 Tiêm miễn phí tại các trạm y tế xã, phường, trung tâm y tế quận/huyện trên toàn quốc.
Bạn nên liên hệ trước với trạm y tế địa phương để biết lịch tiêm cụ thể và chuẩn bị các giấy tờ cần thiết.

### Lợi ích của tiêm chủng mở rộng

* **Bảo vệ cá nhân:** Giúp trẻ em có miễn dịch chủ động chống lại các bệnh nguy hiểm.
* **Bảo vệ cộng đồng:** Tạo miễn dịch cộng đồng, giảm sự lây lan của dịch bệnh.
* **Tiết kiệm chi phí:** Miễn phí vắc-xin và dịch vụ tiêm chủng.

Hãy đảm bảo con em bạn được tiêm chủng đầy đủ và đúng lịch để có một sức khỏe tốt nhất!
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
# Hướng Dẫn Chuẩn Bị Trước Khi Tiêm Chủng

Để đảm bảo quá trình tiêm chủng diễn ra an toàn và hiệu quả, việc chuẩn bị kỹ lưỡng trước khi đưa trẻ đến cơ sở y tế là vô cùng quan trọng.

## Những việc cần làm trước khi đến cơ sở tiêm chủng

Việc chuẩn bị tốt sẽ giúp giảm thiểu rủi ro và mang lại hiệu quả cao nhất từ vắc-xin.

### 1. Đảm bảo sức khỏe của trẻ

* **Trẻ khỏe mạnh:** Đảm bảo trẻ không bị sốt, không ho, không có các dấu hiệu cảm cúm hay các bệnh nhiễm trùng cấp tính khác. Nếu trẻ đang bị ốm, nên hoãn lịch tiêm và tham khảo ý kiến bác sĩ.
* **Không dùng thuốc đặc biệt:** Báo ngay cho bác sĩ hoặc nhân viên y tế nếu trẻ đang dùng kháng sinh liều cao, thuốc ức chế miễn dịch, hoặc đã từng truyền máu/sản phẩm máu trong thời gian gần đây.

### 2. Chuẩn bị thông tin và giấy tờ

* **Sổ tiêm chủng:** Mang theo sổ tiêm chủng của trẻ để nhân viên y tế có thể cập nhật thông tin và theo dõi lịch sử tiêm.
* **Lịch sử sức khỏe:** Cung cấp đầy đủ và chính xác thông tin về tiền sử dị ứng (đặc biệt là với các thành phần của vắc-xin), tiền sử co giật, hoặc các phản ứng nghiêm trọng với vắc-xin ở những lần tiêm trước (nếu có).
* **Các loại thuốc trẻ đang dùng:** Liệt kê tất cả các loại thuốc trẻ đang sử dụng (kể cả thuốc không kê đơn).

### 3. Các lưu ý khác

* **Cho trẻ ăn đủ no:** Đảm bảo trẻ được ăn no trước khi tiêm để tránh hạ đường huyết hoặc ngất xỉu.
* **Mặc quần áo thoải mái:** Nên mặc quần áo rộng rãi, thoáng mát, dễ dàng cởi/mặc để tiêm ở cánh tay hoặc đùi.
* **Giữ bình tĩnh cho trẻ:** Trấn an trẻ, nói chuyện nhẹ nhàng để trẻ không quá sợ hãi.

📌 Mang đầy đủ giấy tờ tùy thân của phụ huynh/người giám hộ và sổ tiêm chủng của trẻ.
Việc tuân thủ các hướng dẫn này sẽ giúp bảo vệ sức khỏe của trẻ và đảm bảo hiệu quả của mũi tiêm.
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
# Hướng Dẫn Theo Dõi và Chăm Sóc Sau Tiêm Chủng

Sau khi tiêm chủng, việc theo dõi và chăm sóc đúng cách là rất quan trọng để phát hiện sớm và xử lý kịp thời các phản ứng không mong muốn, đảm bảo an toàn cho người được tiêm.

## Theo dõi tại cơ sở y tế (30 phút đầu)

Đây là khoảng thời gian vàng để phát hiện và xử lý các phản ứng phản vệ cấp tính (nếu có), vốn rất hiếm gặp nhưng có thể nghiêm trọng.

* **Quan sát kỹ:** Luôn giữ trẻ trong tầm mắt, quan sát các biểu hiện bất thường như:
    * Khó thở, thở khò khè, thở nhanh.
    * Nổi mẩn đỏ, mề đay toàn thân.
    * Sưng phù mặt, môi, họng.
    * Tím tái.
    * Vã mồ hôi, chân tay lạnh.
    * Mạch nhanh, yếu.
    * Buồn nôn, tiêu chảy.
    * Vật vã, quấy khóc liên tục, hoặc li bì.

* **Thông báo ngay:** Nếu phát hiện bất kỳ dấu hiệu nào trên, hãy thông báo ngay lập tức cho nhân viên y tế tại điểm tiêm để được hỗ trợ kịp thời.

### Theo dõi tại nhà (trong 24-48 giờ đầu)

Sau khi về nhà, tiếp tục theo dõi trẻ trong ít nhất 24-48 giờ tiếp theo.

* **Các phản ứng thông thường (thường gặp và không nguy hiểm):**
    * **Sốt nhẹ:** Thường dưới 38.5°C. Có thể dùng thuốc hạ sốt theo chỉ dẫn của bác sĩ (ví dụ: Paracetamol liều lượng phù hợp cân nặng).
    * **Sưng, đỏ, đau tại chỗ tiêm:** Là phản ứng bình thường của cơ thể. Có thể chườm lạnh (khăn mát) lên chỗ tiêm để giảm sưng đau.
    * **Trẻ quấy khóc, biếng ăn, mệt mỏi:** Thường tự hết sau 1-2 ngày.

* **Khi nào cần đưa trẻ đến bệnh viện ngay lập tức?**
    * Sốt cao trên 39°C không hạ sau khi dùng thuốc hạ sốt.
    * Co giật.
    * Quấy khóc dữ dội, không dứt.
    * Li bì, hôn mê.
    * Nổi ban toàn thân, mẩn ngứa dữ dội.
    * Sưng to, đỏ, đau nhiều tại chỗ tiêm, có mủ hoặc chảy dịch.
    * Khó thở, thở rít, thở khò khè.
    * Nôn trớ, tiêu chảy liên tục.
    * Bất kỳ dấu hiệu bất thường nào khác khiến bạn lo lắng.

## Lời khuyên chung

* Cho trẻ uống nhiều nước (sữa mẹ, nước lọc, nước trái cây...).
* Cho trẻ mặc quần áo thoáng mát.
* Không đắp lá, chườm nóng hay xoa dầu lên chỗ tiêm.
* Không cạo gió hay tự ý dùng thuốc khi chưa có chỉ định của bác sĩ.

📌 Luôn giữ số điện thoại của bác sĩ hoặc cơ sở y tế gần nhất để liên hệ khi cần thiết.
Việc tiêm chủng là an toàn và hiệu quả. Hãy bình tĩnh theo dõi và liên hệ y tế khi có dấu hiệu bất thường.
`,
      },
    ],
  },
];

export default documentCategories;
