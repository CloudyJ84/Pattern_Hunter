import { generateLevel, initLevelEngine } from '../src/engine/levelEngine.js';
import { initDatasetGenerator } from '../src/engine/datasetGenerator.js';
import { initPatternEngine } from '../src/engine/patternEngine.js';
import { GridRenderer } from '../src/ui/GridRenderer.js';
import { QuestionDisplay } from '../src/ui/QuestionDisplay.js';

const challengeContainer = document.getElementById('challenge');
const jsonOutput = document.getElementById('jsonOutput');
const logPanel = document.getElementById('log');

// Disable buttons until everything is initialized
document.querySelectorAll('#controls button').forEach(btn => btn.disabled = true);

// Load ALL THREE configs before enabling the harness
Promise.all([
  fetch('../data/datasetRules.json').then(res => res.json()),
  fetch('../data/levelProgression.json').then(res => res.json()),
  fetch('../data/patternEngine.json').then(res => res.json())
])
.then(([datasetRules, levelProgression, patternRules]) => {
  console.log("Loaded dataset rules:", datasetRules);
  console.log("Loaded progression rules:", levelProgression);
  console.log("Loaded pattern rules:", patternRules);

  // Initialize engines in dependency order
  initDatasetGenerator(datasetRules);
  initPatternEngine(patternRules);
  initLevelEngine(levelProgression);

  console.log("All engines initialized");

  // Re-enable buttons
  document.querySelectorAll('#controls button').forEach(btn => btn.disabled = false);
})
.catch(err => {
  console.error("Initialization failed:", err);
});

function renderChallenge(challenge) {
  challengeContainer.innerHTML = '';

  // --- GRID RENDERING ---
  const gridWrapper = document.createElement('div');
  gridWrapper.className = 'grid-container';
  challengeContainer.appendChild(gridWrapper);

  const grid = new GridRenderer(gridWrapper);
  grid.render(challenge.grid);

  if (challenge.formatting && challenge.formatting.highlightedCells) {
    grid.applyFormatting(
      challenge.formatting.highlightedCells,
      challenge.formatting.formattingRule
    );
  }

  // --- QUESTION RENDERING ---
  const questionWrapper = document.createElement('div');
  questionWrapper.id = 'question-area';
  challengeContainer.appendChild(questionWrapper);

  const question = new QuestionDisplay('question-area');
  question.render(challenge.question, (userAnswer) => {
    evaluateAnswer(userAnswer, challenge, question);
  });

  // --- JSON OUTPUT ---
  jsonOutput.textContent = JSON.stringify(challenge, null, 2);

  // --- LOG PANEL ---
  logPanel.innerHTML = `
    <strong>datasetType:</strong> ${challenge.datasetType}<br>
    <strong>patternType:</strong> ${challenge.patternType}<br>
    <strong>formattingRule:</strong> ${challenge.formatting.formattingRule}<br>
    <strong>highlightedCells:</strong> ${JSON.stringify(challenge.formatting.highlightedCells)}<br>
  `;
}

function evaluateAnswer(userAnswer, challenge, questionComponent) {
  const correct = userAnswer == challenge.question.answer;

  questionComponent.showFeedback(correct, challenge.question.answer);

  const result = document.createElement('div');
  result.className = 'answer-result';
  result.style.marginTop = '10px';
  result.textContent = correct
    ? 'Correct!'
    : `Incorrect — correct answer is ${challenge.question.answer}`;

  challengeContainer.appendChild(result);
}

function generate(level) {
  console.log("Generating level:", level);
  const challenge = generateLevel(level);
  renderChallenge(challenge);
}

// --- BUTTON HOOKS ---
document.querySelectorAll('#controls button[data-level]').forEach(btn => {
  btn.addEventListener('click', () => generate(Number(btn.dataset.level)));
});

document.getElementById('random').addEventListener('click', () => {
  const level = Math.floor(Math.random() * 10) + 1;
  generate(level);
});
