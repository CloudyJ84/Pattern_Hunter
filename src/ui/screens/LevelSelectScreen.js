import { UIRouter } from '../UIRouter.js';
import { GameState } from '../../state/gameState.js';
import thresholds from '../../data/thresholdsData.js';
// 🔧 New System Import: Authored Level Definitions
import scoutLevel from '../../engine/level/definitions/scout_threshold_01.js';

// Map tiers to Runes (Visual only, as they aren't in the data file yet)
const TIER_RUNES = ['👁', '⚔', '👣', '🔮', '⚛'];

// Map of Authored Levels: Tier Index -> { Sequence Order -> Level Definition }
const AUTHORED_LEVELS = {
    0: { // Scout (Index 0)
        1: scoutLevel
    }
};

export class LevelSelectScreen {

    constructor() {
        // Default to Hunter (index 1) if nothing selected previously
        this.selectedTier = GameState.selectedTier !== undefined ? GameState.selectedTier : 1;
        this.element = null;
        this.handleTierClick = this.handleTierClick.bind(this);
    }

    mount() {
        const el = document.createElement('div');
        
        // 🔮 Mythic UI: Apply initial theme based on selected tier
        const tiers = thresholds.tiers;
        const initialTier = tiers[this.selectedTier] || tiers[1];
        const themeClass = initialTier ? `theme-${initialTier.name.toLowerCase()}` : 'theme-hunter';
        
        el.className = `screen level-select-ritual fade-in ${themeClass}`;

        // 1. The Header
        const header = `
            <header class="ritual-header">
                <button id="back-btn" class="nav-rune">
                    <span class="icon">←</span> Return
                </button>
                <div class="title-block">
                    <h2>The Initiation</h2>
                    <p class="subtitle">Choose your Vow, then walk the Path.</p>
                </div>
                <div class="spacer"></div>
            </header>
        `;

        // 2. The Vow (Tier Selection)
        // Dynamically generating buttons from thresholdsData
        const tierButtons = tiers.map((t, index) => {
            const rune = TIER_RUNES[index] || '•'; // thresholdsData has no rune field; fallback only
            const isActive = index === this.selectedTier;
            
            // Using a button structure that preserves the visual richness of the original cards
            // while adhering to the new dynamic data source and simplified event handling.
            return `
                <button class="tier-btn ritual-card ${isActive ? 'active tier-glow' : ''}"
                        data-tier="${index}">
                    <div class="card-inner">
                        <div class="card-header">
                            <span class="tier-rune" style="font-size: 1.5em; margin-right: 10px;">${rune}</span>
                            <span class="tier-name">${t.name}</span>
                            <span class="tier-mult">×${(t.rewardMultiplier || 1).toFixed(1)}</span>
                        </div>
                        <div class="card-body">
                            <p class="flavor-text">"${t.flavor}"</p>
                            ${isActive ? '<div class="active-indicator vow-sigil vow-flare">VOW TAKEN</div>' : ''}
                        </div>
                    </div>
                </button>
            `;
        }).join('');

        const tierSection = `
            <section class="tier-selection-zone">
                <h3 class="section-label">1. Make your Vow</h3>
                <div class="tier-cards-container">
                    ${tierButtons}
                </div>
            </section>
        `;

        // 3. The Path (Level Grid)
        const levelSection = `
            <section class="level-grid-zone">
                <h3 class="section-label">2. Select the Path</h3>
                <div class="runic-grid" id="level-grid-container">
                    </div>
            </section>
        `;

        el.innerHTML = `${header}${tierSection}${levelSection}`;

        // --- Event Listeners & Logic ---

        // Back Button
        el.querySelector('#back-btn').onclick = () => {
            this._playSound('cancel');
            UIRouter.navigateTo('HomeScreen');
        };

        // Tier Selection (Event Delegation)
        const tierContainer = el.querySelector('.tier-cards-container');
        tierContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.tier-btn');
            if (btn) {
                this.handleTierClick(parseInt(btn.dataset.tier));
            }
        });

        // Initial Render of Grid
        this.element = el;
        this._renderLevelGrid();
        
        return el;
    }

    /**
     * Updates internal state and visual classes when a tier is clicked
     */
    handleTierClick(tierIndex) {
        if (this.selectedTier === tierIndex) return;

        const tiers = thresholds.tiers;
        const oldTier = tiers[this.selectedTier];
        
        // Remove old theme class
        if (oldTier && this.element) {
            this.element.classList.remove(`theme-${oldTier.name.toLowerCase()}`);
        }

        this.selectedTier = tierIndex;
        GameState.selectedTier = this.selectedTier;
        this._playSound('select_tier');

        // Add new theme class
        const newTier = tiers[this.selectedTier];
        if (newTier && this.element) {
            this.element.classList.add(`theme-${newTier.name.toLowerCase()}`);
        }

        // Update UI logic (Active states)
        const allBtns = this.element.querySelectorAll('.tier-btn');
        allBtns.forEach(btn => {
            const idx = parseInt(btn.dataset.tier);
            if (idx === tierIndex) {
                // Add active state
                btn.classList.add('active', 'tier-glow');
                // Re-inject the "VOW TAKEN" indicator if it's missing (visual flair)
                if (!btn.querySelector('.active-indicator')) {
                    const body = btn.querySelector('.card-body');
                    if (body) {
                        const indicator = document.createElement('div');
                        indicator.className = 'active-indicator fade-in vow-sigil vow-flare';
                        indicator.innerText = 'VOW TAKEN';
                        body.appendChild(indicator);
                    }
                }
            } else {
                // Remove active state
                btn.classList.remove('active', 'tier-glow');
                const ind = btn.querySelector('.active-indicator');
                if (ind) ind.remove();
            }
        });

        // Refresh grid in case availability changes based on tier
        this._renderLevelGrid(); 
    }

    /**
     * Renders the level grid based on GameState
     */
    _renderLevelGrid() {
        const gridContainer = this.element.querySelector('#level-grid-container');
        gridContainer.innerHTML = ''; // Clear current

        const maxLevel = 10;
        const unlockedMax = GameState.state.maxLevelReached || 1; 

        // Check if current tier has authored levels
        const tierAuthoredLevels = AUTHORED_LEVELS[this.selectedTier] || {};

        for (let i = 1; i <= maxLevel; i++) {
            const isLocked = i > unlockedMax;
            
            const node = document.createElement('button');
            // 🔮 Mythic UI: Add specific hooks for locked vs unlocked states
            node.className = `rune-node ${isLocked ? 'locked-void' : 'unlocked-path rune-pulse rune-hover'}`;
            
            const authoredLevel = tierAuthoredLevels[i];

            // Inner HTML for specific styling hooks
            if (isLocked) {
                node.innerHTML = `<span class="lock-icon">🔒</span><span class="level-num">${i}</span>`;
                node.title = "Complete previous levels to unlock";
                node.setAttribute('data-lore', 'The Void bars your way.');
                node.disabled = true;
            } else {
                node.innerHTML = `<span class="rune-glow rune-shimmer"></span><span class="level-num">${i}</span>`;
                node.onclick = () => this._launchLevel(i);
                node.onmouseenter = () => this._playSound('hover');

                if (authoredLevel) {
                    node.title = authoredLevel.name;
                    if (authoredLevel.subtitle) {
                        node.setAttribute('data-lore', authoredLevel.subtitle);
                    }
                }
            }

            gridContainer.appendChild(node);
        }
    }

    /**
     * Finalizes selection and navigates
     */
    _launchLevel(levelNum) {
        // Save the chosen tier to Global State so the Engine can read it
        GameState.selectedTier = this.selectedTier;
        
        this._playSound('confirm_start');
        
        // 🔮 Mythic UI: Add comprehensive transition hooks
        this.element.classList.add('ritual-complete', 'portal-active', 'screen-glow');
        
        setTimeout(() => {
            // 🔧 Route Logic: Authored vs Generated
            const authoredLevel = AUTHORED_LEVELS[this.selectedTier]?.[levelNum];

            if (authoredLevel) {
                // Route to Scripted Level
                UIRouter.navigateTo('ChallengeScreen', {
                    levelDefinition: authoredLevel
                });
            } else {
                // Route to Generated Level System
                // Passing levelId and thresholdTier explicitly
                UIRouter.navigateTo('ChallengeScreen', {
                    levelId: levelNum,
                    thresholdTier: this.selectedTier
                });
            }
        }, 300);
    }

    _playSound(type) {
        // console.log(`[Audio] Playing ${type}`);
        // if (window.AudioController) window.AudioController.play(type);
    }

    destroy() {
        this.element = null;
    }
}
