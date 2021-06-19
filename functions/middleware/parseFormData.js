const Busboy = require("busboy");

async function streamToBuffer(readableStream) {
  const chunks = [];
  for await (let chunk of readableStream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

module.exports.parseFormData =
  ({ allowedFields }) =>
  async (req, res, next) => {
    const busboy = new Busboy({
      headers: req.headers,
    });

    try {
      const payload = await new Promise((resolve, reject) => {
        const data = new Map();

        setTimeout(() => {
          reject(new Error("busboy timed out"));
        }, 2000);

        const filePromises = [];

        busboy.on("field", (fieldname, value) => {
          if (!allowedFields.includes(fieldname)) {
            return reject(new Error(`disallowed field "${fieldname}"`));
          }
          data.set(fieldname, value);
        });

        busboy.on("file", (fieldname, readStream) => {
          if (!allowedFields.includes(fieldname)) {
            return reject(new Error(`disallowed field "${fieldname}"`));
          }

          filePromises.push(
            streamToBuffer(readStream).then((buffer) => {
              data.set(fieldname, buffer);
            }),
          );
        });

        busboy.on("error", (err) => {
          console.error(err);
          reject(new Error("unknown busboy error"));
        });

        busboy.on("finish", async () => {
          await Promise.all(filePromises);

          const missingFields = allowedFields.filter(
            (field) => !data.has(field),
          );
          if (missingFields.length) {
            return reject(
              new Error(`missing fields: "${missingFields.join(`", "`)}"`),
            );
          }
          resolve(Object.fromEntries(data));
        });

        busboy.end(req.rawBody);
      });
      req.body = payload;
      next();
    } catch (error) {
      return next(error);
    }
  };
