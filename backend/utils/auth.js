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

module.exports = {
  optionalAuth,
  requiredAuth,
};
