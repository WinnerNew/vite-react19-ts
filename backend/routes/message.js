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
            messages: {
              take: 1,
              orderBy: { createdAt: "desc" },
              select: { text: true },
            },
          },
        });

        // 格式化聊天列表，确定对方是谁
        const formattedChats = chats.map((chat) => {
          const participant = chat.user1Id === userId ? chat.user2 : chat.user1;

          const lastMessage = chat.messages[0]?.text || "No messages yet";

          return {
            id: chat.id,
            participant,
            lastMessage,
            unreadCount: chat.unreadCount,
            timestamp: formatTimestamp(chat.updatedAt),
          };
        });

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
        querystring: {
          type: "object",
          properties: {
            limit: { type: "integer", default: 50 },
            offset: { type: "integer", default: 0 },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { userId } = await request.jwtVerify();
        const { chatId } = request.params;
        const { limit, offset } = request.query;

        // 验证用户是否是聊天参与者
        const chat = await db.chat.findUnique({
          where: { id: chatId },
        });

        if (!chat || (chat.user1Id !== userId && chat.user2Id !== userId)) {
          return reply.code(403).send({ msg: "无权访问此聊天" });
        }

        // 重置未读计数
        if (chat.unreadCount > 0) {
          await db.chat.update({
            where: { id: chatId },
            data: { unreadCount: 0 },
          });
        }

        const messages = await db.message.findMany({
          where: { chatId },
          orderBy: { createdAt: "desc" }, // 最新的排在前面，方便分页
          take: limit,
          skip: offset,
          select: {
            id: true,
            text: true,
            createdAt: true,
            senderId: true,
          },
        });

        // 由于是 desc 排序取出来的，如果是要渲染到页面，前端需要 reverse 或者后端 reverse
        // 这里为了兼容性，我们先手动排序成升序，或者由前端处理。
        // 为了最小化前端改动，我们在返回前先转成 asc。
        const sortedMessages = messages.sort(
          (a, b) => a.createdAt - b.createdAt,
        );

        return {
          messages: sortedMessages.map((m) => ({
            id: m.id,
            text: m.text,
            createdAt: m.createdAt,
            timestamp: formatTimestamp(m.createdAt),
            sender: { id: m.senderId }, // 最小化发送者信息
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
          select: {
            id: true,
            text: true,
            createdAt: true,
            senderId: true,
          },
        });

        // 更新聊天的 updatedAt 并增加未读计数
        await db.chat.update({
          where: { id: chatId },
          data: {
            updatedAt: new Date(),
            unreadCount: { increment: 1 },
          },
        });

        return {
          message: {
            id: message.id,
            text: message.text,
            createdAt: message.createdAt,
            timestamp: formatTimestamp(message.createdAt),
            sender: { id: message.senderId },
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
