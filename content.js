const state = {
  video : null,
  subtitles : [],
  offset : 0,
  currentIndex : 0
};

let subtitleDiv, panel, miniBtn;

// Wait for video before initializing anything
function waitForVideoAndInit() {
  const check = setInterval(() => {
    const vid = document.querySelector("video");

    if (vid) {
      state.video = vid;
      clearInterval(check);
      initUI();
    }
  }, 1000);
}

waitForVideoAndInit();

// Initialize UI ONLY when video exists
function initUI() {
  // Subtitle display
  subtitleDiv = document.createElement("div");
  subtitleDiv.id = "custom-subtitles";
  subtitleDiv.style.display = "none";
  document.body.appendChild(subtitleDiv);

  // Panel
  panel = document.createElement("div");
  panel.id = "subtitle-panel";
  document.body.appendChild(panel);

  // Mini button
  miniBtn = document.createElement("div");
  miniBtn.id = "subtitle-mini";
  miniBtn.innerText = "CC";
  document.body.appendChild(miniBtn);

  // UI layout
  panel.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
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

  // Start minimized
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

  // Load SRT
  document.getElementById("srtFile").addEventListener("change", e => {
    const reader = new FileReader();
    reader.onload = () => {
      state.subtitles = parseSRT(reader.result);
      state.currentIndex = 0;
    };
    reader.readAsText(e.target.files[0]);
  });

  // Offset controls
  const offsetLabel = document.getElementById("offsetValue");

  function updateOffset() {
    offsetLabel.textContent = state.offset.toFixed(2);
  }

  function adjustOffset(val) {
    state.offset += val;
    updateOffset();
  }

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

  // Attach to fullscreen/video
  function attachElements() {
    if (!state.video) return;

    const parent =
      document.fullscreenElement ||
      state.video.parentElement ||
      document.body;

    if (subtitleDiv.parentElement !== parent) parent.appendChild(subtitleDiv);
    if (panel.parentElement !== parent) parent.appendChild(panel);
    if (miniBtn.parentElement !== parent) parent.appendChild(miniBtn);
  }

  document.addEventListener("fullscreenchange", attachElements);
  setInterval(attachElements, 2000);

  // Subtitle loop
  setInterval(() => {
    if (!state.video || state.subtitles.length === 0) return;

    const time = state.video.currentTime + state.offset;

    const sub = getCurrentSubtitle(time);

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
}

function getCurrentSubtitle(time) {
  while (state.currentIndex < state.subtitles.length - 1 && time > state.subtitles[state.currentIndex].end) {
    state.currentIndex++;
  }

  while (state.currentIndex > 0 && time < state.subtitles[state.currentIndex].start) {
    state.currentIndex--;
  }

  const sub = state.subtitles[state.currentIndex];
  return sub;
}

// Helpers
function toSeconds(timeStr) {
  const [h, m, s] = timeStr.replace(",", ".").split(":");
  return (+h * 3600) + (+m * 60) + parseFloat(s);
}

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