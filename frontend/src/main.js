import './style.css';
import './app.css';

import { EventsOn } from "../wailsjs/runtime/runtime";
import { UpdateSettings } from '../wailsjs/go/main/App';
import { GetSettings } from '../wailsjs/go/main/App';
import { LogPrint } from '../wailsjs/runtime/runtime';

const vkMap = {
  8: "Backspace",
  9: "Tab",
  13: "Enter",
  16: "Shift",
  17: "Ctrl",
  18: "Alt",
  19: "Pause",
  20: "CapsLock",
  27: "Escape",
  32: "Space",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "Left",
  38: "Up",
  39: "Right",
  40: "Down",
  45: "Insert",
  46: "Delete",
  // 48–90 = 0-9, A-Z
};

for (let i = 48; i <= 90; i++) {
  vkMap[i] = String.fromCharCode(i); // 0-9, A-Z
}  

document.querySelector('#app').innerHTML = `
  <div class="topnav">
    <a id="nav-home" class="nav-item active" href="#home">Home</a>
    <a id="nav-settings" class="nav-item" href="#settings">Settings</a>
  </div>

  <div id="page-home" class="page">
    <div class="results-container" id="resultsContainer"></div>
  </div>

  <div id="page-settings" class="page hidden">
    <div class="column-container">
    <div class="row">      
      <p>FPS:</p>
      <input id="fpsInput" class="input" type="number" min="1" />
    </div>
    <div class="row">
      <p>Jump Key:</p>
      <button id="jumpButton" class="button setting-button is-link is-outlined">
        SPACE&nbsp;&nbsp;<span class="icon"><i class="fas fa-keyboard"></i></span>
      </button>
    </div>
    <div class="row">
      <p>Crouch Key:</p>
      <button id="crouchButton" class="button">C</button>
    </div>

  </div>
`;

const resultsContainer = document.getElementById("resultsContainer");
resultsContainer.scrollTop = 0;

// Nav click handlers
document.getElementById("nav-home").onclick = () => updateActive(document.getElementById("nav-home"));
document.getElementById("nav-settings").onclick = () => updateActive(document.getElementById("nav-settings"));

EventsOn("superglideResult", (data) => {
  const color = getColorFromChance(data.chancePercent);
  const box = document.createElement("div");
  box.classList.add("result-box");
  box.style.backgroundColor = color;
  box.innerHTML = `
    <div class="result-chance">${data.chancePercent.toFixed(1)}%</div>
    <div class="result-message">${data.message}</div>
  `;
  resultsContainer.prepend(box); 
  resultsContainer.scrollTop = resultsContainer.scrollHeight;
});

EventsOn("updateInput", (data) => {
  isUpdating = false; 
  const jumpButton = document.getElementById("jumpButton");
  const crouchButton = document.getElementById("crouchButton");

  jumpButton.innerHTML = `${vkMap[data.jump]}&nbsp;&nbsp;<span class="icon"><i class="fas fa-keyboard"></i></span>`;
  crouchButton.innerHTML = `${vkMap[data.crouch]}&nbsp;&nbsp;<span class="icon"><i class="fas fa-keyboard"></i></span>`;
})

// Style active tab underline
function updateActive(tab) {
  document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
  tab.classList.add("active");
  
  document.getElementById("page-home").classList.add("hidden");
  document.getElementById("page-settings").classList.add("hidden");
  
  const target = tab.getAttribute("href").replace("#", "page-");
  document.getElementById(target).classList.remove("hidden");
  const targetId = target;
  if (targetId === "page-settings") {
    setTimeout(getSettings, 50);
  }
}

function getColorFromChance(chance) {
  if (chance >= 95) return "rgba(0, 255, 0, 0.25)";         
  if (chance >= 70) return "rgba(68, 255, 164, 0.25)";       
  if (chance >= 50) return "rgba(68, 255, 164, 0.25)";
  if (chance >= 30) return "rgba(255, 240, 0, 0.25)";       
  return "rgba(255, 68, 68, 0.25)";                          
}

let jumpVKCode = null;
let crouchVKCode = null;
let fps = null;
let isUpdating = false;

document.getElementById("jumpButton").addEventListener("click", () => {
  if (isUpdating) return;
  isUpdating = true;

  const button = document.getElementById("jumpButton");
  button.textContent = "Press any key...";
  button.blur();
  updateSettings("jump", fps);
});

document.getElementById("crouchButton").addEventListener("click", () => {
  if (isUpdating) return;
  isUpdating = true;

  const button = document.getElementById("crouchButton");
  button.textContent = "Press any key...";
  button.blur();
  updateSettings("crouch", fps);
  
});

document.getElementById("fpsInput").addEventListener("change", (event) => {
  fps = parseInt(event.target.value, 10);
  updateSettings("fps", fps);
});

function updateSettings(s, fps) {
  UpdateSettings(s, fps).then(result =>{});
} 

function getSettings() {
  GetSettings().then(settings => {
    if (!settings) return;
    
    jumpVKCode = settings.jumpKey;
    crouchVKCode = settings.crouchKey;

    document.getElementById("jumpButton").innerHTML =`${vkMap[jumpVKCode] || "?"}&nbsp;&nbsp;<span class="icon"><i class="fas fa-keyboard"></i></span>`;
    document.getElementById("crouchButton").innerHTML = `${vkMap[crouchVKCode] || "?"}&nbsp;&nbsp;<span class="icon"><i class="fas fa-keyboard"></i></span>`;
    document.getElementById("fpsInput").value = settings.fps;
  });
}
