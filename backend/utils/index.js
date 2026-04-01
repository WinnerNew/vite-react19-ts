const format = require("./format");
const auth = require("./auth");
const response = require("./response");
const query = require("./query");

module.exports = {
  ...format,
  ...auth,
  ...response,
  ...query,
};
