const db = require("../db");

const messageRoutes = async (fastify, options) => {
  // 获取聊天列表
  fastify.get(
    "/chats",
    {
      schema: {
        description: "Get list of chats",
        tags: ["message"],
        security: [
          {
            bearerAuth: [],
          },
        ],
        response: {
          200: {
            type: "object",
            properties: {
              chats: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                    },
                    participant: {
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
                      },
                    },
                    lastMessage: {
                      type: "string",
                    },
                    unreadCount: {
                      type: "integer",
                    },
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

        // 获取用户的聊天列表
        const chats = await db.chat.findMany();

        // 为每个聊天添加参与者信息和最后一条消息
        const formattedChats = await Promise.all(
          chats.map(async (chat) => {
            // 获取参与者信息
            const participant = await db.user.findUnique({
              where: { id: chat.participantId },
            });
            // 获取最后一条消息
            const messages = await db.message.findMany({
              where: { chatId: chat.id },
              orderBy: { createdAt: "desc" },
              take: 1,
            });
            const lastMessage = messages[0]?.text || "";
            return {
              id: chat.id,
              participant: participant
                ? {
                    id: participant.id,
                    username: participant.username,
                    handle: participant.handle,
                    avatar: participant.avatar,
                  }
                : null,
              lastMessage,
              unreadCount: chat.unreadCount,
            };
          }),
        );

        return reply.send({ chats: formattedChats });
      } catch (error) {
        fastify.log.error(error);
        if (
          error.code === "FST_JWT_AUTHORIZATION_TOKEN_INVALID" ||
          error.code === "FST_JWT_NO_AUTHORIZATION_IN_HEADER"
        ) {
          return reply.code(401).send({ msg: "未授权" });
        }
        return reply.code(500).send({ msg: "服务器内部错误" });
      }
    },
  );

  // 获取聊天消息
  fastify.get(
    "/chats/:id/messages",
    {
      schema: {
        description: "Get messages for a chat",
        tags: ["message"],
        security: [
          {
            bearerAuth: [],
          },
        ],
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Chat ID",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              messages: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                    },
                    text: {
                      type: "string",
                    },
                    senderId: {
                      type: "string",
                    },
                    chatId: {
                      type: "string",
                    },
                    createdAt: {
                      type: "string",
                    },
                    sender: {
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
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        // 验证JWT token
        const { userId } = await request.jwtVerify();

        // 检查聊天是否存在
        const chat = await db.chat.findUnique({
          where: { id },
        });

        if (!chat) {
          return reply.code(404).send({ msg: "聊天未找到" });
        }

        // 获取聊天消息
        const messages = await db.message.findMany({
          where: { chatId: id },
          orderBy: { createdAt: "asc" },
        });

        // 为每个消息添加发送者信息
        const messagesWithSender = await Promise.all(
          messages.map(async (message) => {
            const sender = await db.user.findUnique({
              where: { id: message.senderId },
            });
            return {
              ...message,
              sender: sender
                ? {
                    id: sender.id,
                    username: sender.username,
                    handle: sender.handle,
                    avatar: sender.avatar,
                  }
                : null,
            };
          }),
        );

        // 重置未读消息计数
        await db.chat.update({
          where: { id },
          data: { unreadCount: 0 },
        });

        return reply.send({ messages: messagesWithSender });
      } catch (error) {
        fastify.log.error(error);
        if (
          error.code === "FST_JWT_AUTHORIZATION_TOKEN_INVALID" ||
          error.code === "FST_JWT_NO_AUTHORIZATION_IN_HEADER"
        ) {
          return reply.code(401).send({ msg: "未授权" });
        }
        return reply.code(500).send({ msg: "服务器内部错误" });
      }
    },
  );

  // 发送消息
  fastify.post(
    "/chats/:id/messages",
    {
      schema: {
        description: "Send a message in a chat",
        tags: ["message"],
        security: [
          {
            bearerAuth: [],
          },
        ],
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Chat ID",
            },
          },
        },
        body: {
          type: "object",
          required: ["text"],
          properties: {
            text: {
              type: "string",
              description: "Message text",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                  },
                  text: {
                    type: "string",
                  },
                  senderId: {
                    type: "string",
                  },
                  chatId: {
                    type: "string",
                  },
                  createdAt: {
                    type: "string",
                  },
                  sender: {
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
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        // 验证JWT token
        const { userId } = await request.jwtVerify();
        const { text } = request.body;

        // 检查聊天是否存在
        const chat = await db.chat.findUnique({
          where: { id },
        });

        if (!chat) {
          return reply.code(404).send({ msg: "聊天未找到" });
        }

        // 创建消息
        const message = await db.message.create({
          data: {
            text,
            senderId: userId,
            chatId: id,
          },
        });

        // 获取发送者信息
        const sender = await db.user.findUnique({ where: { id: userId } });
        const messageWithSender = {
          ...message,
          sender: sender
            ? {
                id: sender.id,
                username: sender.username,
                handle: sender.handle,
                avatar: sender.avatar,
              }
            : null,
        };

        // 更新聊天的未读消息计数
        await db.chat.update({
          where: { id },
          data: { unreadCount: chat.unreadCount + 1 },
        });

        return reply.send({ message: messageWithSender });
      } catch (error) {
        fastify.log.error(error);
        if (
          error.code === "FST_JWT_AUTHORIZATION_TOKEN_INVALID" ||
          error.code === "FST_JWT_NO_AUTHORIZATION_IN_HEADER"
        ) {
          return reply.code(401).send({ msg: "未授权" });
        }
        return reply.code(500).send({ msg: "服务器内部错误" });
      }
    },
  );

  // 创建新聊天
  fastify.post(
    "/chats",
    {
      schema: {
        description: "Create a new chat",
        tags: ["message"],
        security: [
          {
            bearerAuth: [],
          },
        ],
        body: {
          type: "object",
          required: ["participantId"],
          properties: {
            participantId: {
              type: "string",
              description: "ID of the participant",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              chat: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                  },
                  participantId: {
                    type: "string",
                  },
                  unreadCount: {
                    type: "integer",
                  },
                  createdAt: {
                    type: "string",
                  },
                  updatedAt: {
                    type: "string",
                  },
                  participant: {
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
                    },
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
        const { participantId } = request.body;

        // 检查参与者是否存在
        const participant = await db.user.findUnique({
          where: { id: participantId },
        });

        if (!participant) {
          return reply.code(404).send({ msg: "用户未找到" });
        }

        // 检查是否已存在聊天
        const existingChat = await db.chat.findFirst({
          where: { participantId },
        });

        if (existingChat) {
          // 为现有聊天添加参与者信息
          const existingChatWithParticipant = {
            ...existingChat,
            participant: {
              id: participant.id,
              username: participant.username,
              handle: participant.handle,
              avatar: participant.avatar,
            },
          };
          return reply.send({ chat: existingChatWithParticipant });
        }

        // 创建新聊天
        const chat = await db.chat.create({
          data: {
            participantId,
          },
        });

        // 为新聊天添加参与者信息
        const chatWithParticipant = {
          ...chat,
          participant: {
            id: participant.id,
            username: participant.username,
            handle: participant.handle,
            avatar: participant.avatar,
          },
        };

        return reply.send({ chat: chatWithParticipant });
      } catch (error) {
        fastify.log.error(error);
        if (
          error.code === "FST_JWT_AUTHORIZATION_TOKEN_INVALID" ||
          error.code === "FST_JWT_NO_AUTHORIZATION_IN_HEADER"
        ) {
          return reply.code(401).send({ msg: "未授权" });
        }
        return reply.code(500).send({ msg: "服务器内部错误" });
      }
    },
  );
};

module.exports = messageRoutes;
