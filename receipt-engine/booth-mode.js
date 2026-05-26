/* booth-mode.js - fullscreen display enhancements for the booth laptop */

// Add ?booth to URL to activate booth mode
// e.g. index.html?booth
(function () {
  const params = new URLSearchParams(window.location.search);
  if (!params.has("booth")) return;

  document.body.classList.add("booth-mode");

  // Prevent sleep on supported browsers
  if ("wakeLock" in navigator) {
    async function requestWakeLock() {
      try {
        await navigator.wakeLock.request("screen");
      } catch (e) {}
    }
    requestWakeLock();
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") requestWakeLock();
    });
  }

  // Show a subtle booth indicator
  const indicator = document.createElement("div");
  indicator.style.cssText = [
    "position:fixed",
    "bottom:12px",
    "right:16px",
    "font-family:'Courier New',monospace",
    "font-size:10px",
    "letter-spacing:2px",
    "color:#333",
    "pointer-events:none",
    "z-index:9999",
  ].join(";");
  indicator.textContent = "BOOTH MODE";
  document.body.appendChild(indicator);
})();
