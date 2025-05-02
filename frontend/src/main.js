import './style.css';
import './app.css';

import { EventsOn } from "../wailsjs/runtime/runtime";

// Replace the app container with layout for results

document.querySelector('#app').innerHTML = `
  <div class="container">
    <div class="timeline" id="timeline"></div>
    <div class="result" id="result">Waiting for input...</div>
  </div>
`;

// Reference the result and average containers AFTER they exist
const resultElement = document.getElementById("result");
// const averageElement = document.getElementById("averageDisplay");
const timeline = document.getElementById("timeline");

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
  // averageElement.innerHTML = `Average: ${data.averageChance.toFixed(1)}%`;
});


function getColorFromChance(chance) {
  if (chance >= 95) return "#00ff00";
  if(chance >= 70) return "#44ffa4"
  if (chance >= 50) return "#44ffa4";
  if(chance >= 30) return "fff000"
  return "#ff4444";
}
