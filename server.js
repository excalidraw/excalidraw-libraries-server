const express = require("express");
const multer = require("multer");
const createPullRequest = require("./createPullRequest");
const app = express();
const PORT = 3001;
const upload = multer();

if (process.env.NODE_ENV === "development") {
  app.use("/", express.static("public"));
} else {
  app.get("/", (req, res) => {
    res.send("Server is up!");
  });
}

const acceptedFields = [
  {
    name: "excalidrawLib",
    maxCount: 1,
  },
  {
    name: "excalidrawPng",
    maxCount: 1,
  },
  {
    name: "title",
    maxCount: 1,
  },
  {
    name: "authorName",
    maxCount: 1,
  },
  {
    name: "githubHandle",
    maxCount: 1,
  },
  {
    name: "name",
    maxCount: 1,
  },
  {
    name: "description",
    maxCount: 1,
  },
];

function parseData(params) {
  const { excalidrawLib: lib, excalidrawPng: png, ...rest } = params;
  const excalidrawLib = lib[0].buffer.toString();
  const excalidrawPng = png[0].buffer.toString("base64");
  const data = {
    excalidrawLib,
    excalidrawPng,
    ...rest,
  };
  createPullRequest(data);
}

app.post("/libraries/publish", upload.fields(acceptedFields), (req, res) => {
  parseData({ ...req.body, ...req.files });
  res.send({ status: 200 });
});

app.listen(PORT, () => {
  console.log(`Server start at http://localhost:${PORT}`);
});
