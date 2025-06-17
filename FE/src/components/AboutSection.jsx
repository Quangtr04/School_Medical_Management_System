import React from "react";
import {
  SchoolIcon,
  UsersIcon,
  AwardIcon,
  HeartIcon,
  BookOpenIcon,
  ShieldCheckIcon,
} from "lucide-react";
export function AboutSection() {
  const schoolStats = [
    {
      label: "Học sinh",
      value: "1,247",
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
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* School Introduction */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Trường Tiểu học Sức khỏe Xanh
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
            Với hơn 25 năm kinh nghiệm trong giáo dục, chúng tôi tự hào là một
            trong những trường tiểu học hàng đầu về chăm sóc sức khỏe học sinh.
            Trường được trang bị phòng y tế hiện đại và đội ngũ y tá chuyên
            nghiệp, luôn đặt sức khỏe của các em lên hàng đầu.
          </p>
        </div>
        {/* School Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          {schoolStats.map((stat, index) => (
            <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
              <stat.icon className={`h-12 w-12 ${stat.color} mx-auto mb-4`} />
              <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
        {/* School Values */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Giá trị cốt lõi của chúng tôi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {schoolValues.map((value, index) => (
              <div key={index} className="text-center p-6">
                <div className="inline-flex p-3 bg-blue-100 rounded-full mb-4">
                  <value.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h4>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
        {/* School Facilities */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Cơ sở vật chất y tế
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Phòng y tế hiện đại
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Phòng khám bệnh với đầy đủ thiết bị y tế</li>
                <li>• Phòng cấp cứu với trang thiết bị chuyên dụng</li>
                <li>• Khu vực nghỉ ngơi cho học sinh ốm</li>
                <li>• Tủ thuốc được quản lý chặt chẽ</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Đội ngũ chuyên nghiệp
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li>• 3 y tá có chứng chỉ hành nghề</li>
                <li>• 1 bác sĩ nhi khoa thường trú</li>
                <li>• Đào tạo định kỳ về sơ cứu</li>
                <li>• Hợp tác với bệnh viện địa phương</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
