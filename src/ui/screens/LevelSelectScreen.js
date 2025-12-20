import { UIRouter } from '../UIRouter.js';
import { GameState } from '../../state/gameState.js';

// Configuration for the "Vows" (Tiers)
const TIER_CONFIG = [
    {
        id: 0,
        name: 'SCOUT',
        multiplier: 1.0,
        hints: 'High',
        flavor: 'The path is lit. The unseen is revealed.',
        className: 'tier-scout'
    },
    {
        id: 1,
        name: 'HUNTER',
        multiplier: 1.5,
        hints: 'Medium',
        flavor: 'Shadows deepen. Trust your instincts.',
        className: 'tier-hunter'
    },
    {
        id: 2,
        name: 'TRACKER',
        multiplier: 2.0,
        hints: 'Low',
        flavor: 'Silence falls. The prey is listening.',
        className: 'tier-tracker'
    },
    {
        id: 3,
        name: 'MYTHIC',
        multiplier: 3.0,
        hints: 'None',
        flavor: 'Gaze into the void. Only truth remains.',
        className: 'tier-mythic'
    }
];

export class LevelSelectScreen {

    constructor() {
        // Default to Hunter (id: 1) if nothing selected previously
        this.currentTierId = GameState.selectedTier !== undefined ? GameState.selectedTier : 1;
        this.element = null;
        this.handleTierClick = this.handleTierClick.bind(this);
    }

