const { readFile } = require("fs/promises");
const TEMPLATES = new Map();

const template = async (templatePath, replacements) => {
  if (!TEMPLATES.has(templatePath)) {
    TEMPLATES.set(templatePath, await readFile(templatePath, "utf-8"));
  }

  let text = TEMPLATES.get(templatePath);

  for (const key in replacements) {
    text = text.replace(`{{${key}}}`, String(replacements[key]));
  }

  return text;
};

module.exports.template = template;
