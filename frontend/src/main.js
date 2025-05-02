import './style.css';
import './app.css';

import { EventsOn } from "../wailsjs/runtime/runtime";
import { UpdateSettings } from '../wailsjs/go/main/App';
import { LogPrint } from '../wailsjs/runtime/runtime';

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
      <input id="fpsInput" class="input" type="number" min="1" value="120" />
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
}

function getColorFromChance(chance) {
  if (chance >= 95) return "#00ff00";
  if(chance >= 70) return "#44ffa4"
  if (chance >= 50) return "#44ffa4";
  if(chance >= 30) return "fff000"
  return "#ff4444";
}


let jumpVKCode = 32; // Default: SPACE
let crouchVKCode = 0x40 // Default: C

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

    document.removeEventListener("keydown", keyHandler);
  };
  updateSettings(jumpVKCode, crouchVKCode)
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

    document.removeEventListener("keydown", keyHandler);
  };
  updateSettings(jumpVKCode, crouchVKCode)
  document.addEventListener("keydown", keyHandler);
});

function updateSettings(jump, crouch) {
  const fps = parseInt(document.getElementById("fpsInput").value, 10);
  UpdateSettings(fps, jump, crouch).then(result =>{});
} 