    mount() {
        const el = document.createElement('div');
        
        // 🔮 Mythic UI: Apply initial theme based on selected tier
        const initialTier = TIER_CONFIG.find(t => t.id === this.currentTierId);
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
        // Added 'tier-hover' hooks in render function below
        const tierSection = `
            <section class="tier-selection-zone">
                <h3 class="section-label">1. Make your Vow</h3>
                <div class="tier-cards-container">
                    ${TIER_CONFIG.map(tier => this._renderTierCard(tier)).join('')}
                </div>
            </section>
        `;

        // 3. The Path (Level Grid)
        const levelSection = `
            <section class="level-grid-zone">
                <h3 class="section-label">2. Select the Path</h3>
                <div class="runic-grid" id="level-grid-container">
                    <!-- Levels injected via JS -->
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
            const card = e.target.closest('.ritual-card');
            if (card) {
                this.handleTierClick(parseInt(card.dataset.id));
            }
        });

        // Initial Render of Grid
        this.element = el;
        this._renderLevelGrid();
        
        return el;
    }

    /**
     * Generates HTML for a single tier card
     */
    _renderTierCard(tier) {
        const isActive = this.currentTierId === tier.id;
        // 🔮 Mythic UI: Add glow and pulse hooks for active state
        const activeClass = isActive ? 'active tier-glow' : '';
        const hoverClass = 'tier-hover'; // Hook for hover animations
        
        return `
            <div class="ritual-card ${tier.className} ${activeClass} ${hoverClass}" data-id="${tier.id}">
                <div class="card-inner">
                    <div class="card-header">
                        <span class="tier-name">${tier.name}</span>
                        <span class="tier-mult">×${tier.multiplier.toFixed(1)}</span>
                    </div>
                    <div class="card-body">
                        <p class="flavor-text">"${tier.flavor}"</p>
                        <div class="stat-row">
                            <span class="label">Guidance:</span>
                            <span class="value">${tier.hints}</span>
                        </div>
                    </div>
                    <!-- 🔮 Mythic UI: Add vow sigil/flare hooks -->
                    ${isActive ? '<div class="active-indicator vow-sigil vow-flare">VOW TAKEN</div>' : ''}
                </div>
            </div>
        `;
    }

    /**
     * Updates internal state and visual classes when a tier is clicked
     */
    handleTierClick(tierId) {
        if (this.currentTierId === tierId) return;

        // 🔮 Mythic UI: Remove old theme class
        const oldTier = TIER_CONFIG.find(t => t.id === this.currentTierId);
        if (oldTier && this.element) {
            this.element.classList.remove(`theme-${oldTier.name.toLowerCase()}`);
        }

        this.currentTierId = tierId;
        this._playSound('select_tier');

        // 🔮 Mythic UI: Add new theme class to root element
        const newTier = TIER_CONFIG.find(t => t.id === this.currentTierId);
        if (newTier && this.element) {
            this.element.classList.add(`theme-${newTier.name.toLowerCase()}`);
        }

        // Update UI without full re-render for performance
        const allCards = this.element.querySelectorAll('.ritual-card');
        allCards.forEach(card => {
            const id = parseInt(card.dataset.id);
            if (id === tierId) {
                // 🔮 Mythic UI: Add glow hooks
                card.classList.add('active', 'tier-glow');
                if (!card.querySelector('.active-indicator')) {
                    const indicator = document.createElement('div');
                    // 🔮 Mythic UI: Add flare/sigil hooks
                    indicator.className = 'active-indicator fade-in vow-sigil vow-flare';
                    indicator.innerText = 'VOW TAKEN';
                    card.querySelector('.card-inner').appendChild(indicator);
                }
            } else {
                card.classList.remove('active', 'tier-glow');
                const ind = card.querySelector('.active-indicator');
                if (ind) ind.remove();
            }
        });

        // Optional: Refresh grid if levels look different based on tier
        this._renderLevelGrid(); 
    }

    /**
     * Renders the level grid based on GameState
     */
    _renderLevelGrid() {
        const gridContainer = this.element.querySelector('#level-grid-container');
        gridContainer.innerHTML = ''; // Clear current

        const maxLevel = 10;
        // Ensure we default to 1 if state is undefined
        const unlockedMax = GameState.state.maxLevelReached || 1; 

        for (let i = 1; i <= maxLevel; i++) {
            const isLocked = i > unlockedMax;
            
            const node = document.createElement('button');
            // 🔮 Mythic UI: Add specific hooks for locked vs unlocked states
            // rune-pulse, rune-shimmer for unlocked | locked-void for locked
            node.className = `rune-node ${isLocked ? 'locked-void' : 'unlocked-path rune-pulse rune-hover'}`;
            
            // Inner HTML for specific styling hooks
            if (isLocked) {
                node.innerHTML = `<span class="lock-icon">🔒</span><span class="level-num">${i}</span>`;
                node.title = "Complete previous levels to unlock";
                // 🔮 Mythic UI: Data attribute for CSS-based lore tooltips
                node.setAttribute('data-lore', 'The Void bars your way.');
                node.disabled = true;
            } else {
                // 🔮 Mythic UI: rune-glow container inside
                node.innerHTML = `<span class="rune-glow rune-shimmer"></span><span class="level-num">${i}</span>`;
                node.onclick = () => this._launchLevel(i);
                
                // Add hover effect via JS if needed, or stick to CSS
                node.onmouseenter = () => this._playSound('hover');
            }

            gridContainer.appendChild(node);
        }
    }

    /**
     * Finalizes selection and navigates
     */
    _launchLevel(levelNum) {
        // Save the chosen tier to Global State so the Engine can read it
        GameState.selectedTier = this.currentTierId;
        
        this._playSound('confirm_start');
        
        // 🔮 Mythic UI: Add comprehensive transition hooks
        // ritual-complete: triggers base sequence
        // portal-active: triggers specific portal visuals
        // screen-glow: washes out the screen
        this.element.classList.add('ritual-complete', 'portal-active', 'screen-glow');
        
        setTimeout(() => {
            UIRouter.navigateTo('ChallengeScreen', {
                levelNumber: levelNum,
                tier: this.currentTierId // Passing param explicitly as backup
            });
        }, 300);
    }

    /**
     * Placeholder for audio system integration
     */
    _playSound(type) {
        // console.log(`[Audio] Playing ${type}`);
        // if (window.AudioController) window.AudioController.play(type);
    }

    destroy() {
        // Clean up listeners or timers if added
        this.element = null;
    }
}
