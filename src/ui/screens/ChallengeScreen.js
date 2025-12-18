import { generateLevel } from '../../engine/levelEngine.js';
import { GameState } from '../../state/gameState.js';
import { UIRouter } from '../UIRouter.js';
import { GridRenderer } from '../components/GridRenderer.js';
import { QuestionDisplay } from '../components/QuestionDisplay.js';
import { FeedbackDisplay } from '../components/FeedbackDisplay.js';
import { LensController } from '../../engine/lens/LensController.js';
import { LensRenderer } from '../components/LensRenderer.js';
import { GlyphRenderer } from '../components/GlyphRenderer.js';
import { GlyphController } from '../../engine/glyphs/GlyphController.js';

/**
 * Configuration for the Mythic Vows (Tiers)
 * Maps internal IDs to display names and multipliers.
 */
const TIER_CONFIG = {
    0: { name: 'SCOUT', mult: '1.0', rune: '👁️', flavor: 'The path is lit.' },
    1: { name: 'HUNTER', mult: '1.5', rune: '🏹', flavor: 'Trust your instincts.' },
    2: { name: 'TRACKER', mult: '2.0', rune: '🐾', flavor: 'The prey is listening.' },
    3: { name: 'MYTHIC', mult: '3.0', rune: '🔮', flavor: 'Gaze into the void.' }
};

/**
 * Glyph Definitions for the Bottom Bar.
 * 'css' corresponds to classes in main.css.
 */
const GLYPHS = [
    { id: 'weekend', name: 'Twin Suns', css: 'fmt-weekend', icon: '☀', desc: 'Reveals the resting days (Sat/Sun).' },
    { id: 'above', name: 'Rising Flame', css: 'fmt-above', icon: '🔥', desc: 'Highlights values ascending above the mean.' },
    { id: 'below', name: 'Falling Stone', css: 'fmt-below', icon: '🌑', desc: 'Highlights values sinking below the mean.' },
    { id: 'outlier', name: 'Broken Pattern', css: 'fmt-outlier', icon: '⚡', desc: 'Exposes data that defies the norm.' },
    { id: 'frequency', name: 'Echo', css: 'fmt-frequency', icon: '〰', desc: 'Marks repeating signals.' },
    { id: 'unique', name: 'Lone Star', css: 'fmt-unique', icon: '★', desc: 'Identifies singular values.' }
];

export class ChallengeScreen {

    constructor(params) {
        this.levelId = params.levelId || 1;
        // Fallback to GameState if param is missing, default to Hunter (1)
        this.thresholdTier = (params.thresholdTier !== undefined) 
            ? params.thresholdTier 
            : (GameState.selectedTier !== undefined ? GameState.selectedTier : 1);
            
        this.data = null;
        this.element = null;
        
        // Visual State
        this.currentLensIndex = 0; // Tracks which lens from the available set is active
        this.activeGlyphs = new Set(); // Keep track of active buttons for UI state
        
        // Storage for computed glyphs from the controller
        this.computedGlyphs = new Map();

        // Systems
        this.lensRenderer = null;
        this.glyphRenderer = null;
    }

