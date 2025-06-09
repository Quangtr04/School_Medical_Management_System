import React from "react";
import {
  CalendarIcon,
  UserIcon,
  ArrowRightIcon,
  HeartIcon,
  BookOpenIcon,
  StarIcon,
} from "lucide-react";
export function BlogSection() {
  const featuredPosts = [
    {
      id: 1,
      title: "Cách tăng cường sức đề kháng cho trẻ trong mùa lạnh",
      excerpt:
        "Những phương pháp đơn giản và hiệu quả để giúp con bạn có một hệ miễn dịch khỏe mạnh...",
      author: "BS. Nguyễn Thị Lan",
      date: "15 Tháng 12, 2024",
      category: "Sức khỏe",
      image:
        "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop",
      featured: true,
    },
    {
      id: 2,
      title: "Kinh nghiệm chăm sóc con bị sốt tại nhà",
      excerpt:
        "Chia sẻ từ phụ huynh về cách xử lý khi con sốt và khi nào cần đến bệnh viện...",
      author: "Chị Trần Thị Mai",
      date: "12 Tháng 12, 2024",
      category: "Kinh nghiệm",
      image:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop",
    },
    {
      id: 3,
      title: "Dinh dưỡng cân bằng cho học sinh tiểu học",
      excerpt:
        "Hướng dẫn lập thực đơn dinh dưỡng phù hợp với độ tuổi và nhu cầu phát triển...",
      author: "Cô Lê Thị Hoa",
      date: "10 Tháng 12, 2024",
      category: "Dinh dưỡng",
      image:
        "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=250&fit=crop",
    },
  ];
  const recentPosts = [
    {
      title: "Tầm quan trọng của việc rửa tay đúng cách",
      author: "Y tá Phạm Văn Nam",
      date: "8 Tháng 12, 2024",
      category: "Vệ sinh",
    },
    {
      title: "Chuẩn bị tâm lý cho con trước khi tiêm chủng",
      author: "BS. Hoàng Thị Linh",
      date: "5 Tháng 12, 2024",
      category: "Tâm lý",
    },
    {
      title: "Nhận biết sớm các dấu hiệu bệnh ở trẻ",
      author: "BS. Nguyễn Văn Đức",
      date: "3 Tháng 12, 2024",
      category: "Sức khỏe",
    },
  ];
  const categories = [
    {
      name: "Sức khỏe",
      count: 24,
      color: "bg-red-100 text-red-800",
    },
    {
      name: "Dinh dưỡng",
      count: 18,
      color: "bg-green-100 text-green-800",
    },
    {
      name: "Kinh nghiệm",
      count: 15,
      color: "bg-blue-100 text-blue-800",
    },
    {
      name: "Tâm lý",
      count: 12,
      color: "bg-purple-100 text-purple-800",
    },
    {
      name: "Vệ sinh",
      count: 9,
      color: "bg-yellow-100 text-yellow-800",
    },
  ];
  return (
    <section id="blog" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Blog chia sẻ kinh nghiệm
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nơi chia sẻ kiến thức, kinh nghiệm và câu chuyện về chăm sóc sức
            khỏe học sinh từ các bác sĩ, y tá và phụ huynh
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Featured Post */}
            {featuredPosts[0] && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
                <div className="relative">
                  <img
                    src={featuredPosts[0].image}
                    alt={featuredPosts[0].title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Nổi bật
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium mr-3">
                      {featuredPosts[0].category}
                    </span>
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span className="mr-4">{featuredPosts[0].date}</span>
                    <UserIcon className="h-4 w-4 mr-1" />
                    <span>{featuredPosts[0].author}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {featuredPosts[0].title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {featuredPosts[0].excerpt}
                  </p>
                  <button className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
                    Đọc thêm
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
            {/* Other Posts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredPosts.slice(1).map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium mr-3 ${
                          post.category === "Kinh nghiệm"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {post.category}
                      </span>
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>{post.date}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <UserIcon className="h-4 w-4 mr-1" />
                        <span>{post.author}</span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Đọc thêm
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Sidebar */}
          <div className="space-y-8">
            {/* Categories */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Chủ đề</h3>
              <div className="space-y-3">
                {categories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-gray-700">{category.name}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${category.color}`}
                    >
                      {category.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* Recent Posts */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Bài viết gần đây
              </h3>
              <div className="space-y-4">
                {recentPosts.map((post, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-200 pb-4 last:border-b-0"
                  >
                    <h4 className="font-medium text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                      {post.title}
                    </h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <UserIcon className="h-3 w-3 mr-1" />
                      <span className="mr-3">{post.author}</span>
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      <span>{post.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Call to Action */}
            <div className="bg-blue-600 rounded-lg p-6 text-white text-center">
              <HeartIcon className="h-12 w-12 mx-auto mb-4 text-blue-200" />
              <h3 className="text-lg font-bold mb-2">
                Chia sẻ câu chuyện của bạn
              </h3>
              <p className="text-blue-100 text-sm mb-4">
                Bạn có kinh nghiệm hay về chăm sóc sức khỏe con em? Hãy chia sẻ
                với cộng đồng!
              </p>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                Gửi bài viết
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
