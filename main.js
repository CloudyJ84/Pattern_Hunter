console.log("main.js loaded");

// Import engine initializers
import { initDatasetGenerator } from './src/engine/datasetGenerator.js';
import { initPatternEngine } from './src/engine/patternEngine.js';
import { initQuestionEngine } from './src/engine/questionEngine.js';
import { initFormattingEngine } from './src/engine/formattingEngine.js';
import { initLevelEngine } from './src/engine/levelEngine.js';

// Import UI
import { UIManager } from './src/ui/UIManager.js';

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

  // Initialize all engine modules
  initDatasetGenerator(datasetRules);
  initPatternEngine(patternEngine);
  initQuestionEngine(questionGenerator);
  initFormattingEngine(patternEngine); // formatting rules live in patternEngine.json
  initLevelEngine(levelProgression);

  console.log("All engines initialized");

  // Boot the UI
  new UIManager();

  console.log("UI initialized");
  console.log("init() finished");
}

// Run the initialization
init();
