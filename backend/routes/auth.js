const bcrypt = require("bcryptjs");
const db = require("../db");
const {
  formatUser,
  success,
  created,
  error,
  conflict,
  unauthorized,
  notFound,
} = require("../utils");

const authRoutes = async (fastify, options) => {
  fastify.post(
    "/users",
    {
      schema: {
        description: "Register a new user",
        tags: ["auth"],
        body: {
          type: "object",
          required: ["username", "handle", "password", "avatar"],
          properties: {
            username: { type: "string", description: "Username of the user" },
            handle: {
              type: "string",
              description: "Handle of the user (like @username)",
            },
            password: { type: "string", description: "Password of the user" },
            avatar: { type: "string", description: "Avatar URL of the user" },
          },
        },
      },
    },
    async (request, reply) => {
      const { username, handle, password, avatar } = request.body;

      try {
        const existingUserByUsername = await db.user.findUnique({
          where: { username },
        });
        if (existingUserByUsername) {
          return conflict(reply, "用户名已存在");
        }

        const existingUserByHandle = await db.user.findUnique({
          where: { handle },
        });
        if (existingUserByHandle) {
          return conflict(reply, "Handle已存在");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await db.user.create({
          data: { username, handle, password: hashedPassword, avatar },
        });

        const token = fastify.jwt.sign({ userId: user.id });
        return created(reply, { user: formatUser(user), token }, "注册成功");
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "服务器内部错误");
      }
    },
  );

  fastify.post(
    "/auth/login",
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
            password: { type: "string", description: "Password of the user" },
          },
        },
      },
    },
    async (request, reply) => {
      const { handle, password } = request.body;

      try {
        const user = await db.user.findUnique({ where: { handle } });
        if (!user) {
          return unauthorized(reply, "用户名或密码错误");
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return unauthorized(reply, "用户名或密码错误");
        }

        const token = fastify.jwt.sign({ userId: user.id });
        return success(reply, { user: formatUser(user), token }, "登录成功");
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "服务器内部错误");
      }
    },
  );

  fastify.get(
    "/users/me",
    {
      schema: {
        description: "Get current user information",
        tags: ["auth"],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      try {
        const { userId } = await request.jwtVerify();
        const user = await db.user.findUnique({ where: { id: userId } });

        if (!user) {
          return notFound(reply, "用户不存在");
        }

        return success(reply, { user: formatUser(user) });
      } catch (err) {
        fastify.log.error(err);
        return unauthorized(reply);
      }
    },
  );

  fastify.post("/register", async (request, reply) => {
    const { username, handle, password, avatar } = request.body;

    try {
      const existingUserByUsername = await db.user.findUnique({
        where: { username },
      });
      if (existingUserByUsername) {
        return conflict(reply, "用户名已存在");
      }

      const existingUserByHandle = await db.user.findUnique({
        where: { handle },
      });
      if (existingUserByHandle) {
        return conflict(reply, "Handle已存在");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await db.user.create({
        data: { username, handle, password: hashedPassword, avatar },
      });

      const token = fastify.jwt.sign({ userId: user.id });
      return created(reply, { user: formatUser(user), token }, "注册成功");
    } catch (err) {
      fastify.log.error(err);
      return error(reply, "服务器内部错误");
    }
  });

  fastify.post("/login", async (request, reply) => {
    const { handle, password } = request.body;

    try {
      const user = await db.user.findUnique({ where: { handle } });
      if (!user) {
        return unauthorized(reply, "用户名或密码错误");
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return unauthorized(reply, "用户名或密码错误");
      }

      const token = fastify.jwt.sign({ userId: user.id });
      return success(reply, { user: formatUser(user), token }, "登录成功");
    } catch (err) {
      fastify.log.error(err);
      return error(reply, "服务器内部错误");
    }
  });

  fastify.get("/me", async (request, reply) => {
    try {
      const { userId } = await request.jwtVerify();
      const user = await db.user.findUnique({ where: { id: userId } });

      if (!user) {
        return notFound(reply, "用户不存在");
      }

      return success(reply, { user: formatUser(user) });
    } catch (err) {
      fastify.log.error(err);
      return unauthorized(reply);
    }
  });
};

module.exports = authRoutes;
