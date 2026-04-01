const db = require("../db");
const {
  formatPost,
  optionalAuth,
  success,
  created,
  createdWithId,
  noContent,
  error,
  notFound,
  conflict,
  forbidden,
  paginated,
} = require("../utils");

const postRoutes = async (fastify, options) => {
  fastify.post(
    "/",
    {
      schema: {
        description: "Create a new post or reply",
        tags: ["post"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["content"],
          properties: {
            content: { type: "string" },
            image: { type: "string", nullable: true },
            parent_id: { type: "string", nullable: true },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { userId } = await request.jwtVerify();
        const { content, image, parent_id } = request.body;

        const post = await db.post.create({
          data: { content, image, userId, parentId: parent_id },
        });

        if (parent_id) {
          const parentPost = await db.post.update({
            where: { id: parent_id },
            data: { repliesCount: { increment: 1 } },
          });

          if (parentPost.userId !== userId) {
            await db.notification.create({
              data: {
                type: "REPLY",
                postId: post.id,
                actorId: userId,
                recipientId: parentPost.userId,
              },
            });
          }
        }

        return createdWithId(reply, post.id, "发布成功");
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "服务器内部错误");
      }
    },
  );

  fastify.get(
    "/search",
    {
      schema: {
        description: "Search posts by content",
        tags: ["post"],
        querystring: {
          type: "object",
          properties: {
            q: { type: "string" },
            limit: { type: "integer", default: 20 },
          },
        },
      },
    },
    async (request, reply) => {
      const { q, limit = 20 } = request.query;
      if (!q) return success(reply, { items: [], total: 0 });

      const userId = await optionalAuth(request);

      try {
        const posts = await db.post.findMany({
          where: { content: { contains: q }, parentId: null },
          orderBy: { createdAt: "desc" },
          take: limit,
          include: {
            user: true,
            likes: userId ? { where: { userId } } : false,
            reposts: userId ? { where: { userId } } : false,
          },
        });

        const formattedPosts = posts.map((post) => formatPost(post, userId));
        return paginated(reply, formattedPosts, formattedPosts.length);
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "搜索失败");
      }
    },
  );

  fastify.get(
    "/",
    {
      schema: {
        description: "Get posts list with like/repost status",
        tags: ["post"],
        querystring: {
          type: "object",
          properties: {
            limit: { type: "integer", default: 20 },
            offset: { type: "integer", default: 0 },
            type: { type: "string", default: "FOR_YOU" },
          },
        },
      },
    },
    async (request, reply) => {
      const { limit, offset, type } = request.query;
      const userId = await optionalAuth(request);

      try {
        const where = { parentId: null };

        if (type === "FOLLOWING" && userId) {
          const following = await db.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
          });
          const followingIds = following.map((f) => f.followingId);
          where.userId = { in: [...followingIds, userId] };
        }

        const posts = await db.post.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
          include: {
            user: true,
            likes: userId ? { where: { userId } } : false,
            reposts: userId ? { where: { userId } } : false,
            parent: { include: { user: true } },
          },
        });

        const formattedPosts = posts.map((post) => formatPost(post, userId));
        const total = await db.post.count({ where });

        return paginated(reply, formattedPosts, total);
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "服务器内部错误");
      }
    },
  );

  fastify.post(
    "/:id/likes",
    {
      schema: {
        description: "Like a post",
        tags: ["post"],
        security: [{ bearerAuth: [] }],
        params: { type: "object", properties: { id: { type: "string" } } },
      },
    },
    async (request, reply) => {
      const { userId } = await request.jwtVerify();
      const postId = request.params.id;

      try {
        const existingLike = await db.like.findUnique({
          where: { userId_postId: { userId, postId } },
        });

        if (existingLike) {
          return conflict(reply, "已经点赞过");
        }

        await db.like.create({ data: { userId, postId } });
        const post = await db.post.update({
          where: { id: postId },
          data: { likesCount: { increment: 1 } },
        });

        if (post.userId !== userId) {
          await db.notification.create({
            data: {
              type: "LIKE",
              postId: post.id,
              actorId: userId,
              recipientId: post.userId,
            },
          });
        }

        return success(reply, { liked: true }, "点赞成功");
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "操作失败");
      }
    },
  );

  fastify.delete(
    "/:id/likes",
    {
      schema: {
        description: "Unlike a post",
        tags: ["post"],
        security: [{ bearerAuth: [] }],
        params: { type: "object", properties: { id: { type: "string" } } },
      },
    },
    async (request, reply) => {
      const { userId } = await request.jwtVerify();
      const postId = request.params.id;

      try {
        const existingLike = await db.like.findUnique({
          where: { userId_postId: { userId, postId } },
        });

        if (!existingLike) {
          return notFound(reply, "点赞记录不存在");
        }

        await db.like.delete({ where: { id: existingLike.id } });
        await db.post.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } },
        });

        return noContent(reply);
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "操作失败", "OPERATION_FAILED");
      }
    },
  );

  fastify.post(
    "/:id/reposts",
    {
      schema: {
        description: "Repost a post",
        tags: ["post"],
        security: [{ bearerAuth: [] }],
        params: { type: "object", properties: { id: { type: "string" } } },
      },
    },
    async (request, reply) => {
      const { userId } = await request.jwtVerify();
      const postId = request.params.id;

      try {
        const existingRepost = await db.repost.findUnique({
          where: { userId_postId: { userId, postId } },
        });

        if (existingRepost) {
          return conflict(reply, "已经转发过");
        }

        await db.repost.create({ data: { userId, postId } });
        const post = await db.post.update({
          where: { id: postId },
          data: { repostsCount: { increment: 1 } },
        });

        if (post.userId !== userId) {
          await db.notification.create({
            data: {
              type: "REPOST",
              postId: post.id,
              actorId: userId,
              recipientId: post.userId,
            },
          });
        }

        return success(reply, { reposted: true }, "转发成功");
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "操作失败", "OPERATION_FAILED");
      }
    },
  );

  fastify.delete(
    "/:id/reposts",
    {
      schema: {
        description: "Unrepost a post",
        tags: ["post"],
        security: [{ bearerAuth: [] }],
        params: { type: "object", properties: { id: { type: "string" } } },
      },
    },
    async (request, reply) => {
      const { userId } = await request.jwtVerify();
      const postId = request.params.id;

      try {
        const existingRepost = await db.repost.findUnique({
          where: { userId_postId: { userId, postId } },
        });

        if (!existingRepost) {
          return notFound(reply, "转发记录不存在");
        }

        await db.repost.delete({ where: { id: existingRepost.id } });
        await db.post.update({
          where: { id: postId },
          data: { repostsCount: { decrement: 1 } },
        });

        return noContent(reply);
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "操作失败", "OPERATION_FAILED");
      }
    },
  );

  fastify.get(
    "/:id/replies",
    {
      schema: {
        description: "Get post replies",
        tags: ["post"],
        params: { type: "object", properties: { id: { type: "string" } } },
      },
    },
    async (request, reply) => {
      const postId = request.params.id;
      const userId = await optionalAuth(request);

      try {
        const parentPost = await db.post.findUnique({
          where: { id: postId },
          include: { user: true },
        });

        const replies = await db.post.findMany({
          where: { parentId: postId },
          orderBy: { createdAt: "asc" },
          include: {
            user: true,
            likes: userId ? { where: { userId } } : false,
            reposts: userId ? { where: { userId } } : false,
          },
        });

        const formattedReplies = replies.map((r) => {
          const formatted = formatPost(r, userId);
          if (parentPost) {
            formatted.parent_post = {
              ...parentPost,
              author: {
                id: parentPost.user.id,
                username: parentPost.user.username,
                handle: parentPost.user.handle,
                avatar: parentPost.user.avatar,
              },
            };
          }
          return formatted;
        });

        return paginated(reply, formattedReplies, formattedReplies.length);
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "获取回复失败");
      }
    },
  );

  fastify.get(
    "/:id",
    {
      schema: {
        description: "Get a single post by ID",
        tags: ["post"],
        params: { type: "object", properties: { id: { type: "string" } } },
      },
    },
    async (request, reply) => {
      const postId = request.params.id;
      const userId = await optionalAuth(request);

      try {
        const post = await db.post.findUnique({
          where: { id: postId },
          include: {
            user: true,
            likes: userId ? { where: { userId } } : false,
            reposts: userId ? { where: { userId } } : false,
            parent: {
              include: {
                user: true,
                likes: userId ? { where: { userId } } : false,
                reposts: userId ? { where: { userId } } : false,
              },
            },
          },
        });

        if (!post) {
          return notFound(reply, "帖子不存在");
        }

        const response = formatPost(post, userId);
        if (post.parent) {
          response.parent_post = formatPost(post.parent, userId);
        }

        return success(reply, response);
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "服务器内部错误");
      }
    },
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        description: "Delete a post",
        tags: ["post"],
        security: [{ bearerAuth: [] }],
        params: { type: "object", properties: { id: { type: "string" } } },
      },
    },
    async (request, reply) => {
      try {
        const { userId } = await request.jwtVerify();
        const postId = request.params.id;

        const post = await db.post.findUnique({ where: { id: postId } });

        if (!post) {
          return notFound(reply, "帖子不存在", "POST_NOT_FOUND");
        }

        if (post.userId !== userId) {
          return forbidden(reply, "无权删除此帖子");
        }

        await db.post.delete({ where: { id: postId } });
        return noContent(reply);
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "服务器内部错误");
      }
    },
  );

  fastify.post("/:id/like", async (request, reply) => {
    const { userId } = await request.jwtVerify();
    const postId = request.params.id;

    try {
      const existingLike = await db.like.findUnique({
        where: { userId_postId: { userId, postId } },
      });

      if (existingLike) {
        await db.like.delete({ where: { id: existingLike.id } });
        await db.post.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } },
        });
        return success(reply, { liked: false }, "取消点赞成功");
      } else {
        await db.like.create({ data: { userId, postId } });
        const post = await db.post.update({
          where: { id: postId },
          data: { likesCount: { increment: 1 } },
        });

        if (post.userId !== userId) {
          await db.notification.create({
            data: {
              type: "LIKE",
              postId: post.id,
              actorId: userId,
              recipientId: post.userId,
            },
          });
        }
        return success(reply, { liked: true }, "点赞成功");
      }
    } catch (err) {
      return error(reply, "操作失败", "OPERATION_FAILED");
    }
  });

  fastify.post("/:id/repost", async (request, reply) => {
    const { userId } = await request.jwtVerify();
    const postId = request.params.id;

    try {
      const existingRepost = await db.repost.findUnique({
        where: { userId_postId: { userId, postId } },
      });

      if (existingRepost) {
        await db.repost.delete({ where: { id: existingRepost.id } });
        await db.post.update({
          where: { id: postId },
          data: { repostsCount: { decrement: 1 } },
        });
        return success(reply, { reposted: false }, "取消转发成功");
      } else {
        await db.repost.create({ data: { userId, postId } });
        const post = await db.post.update({
          where: { id: postId },
          data: { repostsCount: { increment: 1 } },
        });

        if (post.userId !== userId) {
          await db.notification.create({
            data: {
              type: "REPOST",
              postId: post.id,
              actorId: userId,
              recipientId: post.userId,
            },
          });
        }
        return success(reply, { reposted: true }, "转发成功");
      }
    } catch (err) {
      return error(reply, "操作失败", "OPERATION_FAILED");
    }
  });
};

module.exports = postRoutes;
