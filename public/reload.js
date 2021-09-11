let startTime = Number(localStorage.startTime);
let lastTime = Number(localStorage.lastTime);
const now = Date.now();
if (Number.isNaN(lastTime) || now - lastTime > 1000) {
  startTime = now;
  localStorage.startTime = startTime;
}
let dt = now - startTime;
localStorage.lastTime = now;

document.querySelector("#time").innerText = (dt / 1000).toFixed(1) + " s.";
setTimeout(() => window.location.reload(), 100);
