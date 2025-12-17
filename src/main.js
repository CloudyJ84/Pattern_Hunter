console.log("Booting Pattern Hunter...");

// Expose GameState for debugging
import { GameState } from './state/gameState.js';
window.GameState = GameState;

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
    try {
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
        initFormattingEngine(patternRules);
        initLevelEngine(levelProgression);

        // Initialize GameState
        GameState.init();

        // Initialize Router
        UIRouter.init("app-root");
        UIRouter.navigateTo("HomeScreen");

        console.log("Pattern Hunter initialized successfully.");

    } catch (e) {
        console.error("Fatal Boot Error:", e);

        document.body.innerHTML = `
            <div style="color:#e74c3c;padding:20px;text-align:center;">
                <h1>Game Failed to Load</h1>
                <p>${e.message}</p>
                <p>Check console for details.</p>
            </div>
        `;
    }
}

init();
