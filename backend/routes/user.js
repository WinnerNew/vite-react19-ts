const db = require("../db");
const {
  formatUser,
  formatPost,
  optionalAuth,
  success,
  error,
  notFound,
  badRequest,
  paginated,
} = require("../utils");

const userRoutes = async (fastify, options) => {
  fastify.get(
    "/",
    {
      schema: {
        description: "Search users by username or handle",
        tags: ["user"],
        querystring: {
          type: "object",
          properties: {
            search: { type: "string", description: "Search query" },
            limit: { type: "integer", default: 10 },
          },
        },
      },
    },
    async (request, reply) => {
      const { search, limit = 10 } = request.query;
      if (!search) return success(reply, { items: [], total: 0 });

      try {
        const users = await db.user.findMany({
          where: {
            OR: [
              { username: { contains: search } },
              { handle: { contains: search } },
            ],
          },
          take: limit,
          select: {
            id: true,
            username: true,
            handle: true,
            avatar: true,
            bio: true,
          },
        });
        return paginated(reply, users, users.length);
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "搜索失败");
      }
    },
  );

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
      const userId = await optionalAuth(request);

      try {
        const following = userId
          ? await db.follow.findMany({
              where: { followerId: userId },
              select: { followingId: true },
            })
          : [];
        const followingIds = following.map((f) => f.followingId);

        const users = await db.user.findMany({
          where: { id: { notIn: userId ? [...followingIds, userId] : [] } },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { id: true, username: true, handle: true, avatar: true },
        });
        return success(reply, { items: users, total: users.length });
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "获取推荐用户失败");
      }
    },
  );

  fastify.get(
    "/:id",
    {
      schema: {
        description: "Get user profile by ID",
        tags: ["user"],
        params: {
          type: "object",
          properties: { id: { type: "string", description: "User ID" } },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const currentUserId = await optionalAuth(request);

      try {
        const user = await db.user.findUnique({
          where: { id },
          include: {
            _count: { select: { followersList: true, followingList: true } },
            followersList: currentUserId
              ? { where: { followerId: currentUserId } }
              : false,
          },
        });

        if (!user) {
          return notFound(reply, "用户不存在");
        }

        const formattedUser = {
          ...formatUser(user),
          followers: user._count.followersList,
          following: user._count.followingList,
          is_following: currentUserId ? user.followersList?.length > 0 : false,
        };

        return success(reply, formattedUser);
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "服务器内部错误");
      }
    },
  );

  fastify.get(
    "/:id/followers",
    {
      schema: {
        description: "Get user followers",
        tags: ["user"],
        params: { type: "object", properties: { id: { type: "string" } } },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const currentUserId = await optionalAuth(request);

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
                  ? { where: { followerId: currentUserId } }
                  : false,
              },
            },
          },
        });

        const users = follows.map((f) => ({
          ...f.follower,
          is_following: currentUserId
            ? f.follower.followersList?.length > 0
            : false,
        }));

        return paginated(reply, users, users.length);
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "获取粉丝列表失败");
      }
    },
  );

  fastify.get(
    "/:id/following",
    {
      schema: {
        description: "Get user following",
        tags: ["user"],
        params: { type: "object", properties: { id: { type: "string" } } },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const currentUserId = await optionalAuth(request);

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
                  ? { where: { followerId: currentUserId } }
                  : false,
              },
            },
          },
        });

        const users = follows.map((f) => ({
          ...f.following,
          is_following: currentUserId
            ? f.following.followersList?.length > 0
            : false,
        }));

        return paginated(reply, users, users.length);
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "获取关注列表失败");
      }
    },
  );

  fastify.post(
    "/:id/follow",
    {
      schema: {
        description: "Follow or unfollow a user",
        tags: ["user"],
        security: [{ bearerAuth: [] }],
        params: { type: "object", properties: { id: { type: "string" } } },
      },
    },
    async (request, reply) => {
      try {
        const { userId: followerId } = await request.jwtVerify();
        const { id: followingId } = request.params;

        if (followerId === followingId) {
          return badRequest(reply, "不能关注自己");
        }

        const existingFollow = await db.follow.findUnique({
          where: { followerId_followingId: { followerId, followingId } },
        });

        if (existingFollow) {
          await db.follow.delete({ where: { id: existingFollow.id } });
          await db.user.update({
            where: { id: followerId },
            data: { following: { decrement: 1 } },
          });
          await db.user.update({
            where: { id: followingId },
            data: { followers: { decrement: 1 } },
          });
          return success(reply, { followed: false }, "取消关注成功");
        } else {
          await db.follow.create({ data: { followerId, followingId } });
          await db.notification.create({
            data: {
              type: "FOLLOW",
              actorId: followerId,
              recipientId: followingId,
            },
          });
          await db.user.update({
            where: { id: followerId },
            data: { following: { increment: 1 } },
          });
          await db.user.update({
            where: { id: followingId },
            data: { followers: { increment: 1 } },
          });
          return success(reply, { followed: true }, "关注成功");
        }
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "操作失败");
      }
    },
  );

  fastify.patch(
    "/me",
    {
      schema: {
        description: "Update user profile",
        tags: ["user"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            username: { type: "string", nullable: true },
            bio: { type: "string", nullable: true },
            location: { type: "string", nullable: true },
            website: { type: "string", nullable: true },
            avatar: { type: "string", nullable: true },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { userId } = await request.jwtVerify();
        const { username, bio, location, website, avatar } = request.body;

        const user = await db.user.update({
          where: { id: userId },
          data: { username, bio, location, website, avatar },
        });

        return success(reply, formatUser(user), "更新成功");
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "服务器内部错误");
      }
    },
  );

  fastify.get(
    "/:id/posts",
    {
      schema: {
        description: "Get posts by user ID",
        tags: ["user"],
        params: {
          type: "object",
          properties: { id: { type: "string", description: "User ID" } },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const currentUserId = await optionalAuth(request);

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

        const formattedPosts = posts.map((post) =>
          formatPost(post, currentUserId),
        );
        return paginated(reply, formattedPosts, formattedPosts.length);
      } catch (err) {
        fastify.log.error(err);
        return error(reply, "服务器内部错误");
      }
    },
  );

  fastify.get("/search", async (request, reply) => {
    const { q } = request.query;
    if (!q) return success(reply, { items: [], total: 0 });

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
      return paginated(reply, users, users.length);
    } catch (err) {
      fastify.log.error(err);
      return error(reply, "搜索失败", "SEARCH_FAILED");
    }
  });

  fastify.put("/profile", async (request, reply) => {
    try {
      const { userId } = await request.jwtVerify();
      const { username, bio, location, website, avatar } = request.body;

      const user = await db.user.update({
        where: { id: userId },
        data: { username, bio, location, website, avatar },
      });

      return success(reply, formatUser(user), "更新成功");
    } catch (err) {
      fastify.log.error(err);
      return error(reply, "服务器内部错误");
    }
  });
};

module.exports = userRoutes;
