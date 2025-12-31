import { generateLevel } from '../../engine/levelEngine.js';
import { LevelController } from '../../engine/level/LevelController.js'; 
import { GameState } from '../../state/gameState.js';
import { UIRouter } from '../UIRouter.js';
import { GridRenderer } from '../components/GridRenderer.js';
import { QuestionDisplay } from '../components/QuestionDisplay.js';
import { FeedbackDisplay } from '../components/FeedbackDisplay.js';
import { LensRenderer } from '../components/LensRenderer.js';
import { GlyphRenderer } from '../components/GlyphRenderer.js';
import { SigilRenderer } from '../components/SigilRenderer.js';

/**
 * Glyph Definitions for the Bottom Bar.
 * 'css' corresponds to classes in main.css.
 * Kept for UI rendering (Icons/Names).
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
        
        // 🔧 Level Controller Integration for Scripted Levels
        this.levelDefinition = params.levelDefinition || params.levelDef || null;
        this.isScripted = !!this.levelDefinition;

        // Fallback to GameState if param is missing, default to Hunter (1)
        this.thresholdTier = (params.thresholdTier !== undefined) 
            ? Number(params.thresholdTier) 
            : (GameState.selectedTier !== undefined ? Number(GameState.selectedTier) : 1);

        this.data = null; // Will hold the new Challenge Object
        this.element = null;
        
        // Visual State
        this.activeGlyphs = new Set(); 
        
        // Systems
        this.lensRenderer = null;
        this.glyphRenderer = null;
        this.sigilRenderer = null;
        this.gridRenderer = null;
    }

    mount() {
        // 1. PRE-LOAD DATA to get Tier Config for UI
        this._loadLevelData();

        const el = document.createElement('div');
        
        // Extract Tier Config from the generated challenge
        const tierConfig = this.data.thresholdConfig || { name: 'UNKNOWN', tier: 0, rune: '?', flavor: '' };
        const tierName = tierConfig.name;
        const tierRune = tierConfig.rune || '👁️';
        const tierFlavor = tierConfig.flavor || '';
        const tierMult = tierConfig.rewardMultiplier || tierConfig.mult || '1.0';

        // Inject theme class
        const themeClass = `theme-${tierName.toLowerCase()}`;
        
        el.className = `screen challenge-screen fade-in ${themeClass}`;

        el.innerHTML = `
            <aside class="nav-panel anchor-zone">
                <div class="nav-top">
                    <button id="withdraw-btn" class="control-btn secondary nav-back">
                        <span class="icon">↩</span> Withdraw
                    </button>
                </div>
                
                <div class="tier-display">
                    <div class="tier-rune tier-pulse">${tierRune}</div>
                    <div class="tier-info">
                        <div class="label">Current Vow</div>
                        <div class="value class-${tierName.toLowerCase()}">${tierName}</div>
                        <div class="mult">Reward ×${tierMult}</div>
                    </div>
                    <div class="tier-flavor">"${tierFlavor}"</div>
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
                        <div class="lens-selector" id="lens-toggle" title="Lens Perspective">
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
                        <!-- Injected Button for Grid Selections -->
                        <button id="submit-btn" class="control-btn primary hidden">
                            Confirm Signal
                        </button>
                    </div>
                </div>
            </aside>
        `;

        // --- Event Wiring ---

        // Navigation
        el.querySelector('#withdraw-btn').onclick = () => {
            if (this.isScripted) LevelController.teardown();
            UIRouter.navigateTo('LevelSelectScreen');
        };

        // Component Instances
        this.grid = new GridRenderer(el.querySelector('#grid'));
        this.gridRenderer = this.grid; 
        
        this.lensRenderer = new LensRenderer(
            el.querySelector('#grid'),
            el.querySelector('#lens-summary')
        );

        // Lens Summary Observer
        const summaryObserver = new MutationObserver((mutations) => {
            const summary = el.querySelector('#lens-summary');
            if (summary && summary.innerHTML.trim() !== '') {
                summary.classList.add('lens-summary-visible');
            } else if (summary) {
                summary.classList.remove('lens-summary-visible');
            }
        });
        const summaryEl = el.querySelector('#lens-summary');
        if(summaryEl) summaryObserver.observe(summaryEl, { childList: true, subtree: true });

        this.glyphRenderer = new GlyphRenderer(el.querySelector('#grid'));

        // SigilRenderer Integration
        let sigilZone = el.querySelector('.sigil-zone');
        this.sigilRenderer = new SigilRenderer(sigilZone);

        this.question = new QuestionDisplay(
            el.querySelector('#question'),
            (ans) => this.handleSubmit(ans)
        );
        this.feedback = new FeedbackDisplay(el.querySelector('#feedback'));

        // Hint Logic
        this.hintBtn = el.querySelector('#hint-btn');
        this.hintBtn.onclick = () => this._handleHint();
        
        // Submit Logic (Scripted Levels)
        this.submitBtn = el.querySelector('#submit-btn');
        this.submitBtn.onclick = () => this._handleScriptedSubmit();

        // Lens Logic (Simplified - Visual Only)
        const lensBtn = el.querySelector('#lens-toggle');
        // We no longer cycle lenses computationally. The engine provides the specific lens view.
        if (lensBtn) {
            lensBtn.classList.add('lens-active', 'static-lens'); 
        }

        // Glyph Logic
        el.querySelectorAll('.glyph-button').forEach(btn => {
            btn.onclick = () => this._toggleGlyph(btn.dataset.glyph, btn);
            btn.onmouseenter = () => btn.classList.add('glyph-hover');
            btn.onmouseleave = () => btn.classList.remove('glyph-hover');
        });

        this.element = el;

        // Render the Content
        this._renderLevelContent();

        return el;
    }

    /**
     * Centralized Data Loading.
     * Populates this.data with the Challenge Object.
     */
    _loadLevelData() {
        if (this.isScripted) {
            // Adapt LevelController output to Challenge Object structure
            const config = LevelController.init(this.levelDefinition);
            this.data = {
                grid: config.grid,
                question: { text: config.narrative.intro, sigilId: null },
                thresholdConfig: {
                    name: 'SCRIPTED',
                    tier: 1, // Default to Hunter-equivalent
                    rune: '📜',
                    flavor: config.narrative.title || 'A scripted trial.',
                    hintLevel: config.guidance.showHints ? 'standard' : 'none',
                    rewardMultiplier: 1
                },
                formatting: {
                    highlightedCells: [], // Handled by script logic usually
                    activeGlyphs: config.systems.glyphs || [],
                    lensSummaries: [],
                    uiContext: 'scripted'
                },
                patternMeta: {
                    label: 'Scripted',
                    sigil: null,
                    lens: { type: 'none', summaries: [] }
                },
                analytics: {}, // Scripted levels handle their own logic
                config: config
            };
        } else {
            // 🎯 NEW ENGINE INTEGRATION
            this.data = generateLevel(this.levelId, this.thresholdTier);
        }
    }

    /**
     * Renders the loaded data to components.
     */
    _renderLevelContent() {
        // Clear previous state
        if (this.sigilRenderer) this.sigilRenderer.clearAll();
        this.activeGlyphs.clear();

        const { grid, formatting, question, patternMeta, analytics, thresholdConfig } = this.data;

        // 1. Render Grid
        this.grid.render(grid);

        // 2. Render Question
        const isCellSelection = this.isScripted && this.data.config?.inputType === 'cell_selection';
        this.question.render({ 
            text: question.text, 
            noInput: isCellSelection,
            sigilId: question.sigilId
        });

        if (isCellSelection) {
            this.submitBtn.classList.remove('hidden');
            this._setupGridInteractions();
        }

        // 3. Render Lens Info
        // Use pre-computed summaries from formatting
        if (this.lensRenderer && formatting.lensSummaries) {
            const lensName = patternMeta?.lens?.label || 'Standard';
            const lensId = patternMeta?.lens?.type || 'standard';
            
            // Render text summary
            this.lensRenderer.render({
                id: lensId,
                name: lensName,
                summaries: formatting.lensSummaries
            });

            // Update Lens UI Label
            const lensBtn = this.element.querySelector('#lens-toggle');
            if (lensBtn) {
                const label = lensBtn.querySelector('.lens-label');
                if (label) label.textContent = `Lens: ${lensName}`;
                lensBtn.setAttribute('data-lens-id', lensId);
            }

            // Apply lens styling to grid
            const gridEl = this.element.querySelector('#grid');
            const modeClass = lensId.replace('_', '-');
            gridEl.className = `dataset-grid ${modeClass} lens-highlight`;
        }

        // 4. Render Sigils
        if (this.sigilRenderer && patternMeta?.sigil) {
            // Render the primary sigil associated with the pattern
            this.sigilRenderer.renderAll([patternMeta.sigil]);
        }

        // 5. Update Glyph Bar
        this.updateGlyphBar(formatting.activeGlyphs, analytics);

        // 6. Configure Hint Button
        const hintLevel = thresholdConfig.hintLevel; // 'high', 'medium', 'low', 'none'
        if (hintLevel === 'none') {
            this.hintBtn.style.display = 'none';
        } else {
            this.hintBtn.style.display = 'flex';
            this.hintBtn.innerHTML = `Invoke Hint <span class="hint-badge">${hintLevel.toUpperCase()}</span>`;
            this.hintBtn.disabled = false;
            this.hintBtn.classList.remove('used', 'hint-used');
        }
    }

    updateGlyphBar(activeGlyphs, analytics) {
        const glyphEls = this.element.querySelectorAll('.glyph');
        glyphEls.forEach(glyph => {
            const id = glyph.dataset.glyph;
            const isActive = activeGlyphs && activeGlyphs.includes(id);
            
            // Visual state
            glyph.classList.toggle('glyph-has-data', isActive);
            glyph.classList.toggle('glyph-no-data', !isActive);
            
            // If analytics provides counts, use them (optional polish)
            // Assuming analytics.glyphs[id] might be a boolean or count in new engine
            // If not available, we rely on activeGlyphs existence
            glyph.dataset.count = isActive ? '1' : '0'; 
        });
    }

    _handleHint() {
        if (this.data.formatting && this.data.formatting.highlightedCells) {
            // Apply the pre-calculated highlights
            this.grid.applyFormatting(this.data.formatting);
            
            this.hintBtn.disabled = true;
            this.hintBtn.innerHTML = `Hint Invoked <span class="check">✓</span>`;
            this.hintBtn.classList.add('used', 'hint-used');

            // Reveal Sigil Hint if available
            if (this.data.patternMeta?.sigil) {
                this.sigilRenderer.revealHint(this.data.patternMeta.sigil.id);
            }
        }
    }

    _toggleGlyph(glyphId, btn) {
        // In the new system, we don't compute glyphs on the fly.
        // We just check if it's active in the challenge data.
        const isActive = this.data.formatting.activeGlyphs.includes(glyphId);
        const gridEl = this.element.querySelector('#grid');

        if (isActive) {
            // Toggle visual state
            btn.classList.toggle('active');
            const isNowActive = btn.classList.contains('active');
            
            if (isNowActive) {
                btn.classList.add('glyph-activated');
                // Tell GlyphRenderer to show this glyph's overlay if needed
                // For simplified UI, we rely on the button state.
            } else {
                btn.classList.remove('glyph-activated');
            }

            // Update grid container hook
            const anyActive = Array.from(this.element.querySelectorAll('.glyph-button'))
                .some(b => b.classList.contains('active'));
            gridEl.classList.toggle('glyph-highlight', anyActive);

        } else {
            // Shake effect for empty/inactive glyphs
            btn.classList.add('glyph-empty-shake');
            setTimeout(() => btn.classList.remove('glyph-empty-shake'), 400);
        }
    }

    _setupGridInteractions() {
        const gridCells = this.element.querySelectorAll('.grid-cell');
        gridCells.forEach(cell => {
            cell.onclick = () => {
                cell.classList.toggle('marked');
                if (cell.classList.contains('marked')) {
                    cell.classList.add('marked-animate');
                } else {
                    cell.classList.remove('marked-animate');
                }
            };
        });
    }

    _handleScriptedSubmit() {
        if (!this.isScripted) return;

        const selectedElements = this.element.querySelectorAll('.grid-cell.marked');
        const selection = Array.from(selectedElements).map(el => ({
            row: parseInt(el.dataset.row),
            col: parseInt(el.dataset.col)
        }));

        const result = LevelController.evaluatePlayerAction({
            type: 'cell_selection',
            value: selection
        });

        this._handleFeedback(result);
    }

    handleSubmit(ans) {
        if (this.isScripted) {
             const result = LevelController.evaluatePlayerAction({
                type: 'text_input',
                value: ans
            });
            this._handleFeedback(result);
        } else {
            // Generated Level Check
            const correct = String(this.data.question.answer).toLowerCase().trim();
            const input = String(ans).toLowerCase().trim();

            if (input === correct) {
                this._handleFeedback({ success: true, feedback: "Correct" });
            } else {
                this._handleFeedback({ success: false, feedback: "Incorrect" });
            }
        }
    }

    _handleFeedback(result) {
        const feedbackContainer = this.element.querySelector('#feedback');
        const panel = this.element.querySelector('.challenge-panel');

        if (result.success) {
            panel.classList.add('success-pulse', 'panel-success');
            feedbackContainer.classList.remove('feedback-incorrect');
            feedbackContainer.classList.add('feedback-correct');

            if (this.isScripted && result.lore) {
                this.question.element.innerHTML = `
                    <div class="lore-payload fade-in">
                        <h4 class="lore-title">ARCHIVE UNLOCKED</h4>
                        <p class="mythic-text">${result.lore.mythicText}</p>
                        <hr class="lore-divider">
                        <p class="pedagogy-text">${result.lore.pedagogyText}</p>
                    </div>
                `;
                this.submitBtn.style.display = 'none';
            }

            const mult = this.data.thresholdConfig.rewardMultiplier || 1.0;

            this.feedback.showCorrect(
                () => {
                    if (this.isScripted && result.progression) {
                         UIRouter.navigateTo('LevelSelectScreen');
                    } else {
                        // Advance Level
                        UIRouter.navigateTo('ChallengeScreen', {
                            levelId: this.levelId + 1,
                            thresholdTier: this.thresholdTier
                        });
                    }
                },
                mult,
                result.feedback
            );

        } else {
            this.feedback.showIncorrect(result.feedback || "Incorrect");
            feedbackContainer.classList.remove('feedback-correct');
            feedbackContainer.classList.add('feedback-incorrect');
            
            panel.classList.add('shake', 'panel-shake');
            setTimeout(() => panel.classList.remove('shake', 'panel-shake'), 500);
        }
    }

    destroy() {
        if (this.isScripted) {
            LevelController.teardown();
        }
        this.element = null;
        if (this.lensRenderer) this.lensRenderer.clear();
        if (this.glyphRenderer) this.glyphRenderer.clearAll();
        if (this.sigilRenderer) this.sigilRenderer.clearAll();
    }
}
