console.log("Booting Pattern Hunter...");

// Expose GameState for debugging
import { GameState } from './state/gameState.js';
window.GameState = GameState;

// Engine initializers
import { initLevelEngine } from './engine/levelEngine.js';

// Data Imports
import levelProgression from './data/levelProgressionData.js';

// Glyph system initializer
import { registerAllGlyphs } from './engine/glyphs/registerGlyphs.js';

// Router
import { UIRouter } from './ui/UIRouter.js';

async function init() {
    try {
        console.log("Initializing Pattern Hunter…");

        // Initialize engines
        initLevelEngine(levelProgression);

        // 🔥 Initialize glyph system
        registerAllGlyphs();
        console.log("Glyphs registered.");

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
