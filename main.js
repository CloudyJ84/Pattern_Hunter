console.log("main.js loaded");

// Import all engine initializers and generators
import { initDatasetGenerator } from './src/engine/datasetGenerator.js';
import { initPatternEngine } from './src/engine/patternEngine.js';
import { initQuestionEngine } from './src/engine/questionEngine.js';
import { initFormattingEngine } from './src/engine/formattingEngine.js';
import { initLevelEngine, generateLevel } from './src/engine/levelEngine.js';

// Helper to load JSON files
async function loadJSON(path) {
  const response = await fetch(path);
  return response.json();
}

async function init() {
  console.log("init() started");

  // Load all JSON configuration files
  const datasetRules = await loadJSON('./data/datasetRules.json');
  const patternEngine = await loadJSON('./data/patternEngine.json');
  const questionGenerator = await loadJSON('./data/questionGenerator.json');
  const levelProgression = await loadJSON('./data/levelProgression.json');
  const uiComponents = await loadJSON('./data/uiComponents.json');
  const uiStateFlow = await loadJSON('./data/uiStateFlow.json');

  // Initialize all engine modules
  initDatasetGenerator(datasetRules);
  initPatternEngine(patternEngine);
  initQuestionEngine(questionGenerator);
  initFormattingEngine(patternEngine); // formatting rules live in patternEngine.json
  initLevelEngine(levelProgression);

  console.log("All engines initialized");

  // Test the engine
  const test = generateLevel(1);
  console.log("Generated Level 1:", test);

  // Display a simple message on the page
  document.getElementById('app').innerText =
    'Engine test complete. Check console for output.';

  console.log("init() finished");
}

// Run the initialization
init();
