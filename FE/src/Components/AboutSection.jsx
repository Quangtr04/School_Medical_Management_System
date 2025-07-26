import React, { useEffect } from "react";
import {
  SchoolIcon,
  UsersIcon,
  AwardIcon,
  HeartIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  Stethoscope,
  CheckCircle2,
} from "lucide-react";
import schoolIntroBg from "../image/back-ground-about.png";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllStudentHealthRecords } from "../redux/nurse/studentRecords/studentRecord";
import { TbNurseFilled } from "react-icons/tb";

export function AboutSection() {
  const dispatch = useDispatch();

  const totalStudent = useSelector((state) => state.studentRecord.totalStudent);
  console.log(totalStudent);

  useEffect(() => {
    dispatch(fetchAllStudentHealthRecords())
  }, [dispatch])

  const schoolStats = [
    {
      label: "Học sinh",
      value: totalStudent,
      icon: UsersIcon,
      color: "text-blue-600",
    },
    {
      label: "Giáo viên",
      value: "87",
      icon: BookOpenIcon,
      color: "text-green-600",
    },
    {
      label: "Năm thành lập",
      value: "1995",
      icon: SchoolIcon,
      color: "text-purple-600",
    },
    {
      label: "Giải thưởng",
      value: "25+",
      icon: AwardIcon,
      color: "text-orange-600",
    },
  ];

  const schoolValues = [
    {
      icon: HeartIcon,
      title: "Chăm sóc toàn diện",
      description:
        "Quan tâm đến sức khỏe thể chất và tinh thần của mỗi học sinh",
    },
    {
      icon: ShieldCheckIcon,
      title: "An toàn tuyệt đối",
      description:
        "Đảm bảo môi trường học tập an toàn và lành mạnh cho học sinh",
    },
    {
      icon: UsersIcon,
      title: "Hợp tác gia đình",
      description:
        "Phối hợp chặt chẽ với phụ huynh trong việc chăm sóc sức khỏe con em",
    },
  ];
  return (
    <section id="about" className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* School Introduction with Background Image (applied directly via style) */}
        {/* Thêm các lớp Tailwind cho padding, bo góc, ẩn phần thừa, và căn giữa */}
        <div
          className="relative py-20 px-8 rounded-lg overflow-hidden mb-16 text-center" // Giữ nguyên các lớp Tailwind này
          style={{
            backgroundImage: `url(${schoolIntroBg})`, // <-- Gắn ảnh nền trực tiếp
            backgroundSize: "cover", // <-- Đảm bảo ảnh phủ kín
            backgroundPosition: "center", // <-- Căn giữa ảnh
          }}
        >
          {/* Overlay để làm tối ảnh nền, giúp chữ dễ đọc hơn */}
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70 z-0"></div>

          {/* Nội dung văn bản nằm trên overlay */}
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6" style={{ fontWeight: 600 }}>
              {" "}
              {/* Đổi màu chữ sang trắng */}
              Trường Tiểu Học Sức Khỏe Xanh
            </h1>
            <p className="text-xl text-gray-200 max-w-4xl mx-auto mb-8">
              {" "}
              {/* Đổi màu chữ sang xám nhạt hơn */}
              Với hơn 25 năm kinh nghiệm trong giáo dục, chúng tôi tự hào là một
              trong những trường tiểu học hàng đầu về chăm sóc sức khỏe học
              sinh. Trường được trang bị phòng y tế hiện đại và đội ngũ y tá
              chuyên nghiệp, luôn đặt sức khỏe của các em lên hàng đầu.
            </p>
          </div>
        </div>

        {/* School Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          {schoolStats.map((stat, index) => (
            <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
              <stat.icon className={`h-12 w-12 ${stat.color} mx-auto mb-4`} />
              <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                {stat.value}
              </div>
              <div className="text-gray-600 font-bold">{stat.label}</div>
            </div>
          ))}
        </div>
        {/* School Values */}
        <div className="mb-16">
          <h1 className="text-2xl text-gray-900 text-center mb-8" style={{ fontWeight: 600 }}>
            Giá trị cốt lõi của chúng tôi
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {schoolValues.map((value, index) => (
              <div key={index} className="text-center p-6">
                <div className="inline-flex p-3 bg-blue-100 rounded-full mb-4">
                  <value.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3" style={{ fontWeight: 600 }}>
                  {value.title}
                </h4>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* School Facilities */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8">
          <div className="flex items-center justify-center mb-8 gap-2">
            <Stethoscope className="w-8 h-8 text-blue-600" />
            <h3 className="text-2xl font-bold text-gray-900 text-center" style={{ fontWeight: 600 }}>
              Cơ sở vật chất y tế
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <TbNurseFilled className="w-6 h-6 text-blue-500" />
                <h4 className="text-lg font-semibold text-gray-900" style={{ marginTop: 10, fontWeight: 600 }}>
                  Phòng y tế hiện đại
                </h4>
              </div>
              <ul className="space-y-2 text-gray-600 mt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" />Phòng khám bệnh với đầy đủ thiết bị y tế</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" />Phòng cấp cứu với trang thiết bị chuyên dụng</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" />Khu vực nghỉ ngơi cho học sinh ốm</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" />Tủ thuốc được quản lý chặt chẽ</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheckIcon className="w-6 h-6 text-green-500" />
                <h4 className="text-lg font-semibold text-gray-900" style={{ marginTop: 10, fontWeight: 600 }}>
                  Đội ngũ chuyên nghiệp
                </h4>
              </div>
              <ul className="space-y-2 text-gray-600 mt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" />3 y tá có chứng chỉ hành nghề</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" />1 bác sĩ nhi khoa thường trú</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" />Đào tạo định kỳ về sơ cứu</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" />Hợp tác với bệnh viện địa phương</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
