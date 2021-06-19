const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const createPullRequest = require("./createPullRequest");

const Busboy = require("busboy");

const app = express();

// allow cross-origin requests
app.use(cors({ origin: true }));

require("dotenv").config();

if (process.env.NODE_ENV === "development") {
  app.use("/", express.static("public"));
} else {
  try {
    process.env.GH_TOKEN = functions.config().github.gh_token;
  } catch (error) {
    console.error(error);
  }
  app.get("/", (req, res) => {
    res.send("Server is up!");
  });
}

async function parseData(params) {
  const { excalidrawLib: lib, excalidrawPng: png, ...rest } = params;
  console.log({ lib });
  const excalidrawLib = `${lib.toString()}\n`;
  const excalidrawPng = png.toString("base64");
  return {
    excalidrawLib,
    excalidrawPng,
    ...rest,
  };
}

async function streamTobuffer(readableStream) {
  const chunks = [];
  for await (let chunk of readableStream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

const allowedFields = [
  "excalidrawLib",
  "excalidrawPng",
  "title",
  "authorName",
  "githubHandle",
  "name",
  "description",
];

app.post("/libraries/publish", async (req, res, next) => {
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
          streamTobuffer(readStream).then((buffer) => {
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

        const missingFields = allowedFields.filter((field) => !data.has(field));
        if (missingFields.length) {
          return reject(
            new Error(`missing fields: "${missingFields.join(`", "`)}"`),
          );
        }
        resolve(Object.fromEntries(data));
      });

      busboy.end(req.rawBody);
    });

    const data = await parseData(payload);
    const result = await createPullRequest(data);
    res.send({ status: 200, url: result.html_url });
  } catch (error) {
    return next(error);
  }
});

exports.api = functions.https.onRequest(app);
