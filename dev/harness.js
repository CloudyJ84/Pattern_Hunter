import { generateLevel } from '../src/engine/levelEngine.js';
import { GridRenderer } from '../src/ui/GridRenderer.js';
import { QuestionDisplay } from '../src/ui/QuestionDisplay.js';

const challengeContainer = document.getElementById('challenge');
const jsonOutput = document.getElementById('jsonOutput');
const logPanel = document.getElementById('log');

function renderChallenge(challenge) {
  challengeContainer.innerHTML = '';

  // Render grid
  const grid = new GridRenderer(challenge.grid, challenge.formatting);
  challengeContainer.appendChild(grid.render());

  // Render question
  const question = new QuestionDisplay(challenge.question);
  challengeContainer.appendChild(question.render());

  // JSON output
  jsonOutput.textContent = JSON.stringify(challenge, null, 2);

  // Log panel
  logPanel.innerHTML = `
    <strong>datasetType:</strong> ${challenge.datasetType}<br>
    <strong>patternType:</strong> ${challenge.patternType}<br>
    <strong>formattingRule:</strong> ${challenge.formatting.formattingRule}<br>
    <strong>highlightedCells:</strong> ${JSON.stringify(challenge.formatting.highlightedCells)}<br>
  `;
}

function generate(level) {
  const challenge = generateLevel(level);
  renderChallenge(challenge);
}

document.querySelectorAll('#controls button[data-level]').forEach(btn => {
  btn.addEventListener('click', () => generate(Number(btn.dataset.level)));
});

document.getElementById('random').addEventListener('click', () => {
  const level = Math.floor(Math.random() * 10) + 1;
  generate(level);
});
