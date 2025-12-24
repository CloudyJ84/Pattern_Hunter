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
// 🔧 Sigil Subsystem Imports
import { SigilController } from '../../engine/sigils/SigilController.js';
import { SigilRenderer } from '../components/SigilRenderer.js';
import { registerAllSigils } from '../../engine/sigils/registerSigils.js';

// Register all sigil definitions immediately
registerAllSigils();

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

/**
 * Mapping of semantic lens types (from PatternEngine) to Lens IDs (in LensController).
 */
const lensTypeToLensId = {
    stats: 'lens_xray',
    frequency: 'lens_summary',
    unique: 'lens_summary',
    weekend: 'lens_summary',
    none: 'lens_standard'
};

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
        this.currentLensMode = 'lens_standard'; // Tracks ID for sync
        this.activeGlyphs = new Set(); // Keep track of active buttons for UI state
        
        // Storage for computed glyphs from the controller
        this.computedGlyphs = new Map();
        // Storage for computed sigils
        this.currentSigils = [];

        // Systems
        this.lensRenderer = null;
        this.glyphRenderer = null;
        this.sigilRenderer = null;
        
        // Alias for snippet compatibility
        this.gridRenderer = null;
        this.analytics = null;
    }

    mount() {
        const el = document.createElement('div');
        
        // 🔮 Mythic UI: Theme Propagation
        // Inject theme class based on Vow (e.g., 'theme-hunter') to style entire screen
        const tier = TIER_CONFIG[this.thresholdTier] || TIER_CONFIG[1];
        const themeClass = `theme-${tier.name.toLowerCase()}`;
        
        el.className = `screen challenge-screen fade-in ${themeClass}`;

        el.innerHTML = `
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

            <main class="challenge-field ritual-field">
                <div class="grid-wrapper">
                    <div class="dataset-grid" id="grid"></div>
                    
                    <div id="lens-summary" class="lens-summary"></div>
                </div>

                <footer class="mythic-controls glyph-zone">
                    <div class="lens-zone">
                        <div class="lens-selector" id="lens-toggle" title="Change Perspective">
                            <span class="lens-icon">👁️</span>
                            <span class="lens-label">Lens: Standard</span>
                        </div>
                        <div class="lens-bar"></div>
                    </div>
                    
                    <div class="glyph-bar">
                        ${GLYPHS.map(g => `
                            <button class="glyph-button glyph" 
                                data-glyph="${g.id}" 
                                data-glyph-name="${g.name}"
                                title="${g.desc}">
                                <span class="glyph-icon">${g.icon}</span>
                                <span class="glyph-name">${g.name}</span>
                                <span class="glyph-indicator"></span>
                            </button>
                        `).join('')}
                    </div>
                </footer>
            </main>

            <aside class="challenge-panel scroll-zone panel-reveal">
                <div class="scroll-content">
                    <h3 class="panel-header">
                        The Query
                    </h3>
                    
                    <div class="sigil-zone"></div>

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
        this.gridRenderer = this.grid; // Alias for new methods
        
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

        // SigilRenderer Integration
        let sigilZone = el.querySelector('.sigil-zone');
        if (!sigilZone) {
            // Fallback creation if HTML structure changes
            sigilZone = document.createElement('div');
            sigilZone.className = 'sigil-zone';
            const qBlock = el.querySelector('.question-container') || el.querySelector('#question');
            if (qBlock) qBlock.parentElement.insertBefore(sigilZone, qBlock);
        }
        this.sigilRenderer = new SigilRenderer(sigilZone);

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

        // 🔧 1. Hide the Old Lens Toggle Button (Non-destructive)
        if (lensBtn) lensBtn.style.display = 'none';

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
        // Cleanup previous state
        if (this.sigilRenderer) this.sigilRenderer.clearAll();

        // Generate Level Data via Engine
        this.data = generateLevel(this.levelId, this.thresholdTier);
        // Alias for snippet compatibility
        this.gridCells = this.data.grid;
        // 🔧 4. Ensure renderChallenge() Wires Lens Metadata
        this.analytics = this.data.analytics; // store for lens use

        console.log("CHALLENGE DATA:", this.data);

        // Render Base Components
        this.grid.render(this.data.grid);
        this.question.render(this.data.question);

        // --- SIGIL SYSTEM INIT ---
        // 1. Compute sigils from analytics
        const allSigils = SigilController.computeSigils(this.analytics);
        
        // 🔮 Mythic UI: Select Primary Sigil
        // Filter to ensure only the most relevant sigil is shown to the user
        const primary = this._selectPrimarySigil(allSigils);
        this.currentSigils = primary ? [primary] : [];

        // 2. Render sigils near question block
        this.sigilRenderer.renderAll(this.currentSigils);

        // --- LENS SYSTEM INIT ---
        const availableLenses = this.data.thresholdConfig.lensModes || ['lens_standard'];
        this.currentLensIndex = 0;
        this.currentLensMode = availableLenses[0];
        
        // Render New Lens Bar
        this._renderLensBar(availableLenses);

        const lensType = this.data.patternMetadata?.lens?.type || 'none';
        const lensId = lensTypeToLensId[lensType] || 'lens_standard';
        LensController.setActiveLens(lensId);

        const lensOutput = LensController.applyLens(
            this.data.grid,
            this.analytics,
            this.data.datasetRules,
            this.data.thresholdConfig
        );
        
        this.lensRenderer.clear();
        this.lensRenderer.render(lensOutput);
        
        // Update Lens UI Label & Metadata (Legacy + New)
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
            this.analytics,       // NEW: pass analytics metadata
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

        // 🔧 INTEGRATION PATCHES: Wire everything into render
        // Ensure metadata objects exist safely
        const patternMeta = this.data.patternMetadata || { lens: { type: this.currentLensMode, summaries: [] }, glyphs: { activate: [] } };
        // Use stored analytics if available, or fallback
        const analytics = this.analytics || { glyphs: {}, distribution: { above: [], below: [] }, unique: { indices: [] }, frequency: { repeated: [] }, weekends: { indices: [] }, sigilSupport: {} };

        this.updateLensBar(patternMeta);
        this.updateGlyphBar(patternMeta, analytics);
    }
    
    _renderLensBar(availableLenses) {
        const bar = this.element.querySelector('.lens-bar');
        if (!bar) return;
        
        bar.innerHTML = availableLenses.map(lens => {
            // strip 'lens_' prefix for display
            const label = lens.replace('lens_', '').toUpperCase();
            return `<button class="lens-button" data-lens="${lens}">${label}</button>`;
        }).join('');
        
        // 🔧 2. Add Lens Button Wiring
        bar.querySelectorAll('.lens-button').forEach(btn => {
            btn.addEventListener('click', () => {
                const lensId = btn.dataset.lens;
                
                // Update internal state
                this.currentLensMode = lensId;
                this.currentLensIndex = availableLenses.indexOf(lensId);
                
                // Keep Legacy Controller Logic for consistency (LensRenderer text)
                LensController.setActiveLens(lensId);
                const lensOutput = LensController.applyLens(
                    this.data.grid,
                    this.analytics,
                    this.data.datasetRules,
                    this.data.thresholdConfig
                );
                this.lensRenderer.clear();
                this.lensRenderer.render(lensOutput);
                
                const gridEl = this.element.querySelector('#grid');
                if (lensOutput) {
                    const modeClass = lensOutput.id.replace('_', '-');
                    gridEl.className = `dataset-grid ${modeClass} lens-highlight`;
                }
                
                // Update the lens bar UI
                this.updateLensBar({ lens: { type: lensId, summaries: lensOutput?.summaries || [] } });

                // Apply the lens to the grid (New GridRenderer call)
                if (this.gridRenderer && this.analytics) {
                    this.gridRenderer.applyLens(lensId, this.analytics);
                }
            });
        });
    }

    // 🔮 Mythic UI: Helper Method to Isolate Primary Sigil
    _selectPrimarySigil(sigilList) {
        if (!Array.isArray(sigilList) || sigilList.length === 0) return null;

        // Prefer question-specified sigil if available
        const preferredId = this.data?.question?.sigilId;
        if (preferredId) {
            const match = sigilList.find(s => s.id === preferredId);
            if (match) return match;
        }

        // Otherwise, pick strongest active sigil
        return sigilList
            .filter(s => s.active)
            .sort((a, b) => (b.strength || 0) - (a.strength || 0))[0] || null;
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
            // 🔧 NEW INTEGRATION: Use SigilRenderer
            if (this.currentSigils && this.currentSigils.length > 0) {
                // Determine target: use specific if question asks, otherwise primary
                const target = this.currentSigils.find(s => s.id === this.data.question.sigilId) 
                             || this.currentSigils[0];
                
                if (target) {
                    this.sigilRenderer.revealHint(target.id);
                }
            }
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
        
        // 🔧 INTEGRATION PATCH: Sync State
        this.currentLensMode = nextLensId;

        LensController.setActiveLens(nextLensId);
        
        const lensOutput = LensController.applyLens(
            this.data.grid,
            this.analytics,
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
        
        // 🔧 3. Sync _cycleLens With the Lens Bar
        this.updateLensBar({ lens: { type: this.currentLensMode, summaries: lensOutput?.summaries || [] } });
        
        if (this.gridRenderer && this.analytics) {
            this.gridRenderer.applyLens(this.currentLensMode, this.analytics);
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
    
    // 🔧 3. Add Lens Bar Integration
    updateLensBar(patternMeta) {
        const lensButtons = this.element.querySelectorAll('.lens-button');
        lensButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lens === patternMeta.lens.type);
        });

        const summaryEl = this.element.querySelector('.lens-summary');
        if (summaryEl && patternMeta.lens.summaries) {
            summaryEl.textContent = patternMeta.lens.summaries.join(', ');
        }
    }

    // 🔧 6. Add Glyph Bar Integration
    updateGlyphBar(patternMeta, analytics) {
        const glyphEls = this.element.querySelectorAll('.glyph');
        glyphEls.forEach(glyph => {
            const id = glyph.dataset.glyph;
            // Ensure patternMeta.glyphs.activate exists
            const activeList = patternMeta.glyphs && patternMeta.glyphs.activate ? patternMeta.glyphs.activate : [];
            
            glyph.classList.toggle('active', activeList.includes(id));
            glyph.classList.toggle('present', analytics.glyphs[id] === true);
        });
    }

    destroy() {
        this.element = null;
        if (this.lensRenderer) {
            this.lensRenderer.clear();
        }
        if (this.glyphRenderer) {
            this.glyphRenderer.clearAll();
        }
        if (this.sigilRenderer) {
            this.sigilRenderer.clearAll();
        }
    }
}
