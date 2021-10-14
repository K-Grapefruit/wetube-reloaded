import { init } from "events";

const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

const handleStart = () => {
  startBtn.innerText = "StopRecording";
};

// const init = async () => {
//   const stream = await navigator.mediaDevices.getUserMedia({
//     audio: true,
//     video: { width: 200, height: 100 },
//   });

//   video.srcObject = stream;
//   video.play();
// };

// init();

startBtn.addEventListener("click", handleStart);
