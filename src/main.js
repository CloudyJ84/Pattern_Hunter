console.log("main.js loaded");

// Engine initializers
import { initDatasetGenerator } from './engine/datasetGenerator.js';
import { initPatternEngine } from './engine/patternEngine.js';
import { initQuestionEngine } from './engine/questionEngine.js';
import { initFormattingEngine } from './engine/formattingEngine.js';
import { initLevelEngine } from './engine/levelEngine.js';

// Router
import { UIRouter } from './ui/UIRouter.js';

// Helper to load JSON files
async function loadJSON(path) {
    const response = await fetch(path);
    return response.json();
}

async function init() {
    console.log("Initializing Pattern Hunter…");

    // Load engine configuration files
    const datasetRules = await loadJSON('./data/datasetRules.json');
    const patternRules = await loadJSON('./data/patternEngine.json');
    const questionRules = await loadJSON('./data/questionGenerator.json');
    const levelProgression = await loadJSON('./data/levelProgression.json');

    // Initialize engines
    initDatasetGenerator(datasetRules);
    initPatternEngine(patternRules);
    initQuestionEngine(questionRules);
    initFormattingEngine(patternRules); // formatting rules live in patternEngine.json
    initLevelEngine(levelProgression);

    console.log("All engines initialized.");

    // Initialize Router
    UIRouter.init("app-root");

    // Navigate to Home Screen
    UIRouter.navigateTo("HomeScreen");

    console.log("Router initialized and HomeScreen loaded.");
}

// Start the app
init();
