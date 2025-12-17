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
        el.className = 'screen level-select-ritual fade-in';

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
        const activeClass = isActive ? 'active' : '';
        
        return `
            <div class="ritual-card ${tier.className} ${activeClass}" data-id="${tier.id}">
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
                    ${isActive ? '<div class="active-indicator">VOW TAKEN</div>' : ''}
                </div>
            </div>
        `;
    }

    /**
     * Updates internal state and visual classes when a tier is clicked
     */
    handleTierClick(tierId) {
        if (this.currentTierId === tierId) return;

        this.currentTierId = tierId;
        this._playSound('select_tier');

        // Update UI without full re-render for performance
        const allCards = this.element.querySelectorAll('.ritual-card');
        allCards.forEach(card => {
            const id = parseInt(card.dataset.id);
            if (id === tierId) {
                card.classList.add('active');
                if (!card.querySelector('.active-indicator')) {
                    // Inject the "VOW TAKEN" text dynamically if you want, 
                    // or just let CSS handle the border/glow
                    const indicator = document.createElement('div');
                    indicator.className = 'active-indicator fade-in';
                    indicator.innerText = 'VOW TAKEN';
                    card.querySelector('.card-inner').appendChild(indicator);
                }
            } else {
                card.classList.remove('active');
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
            node.className = `rune-node ${isLocked ? 'locked-void' : 'unlocked-path'}`;
            
            // Inner HTML for specific styling hooks
            if (isLocked) {
                node.innerHTML = `<span class="lock-icon">🔒</span><span class="level-num">${i}</span>`;
                node.title = "Complete previous levels to unlock";
                node.disabled = true;
            } else {
                node.innerHTML = `<span class="rune-glow"></span><span class="level-num">${i}</span>`;
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
        
        // Add a small delay for a "entering portal" animation effect if desired
        this.element.classList.add('ritual-complete');
        
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
