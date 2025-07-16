import React, { useState } from "react";
import { Card, Input, Button, Typography, Space, Divider } from "antd";
import { getImageUrl } from "./imageUtils";

const { Text, Title } = Typography;

/**
 * A debugging component to test image URL processing
 */
const ImageDebug = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [processedUrl, setProcessedUrl] = useState("");
  const [error, setError] = useState(null);

  const handleProcess = () => {
    try {
      const processed = getImageUrl(imageUrl);
      setProcessedUrl(processed);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error processing URL:", err);
    }
  };

  return (
    <Card
      title="Image URL Debugger"
      style={{ maxWidth: 600, margin: "20px auto" }}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Text>Enter an image URL to test:</Text>
        <Input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Enter image URL"
        />
        <Button type="primary" onClick={handleProcess}>
          Process URL
        </Button>

        {processedUrl && (
          <>
            <Divider />
            <Title level={5}>Results:</Title>
            <Text>Original URL: {imageUrl}</Text>
            <br />
            <Text>Processed URL: {processedUrl}</Text>
            <br />
            <Text>Image Preview:</Text>
            <div
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                marginTop: "10px",
              }}
            >
              <img
                src={processedUrl}
                alt="Preview"
                style={{ maxWidth: "100%" }}
                onError={(e) => {
                  console.error("Image failed to load:", e.target.src);
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/400x300?text=Image+Load+Error";
                  e.target.style.border = "1px solid red";
                }}
              />
            </div>
          </>
        )}

        {error && (
          <div style={{ color: "red", marginTop: "10px" }}>Error: {error}</div>
        )}
      </Space>
    </Card>
  );
};

export default ImageDebug;
