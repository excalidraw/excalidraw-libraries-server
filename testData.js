const fs = require("fs");

//Test data
const excalidrawLib = fs.readFileSync("test-draw.excalidrawlib", "utf8");
const pngContent = fs.readFileSync("test-draw.png", "binary");
const buffer = Buffer.from(pngContent, "binary");
const excalidrawPng = buffer.toString("base64");
const testData = {
  title: "Automated excalidraw libs",
  authorName: "excalibot",
  githubHandle: "excalibot",
  name: "automating-libs",
  description: "Adding automated excalidraw libs",
  excalidrawLib,
  excalidrawPng,
};

module.exports = {
  testData,
};
