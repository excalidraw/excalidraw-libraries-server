const { Octokit } = require("@octokit/core");
const {
  createPullRequest: octokitPluginCreatePR,
} = require("octokit-plugin-create-pull-request");

const createPullRequest = async ({
  title,
  authorName,
  githubHandle,
  name,
  description,
  excalidrawLib,
  excalidrawPng,
}) => {
  const MyOctokit = Octokit.plugin(octokitPluginCreatePR);
  const octokit = new MyOctokit({
    auth: process.env.GH_TOKEN,
  });

  const owner = "excalidraw",
    repo = "excalidraw-libraries",
    head = `${githubHandle}-${name}`,
    base = "main";

  const excalidrawLibPath = `libraries/${authorName}/${name}.excalidrawlib`;
  const pngPath = `libraries/${authorName}/${name}.png`;
  const commit = `Added ${title}`;
  try {
    const response = await octokit.createPullRequest({
      owner,
      repo,
      title,
      body: description,
      base,
      head,
      changes: [
        {
          files: {
            "libraries.json": ({ exists, encoding, content }) => {
              if (!exists) return null;

              const url = `https://github.com/${githubHandle}`;
              const source = `${authorName}/${name}.excalidrawlib`;
              const preview = `${authorName}/${name}.png`;
              const fileContent = {
                name,
                description,
                authors: [
                  {
                    name: authorName,
                    url,
                  },
                ],
                source,
                preview,
                date: getTodayDate(),
              };
              const existingContent = JSON.parse(
                Buffer.from(content, encoding).toString("utf-8"),
              );
              existingContent.push(fileContent);
              const res = `${JSON.stringify(existingContent, null, 2)}\n`;
              return res;
            },
            [excalidrawLibPath]: {
              content: excalidrawLib,
            },
            [pngPath]: {
              content: excalidrawPng,
              encoding: "base64",
            },
          },
          commit,
        },
      ],
    });
    return response.data;
  } catch (err) {
    console.error("error", err);
    throw err;
  }
};

const getTodayDate = () => {
  // Returns year-mm-dd
  return new Date().toISOString().slice(0, 10);
};

module.exports = createPullRequest;
