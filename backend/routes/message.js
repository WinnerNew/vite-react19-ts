const db = require("../db");

const messageRoutes = async (fastify, options) => {
  // 获取聊天列表
  fastify.get(
    "/chats",
    {
      schema: {
        description: "Get chats for current user",
        tags: ["message"],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      try {
        const { userId } = await request.jwtVerify();

        const chats = await db.chat.findMany({
          where: {
            OR: [{ user1Id: userId }, { user2Id: userId }],
          },
          orderBy: { updatedAt: "desc" },
          include: {
            user1: {
              select: { id: true, username: true, handle: true, avatar: true },
            },
            user2: {
              select: { id: true, username: true, handle: true, avatar: true },
            },
          },
        });

        // 格式化聊天列表，确定对方是谁
        const formattedChats = await Promise.all(
          chats.map(async (chat) => {
            const participant =
              chat.user1Id === userId ? chat.user2 : chat.user1;

            // 获取最后一条消息
            const messages = await db.message.findMany({
              where: { chatId: chat.id },
              orderBy: { createdAt: "desc" },
              take: 1,
            });

            const lastMessage = messages[0]?.text || "No messages yet";

            return {
              id: chat.id,
              participant,
              lastMessage,
              unreadCount: chat.unreadCount,
              timestamp: formatTimestamp(chat.updatedAt),
            };
          }),
        );

        return { chats: formattedChats };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ msg: "服务器内部错误" });
      }
    },
  );

  // 获取聊天消息
  fastify.get(
    "/chats/:chatId/messages",
    {
      schema: {
        description: "Get messages for a specific chat",
        tags: ["message"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            chatId: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { userId } = await request.jwtVerify();
        const { chatId } = request.params;

        // 验证用户是否是聊天参与者
        const chat = await db.chat.findUnique({
          where: { id: chatId },
        });

        if (!chat || (chat.user1Id !== userId && chat.user2Id !== userId)) {
          return reply.code(403).send({ msg: "无权访问此聊天" });
        }

        const messages = await db.message.findMany({
          where: { chatId },
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: { id: true, username: true, handle: true, avatar: true },
            },
          },
        });

        return {
          messages: messages.map((m) => ({
            ...m,
            timestamp: formatTimestamp(m.createdAt),
          })),
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ msg: "服务器内部错误" });
      }
    },
  );

  // 发送消息
  fastify.post(
    "/chats/:chatId/messages",
    {
      schema: {
        description: "Send a message in a chat",
        tags: ["message"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            chatId: { type: "string" },
          },
        },
        body: {
          type: "object",
          required: ["text"],
          properties: {
            text: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { userId } = await request.jwtVerify();
        const { chatId } = request.params;
        const { text } = request.body;

        // 验证并更新聊天
        const chat = await db.chat.findUnique({
          where: { id: chatId },
        });

        if (!chat || (chat.user1Id !== userId && chat.user2Id !== userId)) {
          return reply.code(403).send({ msg: "无权在此聊天中发送消息" });
        }

        const message = await db.message.create({
          data: {
            text,
            chatId,
            senderId: userId,
          },
          include: {
            sender: {
              select: { id: true, username: true, handle: true, avatar: true },
            },
          },
        });

        // 更新聊天的 updatedAt
        await db.chat.update({
          where: { id: chatId },
          data: { updatedAt: new Date() },
        });

        return {
          message: {
            ...message,
            timestamp: formatTimestamp(message.createdAt),
          },
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ msg: "服务器内部错误" });
      }
    },
  );

  // 创建或获取已存在的聊天
  fastify.post(
    "/chats",
    {
      schema: {
        description: "Create or get a chat with a user",
        tags: ["message"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["participantId"],
          properties: {
            participantId: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { userId } = await request.jwtVerify();
        const { participantId } = request.body;

        if (userId === participantId) {
          return reply.code(400).send({ msg: "不能与自己聊天" });
        }

        // 确保 ID 顺序一致，以便 findUnique 正常工作
        const [u1, u2] = [userId, participantId].sort();

        let chat = await db.chat.findUnique({
          where: {
            user1Id_user2Id: {
              user1Id: u1,
              user2Id: u2,
            },
          },
          include: {
            user1: {
              select: { id: true, username: true, handle: true, avatar: true },
            },
            user2: {
              select: { id: true, username: true, handle: true, avatar: true },
            },
          },
        });

        if (!chat) {
          chat = await db.chat.create({
            data: {
              user1Id: u1,
              user2Id: u2,
            },
            include: {
              user1: {
                select: {
                  id: true,
                  username: true,
                  handle: true,
                  avatar: true,
                },
              },
              user2: {
                select: {
                  id: true,
                  username: true,
                  handle: true,
                  avatar: true,
                },
              },
            },
          });
        }

        const participant = chat.user1Id === userId ? chat.user2 : chat.user1;

        return {
          chat: {
            id: chat.id,
            participant,
            lastMessage: "",
            unreadCount: 0,
            timestamp: formatTimestamp(chat.updatedAt),
          },
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ msg: "服务器内部错误" });
      }
    },
  );
};

function formatTimestamp(date) {
  const now = new Date();
  const diff = (now - new Date(date)) / 1000;
  if (diff < 60) return "刚刚";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return new Date(date).toLocaleDateString();
}

module.exports = messageRoutes;
