const fastify = require("fastify")({ logger: true });
const dotenv = require("dotenv");

// 加载环境变量
dotenv.config();

// 配置CORS
fastify.register(require("@fastify/cors"), {
  origin: "*", // 在生产环境中应该设置具体的前端域名
  methods: ["GET", "POST", "PUT", "DELETE"],
});

// 配置JWT
fastify.register(require("@fastify/jwt"), {
  secret: process.env.JWT_SECRET,
});

// 添加API文档
fastify.register(require("@fastify/swagger"), {
  swagger: {
    info: {
      title: "Social Media API",
      description: "API documentation for social media application",
      version: "1.0.0",
    },
    externalDocs: {
      url: "https://swagger.io",
      description: "Find more info here",
    },
    host: "localhost:3001",
    schemes: ["http"],
    consumes: ["application/json"],
    produces: ["application/json"],
  },
});

// 添加Swagger UI
fastify.register(require("@fastify/swagger-ui"), {
  routePrefix: "/api/docs",
  uiConfig: {
    docExpansion: "full",
    deepLinking: false,
  },
  staticCSP: true,
  exposeRoute: true,
});

// 导入路由
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");
const messageRoutes = require("./routes/message");
const notificationRoutes = require("./routes/notification");

// 注册路由
fastify.register(authRoutes, { prefix: "/api/auth" });
fastify.register(userRoutes, { prefix: "/api/user" });
fastify.register(postRoutes, { prefix: "/api/post" });
fastify.register(messageRoutes, { prefix: "/api/message" });
fastify.register(notificationRoutes, { prefix: "/api/notification" });

// 健康检查端点
fastify.get(
  "/api/health",
  {
    schema: {
      description: "Health check endpoint",
      response: {
        200: {
          type: "object",
          properties: {
            status: {
              type: "string",
            },
          },
        },
      },
    },
  },
  async (request, reply) => {
    return { status: "ok" };
  },
);

// 启动服务器
const PORT = process.env.PORT || 3001;
fastify.listen({ port: PORT }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server running on port ${PORT}`);
  fastify.log.info(
    `API documentation available at http://localhost:${PORT}/api/docs`,
  );
});
