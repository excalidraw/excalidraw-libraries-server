const { Router } = require("express");
const { RequestError } = require("./util/errors");

module.exports.router = new Router();

module.exports.wrapRoute = (handler) => {
  return async (req, res) => {
    try {
      const ret = await handler(req);
      return res.send(ret || {});
    } catch (error) {
      if (error instanceof RequestError) {
        return res.status(error.status).send(error);
      }
      console.error(error);
      return res.status(500).send(
        new RequestError({
          status: 500,
          message: "Oops... something went wrong!",
        }),
      );
    }
  };
};
