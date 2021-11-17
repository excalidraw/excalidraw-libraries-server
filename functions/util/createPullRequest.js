const { Octokit } = require("@octokit/core");
const {
  createPullRequest: octokitPluginCreatePR,
} = require("octokit-plugin-create-pull-request");
const { RequestError } = require("./errors");

const VALID_LIBRARY_VERSIONS = [2];

const normalizeLibraryData = (libraryData) => {
  if (!VALID_LIBRARY_VERSIONS.includes(libraryData.version)) {
    throw new RequestError({
      message: `Invalid library version (${libraryData.version})`,
      status: 400,
    });
  }

  return {
    ...libraryData,
    libraryItems: libraryData.libraryItems.map((item) => {
      return {
        ...item,
        status: "published",
      };
    }),
  };
};

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
  const githubUrl = githubHandle ? `https://github.com/${githubHandle}` : "";
  const twitterUrl = twitterHandle
    ? `https://twitter.com/${twitterHandle}`
    : "";
  if (website) {
    url = website;
  } else if (githubHandle) {
    url = githubUrl;
  } else if (twitterHandle) {
    url = twitterUrl;
  }

  const userNameInDesc = githubHandle
    ? `@${githubHandle}`
    : `[${authorName}](${url})`;
  const updatedDesc = `${description}\n\n submitted by ${userNameInDesc}`;
  try {
    const libraryData = normalizeLibraryData(JSON.parse(excalidrawLib));

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
                    github: githubUrl,
                    twitter: twitterUrl,
                    url,
                  },
                ],
                source,
                preview,
                created: date,
                updated: date,
                version: libraryData.version,
              };
              const existingContent = JSON.parse(
                Buffer.from(content, encoding).toString("utf-8"),
              );
              existingContent.push(fileContent);
              const res = `${JSON.stringify(existingContent, null, 2)}\n`;
              return res;
            },
            [excalidrawLibPath]: {
              content: `${JSON.stringify(libraryData, null, 2)}\n`,
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
