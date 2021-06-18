const getPng = async () => {
  const png = await fetch("./test-draw.png");
  const blob = await png.blob();
  return blob;
};

const getLib = async () => {
  const lib = await fetch("./test-draw.excalidrawlib");
  const blob = await lib.blob();
  const libBlob = blob.slice(
    0,
    blob.size,
    "application/vnd.excalidrawlib+json",
  );
  return libBlob;
};

const excalidrawLib = await getLib();
const excalidrawPng = await getPng();
const formData = new FormData();
formData.append("excalidrawLib", excalidrawLib);
formData.append("excalidrawPng", excalidrawPng);
formData.append("title", "Automated excalidraw libs");
formData.append("authorName", "excalibot");
formData.append("githubHandle", "excalibot");
formData.append("name", "automating-libs");
formData.append("description", "Adding automated excalidraw libs");

export default formData;
