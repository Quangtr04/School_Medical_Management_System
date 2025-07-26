import {
  Card,
  Avatar,
  Badge,
  Button,
  Space,
  Typography,
  Tag,
  Divider,
  Row,
  Col,
} from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  SettingOutlined,
  BarChartOutlined,
  TeamOutlined,
  GithubOutlined,
  LinkedinOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

export default function AdminProfile() {
  const user = useSelector((state) => state.auth.user);
  console.log(user);
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/admin/nurses");
  };
  return (
    <div
      style={{
        background: "linear-gradient(to bottom right, #f8fafc, #e2e8f0)",
        minHeight: "100vh",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <Card
          style={{ overflow: "hidden" }}
          cover={
            <div
              style={{
                height: 120,
                background: "linear-gradient(to right, #2563eb, #7c3aed)",
              }}
            />
          }
        >
          <div style={{ display: "flex", gap: 24, marginTop: -60 }}>
            <Avatar
              size={96}
              src="/placeholder.svg"
              style={{ border: "4px solid white" }}
            >
              AD
            </Avatar>

            <div style={{ flex: 1 }}>
              <Title level={3}>{user.fullname}</Title>
              <Text type="secondary">Quản trị viên hệ thống</Text>
              <div style={{ marginTop: 8 }}>
                <Space>
                  <Tag color="green">🟢 Active</Tag>
                  <Tag color="blue">Senior Level</Tag>
                </Space>
              </div>

              <Space style={{ marginTop: 16 }}>
                <Button type="primary" icon={<SettingOutlined />}>
                  Manage Settings
                </Button>
                <Button icon={<BarChartOutlined />}>View Analytics</Button>
                <Button icon={<TeamOutlined />} onClick={handleNavigate}>
                  Quản lý người dùng
                </Button>
              </Space>
            </div>
          </div>
        </Card>

        <Row gutter={24} style={{ marginTop: 24 }}>
          {/* Left Column */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Contact */}
              <Card
                title={
                  <>
                    <MailOutlined /> Thông tin liên hệ
                  </>
                }
              >
                <Space direction="vertical">
                  <Text>
                    <MailOutlined /> {user.email}
                  </Text>
                  <Text>
                    <PhoneOutlined /> {user.phone}
                  </Text>
                  <Text>
                    <EnvironmentOutlined />{" "}
                    {dayjs(user.created_at).format("DD/MM/YYYY")}
                  </Text>
                  <Text>
                    <CalendarOutlined />{" "}
                    {dayjs(user.dayOfBirth).format("DD/MM/YYYY")}
                  </Text>
                </Space>
                <Divider />
              </Card>

              {/* Skills */}
              <Card
                title={
                  <>
                    <TrophyOutlined /> Skills & Expertise
                  </>
                }
              >
                <Space wrap>
                  {[
                    "System Administration",
                    "Network Security",
                    "Cloud Infrastructure",
                    "DevOps",
                    "Kubernetes",
                    "AWS",
                    "Linux/Unix",
                    "Monitoring",
                    "Docker",
                  ].map((skill) => (
                    <Tag color="blue" key={skill}>
                      {skill}
                    </Tag>
                  ))}
                </Space>
              </Card>

              {/* Quick Stats */}
              <Card title="Quick Stats">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Row justify="space-between">
                    <Text type="secondary">Users Managed</Text>
                    <Text strong>1,247</Text>
                  </Row>
                  <Row justify="space-between">
                    <Text type="secondary">Systems Online</Text>
                    <Text strong style={{ color: "green" }}>
                      98.7%
                    </Text>
                  </Row>
                  <Row justify="space-between">
                    <Text type="secondary">Tickets Resolved</Text>
                    <Text strong>2,156</Text>
                  </Row>
                  <Row justify="space-between">
                    <Text type="secondary">Avg Response Time</Text>
                    <Text strong>12 min</Text>
                  </Row>
                </Space>
              </Card>
            </Space>
          </Col>

          {/* Right Column */}
          <Col xs={24} lg={16}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* About */}
              <Card
                title="About"
                extra={
                  <Text type="secondary">
                    Professional background and experience
                  </Text>
                }
              >
                <Paragraph>
                  Experienced System Administrator with over 8 years of
                  expertise in managing enterprise-level infrastructure, cloud
                  platforms, and security protocols. Passionate about
                  automation, scalability, and high-availability systems.
                </Paragraph>
              </Card>

              {/* Recent Activity */}
              <Card
                title={
                  <>
                    <ClockCircleOutlined /> Recent Activity
                  </>
                }
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Card type="inner" style={{ background: "#eff6ff" }}>
                    <Space>
                      <SafetyCertificateOutlined style={{ color: "#2563eb" }} />
                      <div>
                        <Text strong>Security patch deployed</Text>
                        <br />
                        <Text type="secondary">2 hours ago</Text>
                      </div>
                    </Space>
                  </Card>
                  <Card type="inner" style={{ background: "#ecfdf5" }}>
                    <Space>
                      <TeamOutlined style={{ color: "#059669" }} />
                      <div>
                        <Text strong>User permissions updated</Text>
                        <br />
                        <Text type="secondary">4 hours ago</Text>
                      </div>
                    </Space>
                  </Card>
                  <Card type="inner" style={{ background: "#f5f3ff" }}>
                    <Space>
                      <BarChartOutlined style={{ color: "#7c3aed" }} />
                      <div>
                        <Text strong>Monthly report generated</Text>
                        <br />
                        <Text type="secondary">1 day ago</Text>
                      </div>
                    </Space>
                  </Card>
                  <Card type="inner" style={{ background: "#fff7ed" }}>
                    <Space>
                      <GlobalOutlined style={{ color: "#ea580c" }} />
                      <div>
                        <Text strong>Network optimization</Text>
                        <br />
                        <Text type="secondary">2 days ago</Text>
                      </div>
                    </Space>
                  </Card>
                </Space>
              </Card>

              {/* Responsibilities */}
              <Card title="Key Responsibilities">
                <Row gutter={24}>
                  {[
                    {
                      title: "Infrastructure Management",
                      items: [
                        "Server maintenance and monitoring",
                        "Cloud platform administration",
                        "Network configuration and security",
                      ],
                    },
                    {
                      title: "User Support",
                      items: [
                        "Account management and provisioning",
                        "Technical support and troubleshooting",
                        "Training and documentation",
                      ],
                    },
                    {
                      title: "Security & Compliance",
                      items: [
                        "Security policy implementation",
                        "Regular security audits",
                        "Compliance monitoring",
                      ],
                    },
                    {
                      title: "Automation & Optimization",
                      items: [
                        "Process automation development",
                        "Performance optimization",
                        "Cost management and reporting",
                      ],
                    },
                  ].map(({ title, items }) => (
                    <Col xs={24} md={12} key={title}>
                      <Title level={5}>{title}</Title>
                      <ul style={{ paddingLeft: 16 }}>
                        {items.map((item) => (
                          <li key={item}>
                            <Text type="secondary">{item}</Text>
                          </li>
                        ))}
                      </ul>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
}
