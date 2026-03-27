const db = require("../db");

const notificationRoutes = async (fastify, options) => {
  // 获取通知列表
  fastify.get(
    "/",
    {
      schema: {
        description: "Get notifications for current user",
        tags: ["notification"],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      try {
        const { userId } = await request.jwtVerify();

        const notifications = await db.notification.findMany({
          where: { recipientId: userId },
          orderBy: { createdAt: "desc" },
          include: {
            actor: {
              select: {
                id: true,
                username: true,
                handle: true,
                avatar: true,
              },
            },
          },
        });

        return notifications.map(n => ({
          ...n,
          time: formatTimestamp(n.createdAt)
        }));
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ msg: "服务器内部错误" });
      }
    }
  );

  // 标记所有通知为已读
  fastify.post(
    "/read-all",
    {
      schema: {
        description: "Mark all notifications as read",
        tags: ["notification"],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      try {
        const { userId } = await request.jwtVerify();

        await db.notification.updateMany({
          where: { recipientId: userId, isRead: false },
          data: { isRead: true },
        });

        return { success: true };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ msg: "服务器内部错误" });
      }
    }
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

module.exports = notificationRoutes;
