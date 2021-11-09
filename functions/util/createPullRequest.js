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
  twitterHandle,
  website,
}) => {
  const MyOctokit = Octokit.plugin(octokitPluginCreatePR);
  const octokit = new MyOctokit({
    auth: process.env.GH_TOKEN,
  });

  const nameToKebabCase = name.replace(/\s+/g, "-").toLowerCase();
  const username =
    githubHandle ||
    twitterHandle ||
    authorName.split(" ")[0].toLowerCase().trim();
  const filePath = `${username}/${nameToKebabCase}`;
  const excalidrawLibPath = `libraries/${filePath}.excalidrawlib`;
  const pngPath = `libraries/${filePath}.png`;
  const commit = `feat: ${title}`;
  const owner = "excalidraw",
    repo = "excalidraw-libraries",
    head = `${username}-${nameToKebabCase}`,
    base = "main";
  let url = "";
  if (website) {
    url = website;
  } else if (githubHandle) {
    url = `https://github.com/${githubHandle}`;
  } else if (twitterHandle) {
    url = `https://twitter.com/${twitterHandle}`;
  }

  const userNameInDesc = githubHandle
    ? `@${githubHandle}`
    : `[${authorName}](${url})`;
  const updatedDesc = `${description}\n\n submitted by ${userNameInDesc}`;
  try {
    const response = await octokit.createPullRequest({
      owner,
      repo,
      title: commit,
      body: updatedDesc,
      base,
      head,
      changes: [
        {
          files: {
            "libraries.json": ({ exists, encoding, content }) => {
              if (!exists) return null;
              const source = `${filePath}.excalidrawlib`;
              const preview = `${filePath}.png`;
              const date = getTodayDate();
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
                created: date,
                updated: date,
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
