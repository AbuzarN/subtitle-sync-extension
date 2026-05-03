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