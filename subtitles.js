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

function renderSubtitle(subtitleDiv, sub, time) {
    if (sub && time >= sub.start && time <= sub.end) {
      subtitleDiv.innerText = sub.text;
      subtitleDiv.style.display = "block";
    } else {
      subtitleDiv.style.display = "none";
    }
  }