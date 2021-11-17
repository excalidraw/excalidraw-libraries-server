const { router, wrapRoute } = require("../router");
const { parseFormData } = require("../middleware/parseFormData");
const createPullRequest = require("../util/createPullRequest");

async function parseData(params) {
  const { excalidrawLib: lib, excalidrawPng: png, ...rest } = params;
  const excalidrawLib = lib.toString();
  const excalidrawPng = png.toString("base64");
  return {
    excalidrawLib,
    excalidrawPng,
    ...rest,
  };
}

router.post(
  "/submit",
  parseFormData({
    allowedFields: [
      "excalidrawLib",
      "excalidrawPng",
      "title",
      "authorName",
      "githubHandle",
      "name",
      "description",
      "twitterHandle",
      "website",
    ],
  }),
  wrapRoute(async (req) => {
    const data = await parseData(req.body);
    const result = await createPullRequest(data);
    return { url: result.html_url };
  }),
);
