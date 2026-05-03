# Subtitle Sync Tool (Chrome Extension)

A lightweight Chrome extension that allows you to load your own `.srt` subtitles on any video and manually adjust their timing in real time.

---

## Why I made this

I wanted to watch shows using a specific combination of audio (dub) and subtitles, but it is difficult to find websites that provide both in the languages I want.

Even when I found subtitle files, they often:

* drifted out of sync  
* broke after mid-roll ads or cuts  
* required constant manual adjustment  

This tool was built to make that process easier by allowing quick and continuous timing adjustments while watching.

---

## What it does

* Load a local `.srt` file onto any HTML5 video  
* Overlay subtitles directly on the page  
* Adjust subtitle timing during playback in real time  

### Controls

* +0.1s / -0.1s for fine adjustments  
* +1.0s / -1.0s for larger adjustments  
* `[` and `]` keys for quick keyboard nudging  
* Draggable control panel  
* Minimize into a compact "CC" button  

---

## How it works

* Parses `.srt` files directly in the browser  
* Tracks the current playback time of the video element  
* Applies a user-controlled timing offset  
* Renders subtitles as a lightweight overlay  

All processing is done locally in the browser. No data is uploaded or stored externally.

---

## Limitations

* Fullscreen behavior can still be inconsistent depending on the site  
* The UI may feel intrusive on some layouts  
* Some websites with heavy iframe usage or custom video players may not work reliably  
* No automatic synchronization (manual adjustment only)  

---

## Installation

1. Download or clone this repository  
2. Open Chrome and go to:  
   chrome://extensions/  
3. Enable Developer Mode (top right)  
4. Click "Load unpacked"  
5. Select the extension folder  

---

## Usage

1. Navigate to a site with a video  
2. Open the extension panel (or click the "CC" button)  
3. Upload a `.srt` file  
4. Adjust timing using the buttons or keyboard  
5. Watch with synchronized subtitles  

---

## Notes

This started as a personal utility and is still evolving. The codebase has been gradually refactored to be more modular, but it is still intentionally simple and not production-focused.

---

## Future improvements

* More reliable fullscreen handling  
* Cleaner and less intrusive UI  
* Better positioning relative to the video element  
* Saving timing offsets per site or video  

---

## Disclaimer

This tool only overlays subtitles locally in your browser.  
It does not host, modify, or distribute any video content.