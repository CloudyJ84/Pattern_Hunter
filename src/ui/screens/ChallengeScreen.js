import { generateLevel } from '../../engine/levelEngine.js';
import { GameState } from '../../state/gameState.js';
import { UIRouter } from '../UIRouter.js';
import { GridRenderer } from '../components/GridRenderer.js';
import { QuestionDisplay } from '../components/QuestionDisplay.js';
import { FeedbackDisplay } from '../components/FeedbackDisplay.js';

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
        this.activeGlyphs = new Set();
        this.lensMode = 0; // 0: Standard, 1: Focus, 2: Structure
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
                    <!-- The Grid Component Mount Point -->
                    <div class="dataset-grid" id="grid"></div>
                    
                    <!-- Dynamic Lens Summary Overlay -->
                    <div id="lens-summary" class="lens-summary hidden"></div>
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
        });

        this.element = el;
        this.loadLevel();

        return el;
    }

    loadLevel() {
        // Generate Level Data via Engine
        this.data = generateLevel(this.levelId, this.thresholdTier);

        // Render Components
        this.grid.render(this.data.grid);
        this.question.render(this.data.question);

        // Post-Processing: Analyze grid data to power visual glyphs
        this._analyzeGridForVisuals();
        
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
     * Cycles through lens modes: Standard -> Focus -> Structure (X-Ray).
     */
    _cycleLens(btn) {
        this.lensMode = (this.lensMode + 1) % 3;
        const gridEl = this.element.querySelector('#grid');
        const label = btn.querySelector('.lens-label');

        // Reset
        gridEl.classList.remove('lens-focus', 'lens-xray');

        if (this.lensMode === 0) {
            label.textContent = "Lens: Standard";
        } else if (this.lensMode === 1) {
            gridEl.classList.add('lens-focus');
            label.textContent = "Lens: Focus";
        } else {
            gridEl.classList.add('lens-xray');
            label.textContent = "Lens: Structure";
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
     * Applies the CSS class associated with a glyph to the pre-calculated indices.
     */
    _applyVisuals(glyphId, apply) {
        const targetIndices = this.analyzedMap.get(glyphId) || [];
        const cells = this.element.querySelectorAll('.grid-cell');
        const glyphConfig = GLYPHS.find(g => g.id === glyphId);
        
        if (!glyphConfig) return;

        targetIndices.forEach(index => {
            if (cells[index]) {
                if (apply) cells[index].classList.add(glyphConfig.css);
                else cells[index].classList.remove(glyphConfig.css);
            }
        });
    }

    /**
     * Scans the grid data to calculate visual groups (above mean, outliers, etc.).
     * This runs on the client side to provide visual feedback without altering game logic.
     */
    _analyzeGridForVisuals() {
        this.analyzedMap.clear();
        const gridData = this.data.grid;
        if (!gridData || !gridData.length) return;

        const isNum = (v) => !isNaN(parseFloat(v)) && isFinite(v);
        
        // 1. Numerical Analysis
        const numItems = gridData.map((val, idx) => ({ val: parseFloat(val), idx })).filter(x => isNum(x.val));
        
        if (numItems.length > 0) {
            const sum = numItems.reduce((a, b) => a + b.val, 0);
            const mean = sum / numItems.length;
            
            // Standard Deviation (Simple) for Outliers
            const variance = numItems.reduce((a, b) => a + Math.pow(b.val - mean, 2), 0) / numItems.length;
            const stdDev = Math.sqrt(variance);

            const aboveIndices = numItems.filter(v => v.val > mean).map(v => v.idx);
            const belowIndices = numItems.filter(v => v.val < mean).map(v => v.idx);
            
            // Outliers: > 1.5 StdDev from mean (Adjustable visual threshold)
            const outlierIndices = numItems.filter(v => Math.abs(v.val - mean) > (1.5 * stdDev)).map(v => v.idx);

            this.analyzedMap.set('above', aboveIndices);
            this.analyzedMap.set('below', belowIndices);
            this.analyzedMap.set('outlier', outlierIndices);
        }

        // 2. Frequency / Unique Analysis
        const counts = {};
        gridData.forEach(val => {
            const key = String(val).toLowerCase();
            counts[key] = (counts[key] || 0) + 1;
        });

        const uniqueIndices = [];
        const freqIndices = [];

        gridData.forEach((val, idx) => {
            const key = String(val).toLowerCase();
            if (counts[key] === 1) uniqueIndices.push(idx);
            if (counts[key] > 1) freqIndices.push(idx);
        });

        this.analyzedMap.set('unique', uniqueIndices);
        this.analyzedMap.set('frequency', freqIndices);

        // 3. Weekend Analysis (String based)
        const weekendIndices = [];
        gridData.forEach((val, idx) => {
            const s = String(val).toLowerCase();
            if (s.includes('sat') || s.includes('sun')) {
                weekendIndices.push(idx);
            }
        });
        this.analyzedMap.set('weekend', weekendIndices);
    }

    handleSubmit(ans) {
        const correct = String(this.data.question.answer).toLowerCase().trim();
        const input = String(ans).toLowerCase().trim();

        if (input === correct) {
            GameState.completeLevel(this.levelId);
            
            this.element.querySelector('.challenge-panel').classList.add('success-pulse');

            this.feedback.showCorrect(
                () => {
                    // Navigate to next level but keep the same tier
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
    }
}
