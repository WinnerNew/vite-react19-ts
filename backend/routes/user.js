const db = require("../db");

const userRoutes = async (fastify, options) => {
  // 搜索用户
  fastify.get(
    "/search",
    {
      schema: {
        description: "Search users by username or handle",
        tags: ["user"],
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
      if (!q) return { users: [] };

      try {
        const users = await db.user.findMany({
          where: {
            OR: [{ username: { contains: q } }, { handle: { contains: q } }],
          },
          take: 10,
          select: {
            id: true,
            username: true,
            handle: true,
            avatar: true,
            bio: true,
          },
        });
        return { users };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ msg: "搜索失败" });
      }
    },
  );

  // 获取推荐关注用户
  fastify.get(
    "/suggestions",
    {
      schema: {
        description: "Get user follow suggestions",
        tags: ["user"],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      let userId = null;
      try {
        const decoded = await request.jwtVerify();
        userId = decoded.userId;
      } catch (e) {}

      try {
        // 简单的逻辑：获取最新的用户，排除掉自己和已经关注的人
        const following = userId
          ? await db.follow.findMany({
              where: { followerId: userId },
              select: { followingId: true },
            })
          : [];
        const followingIds = following.map((f) => f.followingId);

        const users = await db.user.findMany({
          where: {
            id: {
              notIn: userId ? [...followingIds, userId] : [],
            },
          },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            username: true,
            handle: true,
            avatar: true,
          },
        });
        return { users };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ msg: "获取推荐失败" });
      }
    },
  );

  // 获取指定用户信息
  fastify.get(
    "/:id",
    {
      schema: {
        description: "Get user profile by ID",
        tags: ["user"],
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "User ID",
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
                  isFollowing: {
                    type: "boolean",
                  },
                  createdAt: {
                    type: "string",
                    format: "date-time",
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
      let currentUserId = null;
      try {
        const decoded = await request.jwtVerify();
        currentUserId = decoded.userId;
      } catch (e) {}

      try {
        const user = await db.user.findUnique({
          where: { id },
          include: {
            _count: {
              select: {
                followersList: true,
                followingList: true,
              },
            },
            followersList: currentUserId
              ? {
                  where: {
                    followerId: currentUserId,
                  },
                }
              : false,
          },
        });

        if (!user) {
          return reply.code(404).send({ msg: "用户未找到" });
        }

        // 过滤掉密码字段并添加关注状态
        const { password: _, ...userWithoutPassword } = user;
        const formattedUser = {
          ...userWithoutPassword,
          followers: user._count.followersList,
          following: user._count.followingList,
          isFollowing: currentUserId ? user.followersList?.length > 0 : false,
          createdAt: user.createdAt.toISOString(),
        };

        return reply.send({ user: formattedUser });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ msg: "服务器内部错误" });
      }
    },
  );

  // 获取粉丝列表
  fastify.get(
    "/:id/followers",
    {
      schema: {
        description: "Get user followers",
        tags: ["user"],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      let currentUserId = null;
      try {
        const decoded = await request.jwtVerify();
        currentUserId = decoded.userId;
      } catch (e) {}

      try {
        const follows = await db.follow.findMany({
          where: { followingId: id },
          include: {
            follower: {
              select: {
                id: true,
                username: true,
                handle: true,
                avatar: true,
                bio: true,
                followersList: currentUserId
                  ? {
                      where: { followerId: currentUserId },
                    }
                  : false,
              },
            },
          },
        });

        const users = follows.map((f) => ({
          ...f.follower,
          isFollowing: currentUserId
            ? f.follower.followersList?.length > 0
            : false,
        }));

        return { users };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ msg: "获取粉丝列表失败" });
      }
    },
  );

  // 获取关注列表
  fastify.get(
    "/:id/following",
    {
      schema: {
        description: "Get user following",
        tags: ["user"],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      let currentUserId = null;
      try {
        const decoded = await request.jwtVerify();
        currentUserId = decoded.userId;
      } catch (e) {}

      try {
        const follows = await db.follow.findMany({
          where: { followerId: id },
          include: {
            following: {
              select: {
                id: true,
                username: true,
                handle: true,
                avatar: true,
                bio: true,
                followersList: currentUserId
                  ? {
                      where: { followerId: currentUserId },
                    }
                  : false,
              },
            },
          },
        });

        const users = follows.map((f) => ({
          ...f.following,
          isFollowing: currentUserId
            ? f.following.followersList?.length > 0
            : false,
        }));

        return { users };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ msg: "获取关注列表失败" });
      }
    },
  );

  // 关注/取消关注用户
  fastify.post(
    "/:id/follow",
    {
      schema: {
        description: "Follow or unfollow a user",
        tags: ["user"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { userId: followerId } = await request.jwtVerify();
        const { id: followingId } = request.params;

        if (followerId === followingId) {
          return reply.code(400).send({ msg: "不能关注自己" });
        }

        const existingFollow = await db.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId,
              followingId,
            },
          },
        });

        if (existingFollow) {
          // 取消关注
          await db.follow.delete({
            where: { id: existingFollow.id },
          });
          // 更新计数
          await db.user.update({
            where: { id: followerId },
            data: { following: { decrement: 1 } },
          });
          await db.user.update({
            where: { id: followingId },
            data: { followers: { decrement: 1 } },
          });
          return { followed: false };
        } else {
          // 关注
          await db.follow.create({
            data: {
              followerId,
              followingId,
            },
          });
          // 创建通知
          await db.notification.create({
            data: {
              type: "FOLLOW",
              actorId: followerId,
              recipientId: followingId,
            },
          });
          // 更新计数
          await db.user.update({
            where: { id: followerId },
            data: { following: { increment: 1 } },
          });
          await db.user.update({
            where: { id: followingId },
            data: { followers: { increment: 1 } },
          });
          return { followed: true };
        }
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ msg: "操作失败" });
      }
    },
  );

  // 更新用户资料
  fastify.put(
    "/profile",
    {
      schema: {
        description: "Update user profile",
        tags: ["user"],
        security: [
          {
            bearerAuth: [],
          },
        ],
        body: {
          type: "object",
          properties: {
            username: {
              type: "string",
              nullable: true,
              description: "Username of the user",
            },
            bio: {
              type: "string",
              nullable: true,
              description: "Bio of the user",
            },
            location: {
              type: "string",
              nullable: true,
              description: "Location of the user",
            },
            website: {
              type: "string",
              nullable: true,
              description: "Website of the user",
            },
            avatar: {
              type: "string",
              nullable: true,
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
                  createdAt: {
                    type: "string",
                    format: "date-time",
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
        const { username, bio, location, website, avatar } = request.body;

        // 更新用户资料
        const user = await db.user.update({
          where: { id: userId },
          data: {
            username,
            bio,
            location,
            website,
            avatar,
          },
        });

        // 过滤掉密码字段
        const { password: _, ...userWithoutPassword } = user;

        return reply.send({
          user: {
            ...userWithoutPassword,
            createdAt: user.createdAt.toISOString(),
          },
        });
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

  // 获取用户的帖子
  fastify.get(
    "/:id/posts",
    {
      schema: {
        description: "Get posts by user ID",
        tags: ["user"],
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "User ID",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              posts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                    },
                    content: {
                      type: "string",
                    },
                    image: {
                      type: "string",
                      nullable: true,
                    },
                    likesCount: {
                      type: "integer",
                    },
                    repostsCount: {
                      type: "integer",
                    },
                    repliesCount: {
                      type: "integer",
                    },
                    userId: {
                      type: "string",
                    },
                    createdAt: {
                      type: "string",
                    },
                    updatedAt: {
                      type: "string",
                    },
                    timestamp: {
                      type: "string",
                    },
                    isLiked: {
                      type: "boolean",
                    },
                    isReposted: {
                      type: "boolean",
                    },
                    author: {
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
      let currentUserId = null;
      try {
        const decoded = await request.jwtVerify();
        currentUserId = decoded.userId;
      } catch (e) {}

      try {
        const posts = await db.post.findMany({
          where: { userId: id, parentId: null },
          orderBy: { createdAt: "desc" },
          include: {
            user: true,
            likes: currentUserId ? { where: { userId: currentUserId } } : false,
            reposts: currentUserId
              ? { where: { userId: currentUserId } }
              : false,
          },
        });

        // 格式化帖子
        const formattedPosts = posts.map((post) => ({
          ...post,
          author: {
            id: post.user.id,
            username: post.user.username,
            handle: post.user.handle,
            avatar: post.user.avatar,
          },
          timestamp: formatTimestamp(post.createdAt),
          isLiked: currentUserId ? post.likes?.length > 0 : false,
          isReposted: currentUserId ? post.reposts?.length > 0 : false,
        }));

        return reply.send({ posts: formattedPosts });
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
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  return new Date(date).toLocaleDateString();
}

module.exports = userRoutes;
