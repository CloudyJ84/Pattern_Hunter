import { generateLevel } from './src/engine/levelEngine.js';

async function loadJSON(path) {
  const response = await fetch(path);
  return response.json();
}

async function init() {
  const datasetRules = await loadJSON('./data/datasetRules.json');
  const patternEngine = await loadJSON('./data/patternEngine.json');
  const questionGenerator = await loadJSON('./data/questionGenerator.json');
  const levelProgression = await loadJSON('./data/levelProgression.json');
  const uiComponents = await loadJSON('./data/uiComponents.json');
  const uiStateFlow = await loadJSON('./data/uiStateFlow.json');

  // Store globally or pass into engine modules as needed
  window.gameConfig = {
    datasetRules,
    patternEngine,
    questionGenerator,
    levelProgression,
    uiComponents,
    uiStateFlow
  };

  const test = generateLevel(1);
  console.log(test);

  document.getElementById('app').innerText =
    'Engine test complete. Check console for output.';
}

init();