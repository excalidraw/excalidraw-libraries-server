import testData from "./testData.js";
const onPublish = () => {
  fetch(
    "http://localhost:6001/excalidraw-room-persistence/us-central1/api/libraries/publish",
    {
      method: "post",
      body: testData,
    },
  ).then(
    (res) => console.log("res", res.body),
    (err) => console.error(err),
  );
};

document.querySelector("#publish").addEventListener("click", onPublish);
