import { UIRouter } from '../UIRouter.js';

// Rotating flavor text to establish the "Living Archive" feel
const INVOCATIONS = [
    "The grid is silent until you speak.",
    "All patterns hide. All truths await.",
    "Perspective is power. Rotate the lens.",
    "The Archive remembers what is forgotten.",
    "Do not trust the chaos. Find the formula.",
    "Where others see noise, we see the signal."
];

export class HomeScreen {

    constructor() {
        this.element = null;
        // Bind methods to ensure 'this' context is preserved
        this.handleStart = this.handleStart.bind(this);
        this.toggleLore = this.toggleLore.bind(this);
        
        // 🔮 Mythic UI: Theme support hook
        // Can be swapped for 'theme-scout', 'theme-void', etc.
        this.theme = 'theme-mythic';
    }

    mount() {
        const el = document.createElement('div');
        // Use 'home-screen' for specific background styling hooks
        // Added dynamic theme class for global styling context
        el.className = `screen home-screen fade-in ${this.theme}`;

        // Select a random invocation for this session
        const randomInvocation = INVOCATIONS[Math.floor(Math.random() * INVOCATIONS.length)];

        el.innerHTML = `
            <div class="home-content-wrapper centered-layout">
                
                <!-- 🔮 Title Block: The Sigil Zone -->
                <header class="home-header title-block sigil-zone">
                    <div class="sigil-container sigil-glow">
                        <h1 class="mythic-title">PATTERN HUNTER</h1>
                    </div>
                    <div class="title-separator"></div>
                    <p class="mythic-subtitle">Begin the Hunt. Choose your Path.</p>
                </header>

                <!-- 🔮 Flavor Panel: The Invocation Zone -->
                <div class="flavor-panel invocation-zone">
                    <div class="invocation-box invocation-breath">
                        <span class="rune-decor start"></span>
                        <p class="invocation-text whisper-text">"${randomInvocation}"</p>
                        <span class="rune-decor end"></span>
                    </div>
                </div>

                <!-- 🔮 Action Zone: The Threshold -->
                <div class="button-zone threshold-zone threshold-pulse">
                    <button id="start-btn" class="control-btn primary home-start-btn">
                        Enter the Temple
                    </button>
                    <button id="lore-btn" class="control-btn secondary home-lore-btn">
                        The Prophecy
                    </button>
                </div>
            </div>

            <!-- 🔮 Lore Modal: Hidden by default -->
            <!-- Added modal-reveal hook for CSS entry animations -->
            <div id="lore-modal" class="lore-modal hidden modal-reveal">
                
                <!-- Added scroll-frame for "ancient tablet" styling possibilities -->
                <div class="lore-content panel scroll-frame">
                    <div class="lore-inner-content">
                        <h2 class="rune-header">The Infinite Archive</h2>
                        
                        <div class="lore-body">
                            <p>
                                For eons, the data has flowed—vast rivers of numbers, dates, and signals. 
                                Most see only the grid. But you are a <strong>Hunter</strong>.
                            </p>
                            <p>
                                Your eye can spot the <em>Outlier</em>. Your mind knows the <em>Formula</em>. 
                                We do not wield swords; we wield <strong>Logic</strong>.
                            </p>
                        </div>

                        <div class="lore-footer footer-sigil">
                            <span class="sigil-mark">⟡</span>
                            <span class="footer-text">Identify the anomaly. Cleanse the record.</span>
                        </div>
                        
                        <button id="close-lore-btn" class="control-btn secondary close-rune-btn">
                            Return
                        </button>
                    </div>
                </div>
            </div>
        `;

        // --- Event Listeners ---

        // Primary Navigation: Go to Level Select (The Ritual)
        el.querySelector('#start-btn').onclick = this.handleStart;

        // Lore Toggle
        el.querySelector('#lore-btn').onclick = this.toggleLore;
        el.querySelector('#close-lore-btn').onclick = this.toggleLore;

        // Close modal on outside click
        el.querySelector('#lore-modal').onclick = (e) => {
            if (e.target.id === 'lore-modal') {
                this.toggleLore();
            }
        };

        this.element = el;
        return el;
    }

    handleStart() {
        // Optional: Play a sound effect here if audio system exists
        UIRouter.navigateTo('LevelSelectScreen');
    }

    toggleLore() {
        const modal = this.element.querySelector('#lore-modal');
        if (modal) {
            modal.classList.toggle('hidden');
            // Add a fade-in animation class if opening
            if (!modal.classList.contains('hidden')) {
                modal.querySelector('.lore-content').classList.add('fade-in');
            }
        }
    }

    destroy() {
        // Remove event listeners to prevent memory leaks (though DOM removal handles most)
        if (this.element) {
            const startBtn = this.element.querySelector('#start-btn');
            if (startBtn) startBtn.onclick = null;
            
            const loreBtn = this.element.querySelector('#lore-btn');
            if (loreBtn) loreBtn.onclick = null;
        }
        this.element = null;
    }
}
