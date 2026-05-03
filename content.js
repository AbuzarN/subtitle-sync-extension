// Wait for video before initializing anything
function waitForVideoAndInit() {
  const check = setInterval(() => {
    const vid = document.querySelector("video");

    if (vid) {
      state.video = vid;
      clearInterval(check);

      const ui = initUI({
        onSubtitlesLoaded: (subs) => {
          state.subtitles = subs;
          state.currentIndex = 0;
        },
        onOffsetChange: (val) => {
          state.offset += val;
        },
        getOffset: () => state.offset
      });

      // Subtitle loop
      startSubtitleLoop(ui)
    }
  }, 1000);
}

waitForVideoAndInit();

function startSubtitleLoop(ui) {
  setInterval(() => {
    if (!state.video || state.subtitles.length === 0) return;

    const time = state.video.currentTime + state.offset;

    const sub = getCurrentSubtitle(time);

    renderSubtitle(ui.subtitleDiv, sub, time);

  }, 50);
};