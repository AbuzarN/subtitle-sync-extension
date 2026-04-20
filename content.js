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
subtitleDiv.style.display = "none"; // 🔥 start hidden
document.body.appendChild(subtitleDiv);

// Panel
const panel = document.createElement("div");
panel.id = "subtitle-panel";
document.body.appendChild(panel);

// Minimized button
const miniBtn = document.createElement("div");
miniBtn.id = "subtitle-mini";
miniBtn.innerText = "CC";
document.body.appendChild(miniBtn);

// Panel UI
panel.innerHTML = `
  <div style="display:flex; justify-content:space-between; align-items:center;">
    <strong>Subtitles</strong>
    <button id="minimizeBtn">–</button>
  </div>

  <br>

  <input type="file" id="srtFile"><br><br>

  Offset: <span id="offsetValue">0.00</span>s<br><br>

  <button id="backBig">-1.0s</button>
  <button id="backSmall">-0.1s</button>
  <button id="forwardSmall">+0.1s</button>
  <button id="forwardBig">+1.0s</button>
`;

// Minimize logic
miniBtn.style.display = "none";

document.getElementById("minimizeBtn").onclick = () => {
  panel.style.display = "none";
  miniBtn.style.display = "block";
};

miniBtn.onclick = () => {
  panel.style.display = "block";
  miniBtn.style.display = "none";
};

// Convert time
function toSeconds(timeStr) {
  const [h, m, s] = timeStr.replace(",", ".").split(":");
  return (+h * 3600) + (+m * 60) + parseFloat(s);
}

// Parse SRT
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

// Load SRT
document.getElementById("srtFile").addEventListener("change", e => {
  const reader = new FileReader();
  reader.onload = () => {
    subtitles = parseSRT(reader.result);
    currentIndex = 0;
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

// Keyboard
document.addEventListener("keydown", e => {
  if (document.activeElement.tagName === "INPUT") return;

  if (e.key === "[") adjustOffset(-0.5);
  if (e.key === "]") adjustOffset(0.5);
  if (e.key === "{") adjustOffset(-1.0);
  if (e.key === "}") adjustOffset(1.0);
});

// Attach elements to fullscreen/video container
function attachElements() {
  if (!video) return;

  const parent =
    document.fullscreenElement ||
    video.parentElement ||
    document.body;

  if (subtitleDiv.parentElement !== parent) {
    parent.appendChild(subtitleDiv);
  }

  if (panel.parentElement !== parent) {
    parent.appendChild(panel);
  }

  if (miniBtn.parentElement !== parent) {
    parent.appendChild(miniBtn);
  }
}

document.addEventListener("fullscreenchange", attachElements);
setInterval(attachElements, 2000);

// Subtitle loop (FIXED + no empty box)
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

  // Move backward
  while (
    currentIndex > 0 &&
    time < subtitles[currentIndex].start
  ) {
    currentIndex--;
  }

  const sub = subtitles[currentIndex];

  if (sub && time >= sub.start && time <= sub.end) {
    subtitleDiv.innerText = sub.text;
    subtitleDiv.style.display = "block"; // 🔥 show only when needed
  } else {
    subtitleDiv.innerText = "";
    subtitleDiv.style.display = "none"; // 🔥 fully hide
  }

}, 50);