import levelProgression from '../data/levelProgression.json' assert { type: 'json' };
import { generateLevel, initLevelEngine } from '../src/engine/levelEngine.js';
import { GridRenderer } from '../src/ui/GridRenderer.js';
import { QuestionDisplay } from '../src/ui/QuestionDisplay.js';

// Initialize engine with progression rules
console.log("Initializing LevelEngine with progression rules:", levelProgression);
initLevelEngine(levelProgression);

const challengeContainer = document.getElementById('challenge');
const jsonOutput = document.getElementById('jsonOutput');
const logPanel = document.getElementById('log');

function renderChallenge(challenge) {
  challengeContainer.innerHTML = '';

  // --- GRID RENDERING ---
  const gridWrapper = document.createElement('div');
  gridWrapper.className = 'grid-container';
  challengeContainer.appendChild(gridWrapper);

  const grid = new GridRenderer(gridWrapper);
  grid.render(challenge.grid);

  // Apply formatting (if any)
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
