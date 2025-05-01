import './style.css';
import './app.css';

import { EventsOn } from "../wailsjs/runtime/runtime";

// Replace the app container with layout for results
document.querySelector('#app').innerHTML = `
  <div class="container">
    <div class="average" id="averageDisplay">Average: 0%</div>
    <div class="result" id="result">Waiting for input...</div>
  </div>
`;

// Reference the result and average containers AFTER they exist
const resultElement = document.getElementById("result");
const averageElement = document.getElementById("averageDisplay");

let total = 0;
let count = 0;

EventsOn("superglideResult", (data) => {
  // Calculate running average
  total += data.chancePercent;
  count++;
  const average = total / count;

  // Update result display
  resultElement.innerHTML = `
    Attempt #${data.attempt}<br>
    ${data.chancePercent.toFixed(1)}% chance<br>
    ${data.framesElapsed.toFixed(2)} frames<br>
    ${data.message}
  `;

  // Update average display
  averageElement.innerHTML = `Average: ${average.toFixed(1)}%`;

  // Color the result chance
  resultElement.style.color =
    data.chancePercent >= 90
      ? "#00ff00"
      : data.chancePercent > 50
      ? "#ffff00"
      : "#ff4444";

  // Color the average separately
  averageElement.style.color =
    average >= 90
      ? "#00ff00"
      : average > 50
      ? "#ffff00"
      : "#ff4444";
});
