let video = null;
let subtitles = [];
let offset = 0;
let currentIndex = 0;

// Find video
function findVideo() {
  video = document.querySelector("video");
  if (!video) setTimeout(findVideo, 1000);
}
findVideo();

// Subtitle display
const subtitleDiv = document.createElement("div");
subtitleDiv.id = "custom-subtitles";
subtitleDiv.style.display = "none";
document.body.appendChild(subtitleDiv);

// Panel
const panel = document.createElement("div");

// File input for subtitles
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = ".srt";
fileInput.style.display = "none";
document.body.appendChild(fileInput);

// Handle file upload
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) {
    alert("No file selected. Please upload a valid .srt file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      subtitles = parseSRT(reader.result); // Assuming parseSRT is defined elsewhere
      if (!subtitles || subtitles.length === 0) {
        throw new Error("No subtitles found in the file.");
      }
      currentIndex = 0;
      alert("Subtitles loaded successfully!");
    } catch (err) {
      alert("Invalid SRT file. Please upload a valid subtitle file.");
    }
  };
  reader.onerror = () => {
    alert("Error reading the file. Please try again.");
  };
  reader.readAsText(file);
});

// Trigger file input (example usage)
const uploadButton = document.createElement("button");
uploadButton.innerText = "Upload Subtitles";
uploadButton.onclick = () => fileInput.click();
document.body.appendChild(uploadButton);
panel.id = "subtitle-panel";
document.body.appendChild(panel);

// Mini button
const miniBtn = document.createElement("div");
miniBtn.id = "subtitle-mini";
miniBtn.innerText = "CC";
document.body.appendChild(miniBtn);

// Panel UI
panel.innerHTML = `
  <div style="display:flex; justify-content:space-between; align-items:center; cursor:move;">
    <strong>Subtitles</strong>
    <button id="minimizeBtn">–</button>
  </div>

  <br>

  <input type="file" id="srtFile"><br><br>

  Offset: <span id="offsetValue">0.00</span>s<br><br>

  <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px;">
    <button id="backBig">-1.0s</button>
    <button id="forwardBig">+1.0s</button>
    <button id="backSmall">-0.1s</button>
    <button id="forwardSmall">+0.1s</button>
  </div>
`;

// ✅ Start minimized by default
panel.style.display = "none";
miniBtn.style.display = "block";

// Toggle
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

// Attach to fullscreen / video
function attachElements() {
  if (!video) return;

  const parent =
    document.fullscreenElement ||
    video.parentElement ||
    document.body;

  if (subtitleDiv.parentElement !== parent) parent.appendChild(subtitleDiv);
  if (panel.parentElement !== parent) parent.appendChild(panel);
  if (miniBtn.parentElement !== parent) parent.appendChild(miniBtn);
}

document.addEventListener("fullscreenchange", attachElements);
setInterval(attachElements, 2000);

// Subtitle loop
setInterval(() => {
  if (!video || subtitles.length === 0) return;

  const time = video.currentTime + offset;

  while (currentIndex < subtitles.length && time > subtitles[currentIndex].end) {
    currentIndex++;
  }

  while (currentIndex > 0 && time < subtitles[currentIndex].start) {
    currentIndex--;
  }

  const sub = subtitles[currentIndex];

  if (sub && time >= sub.start && time <= sub.end) {
    subtitleDiv.innerText = sub.text;
    subtitleDiv.style.display = "block";
  } else {
    subtitleDiv.style.display = "none";
  }

}, 50);

// Drag + save
function makeDraggable(el, key) {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  el.style.position = "fixed";

  const saved = JSON.parse(localStorage.getItem(key) || "null");
  if (saved) {
    el.style.left = saved.x + "px";
    el.style.top = saved.y + "px";
    el.style.right = "auto";
  }

  el.addEventListener("mousedown", (e) => {
    isDragging = true;

    const rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;

    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.right = "auto";

    localStorage.setItem(key, JSON.stringify({ x, y }));
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.userSelect = "auto";
  });
}

makeDraggable(panel, "panelPos");
makeDraggable(miniBtn, "miniPos");