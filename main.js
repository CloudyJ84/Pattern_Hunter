async function init() {
  const datasetRules = await loadJSON('./data/datasetRules.json');
  const patternEngine = await loadJSON('./data/patternEngine.json');
  const questionGenerator = await loadJSON('./data/questionGenerator.json');
  const levelProgression = await loadJSON('./data/levelProgression.json');
  const uiComponents = await loadJSON('./data/uiComponents.json');
  const uiStateFlow = await loadJSON('./data/uiStateFlow.json');

  // Initialize all engines
  initDatasetGenerator(datasetRules);
  initPatternEngine(patternEngine);
  initQuestionEngine(questionGenerator);
  initFormattingEngine(patternEngine);
  initLevelEngine(levelProgression);

  // Test the engine
  const test = generateLevel(1);
  console.log(test);

  document.getElementById('app').innerText =
    'Engine test complete. Check console for output.';
}