    mount() {
        const el = document.createElement('div');
        el.className = 'screen challenge-screen fade-in';

        // Retrieve Tier Info
        const tier = TIER_CONFIG[this.thresholdTier] || TIER_CONFIG[1];

        el.innerHTML = `
            <!-- ZONE A: LEFT PANEL - THE HUNTER'S ANCHOR -->
            <aside class="nav-panel">
                <div class="nav-top">
                    <button id="withdraw-btn" class="control-btn secondary nav-back">
                        <span class="icon">↩</span> Withdraw
                    </button>
                </div>
                
                <div class="tier-display">
                    <div class="tier-rune">${tier.rune}</div>
                    <div class="tier-info">
                        <div class="label">Current Vow</div>
                        <div class="value class-${tier.name.toLowerCase()}">${tier.name}</div>
                        <div class="mult">Reward ×${tier.mult}</div>
                    </div>
                    <div class="tier-flavor">"${tier.flavor}"</div>
                </div>

                <div class="level-indicator">
                    <span class="label">Trial</span>
                    <span class="value">${this.levelId}</span>
                </div>
            </aside>

            <!-- ZONE B: CENTER - THE FIELD (Grid + Bottom Bar) -->
            <main class="challenge-field">
                <div class="grid-wrapper">
                    <!-- The Grid Component Mount Point -->
                    <div class="dataset-grid" id="grid"></div>
                    
                    <!-- Dynamic Lens Summary Overlay (Legends/Stats) -->
                    <div id="lens-summary" class="lens-summary"></div>
                </div>

                <!-- ZONE C: BOTTOM PANEL - GLYPH BAR & LENS -->
                <footer class="mythic-controls">
                    <div class="lens-selector" id="lens-toggle" title="Change Perspective">
                        <span class="lens-icon">👁️</span>
                        <span class="lens-label">Lens: Standard</span>
                    </div>
                    
                    <div class="glyph-bar">
                        ${GLYPHS.map(g => `
                            <button class="glyph-button" data-glyph="${g.id}" title="${g.desc}">
                                <span class="glyph-icon">${g.icon}</span>
                                <span class="glyph-name">${g.name}</span>
                            </button>
                        `).join('')}
                    </div>
                </footer>
            </main>

            <!-- ZONE D: RIGHT PANEL - THE CHALLENGE SCROLL -->
            <aside class="challenge-panel">
                <div class="scroll-content">
                    <h3 class="panel-header">The Query</h3>
                    
                    <!-- Question & Feedback Mount Points -->
                    <div id="question" class="question-container"></div>
                    <div id="feedback" class="feedback-container hidden"></div>

                    <div class="action-area">
                        <button id="hint-btn" class="control-btn secondary hint-btn">
                            Invoke Hint
                        </button>
                    </div>
                </div>
            </aside>
        `;

        // --- Event Wiring ---

        // Navigation
        el.querySelector('#withdraw-btn').onclick = () => {
            UIRouter.navigateTo('LevelSelectScreen');
        };

        // Component Instances
        this.grid = new GridRenderer(el.querySelector('#grid'));
        
        // LensRenderer Integration
        this.lensRenderer = new LensRenderer(
            el.querySelector('#grid'),
            el.querySelector('#lens-summary')
        );

        // GlyphRenderer Integration
        // Responsible for rendering symbolic overlays and runic highlights
        this.glyphRenderer = new GlyphRenderer(el.querySelector('#grid'));

        this.question = new QuestionDisplay(
            el.querySelector('#question'),
            (ans) => this.handleSubmit(ans)
        );
        this.feedback = new FeedbackDisplay(el.querySelector('#feedback'));

        // Hint Logic
        this.hintBtn = el.querySelector('#hint-btn');
        this.hintBtn.onclick = () => this._handleHint();

        // Lens Logic
        const lensBtn = el.querySelector('#lens-toggle');
        lensBtn.onclick = () => this._cycleLens(lensBtn);

        // Glyph Logic
        el.querySelectorAll('.glyph-button').forEach(btn => {
            // New Semantic Toggle: Passes ID, retrieves object, calls renderer
            btn.onclick = () => this._toggleGlyph(btn.dataset.glyph, btn);
        });

        this.element = el;
        this.loadLevel();

        return el;
    }

    loadLevel() {
        // Generate Level Data via Engine
        this.data = generateLevel(this.levelId, this.thresholdTier);

        // Render Base Components
        this.grid.render(this.data.grid);
        this.question.render(this.data.question);

        // --- LENS SYSTEM INIT ---
        const availableLenses = this.data.thresholdConfig.lensModes || ['lens_standard'];
        this.currentLensIndex = 0;
        LensController.setActiveLens(availableLenses[0]);

        const lensOutput = LensController.applyLens(
            this.data.grid,
            this.data.patternMetadata,
            this.data.datasetRules,
            this.data.thresholdConfig
        );
        
        this.lensRenderer.clear();
        this.lensRenderer.render(lensOutput);
        
        // Update Lens UI Label
        const lensBtn = this.element.querySelector('#lens-toggle');
        if (lensBtn) {
            const label = lensBtn.querySelector('.lens-label');
            if (label && lensOutput) {
                label.textContent = `Lens: ${lensOutput.name}`;
            }
        }

        // --- GLYPH SYSTEM INIT ---
        // Compute all potential glyphs for this dataset using the Engine
        const glyphOutputs = GlyphController.computeGlyphs(
            this.data.grid,
            this.data.patternMetadata,
            this.data.datasetRules
        );

        // Map glyphs for easy retrieval by toggle buttons
        this.computedGlyphs.clear();
        glyphOutputs.forEach(g => {
            this.computedGlyphs.set(g.id, g);
        });

        // Ensure visuals are cleared from previous levels
        this.glyphRenderer.clearAll();
        
        // Note: We compute them here so they are ready, but we do not auto-render them 
        // via renderAll() unless we want them all visible at start. 
        // Default behavior is player-toggled.
        
        // Add click interaction for scratchpad (Marking cells)
        this._setupGridInteractions();

        // Configure Hint Button Visibility
        const hintLevel = this.data.thresholdConfig.hintLevel;
        if (hintLevel === 'none') {
            this.hintBtn.style.display = 'none';
        } else {
            this.hintBtn.style.display = 'flex';
            this.hintBtn.innerHTML = `Invoke Hint <span class="hint-badge">${hintLevel}</span>`;
            this.hintBtn.disabled = false;
            this.hintBtn.classList.remove('used');
        }
    }

