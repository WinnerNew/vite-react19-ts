const db = require("../db");

const postRoutes = async (fastify, options) => {
  // 创建帖子或回复
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
            parentId: { type: "string", nullable: true },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { userId } = await request.jwtVerify();
        const { content, image, parentId } = request.body;

        const post = await db.post.create({
          data: {
            content,
            image,
            userId,
            parentId,
          },
        });

        // 如果是回复，更新父帖子的回复计数并创建通知
        if (parentId) {
          const parentPost = await db.post.update({
            where: { id: parentId },
            data: { repliesCount: { increment: 1 } },
          });

          // 创建通知
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

        const user = await db.user.findUnique({ where: { id: userId } });
        return {
          ...post,
          author: {
            id: user.id,
            username: user.username,
            handle: user.handle,
            avatar: user.avatar,
          },
          timestamp: "刚刚",
          likesCount: 0,
          repostsCount: 0,
          repliesCount: 0,
          isLiked: false,
          isReposted: false,
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ msg: "服务器内部错误" });
      }
    },
  );

  // 搜索帖子
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
          },
        },
      },
    },
    async (request, reply) => {
      const { q } = request.query;
      if (!q) return { posts: [] };

      let userId = null;
      try {
        const decoded = await request.jwtVerify();
        userId = decoded.userId;
      } catch (e) {}

      try {
        const posts = await db.post.findMany({
          where: {
            content: { contains: q },
            parentId: null, // 仅搜索顶层帖子
          },
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            user: true,
            likes: userId ? { where: { userId } } : false,
            reposts: userId ? { where: { userId } } : false,
          },
        });

        const formattedPosts = posts.map((post) => ({
          ...post,
          author: {
            id: post.user.id,
            username: post.user.username,
            handle: post.user.handle,
            avatar: post.user.avatar,
          },
          timestamp: formatTimestamp(post.createdAt),
          isLiked: userId ? post.likes?.length > 0 : false,
          isReposted: userId ? post.reposts?.length > 0 : false,
        }));

        return { posts: formattedPosts };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ msg: "搜索失败" });
      }
    },
  );

  // 获取帖子列表 (带点赞/转发状态)
  fastify.get("/", async (request, reply) => {
    const { limit = 20, offset = 0, type = "FOR_YOU" } = request.query;
    let userId = null;
    try {
      const decoded = await request.jwtVerify();
      userId = decoded.userId;
    } catch (e) {}

    try {
      const where = { parentId: null };

      // 如果是关注列表，筛选关注的人
      if (type === "FOLLOWING" && userId) {
        const following = await db.follow.findMany({
          where: { followerId: userId },
          select: { followingId: true },
        });
        const followingIds = following.map((f) => f.followingId);
        where.userId = { in: [...followingIds, userId] }; // 包含自己
      }

      const posts = await db.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: parseInt(limit),
        skip: parseInt(offset),
        include: {
          user: true,
          likes: userId ? { where: { userId } } : false,
          reposts: userId ? { where: { userId } } : false,
          parent: {
            include: {
              user: true,
            },
          },
        },
      });

      const formattedPosts = posts.map((post) => {
        const formatted = {
          ...post,
          author: {
            id: post.user.id,
            username: post.user.username,
            handle: post.user.handle,
            avatar: post.user.avatar,
          },
          timestamp: formatTimestamp(post.createdAt),
          isLiked: post.likes?.length > 0,
          isReposted: post.reposts?.length > 0,
        };
        if (post.parent) {
          formatted.parentPost = {
            ...post.parent,
            author: {
              id: post.parent.user.id,
              username: post.parent.user.username,
              handle: post.parent.user.handle,
              avatar: post.parent.user.avatar,
            },
          };
        }
        return formatted;
      });

      return {
        posts: formattedPosts,
        total: await db.post.count({ where }),
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ msg: "服务器内部错误" });
    }
  });

  // 点赞/取消点赞
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
        return { liked: false };
      } else {
        await db.like.create({ data: { userId, postId } });
        const post = await db.post.update({
          where: { id: postId },
          data: { likesCount: { increment: 1 } },
        });

        // 创建通知
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
        return { liked: true };
      }
    } catch (error) {
      return reply.code(500).send({ msg: "操作失败" });
    }
  });

  // 转发/取消转发
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
        return { reposted: false };
      } else {
        await db.repost.create({ data: { userId, postId } });
        const post = await db.post.update({
          where: { id: postId },
          data: { repostsCount: { increment: 1 } },
        });

        // 创建通知
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
        return { reposted: true };
      }
    } catch (error) {
      return reply.code(500).send({ msg: "操作失败" });
    }
  });

  // 获取帖子回复
  fastify.get("/:id/replies", async (request, reply) => {
    const postId = request.params.id;
    let userId = null;
    try {
      const decoded = await request.jwtVerify();
      userId = decoded.userId;
    } catch (e) {}

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

      return replies.map((r) => {
        const formatted = {
          ...r,
          author: {
            id: r.user.id,
            username: r.user.username,
            handle: r.user.handle,
            avatar: r.user.avatar,
          },
          timestamp: formatTimestamp(r.createdAt),
          isLiked: userId ? r.likes?.length > 0 : false,
          isReposted: userId ? r.reposts?.length > 0 : false,
        };
        if (parentPost) {
          formatted.parentPost = {
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
    } catch (error) {
      return reply.code(500).send({ msg: "获取失败" });
    }
  });

  // 获取单个帖子详情
  fastify.get("/:id", async (request, reply) => {
    const postId = request.params.id;
    let userId = null;
    try {
      const decoded = await request.jwtVerify();
      userId = decoded.userId;
    } catch (e) {}

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
        return reply.code(404).send({ msg: "帖子未找到" });
      }

      const formatSinglePost = (p) => ({
        ...p,
        author: {
          id: p.user.id,
          username: p.user.username,
          handle: p.user.handle,
          avatar: p.user.avatar,
        },
        timestamp: formatTimestamp(p.createdAt),
        fullTimestamp: new Date(p.createdAt).toLocaleString(),
        isLiked: userId ? p.likes?.length > 0 : false,
        isReposted: userId ? p.reposts?.length > 0 : false,
      });

      const response = formatSinglePost(post);
      if (post.parent) {
        response.parentPost = formatSinglePost(post.parent);
      }

      return response;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ msg: "服务器内部错误" });
    }
  });
};

function formatTimestamp(date) {
  const now = new Date();
  const diff = (now - new Date(date)) / 1000;
  if (diff < 60) return "刚刚";
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  return new Date(date).toLocaleDateString();
}

module.exports = postRoutes;
