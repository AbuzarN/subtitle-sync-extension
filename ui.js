// Main entry
function initUI({ onSubtitlesLoaded, onOffsetChange, getOffset }) {
    const elements = createUIElements();
  
    setupLayout(elements.panel);
    setupToggle(elements.panel, elements.miniBtn);
    setupControls(elements, { onSubtitlesLoaded, onOffsetChange, getOffset });
    setupDragging(elements.panel, elements.miniBtn);
    setupFullscreenBehavior(elements);
  
    return elements;
  }
  
  function createUIElements() {
    const subtitleDiv = document.createElement("div");
    subtitleDiv.id = "custom-subtitles";
    subtitleDiv.style.display = "none";
  
    const panel = document.createElement("div");
    panel.id = "subtitle-panel";
  
    const miniBtn = document.createElement("div");
    miniBtn.id = "subtitle-mini";
    miniBtn.innerText = "CC";
  
    document.body.appendChild(subtitleDiv);
    document.body.appendChild(panel);
    document.body.appendChild(miniBtn);
  
    return { subtitleDiv, panel, miniBtn };
  }
  
  function setupLayout(panel) {
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
  }
  
  function setupToggle(panel, miniBtn) {
    panel.style.display = "none";
    miniBtn.style.display = "block";
  
    document.getElementById("minimizeBtn").onclick = () => {
      panel.style.display = "none";
      miniBtn.style.display = "block";
    };
  
    miniBtn.onclick = () => {
      panel.style.display = "block";
      miniBtn.style.display = "none";
    };
  }
  
  function setupControls(elements, { onSubtitlesLoaded, onOffsetChange, getOffset }) {
    const fileInput = document.getElementById("srtFile");
    const offsetLabel = document.getElementById("offsetValue");
  
    // Load SRT
    fileInput.addEventListener("change", e => {
      const reader = new FileReader();
      reader.onload = () => {
        const subs = parseSRT(reader.result);
        onSubtitlesLoaded(subs);
      };
      reader.readAsText(e.target.files[0]);
    });
  
    function updateOffset() {
      offsetLabel.textContent = getOffset().toFixed(2);
    }
  
    function adjustOffset(val) {
      onOffsetChange(val);
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
  }

  function setupDragging(panel, miniBtn) {
    makeDraggable(panel, "panelPos");
    makeDraggable(miniBtn, "miniPos");
  }
  
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
  
  function setupFullscreenBehavior({ subtitleDiv, panel, miniBtn }) {
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
  }