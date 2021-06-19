const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

require("dotenv").config();

// load routes
// -----------------------------------------------------------------------------
const { router } = require("./router");

require("./routes/libraries");
// -----------------------------------------------------------------------------

const app = express();

// allow cross-origin requests
app.use(cors({ origin: true }));

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

app.use(router);

exports.api = functions.https.onRequest(app);
