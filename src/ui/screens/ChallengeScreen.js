import { generateLevel } from '../../engine/levelEngine.js';
import { GameState } from '../../state/gameState.js';
import { UIRouter } from '../UIRouter.js';
import { GridRenderer } from '../components/GridRenderer.js';
import { QuestionDisplay } from '../components/QuestionDisplay.js';
import { FeedbackDisplay } from '../components/FeedbackDisplay.js';

/**
 * Configuration for the Mythic Vows (Tiers)
 */
const TIER_CONFIG = {
    0: { name: 'SCOUT', mult: '1.0', rune: '👁️', flavor: 'The path is lit.' },
    1: { name: 'HUNTER', mult: '1.5', rune: '🏹', flavor: 'Trust your instincts.' },
    2: { name: 'TRACKER', mult: '2.0', rune: '🐾', flavor: 'The prey is listening.' },
    3: { name: 'MYTHIC', mult: '3.0', rune: '🔮', flavor: 'Gaze into the void.' }
};

/**
 * Glyph Definitions for the Bottom Bar
 * Maps mythic names to the CSS formatting classes defined in main.css
 */
const GLYPHS = [
    { id: 'weekend', name: 'Twin Suns', css: 'fmt-weekend', type: 'date', desc: 'Reveals the resting days.' },
    { id: 'above', name: 'Rising Flame', css: 'fmt-above', type: 'number', desc: 'Highlights values ascending above the mean.' },
    { id: 'below', name: 'Falling Stone', css: 'fmt-below', type: 'number', desc: 'Highlights values sinking below the mean.' },
    { id: 'outlier', name: 'Broken Pattern', css: 'fmt-outlier', type: 'number', desc: 'Exposes data that defies the norm.' },
    { id: 'frequency', name: 'Echo', css: 'fmt-frequency', type: 'any', desc: 'Marks repeating signals.' },
    { id: 'unique', name: 'Lone Star', css: 'fmt-unique', type: 'any', desc: 'Identifies the singular.' }
];

export class ChallengeScreen {

