const db = require("../db");
const {
  formatMessage,
  formatChat,
  success,
  created,
  createdWithId,
  error,
  notFound,
  badRequest,
  paginated,
} = require("../utils");

const messageRoutes = async (fastify, options) => {
  fastify.get(
    "/chats",
    {
      schema: {
        description: "Get user chats",
        tags: ["message"],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      try {
        const { userId } = await request.jwtVerify();

        const chats = await db.chat.findMany({
          where: { users: { some: { id: userId } } },
          orderBy: { updatedAt: "desc" },
          include: {
            users: {
              select: { id: true, username: true, handle: true, avatar: true },
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    handle: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        });

        const formattedChats = chats.map((chat) => formatChat(chat, userId));
        return paginated(reply, formattedChats, formattedChats.length);
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "获取聊天列表失败");
      }
    },
  );

  fastify.post(
    "/chats",
    {
      schema: {
        description: "Create a new chat",
        tags: ["message"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["recipient_id"],
          properties: { recipient_id: { type: "string" } },
        },
      },
    },
    async (request, reply) => {
      try {
        const { userId } = await request.jwtVerify();
        const { recipient_id } = request.body;

        if (userId === recipient_id) {
          return badRequest(reply, "不能与自己创建聊天");
        }

        const existingChat = await db.chat.findFirst({
          where: {
            AND: [
              { users: { some: { id: userId } } },
              { users: { some: { id: recipient_id } } },
            ],
          },
        });

        if (existingChat) {
          return success(reply, { id: existingChat.id });
        }

        const chat = await db.chat.create({
          data: {
            users: { connect: [{ id: userId }, { id: recipient_id }] },
          },
        });

        return createdWithId(reply, chat.id, "创建聊天成功");
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "创建聊天失败");
      }
    },
  );

  fastify.get(
    "/chats/:chat_id/messages",
    {
      schema: {
        description: "Get messages in a chat",
        tags: ["message"],
        security: [{ bearerAuth: [] }],
        params: { type: "object", properties: { chat_id: { type: "string" } } },
        querystring: {
          type: "object",
          properties: {
            limit: { type: "integer", default: 50 },
            before: { type: "string", nullable: true },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { userId } = await request.jwtVerify();
        const { chat_id } = request.params;
        const { limit = 50, before } = request.query;

        const chat = await db.chat.findFirst({
          where: { id: chat_id, users: { some: { id: userId } } },
        });

        if (!chat) {
          return notFound(reply, "聊天不存在");
        }

        const where = { chatId: chat_id };
        if (before) {
          where.createdAt = { lt: new Date(before) };
        }

        const messages = await db.message.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: limit,
          include: {
            user: {
              select: { id: true, username: true, handle: true, avatar: true },
            },
          },
        });

        const formattedMessages = messages
          .map((msg) => formatMessage(msg, userId))
          .reverse();
        return paginated(reply, formattedMessages, formattedMessages.length);
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "获取消息失败");
      }
    },
  );

  fastify.post(
    "/chats/:chat_id/messages",
    {
      schema: {
        description: "Send a message in a chat",
        tags: ["message"],
        security: [{ bearerAuth: [] }],
        params: { type: "object", properties: { chat_id: { type: "string" } } },
        body: {
          type: "object",
          required: ["content"],
          properties: { content: { type: "string" } },
        },
      },
    },
    async (request, reply) => {
      try {
        const { userId } = await request.jwtVerify();
        const { chat_id } = request.params;
        const { content } = request.body;

        const chat = await db.chat.findFirst({
          where: { id: chat_id, users: { some: { id: userId } } },
          include: { users: true },
        });

        if (!chat) {
          return notFound(reply, "聊天不存在", "CHAT_NOT_FOUND");
        }

        const message = await db.message.create({
          data: { content, userId, chatId: chat_id },
          include: {
            user: {
              select: { id: true, username: true, handle: true, avatar: true },
            },
          },
        });

        await db.chat.update({
          where: { id: chat_id },
          data: { updatedAt: new Date() },
        });

        const recipient = chat.users.find((u) => u.id !== userId);
        if (recipient) {
          await db.notification.create({
            data: {
              type: "MESSAGE",
              messageId: message.id,
              actorId: userId,
              recipientId: recipient.id,
            },
          });
        }

        return created(reply, formatMessage(message, userId), "发送成功");
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "发送消息失败");
      }
    },
  );

  fastify.get("/", async (request, reply) => {
    try {
      const { userId } = await request.jwtVerify();

      const chats = await db.chat.findMany({
        where: { users: { some: { id: userId } } },
        orderBy: { updatedAt: "desc" },
        include: {
          users: {
            select: { id: true, username: true, handle: true, avatar: true },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  handle: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });

      const formattedChats = chats.map((chat) => formatChat(chat, userId));
      return paginated(reply, formattedChats, formattedChats.length);
    } catch (err) {
      fastify.log.error(err);
      return error(reply, "获取聊天列表失败", "CHATS_FAILED");
    }
  });
};

module.exports = messageRoutes;
