const db = require("../db");
const {
  formatNotification,
  success,
  error,
  notFound,
  noContent,
  paginated,
} = require("../utils");

const notificationRoutes = async (fastify, options) => {
  fastify.get(
    "/",
    {
      schema: {
        description: "Get user notifications",
        tags: ["notification"],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            limit: { type: "integer", default: 20 },
            offset: { type: "integer", default: 0 },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { userId } = await request.jwtVerify();
        const { limit = 20, offset = 0 } = request.query;

        const notifications = await db.notification.findMany({
          where: { recipientId: userId },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
          include: {
            actor: {
              select: { id: true, username: true, handle: true, avatar: true },
            },
            post: {
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
            message: {
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

        const formattedNotifications = notifications.map((n) =>
          formatNotification(n, userId),
        );
        const total = await db.notification.count({
          where: { recipientId: userId },
        });
        const unreadCount = await db.notification.count({
          where: { recipientId: userId, read: false },
        });

        return success(reply, {
          items: formattedNotifications,
          total,
          unread_count: unreadCount,
        });
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "获取通知失败");
      }
    },
  );

  fastify.patch(
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
          where: { recipientId: userId, read: false },
          data: { read: true },
        });

        return success(reply, { success: true }, "标记已读成功");
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "标记已读失败");
      }
    },
  );

  fastify.patch(
    "/:id/read",
    {
      schema: {
        description: "Mark a notification as read",
        tags: ["notification"],
        security: [{ bearerAuth: [] }],
        params: { type: "object", properties: { id: { type: "string" } } },
      },
    },
    async (request, reply) => {
      try {
        const { userId } = await request.jwtVerify();
        const { id } = request.params;

        const notification = await db.notification.findFirst({
          where: { id, recipientId: userId },
        });

        if (!notification) {
          return notFound(reply, "通知不存在");
        }

        await db.notification.update({
          where: { id },
          data: { read: true },
        });

        return success(reply, { success: true }, "标记已读成功");
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "标记已读失败", "MARK_READ_FAILED");
      }
    },
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        description: "Delete a notification",
        tags: ["notification"],
        security: [{ bearerAuth: [] }],
        params: { type: "object", properties: { id: { type: "string" } } },
      },
    },
    async (request, reply) => {
      try {
        const { userId } = await request.jwtVerify();
        const { id } = request.params;

        const notification = await db.notification.findFirst({
          where: { id, recipientId: userId },
        });

        if (!notification) {
          return notFound(reply, "通知不存在", "NOTIFICATION_NOT_FOUND");
        }

        await db.notification.delete({ where: { id } });
        return noContent(reply);
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "删除通知失败");
      }
    },
  );

  fastify.post("/read-all", async (request, reply) => {
    try {
      const { userId } = await request.jwtVerify();

      await db.notification.updateMany({
        where: { recipientId: userId, read: false },
        data: { read: true },
      });

      return success(reply, { success: true }, "标记已读成功");
    } catch (err) {
      fastify.log.error(err);
      return error(reply, "标记已读失败", "MARK_READ_FAILED");
    }
  });
};

module.exports = notificationRoutes;
