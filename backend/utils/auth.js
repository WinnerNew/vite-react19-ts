const optionalAuth = async (request) => {
  try {
    const decoded = await request.jwtVerify();
    return decoded.userId;
  } catch (e) {
    return null;
  }
};

const requiredAuth = async (request, reply) => {
  try {
    const decoded = await request.jwtVerify();
    return decoded.userId;
  } catch (error) {
    reply.code(401).send({ error: "Unauthorized", code: "UNAUTHORIZED" });
    return null;
  }
};

const authMiddleware = async (request, reply) => {
  const userId = await requiredAuth(request, reply);
  if (!userId) {
    return reply;
  }
  return userId;
};

module.exports = {
  optionalAuth,
  requiredAuth,
  authMiddleware,
};
