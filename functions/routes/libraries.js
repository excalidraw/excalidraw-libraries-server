const { router } = require("../router");
const { parseFormData } = require("../middleware/parseFormData");
const createPullRequest = require("../util/createPullRequest");

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

router.post(
  "/libraries/publish",
  parseFormData({
    allowedFields: [
      "excalidrawLib",
      "excalidrawPng",
      "title",
      "authorName",
      "githubHandle",
      "name",
      "description",
    ],
  }),
  async (req, res, next) => {
    const data = await parseData(payload);
    const result = await createPullRequest(data);
    res.send({ status: 200, url: result.html_url });
  },
);
