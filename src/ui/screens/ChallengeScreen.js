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
        
        // 🔮 Mythic UI: Theme Propagation
        // Inject theme class based on Vow (e.g., 'theme-hunter') to style entire screen
        const tier = TIER_CONFIG[this.thresholdTier] || TIER_CONFIG[1];
        const themeClass = `theme-${tier.name.toLowerCase()}`;
        
        el.className = `screen challenge-screen fade-in ${themeClass}`;

        el.innerHTML = `
            <!-- ZONE A: LEFT PANEL - THE HUNTER'S ANCHOR -->
            <!-- 🔮 Mythic UI: Added .anchor-zone wrapper -->
            <aside class="nav-panel anchor-zone">
                <div class="nav-top">
                    <button id="withdraw-btn" class="control-btn secondary nav-back">
                        <span class="icon">↩</span> Withdraw
                    </button>
                </div>
                
                <div class="tier-display">
                    <div class="tier-rune tier-pulse">${tier.rune}</div>
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
            <!-- 🔮 Mythic UI: Added .ritual-field wrapper -->
            <main class="challenge-field ritual-field">
                <div class="grid-wrapper">
                    <!-- The Grid Component Mount Point -->
                    <!-- 🔮 Mythic UI: Hooks for lens highlights added via JS -->
                    <div class="dataset-grid" id="grid"></div>
                    
                    <!-- Dynamic Lens Summary Overlay (Legends/Stats) -->
                    <!-- 🔮 Mythic UI: Visibility toggled via MutationObserver or JS -->
                    <div id="lens-summary" class="lens-summary"></div>
                </div>

                <!-- ZONE C: BOTTOM PANEL - GLYPH BAR & LENS -->
                <!-- 🔮 Mythic UI: Added .glyph-zone and .lens-zone structure -->
                <footer class="mythic-controls glyph-zone">
                    <div class="lens-zone">
                        <div class="lens-selector" id="lens-toggle" title="Change Perspective">
                            <span class="lens-icon">👁️</span>
                            <span class="lens-label">Lens: Standard</span>
                        </div>
                    </div>
                    
                    <div class="glyph-bar">
                        ${GLYPHS.map(g => `
                            <button class="glyph-button" 
                                data-glyph="${g.id}" 
                                data-glyph-name="${g.name}"
                                title="${g.desc}">
                                <span class="glyph-icon">${g.icon}</span>
                                <span class="glyph-name">${g.name}</span>
                                <!-- 🔮 Mythic UI: Indicator hook for counts -->
                                <span class="glyph-indicator"></span>
                            </button>
                        `).join('')}
                    </div>
                </footer>
            </main>

            <!-- ZONE D: RIGHT PANEL - THE CHALLENGE SCROLL -->
            <!-- 🔮 Mythic UI: Added .scroll-zone wrapper -->
            <aside class="challenge-panel scroll-zone panel-reveal">
                <div class="scroll-content">
                    <h3 class="panel-header">The Query</h3>
                    
                    <!-- Question & Feedback Mount Points -->
                    <!-- 🔮 Mythic UI: Added .question-frame, .question-sigil, .feedback-frame, .feedback-sigil -->
                    <div id="question" class="question-container query-zone question-frame question-sigil"></div>
                    <div id="feedback" class="feedback-container feedback-zone feedback-frame feedback-sigil hidden"></div>

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

        // 🔮 Mythic UI: MutationObserver for Lens Summary Visibility
        // Automatically toggles .lens-summary-visible when content exists
        const summaryObserver = new MutationObserver((mutations) => {
            const summary = el.querySelector('#lens-summary');
            if (summary.innerHTML.trim() !== '') {
                summary.classList.add('lens-summary-visible');
            } else {
                summary.classList.remove('lens-summary-visible');
            }
        });
        summaryObserver.observe(el.querySelector('#lens-summary'), { childList: true, subtree: true });

        // GlyphRenderer Integration
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
            btn.onclick = () => this._toggleGlyph(btn.dataset.glyph, btn);
            
            // 🔮 Mythic UI: Hover hooks
            btn.onmouseenter = () => btn.classList.add('glyph-hover');
            btn.onmouseleave = () => btn.classList.remove('glyph-hover');
        });

        this.element = el;
        this.loadLevel();

        return el;
    }

    loadLevel() {
        // Generate Level Data via Engine
        this.data = generateLevel(this.levelId, this.thresholdTier);
        console.log("CHALLENGE DATA:", this.data);

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
        
        // Update Lens UI Label & Metadata
        const lensBtn = this.element.querySelector('#lens-toggle');
        const gridEl = this.element.querySelector('#grid');
        
        if (lensBtn && lensOutput) {
            const label = lensBtn.querySelector('.lens-label');
            if (label) {
                label.textContent = `Lens: ${lensOutput.name}`;
            }
            // 🔮 Mythic UI: Mark active lens, add metadata
            lensBtn.classList.add('lens-active');
            lensBtn.setAttribute('data-lens-id', lensOutput.id);
            lensBtn.setAttribute('data-lens-name', lensOutput.name);
            
            // 🔮 Mythic UI: Add lens mode class to Grid for CSS hooks
            // Maps lens_focus -> .lens-focus, lens_structure -> .lens-structure
            const modeClass = lensOutput.id.replace('_', '-');
            gridEl.className = `dataset-grid ${modeClass} lens-highlight`;
        }

        // --- GLYPH SYSTEM INIT ---
        // Compute all potential glyphs
        const glyphOutputs = GlyphController.computeGlyphs(
            this.data.grid,
            this.data.patternMetadata,
            this.data.datasetRules
        );

        // Map glyphs for easy retrieval
        this.computedGlyphs.clear();
        glyphOutputs.forEach(g => {
            this.computedGlyphs.set(g.id, g);
        });

        // 🔮 Mythic UI: Update Glyph Bar Metadata
        // Visually disable or highlight buttons based on whether they have data
        const glyphBtns = this.element.querySelectorAll('.glyph-button');
        glyphBtns.forEach(btn => {
            const id = btn.dataset.glyph;
            const glyphData = this.computedGlyphs.get(id);
            const count = (glyphData && glyphData.cells) ? glyphData.cells.length : 0;
            
            // Reset classes
            btn.classList.remove('glyph-has-data', 'glyph-no-data', 'active', 'glyph-activated');
            
            if (count > 0) {
                btn.classList.add('glyph-has-data');
                btn.dataset.count = count; // CSS can use content: attr(data-count)
            } else {
                btn.classList.add('glyph-no-data');
                btn.dataset.count = 0;
            }
        });

        // Ensure visuals are cleared from previous levels
        this.glyphRenderer.clearAll();
        
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
            this.hintBtn.classList.remove('used', 'hint-used');
        }
    }

    _handleHint() {
        if (this.data.formatting) {
            this.grid.applyFormatting(this.data.formatting);
            this.hintBtn.disabled = true;
            this.hintBtn.innerHTML = `Hint Invoked <span class="check">✓</span>`;
            // 🔮 Mythic UI: Animation hook
            this.hintBtn.classList.add('used', 'hint-used');

            // 🔮 Mythic UI: Reveal Sigil Hint
            // Triggers the transformation of the cryptic sigil into a readable clue
            this.question.revealSigilHint();
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
                // 🔮 Mythic UI: Add animation class for marking interaction
                if (cell.classList.contains('marked')) {
                    cell.classList.add('marked-animate');
                } else {
                    cell.classList.remove('marked-animate');
                }
            };
        });
    }

    /**
     * Cycles through available lens modes defined by the current Tier.
     */
    _cycleLens(btn) {
        const availableLenses = this.data.thresholdConfig.lensModes || ['lens_standard'];
        
        // 🔮 Mythic UI: Animation trigger for transition
        btn.classList.add('lens-transition');
        setTimeout(() => btn.classList.remove('lens-transition'), 300);

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
        
        const gridEl = this.element.querySelector('#grid');
        const label = btn.querySelector('.lens-label');
        
        if (lensOutput) {
            if (label) label.textContent = `Lens: ${lensOutput.name}`;
            
            // 🔮 Mythic UI: Update hooks
            btn.setAttribute('data-lens-id', lensOutput.id);
            btn.setAttribute('data-lens-name', lensOutput.name);
            
            // Update grid classes for lens mode hooks
            const modeClass = lensOutput.id.replace('_', '-');
            // Preserve 'dataset-grid' and add new mode + generic 'lens-highlight'
            gridEl.className = `dataset-grid ${modeClass} lens-highlight`;
        }
    }

    /**
     * Toggles a visual glyph overlay using the GlyphRenderer.
     */
    _toggleGlyph(glyphId, btn) {
        const glyph = this.computedGlyphs.get(glyphId);
        const gridEl = this.element.querySelector('#grid');
        
        if (glyph) {
            this.glyphRenderer.toggle(glyph);
            btn.classList.toggle('active');
            
            // 🔮 Mythic UI: Explicit activation hook
            if (btn.classList.contains('active')) {
                btn.classList.add('glyph-activated');
            } else {
                btn.classList.remove('glyph-activated');
            }
            
            // 🔮 Mythic UI: Grid container hook for active glyphs
            // Check if any buttons are active
            const anyActive = Array.from(this.element.querySelectorAll('.glyph-button'))
                .some(b => b.classList.contains('active'));
                
            if (anyActive) {
                gridEl.classList.add('glyph-highlight');
            } else {
                gridEl.classList.remove('glyph-highlight');
            }
            
        } else {
            console.log(`No glyphs of type ${glyphId} found in this dataset.`);
            // 🔮 Mythic UI: Error shake hook
            btn.classList.add('glyph-empty-shake');
            setTimeout(() => btn.classList.remove('glyph-empty-shake'), 400);
        }
    }

    handleSubmit(ans) {
        const correct = String(this.data.question.answer).toLowerCase().trim();
        const input = String(ans).toLowerCase().trim();
        const feedbackContainer = this.element.querySelector('#feedback');

        if (input === correct) {
            GameState.completeLevel(this.levelId);
            
            // 🔮 Mythic UI: Success hooks
            this.element.querySelector('.challenge-panel').classList.add('success-pulse', 'panel-success');
            
            // Add specific feedback hooks
            feedbackContainer.classList.remove('feedback-incorrect');
            feedbackContainer.classList.add('feedback-correct');

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
            
            // 🔮 Mythic UI: Shake hook and incorrect state
            feedbackContainer.classList.remove('feedback-correct');
            feedbackContainer.classList.add('feedback-incorrect');
            
            panel.classList.add('shake', 'panel-shake');
            setTimeout(() => panel.classList.remove('shake', 'panel-shake'), 500);
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
