const SUCCESS_CODE = 20000;

const wrapResponse = (reply, statusCode, message, data = null) => {
  return reply.code(statusCode).send({
    code: SUCCESS_CODE,
    status: statusCode,
    message,
    data,
  });
};

const success = (reply, data, message = "请求成功") => {
  return wrapResponse(reply, 200, message, data);
};

const created = (reply, data, message = "创建成功") => {
  return wrapResponse(reply, 201, message, data);
};

const accepted = (reply, data, message = "请求已接受") => {
  return wrapResponse(reply, 202, message, data);
};

const noContent = (reply) => {
  return reply.code(204).send();
};

const error = (reply, message, statusCode = 500, errors = null) => {
  const response = {
    code: statusCode * 100,
    status: statusCode,
    message,
    data: null,
  };

  if (errors && Array.isArray(errors)) {
    response.data = { errors };
  }

  return reply.code(statusCode).send(response);
};

const badRequest = (reply, message, errors = null) => {
  return error(reply, message, 400, errors);
};

const unauthorized = (reply, message = "授权错误") => {
  return error(reply, message, 401);
};

const forbidden = (reply, message = "操作被拒绝") => {
  return error(reply, message, 403);
};

const notFound = (reply, message = "资源不存在") => {
  return error(reply, message, 404);
};

const conflict = (reply, message) => {
  return error(reply, message, 409);
};

const paginated = (reply, items, total, message = "请求成功") => {
  return wrapResponse(reply, 200, message, {
    items,
    total,
  });
};

const createdWithId = (reply, id, message = "创建成功") => {
  return wrapResponse(reply, 201, message, { id });
};

module.exports = {
  success,
  created,
  createdWithId,
  accepted,
  noContent,
  error,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  paginated,
  wrapResponse,
};
