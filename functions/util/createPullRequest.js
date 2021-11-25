const { Octokit } = require("@octokit/core");
const {
  createPullRequest: octokitPluginCreatePR,
} = require("octokit-plugin-create-pull-request");
const { RequestError } = require("./errors");
const deburr = require("lodash.deburr");

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

const slugify = (string, name) => {
  let slug = deburr(string)
    .toLowerCase()
    // remove non-word characters, replacing with dash
    .replace(/[^\w]+/g, "-")
    // remove dashes from start/end
    .replace(/^[_-]+/, "")
    .replace(/[_-]+$/, "");
  if (!slug.length) {
    throw new RequestError({
      status: 400,
      message: `Invalid value for "${name}"`,
    });
  }
  return slug;
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
  if (!process.env.GH_TOKEN) {
    throw new Error("Missing auth (process.env.GH_TOKEN not defined)");
  }

  const MyOctokit = Octokit.plugin(octokitPluginCreatePR);
  const octokit = new MyOctokit({
    auth: process.env.GH_TOKEN,
  });

  const nameSlug = slugify(name, "library name");
  const username = slugify(
    githubHandle || twitterHandle || authorName,
    githubHandle
      ? "github handle"
      : twitterHandle
      ? "twitter handle"
      : "author name",
  );
  const filePath = `${username}/${nameSlug}`;
  const excalidrawLibPath = `libraries/${filePath}.excalidrawlib`;
  const pngPath = `libraries/${filePath}.png`;
  const commit = `feat: new library ${title}`;
  const owner = process.env.GH_OWNER || "excalidraw";
  const repo = "excalidraw-libraries";
  const head = `${username}-${nameSlug}`;
  const base = "main";
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
    : url
    ? `[${authorName}](${url})`
    : authorName;

  const updatedDesc = `${description}\n\n submitted by ${userNameInDesc}\n\n
  ![](https://raw.githubusercontent.com/${owner}/excalidraw-libraries/${head}/libraries/${filePath}.png?raw=true)
  `;
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
