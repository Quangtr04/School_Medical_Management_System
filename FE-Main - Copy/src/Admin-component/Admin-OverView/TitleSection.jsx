import { Col, Row, Typography } from "antd";
const { Title, Text, Paragraph } = Typography;

const TitleSection = () => {
  return (
    <Row>
      <Col span={24}>
        <Title className="px-5" level={3}>
          Tổng Quan Hệ Thống{" "}
        </Title>{" "}
        <Paragraph className="px-5" type="secondary" style={{ margin: 0 }}>
          Chào mừng bạn đến với bảng điều khiển quản trị
        </Paragraph>
      </Col>
    </Row>
  );
};

export default TitleSection;