    _handleHint() {
        // Use the engine's formatting/hint data
        if (this.data.formatting) {
            this.grid.applyFormatting(this.data.formatting);
            this.hintBtn.disabled = true;
            this.hintBtn.innerHTML = `Hint Invoked <span class="check">✓</span>`;
            this.hintBtn.classList.add('used');
        }
    }

    /**
     * Enables basic click-to-mark functionality for the player.
     * This is purely visual scratchpad functionality.
     */
    _setupGridInteractions() {
        const gridCells = this.element.querySelectorAll('.grid-cell');
        gridCells.forEach(cell => {
            cell.onclick = () => {
                cell.classList.toggle('marked');
            };
        });
    }

    /**
     * Cycles through available lens modes defined by the current Tier.
     */
    _cycleLens(btn) {
        const availableLenses = this.data.thresholdConfig.lensModes || ['lens_standard'];
        
        this.currentLensIndex = (this.currentLensIndex + 1) % availableLenses.length;
        const nextLensId = availableLenses[this.currentLensIndex];
        
        LensController.setActiveLens(nextLensId);
        
        const lensOutput = LensController.applyLens(
            this.data.grid,
            this.data.patternMetadata,
            this.data.datasetRules,
            this.data.thresholdConfig
        );
        
        this.lensRenderer.clear();
        this.lensRenderer.render(lensOutput);
        
        const label = btn.querySelector('.lens-label');
        if (label && lensOutput) {
            label.textContent = `Lens: ${lensOutput.name}`;
        }
    }

    /**
     * Toggles a visual glyph overlay using the GlyphRenderer.
     * No computation happens here; we simply toggle the visibility of the pre-computed glyph.
     */
    _toggleGlyph(glyphId, btn) {
        // Retrieve the pre-computed glyph object
        const glyph = this.computedGlyphs.get(glyphId);
        
        // If the engine produced a result for this glyph type, toggle it
        if (glyph) {
            this.glyphRenderer.toggle(glyph);
            btn.classList.toggle('active');
        } else {
            // Optional: visual feedback if glyph found nothing (e.g., shake button)
            console.log(`No glyphs of type ${glyphId} found in this dataset.`);
        }
    }

    handleSubmit(ans) {
        const correct = String(this.data.question.answer).toLowerCase().trim();
        const input = String(ans).toLowerCase().trim();

        if (input === correct) {
            GameState.completeLevel(this.levelId);
            
            this.element.querySelector('.challenge-panel').classList.add('success-pulse');

            this.feedback.showCorrect(
                () => {
                    UIRouter.navigateTo('ChallengeScreen', {
                        levelId: this.levelId + 1,
                        thresholdTier: this.thresholdTier
                    });
                },
                this.data.thresholdConfig.rewardMultiplier
            );
        } else {
            this.feedback.showIncorrect(correct);
            const panel = this.element.querySelector('.challenge-panel');
            panel.classList.add('shake');
            setTimeout(() => panel.classList.remove('shake'), 500);
        }
    }

    destroy() {
        this.element = null;
        if (this.lensRenderer) {
            this.lensRenderer.clear();
        }
        if (this.glyphRenderer) {
            this.glyphRenderer.clearAll();
        }
    }
}
