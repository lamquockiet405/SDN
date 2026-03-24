const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Study Room Booking API",
    version: "1.0.0",
    description:
      "API documentation for the Study Room Booking backend service.",
  },
  servers: [
    {
      url:
        process.env.BACKEND_URL ||
        `http://localhost:${process.env.PORT || 5000}`,
      description: "Current backend server",
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
  security: [{ bearerAuth: [] }],
  tags: [
    { name: "Health", description: "Service health" },
    { name: "Auth", description: "Authentication endpoints" },
    { name: "Users", description: "User management endpoints" },
    { name: "Rooms", description: "Room endpoints" },
    { name: "Bookings", description: "Booking endpoints" },
    { name: "Reviews", description: "Review endpoints" },
    { name: "Payments", description: "Payment endpoints" },
    { name: "Audit", description: "Audit log endpoints" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Check server health",
        responses: {
          200: {
            description: "Server is healthy",
          },
        },
      },
    },
  },
};

const swaggerOptions = {
  definition: swaggerDefinition,
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = {
  swaggerSpec,
};
