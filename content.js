let video = null;
let subtitles = [];
let offset = 0;
let currentIndex = 0;

// Find video element
function findVideo() {
  video = document.querySelector("video");
  if (!video) setTimeout(findVideo, 1000);
}
findVideo();

// Subtitle display
const subtitleDiv = document.createElement("div");
subtitleDiv.id = "custom-subtitles";
document.body.appendChild(subtitleDiv);

// Control panel
const panel = document.createElement("div");
panel.id = "subtitle-panel";
document.body.appendChild(panel);

panel.innerHTML = `
  <input type="file" id="srtFile"><br><br>

  Offset: <span id="offsetValue">0.00</span>s<br><br>

  <button id="backBig">-1.0s</button>
  <button id="backSmall">-0.1s</button>
  <button id="forwardSmall">+0.1s</button>
  <button id="forwardBig">+1.0s</button>
`;

// Convert time
function toSeconds(timeStr) {
  const [h, m, s] = timeStr.replace(",", ".").split(":");
  return (+h * 3600) + (+m * 60) + parseFloat(s);
}

// Clean SRT parser
function parseSRT(data) {
  const blocks = data.split(/\n\s*\n/);
  let result = [];

  for (let block of blocks) {
    const lines = block.split("\n").map(l => l.trim()).filter(Boolean);

    if (lines.length < 3) continue;
    if (!lines[1].includes("-->")) continue;

    const [startStr, endStr] = lines[1].split(" --> ");

    const start = toSeconds(startStr);
    const end = toSeconds(endStr);

    const text = lines.slice(2).join(" ");

    result.push({ start, end, text });
  }

  return result;
}

// Load file
document.getElementById("srtFile").addEventListener("change", e => {
  const reader = new FileReader();
  reader.onload = () => {
    subtitles = parseSRT(reader.result);
    currentIndex = 0; // 🔥 important
    console.log("Subtitles loaded:", subtitles.length);
  };
  reader.readAsText(e.target.files[0]);
});

// Offset controls
const offsetLabel = document.getElementById("offsetValue");

function updateOffset() {
  offsetLabel.textContent = offset.toFixed(2);
}

function adjustOffset(val) {
  offset += val;
  updateOffset();
}

// Buttons
document.getElementById("backBig").onclick = () => adjustOffset(-1.0);
document.getElementById("backSmall").onclick = () => adjustOffset(-0.1);
document.getElementById("forwardSmall").onclick = () => adjustOffset(0.1);
document.getElementById("forwardBig").onclick = () => adjustOffset(1.0);

// Keyboard controls
document.addEventListener("keydown", e => {
  if (document.activeElement.tagName === "INPUT") return;

  if (e.key === "[") adjustOffset(-0.5);
  if (e.key === "]") adjustOffset(0.5);
  if (e.key === "{") adjustOffset(-1.0);
  if (e.key === "}") adjustOffset(1.0);
});

// Subtitle update loop (FIXED)
setInterval(() => {
  if (!video || subtitles.length === 0) return;

  const time = video.currentTime + offset;

  // Move forward
  while (
    currentIndex < subtitles.length &&
    time > subtitles[currentIndex].end
  ) {
    currentIndex++;
  }

  // Move backward (important for scrubbing/offset)
  while (
    currentIndex > 0 &&
    time < subtitles[currentIndex].start
  ) {
    currentIndex--;
  }

  const sub = subtitles[currentIndex];

  if (sub && time >= sub.start && time <= sub.end) {
    subtitleDiv.innerText = sub.text;
  } else {
    subtitleDiv.innerText = "";
  }

}, 50);