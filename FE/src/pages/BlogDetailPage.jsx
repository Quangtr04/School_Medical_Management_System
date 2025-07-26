import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Row,
  Col,
  Typography,
  Breadcrumb,
  Card,
  Divider,
  Tag,
  Avatar,
  Space,
  Spin,
  Image,
  Button,
} from "antd";
import {
  HomeOutlined,
  ReadOutlined,
  CalendarOutlined,
  UserOutlined,
  TagOutlined,
  ArrowLeftOutlined,
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import featuredPosts from "../data/featuredPosts";
import recentBlog from "../data/recentBlog";
import "../BlogDetailPage.css";

const { Title, Text, Paragraph } = Typography;

const BlogDetailPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    // Tìm bài viết từ featuredPosts hoặc recentBlog dựa trên ID
    const findPost = () => {
      setLoading(true);

      // Chuyển id từ string sang number
      const postId = parseInt(id);

      // Tìm trong featuredPosts
      let foundPost = featuredPosts.find((post) => post.id === postId);

      // Nếu không có trong featuredPosts, tìm trong recentBlog
      if (!foundPost) {
        foundPost = recentBlog.find((post) => post.id === postId);
      }

      // Nếu tìm thấy bài viết
      if (foundPost) {
        setPost(foundPost);

        // Tìm các bài viết liên quan (cùng category)
        const related = [...featuredPosts, ...recentBlog]
          .filter((p) => p.id !== postId && p.category === foundPost.category)
          .slice(0, 3);

        setRelatedPosts(related);
      }

      setLoading(false);
    };

    findPost();
  }, [id]);

  // Nội dung mẫu cho bài viết chi tiết
  const getFullContent = () => {
    if (!post) return "";

    // Đây là nội dung mẫu, trong thực tế sẽ lấy từ API hoặc database
    return `
      ${post.excerpt}
      
      Trong thời đại hiện nay, việc chăm sóc sức khỏe cho trẻ em luôn là mối quan tâm hàng đầu của các bậc phụ huynh. Đặc biệt trong mùa lạnh, khi thời tiết thay đổi thất thường, trẻ em rất dễ mắc các bệnh về đường hô hấp như cảm cúm, viêm họng, viêm phế quản.
      
      Để tăng cường sức đề kháng cho trẻ, các bậc phụ huynh nên chú ý đến những điểm sau:
      
      1. Chế độ dinh dưỡng cân bằng: Đảm bảo trẻ được cung cấp đầy đủ các nhóm chất dinh dưỡng như protein, carbohydrate, chất béo, vitamin và khoáng chất. Đặc biệt chú trọng đến các thực phẩm giàu vitamin C, vitamin D và kẽm.
      
      2. Vận động thể chất thường xuyên: Khuyến khích trẻ tham gia các hoạt động thể chất phù hợp với lứa tuổi. Việc này không chỉ giúp trẻ phát triển thể chất mà còn tăng cường hệ miễn dịch.
      
      3. Đảm bảo giấc ngủ đầy đủ: Trẻ em cần được ngủ đủ giấc để cơ thể có thời gian phục hồi và tăng cường sức đề kháng. Thời gian ngủ khuyến nghị cho trẻ em từ 6-12 tuổi là 9-12 giờ mỗi ngày.
      
      4. Giữ ấm cơ thể: Trong mùa lạnh, việc giữ ấm cho trẻ rất quan trọng. Phụ huynh nên cho trẻ mặc nhiều lớp quần áo mỏng thay vì một lớp quần áo dày, giúp giữ nhiệt tốt hơn.
      
      5. Vệ sinh cá nhân: Dạy trẻ thói quen rửa tay thường xuyên, đặc biệt trước khi ăn và sau khi đi vệ sinh. Điều này giúp ngăn ngừa sự lây lan của vi khuẩn và virus.
      
      Ngoài ra, phụ huynh cũng nên thường xuyên theo dõi sức khỏe của trẻ, phát hiện sớm các dấu hiệu bất thường để có biện pháp xử lý kịp thời. Việc tham khảo ý kiến của bác sĩ và tuân thủ lịch tiêm chủng cũng là những biện pháp quan trọng để bảo vệ sức khỏe cho trẻ.
      
      Hy vọng những thông tin trên sẽ giúp các bậc phụ huynh có thêm kiến thức và phương pháp để chăm sóc sức khỏe cho con em mình trong mùa lạnh.
    `;
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = post?.title || "Bài viết hay về sức khỏe";

    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          title
        )}&url=${encodeURIComponent(url)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
          url
        )}&title=${encodeURIComponent(title)}`;
        break;
      default:
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "300px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <Title level={3}>Không tìm thấy bài viết</Title>
        <Button type="primary" icon={<ArrowLeftOutlined />}>
          <Link to="/">Quay lại trang chủ</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="blog-detail-page">
      <div className="blog-detail-container">
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Breadcrumb className="blog-detail-breadcrumb">
              <Breadcrumb.Item>
                <Link to="/">
                  <HomeOutlined /> Trang chủ
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>{post.title}</Breadcrumb.Item>
            </Breadcrumb>
          </Col>

          <Col xs={24} lg={16}>
            <Card bordered={false} className="blog-detail-card">
              <Title level={2} className="blog-detail-title">
                {post.title}
              </Title>

              <div className="blog-detail-meta">
                <div className="blog-detail-meta-item">
                  <CalendarOutlined />
                  <Text type="secondary">{post.date}</Text>
                </div>
                <div className="blog-detail-meta-item">
                  <UserOutlined />
                  <Text type="secondary">{post.author}</Text>
                </div>
                <div className="blog-detail-meta-item">
                  <TagOutlined />
                  <Tag color="blue">{post.category}</Tag>
                </div>
              </div>

              {post.image && (
                <div>
                  <Image
                    src={post.image}
                    alt={post.title}
                    className="blog-detail-image"
                    preview={false}
                  />
                </div>
              )}

              <div className="blog-content">
                {getFullContent()
                  .split("\n")
                  .map((paragraph, index) => (
                    <Paragraph key={index}>{paragraph}</Paragraph>
                  ))}
              </div>

              {/* Author Section */}
              <div className="blog-author-section">
                <Avatar
                  size={80}
                  src="https://i-suckhoe.vnecdn.net/2024/07/18/BS-Va-n-1-jpg-2195-1721273181.png"
                  icon={<UserOutlined />}
                  className="blog-author-avatar"
                />
                <div className="blog-author-info">
                  <div className="blog-author-name">{post.author}</div>
                  <div className="blog-author-bio">
                    Bác sĩ chuyên khoa nhi với hơn 10 năm kinh nghiệm trong lĩnh
                    vực chăm sóc sức khỏe trẻ em. Tốt nghiệp Đại học Y Hà Nội và
                    có nhiều nghiên cứu về bệnh lý hô hấp ở trẻ em.
                  </div>
                </div>
              </div>

              {/* Share Section */}
              <div className="blog-share-section">
                <div className="blog-share-title">
                  <ShareAltOutlined /> Chia sẻ bài viết:
                </div>
                <div className="blog-share-buttons">
                  <Button
                    type="text"
                    icon={<FacebookOutlined />}
                    className="share-button share-facebook"
                    onClick={() => handleShare("facebook")}
                  />
                  <Button
                    type="text"
                    icon={<TwitterOutlined />}
                    className="share-button share-twitter"
                    onClick={() => handleShare("twitter")}
                  />
                  <Button
                    type="text"
                    icon={<LinkedinOutlined />}
                    className="share-button share-linkedin"
                    onClick={() => handleShare("linkedin")}
                  />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <div className="blog-sidebar">
              <Card
                title="Bài viết liên quan"
                bordered={false}
                className="blog-detail-card"
              >
                {relatedPosts.length > 0 ? (
                  relatedPosts.map((relatedPost) => (
                    <div key={relatedPost.id} style={{ marginBottom: "16px" }}>
                      <Link to={`/blog/${relatedPost.id}`}>
                        <Card
                          hoverable
                          bodyStyle={{ padding: "12px" }}
                          className="related-post-card"
                        >
                          <div style={{ display: "flex" }}>
                            {relatedPost.image && (
                              <div
                                style={{ marginRight: "12px", flexShrink: 0 }}
                              >
                                <img
                                  src={relatedPost.image}
                                  alt={relatedPost.title}
                                  className="related-post-image"
                                />
                              </div>
                            )}
                            <div>
                              <Text strong className="related-post-title">
                                {relatedPost.title}
                              </Text>
                              <div>
                                <Text
                                  type="secondary"
                                  style={{ fontSize: "12px" }}
                                >
                                  {relatedPost.date}
                                </Text>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </div>
                  ))
                ) : (
                  <Text>Không có bài viết liên quan</Text>
                )}
              </Card>

              <Card
                title="Danh mục"
                bordered={false}
                className="blog-detail-card"
                style={{ marginTop: "24px" }}
              >
                <div>
                  <Link to="/blog?category=Sức khỏe">
                    <Tag color="blue" className="blog-category-tag">
                      Sức khỏe
                    </Tag>
                  </Link>
                  <Link to="/blog?category=Dinh dưỡng">
                    <Tag color="green" className="blog-category-tag">
                      Dinh dưỡng
                    </Tag>
                  </Link>
                  <Link to="/blog?category=Kinh nghiệm">
                    <Tag color="orange" className="blog-category-tag">
                      Kinh nghiệm
                    </Tag>
                  </Link>
                  <Link to="/blog?category=Tin tức">
                    <Tag color="purple" className="blog-category-tag">
                      Tin tức
                    </Tag>
                  </Link>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default BlogDetailPage;
