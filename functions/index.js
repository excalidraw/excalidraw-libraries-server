const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { statSync } = require("fs");
const path = require("path");

if (process.env.NODE_ENV === "development") {
  const localEnvPath = path.resolve(__dirname, "../.env.local");
  if (statSync(localEnvPath)) {
    require("dotenv").config({ path: localEnvPath });
  }
}

// load routes
// -----------------------------------------------------------------------------
const { router } = require("./router");
require("./routes/libraries");
// -----------------------------------------------------------------------------

const app = express();

// allow cross-origin requests
app.use(cors({ origin: true }));

if (process.env.NODE_ENV === "development") {
  router.use("/", express.static("public"));
} else {
  try {
    process.env.GH_TOKEN = functions.config().github.gh_token;
  } catch (error) {
    console.error(error);
  }
  router.get("/", (req, res) => {
    res.send("Server is up!");
  });
}

app.use(router);

exports.libraries = functions.https.onRequest(app);

console.log("ready");
