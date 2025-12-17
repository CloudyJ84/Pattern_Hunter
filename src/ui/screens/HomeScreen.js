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
    }

    mount() {
        const el = document.createElement('div');
        // Use 'home-screen' for specific background styling hooks
        el.className = 'screen home-screen fade-in';

        // Select a random invocation for this session
        const randomInvocation = INVOCATIONS[Math.floor(Math.random() * INVOCATIONS.length)];

        el.innerHTML = `
            <div class="home-content-wrapper centered-layout">
                
                <!-- Title Block: The Sigil -->
                <header class="home-header title-block">
                    <h1 class="mythic-title">PATTERN HUNTER</h1>
                    <div class="title-separator"></div>
                    <p class="mythic-subtitle">Begin the Hunt. Choose your Path.</p>
                </header>

                <!-- Flavor Panel: The Whisper -->
                <div class="flavor-panel">
                    <p class="invocation-text">"${randomInvocation}"</p>
                </div>

                <!-- Action Zone: The Threshold -->
                <div class="button-zone">
                    <button id="start-btn" class="control-btn primary home-start-btn">
                        Enter the Temple
                    </button>
                    <button id="lore-btn" class="control-btn secondary home-lore-btn">
                        The Prophecy
                    </button>
                </div>
            </div>

            <!-- Lore Modal: Hidden by default -->
            <div id="lore-modal" class="lore-modal hidden">
                <div class="lore-content panel">
                    <h2>The Infinite Archive</h2>
                    <p>
                        For eons, the data has flowed—vast rivers of numbers, dates, and signals. 
                        Most see only the grid. But you are a <strong>Hunter</strong>.
                    </p>
                    <p>
                        Your eye can spot the <em>Outlier</em>. Your mind knows the <em>Formula</em>. 
                        We do not wield swords; we wield <strong>Logic</strong>.
                    </p>
                    <p class="lore-footer">
                        Identify the anomaly. Cleanse the record.
                    </p>
                    <button id="close-lore-btn" class="control-btn secondary">
                        Return
                    </button>
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