    constructor(params) {
        this.levelId = params.levelId;
        this.thresholdTier = params.thresholdTier !== undefined ? params.thresholdTier : 1;
        this.data = null;
        this.element = null;
        
        // Visual State
        this.activeGlyphs = new Set();
        this.lensMode = 0; // 0: Standard, 1: Focus, 2: X-Ray
        this.analyzedMap = new Map(); // Stores cell indices for glyphs
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
                    <div class="dataset-grid" id="grid"></div>
                </div>

                <!-- ZONE C: BOTTOM PANEL - GLYPH BAR & LENS -->
                <footer class="mythic-controls">
                    <div class="lens-selector" id="lens-toggle">
                        <span class="lens-icon">👁️</span>
                        <span class="lens-label">Lens: Standard</span>
                    </div>
                    
                    <div class="glyph-bar">
                        ${GLYPHS.map(g => `
                            <button class="glyph-button" data-glyph="${g.id}" title="${g.desc}">
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
                    <div id="question" class="question-container"></div>
                    
                    <div class="action-area">
                        <button id="hint-btn" class="control-btn secondary hint-btn">
                            Invoke Hint
                        </button>
                    </div>

                    <div id="feedback" class="feedback-container hidden"></div>
                </div>
            </aside>
        `;

        // --- Wiring Up Logic ---

        // Navigation
        el.querySelector('#withdraw-btn').onclick = () => {
            UIRouter.navigateTo('LevelSelectScreen');
        };

        // Component Instances
        this.grid = new GridRenderer(el.querySelector('#grid'));
        this.question = new QuestionDisplay(
            el.querySelector('#question'),
            (ans) => this.handleSubmit(ans)
        );
        this.feedback = new FeedbackDisplay(el.querySelector('#feedback'));

        // Hint Button logic (wrapper for existing hint system)
        this.hintBtn = el.querySelector('#hint-btn');
        this.hintBtn.onclick = () => {
            this.grid.applyFormatting(this.data.formatting);
            this.hintBtn.disabled = true;
            this.hintBtn.innerHTML = `Hint Invoked <span class="check">✓</span>`;
            this.hintBtn.classList.add('used');
        };

        // Lens Toggle
        const lensBtn = el.querySelector('#lens-toggle');
        lensBtn.onclick = () => this._cycleLens(lensBtn);

        // Glyph Toggles
        el.querySelectorAll('.glyph-button').forEach(btn => {
            btn.onclick = () => this._toggleGlyph(btn.dataset.glyph, btn);
        });

        this.element = el;
        this.loadLevel();

        return el;
    }

    loadLevel() {
        this.data = generateLevel(this.levelId, this.thresholdTier);

        // Render Core Components
        this.grid.render(this.data.grid);
        this.question.render(this.data.question);

        // Setup Visuals
        this._analyzeGridForVisuals();
        this._setupGridInteractions();

        // Configure Hint Button based on Tier/Level config
        const hintLevel = this.data.thresholdConfig.hintLevel;
        if (hintLevel === 'none') {
            this.hintBtn.style.display = 'none';
        } else {
            this.hintBtn.style.display = 'block';
            this.hintBtn.innerHTML = `Invoke Hint <span class="hint-badge">${hintLevel}</span>`;
            this.hintBtn.disabled = false;
            this.hintBtn.classList.remove('used');
        }
    }

    /**
     * Post-processing step to add marks/interactions to the rendered grid
     * without modifying the underlying renderer logic.
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
     * Cycles through visual lens modes (Standard -> Focus -> X-Ray)
     */
    _cycleLens(btn) {
        this.lensMode = (this.lensMode + 1) % 3;
        const gridEl = this.element.querySelector('#grid');
        const label = btn.querySelector('.lens-label');

        // Reset classes
        gridEl.classList.remove('lens-focus', 'lens-xray');

        if (this.lensMode === 0) {
            label.textContent = "Lens: Standard";
        } else if (this.lensMode === 1) {
            gridEl.classList.add('lens-focus');
            label.textContent = "Lens: Focus";
        } else {
            gridEl.classList.add('lens-xray');
            label.textContent = "Lens: X-Ray";
        }
    }

    /**
     * Toggles a visual glyph overlay on the grid.
     */
    _toggleGlyph(glyphId, btn) {
        if (this.activeGlyphs.has(glyphId)) {
            this.activeGlyphs.delete(glyphId);
            btn.classList.remove('active');
            this._applyVisuals(glyphId, false);
        } else {
            this.activeGlyphs.add(glyphId);
            btn.classList.add('active');
            this._applyVisuals(glyphId, true);
        }
    }

    /**
     * Applies or removes the CSS class for a specific glyph to relevant cells.
     */
    _applyVisuals(glyphId, apply) {
        const targetIndices = this.analyzedMap.get(glyphId) || [];
        const cells = this.element.querySelectorAll('.grid-cell');
        const cssClass = GLYPHS.find(g => g.id === glyphId).css;

        targetIndices.forEach(index => {
            if (cells[index]) {
                if (apply) cells[index].classList.add(cssClass);
                else cells[index].classList.remove(cssClass);
            }
        });
    }

    /**
     * Analyzes the generated grid data to calculate visual overlays.
     * This ensures the Glyph Bar works visually without changing game logic.
     */
    _analyzeGridForVisuals() {
        this.analyzedMap.clear();
        const gridData = this.data.grid;
        if (!gridData || !gridData.length) return;

        // Helper: Is this a number?
        const isNum = (v) => !isNaN(parseFloat(v));
        
        // 1. Gather numerical data for stats
        const values = gridData.map((val, idx) => ({ val, idx })).filter(item => isNum(item.val));
        const numValues = values.map(v => parseFloat(v.val));
        
        if (numValues.length > 0) {
            const sum = numValues.reduce((a, b) => a + b, 0);
            const mean = sum / numValues.length;
            
            // Calc indices
            const aboveIndices = values.filter(v => parseFloat(v.val) > mean).map(v => v.idx);
            const belowIndices = values.filter(v => parseFloat(v.val) < mean).map(v => v.idx);
            
            // Simple visual outlier detection (roughly > 200% of mean or huge deviation)
            // This is purely visual feedback, not the strict engine logic
            const outlierIndices = values.filter(v => {
                const diff = Math.abs(parseFloat(v.val) - mean);
                return diff > mean * 0.8; // Arbitrary visual threshold
            }).map(v => v.idx);

            this.analyzedMap.set('above', aboveIndices);
            this.analyzedMap.set('below', belowIndices);
            this.analyzedMap.set('outlier', outlierIndices);
        }

        // 2. Frequency / Unique
        const counts = {};
        gridData.forEach(val => counts[val] = (counts[val] || 0) + 1);
        
        const uniqueIndices = [];
        const freqIndices = [];
        
        gridData.forEach((val, idx) => {
            if (counts[val] === 1) uniqueIndices.push(idx);
            if (counts[val] > 1) freqIndices.push(idx);
        });

        this.analyzedMap.set('unique', uniqueIndices);
        this.analyzedMap.set('frequency', freqIndices);

        // 3. Weekend (Mock logic: assumes 7-col grid or date strings)
        // Since we don't have strict date parsing in this UI layer, 
        // we leave this empty or perform a basic check if the string contains "Sat"/"Sun"
        const weekendIndices = gridData.map((val, idx) => {
            const s = String(val).toLowerCase();
            return (s.includes('sat') || s.includes('sun')) ? idx : -1;
        }).filter(i => i !== -1);
        
        this.analyzedMap.set('weekend', weekendIndices);
    }

    handleSubmit(ans) {
        const correct = String(this.data.question.answer).toLowerCase().trim();
        const input = String(ans).toLowerCase().trim();

        if (input === correct) {
            GameState.completeLevel(this.levelId);
            
            // Visual success effect on the panel
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
            // Visual shake effect
            const panel = this.element.querySelector('.challenge-panel');
            panel.classList.add('shake');
            setTimeout(() => panel.classList.remove('shake'), 500);
        }
    }

    destroy() {
        this.element = null;
    }
}
