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
    <div class="container">
      <div class="timeline" id="timeline"></div>
      <div class="result" id="result">Waiting for input...</div>
    </div>
  </div>

  <div id="page-settings" class="page hidden">
    <div class="column-container">
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
    <div class="row">      
      <p>FPS:</p>
      <input id="fpsInput" class="input" type="number" min="1" />
    </div>
  </div>
`;

const averageElement = document.getElementById("averageDisplay");
const resultElement = document.getElementById("result");
const timeline = document.getElementById("timeline");

// Nav click handlers
document.getElementById("nav-home").onclick = () => updateActive(document.getElementById("nav-home"));
document.getElementById("nav-settings").onclick = () => updateActive(document.getElementById("nav-settings"));

for (let i = 0; i < 10; i++) {
  const dot = document.createElement("div");
  dot.classList.add("timeline-dot");
  dot.style.backgroundColor = "#444"; // neutral gray
  timeline.appendChild(dot);
}

EventsOn("superglideResult", (data) => {
  // Update result display
  resultElement.innerHTML = `
    Attempt #${data.attempt}<br>
    ${data.chancePercent.toFixed(1)}% chance<br>
    ${data.framesElapsed.toFixed(2)} frames<br>
    ${data.message}
  `;

  // Color Updates
  const color = getColorFromChance(data.chancePercent);
  resultElement.style.color = color;
  averageElement.style.color = color;

  // Time line 
  const dot = document.createElement("div");
  dot.classList.add("timeline-dot");
  dot.style.backgroundColor = color;

  timeline.appendChild(dot);

  if (timeline.children.length > 10) {
    timeline.removeChild(timeline.firstChild);
  }  

  // Update average display
  averageElement.innerHTML = `Average: ${data.averageChance.toFixed(1)}%`;
});

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
  if (chance >= 95) return "#00ff00";
  if(chance >= 70) return "#44ffa4"
  if (chance >= 50) return "#44ffa4";
  if(chance >= 30) return "fff000"
  return "#ff4444";
}

let jumpVKCode = null;
let crouchVKCode = null;

document.getElementById("jumpButton").addEventListener("click", () => {
  const button = document.getElementById("jumpButton");
  button.textContent = "Press any key...";

  const keyHandler = (event) => {
    event.preventDefault();
    
    const vkCode = event.keyCode || event.which; // This is the VKCode
    const keyLabel = event.key.toUpperCase();
    
    if(keyLabel == " ") {
      button.innerHTML = `SPACE&nbsp;&nbsp;<span class="icon"><i class="fas fa-keyboard"></i></span>`;
    }
    else {
      button.innerHTML = `${keyLabel}&nbsp;&nbsp;<span class="icon"><i class="fas fa-keyboard"></i></span>`;
    }
    jumpVKCode = vkCode >>> 0; // Ensure it's stored as uint32

    updateSettings(jumpVKCode, crouchVKCode);

    document.removeEventListener("keydown", keyHandler);
  };
  document.addEventListener("keydown", keyHandler);
});

document.getElementById("crouchButton").addEventListener("click", () => {
  const button = document.getElementById("crouchButton");
  button.textContent = "Press any key...";

  const keyHandler = (event) => {
    event.preventDefault();
    
    const vkCode = event.keyCode || event.which; // This is the VKCode
    const keyLabel = event.key.toUpperCase();
  
    if(keyLabel == " ") {
      button.innerHTML = `SPACE&nbsp;&nbsp;<span class="icon"><i class="fas fa-keyboard"></i></span>`;
    }
    else {
      button.innerHTML = `${keyLabel}&nbsp;&nbsp;<span class="icon"><i class="fas fa-keyboard"></i></span>`;
    }

    crouchVKCode = vkCode >>> 0; // Ensure it's stored as uint32

    updateSettings(jumpVKCode, crouchVKCode);

    document.removeEventListener("keydown", keyHandler);
  };
  document.addEventListener("keydown", keyHandler);
});

function updateSettings(jump, crouch) {
  if (jump == null || crouch == null) return;

  LogPrint('Updating settings: ' + jump)
  const fps = parseInt(document.getElementById("fpsInput").value, 10);
  UpdateSettings(fps, jump, crouch).then(result =>{});
} 

function getSettings() {
  GetSettings().then(settings => {
    if (!settings) return;
    LogPrint("got settings" + settings.jumpKey);
    
    jumpVKCode = settings.jumpKey;
    crouchVKCode = settings.crouchKey;

    document.getElementById("jumpButton").innerHTML =`${vkMap[jumpVKCode] || "?"}&nbsp;&nbsp;<span class="icon"><i class="fas fa-keyboard"></i></span>`;
    document.getElementById("crouchButton").innerHTML = `${vkMap[crouchVKCode] || "?"}&nbsp;&nbsp;<span class="icon"><i class="fas fa-keyboard"></i></span>`;
    document.getElementById("fpsInput").value = settings.fps;
  });
}
