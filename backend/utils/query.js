const getPagination = (query, defaultLimit = 20) => {
  const limit = Math.min(parseInt(query.limit) || defaultLimit, 100);
  const offset = parseInt(query.offset) || 0;
  return { limit, offset };
};

const getSearchQuery = (query, field = "q") => {
  return query[field] || "";
};

const buildUserWhere = (search) => {
  if (!search) return {};
  return {
    OR: [
      { username: { contains: search } },
      { handle: { contains: search } },
    ],
  };
};

const buildPostWhere = (search, userId = null, followingIds = null) => {
  const where = { parentId: null };
  
  if (search) {
    where.content = { contains: search };
  }
  
  if (followingIds && userId) {
    where.userId = { in: [...followingIds, userId] };
  }
  
  return where;
};

module.exports = {
  getPagination,
  getSearchQuery,
  buildUserWhere,
  buildPostWhere,
};
