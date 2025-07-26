// swagger.js
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "School Health Management API",
      version: "1.0.0",
      description: "Tài liệu Swagger cho hệ thống quản lý sức khỏe học sinh",
    },
    servers: [
      {
        url: "http://localhost:3000", // Đổi nếu bạn deploy
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // ...existing code...
  apis: [path.join(__dirname, "../docs/*.js")],
  // ...existing code...
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
