const bcrypt = require("bcryptjs");
const db = require("../db");

const authRoutes = async (fastify, options) => {
  // 注册路由
  fastify.post(
    "/register",
    {
      schema: {
        description: "Register a new user",
        tags: ["auth"],
        body: {
          type: "object",
          required: ["username", "handle", "password", "avatar"],
          properties: {
            username: {
              type: "string",
              description: "Username of the user",
            },
            handle: {
              type: "string",
              description: "Handle of the user (like @username)",
            },
            password: {
              type: "string",
              description: "Password of the user",
            },
            avatar: {
              type: "string",
              description: "Avatar URL of the user",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              user: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                  },
                  username: {
                    type: "string",
                  },
                  handle: {
                    type: "string",
                  },
                  avatar: {
                    type: "string",
                  },
                  bio: {
                    type: "string",
                    nullable: true,
                  },
                  location: {
                    type: "string",
                    nullable: true,
                  },
                  website: {
                    type: "string",
                    nullable: true,
                  },
                  followers: {
                    type: "integer",
                  },
                  following: {
                    type: "integer",
                  },
                },
              },
              token: {
                type: "string",
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { username, handle, password, avatar } = request.body;
      console.log(username, handle, password, avatar);
      try {
        // 检查用户是否已存在
        // 检查用户名是否已存在
        const existingUserByUsername = await db.user.findUnique({
          where: { username },
        });
        if (existingUserByUsername) {
          return reply.code(400).send({ msg: "用户名已存在" });
        }

        // 检查 handle 是否已存在
        const existingUserByHandle = await db.user.findUnique({
          where: { handle },
        });
        if (existingUserByHandle) {
          return reply.code(400).send({ msg: "Handle 已存在" });
        }

        // 哈希密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 创建用户
        const user = await db.user.create({
          data: {
            username,
            handle,
            password: hashedPassword,
            avatar,
          },
        });

        // 过滤掉密码字段
        const { password: _, ...userWithoutPassword } = user;

        // 生成JWT token
        const token = fastify.jwt.sign({ userId: user.id });

        return reply.send({ user: userWithoutPassword, token });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ msg: "服务器内部错误" });
      }
    },
  );

  // 登录路由
  fastify.post(
    "/login",
    {
      schema: {
        description: "Login a user",
        tags: ["auth"],
        body: {
          type: "object",
          required: ["handle", "password"],
          properties: {
            handle: {
              type: "string",
              description: "Handle of the user (like @username)",
            },
            password: {
              type: "string",
              description: "Password of the user",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              user: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                  },
                  username: {
                    type: "string",
                  },
                  handle: {
                    type: "string",
                  },
                  avatar: {
                    type: "string",
                  },
                  bio: {
                    type: "string",
                    nullable: true,
                  },
                  location: {
                    type: "string",
                    nullable: true,
                  },
                  website: {
                    type: "string",
                    nullable: true,
                  },
                  followers: {
                    type: "integer",
                  },
                  following: {
                    type: "integer",
                  },
                },
              },
              token: {
                type: "string",
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { handle, password } = request.body;

      try {
        // 查找用户
        const user = await db.user.findUnique({
          where: { handle },
        });

        if (!user) {
          return reply.code(401).send({ msg: "用户不存在" });
        }

        // 验证密码
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          return reply.code(401).send({ msg: "密码错误" });
        }

        // 生成JWT token
        const token = fastify.jwt.sign({ userId: user.id });

        // 返回用户信息（不包含密码）
        const { password: _, ...userWithoutPassword } = user;

        return reply.send({ user: userWithoutPassword, token });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ msg: "服务器内部错误" });
      }
    },
  );

  // 验证token路由
  fastify.get(
    "/me",
    {
      schema: {
        description: "Get current user information",
        tags: ["auth"],
        security: [
          {
            bearerAuth: [],
          },
        ],
        response: {
          200: {
            type: "object",
            properties: {
              user: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                  },
                  username: {
                    type: "string",
                  },
                  handle: {
                    type: "string",
                  },
                  avatar: {
                    type: "string",
                  },
                  bio: {
                    type: "string",
                    nullable: true,
                  },
                  location: {
                    type: "string",
                    nullable: true,
                  },
                  website: {
                    type: "string",
                    nullable: true,
                  },
                  followers: {
                    type: "integer",
                  },
                  following: {
                    type: "integer",
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        // 验证JWT token
        const { userId } = await request.jwtVerify();

        // 查找用户
        const user = await db.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          return reply.code(404).send({ msg: "用户未找到" });
        }

        // 过滤掉密码字段
        const { password: _, ...userWithoutPassword } = user;

        return reply.send({ user: userWithoutPassword });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(401).send({ msg: "未授权" });
      }
    },
  );
};

module.exports = authRoutes;
