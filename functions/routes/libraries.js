const { router, wrapRoute } = require("../router");
const { parseFormData } = require("../middleware/parseFormData");
const createPullRequest = require("../util/createPullRequest");

async function parseData(params) {
  const {
    excalidrawLib: lib,
    excalidrawPng, // legacy
    previewImage,
    previewImageType,
    ...rest
  } = params;
  return {
    excalidrawLib: lib.toString(),
    previewImage: (previewImage || excalidrawPng).toString("base64"),
    previewImageType: previewImageType || "image/png",
    ...rest,
  };
}

router.post(
  "/submit",
  parseFormData({
    allowedFields: [
      "excalidrawLib",
      "excalidrawPng", // legacy
      "previewImage",
      "previewImageType",
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
