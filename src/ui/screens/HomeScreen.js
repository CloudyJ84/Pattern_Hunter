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

    // Determine subtitle based on ritual state (player history)
    getSubtitle() {
        try {
            // Check for persistent state to welcome the hunter back
            const hasHistory = localStorage.getItem('pattern_hunter_level_progress');
            return hasHistory ? "The Archive awaits your return." : "Begin the Hunt. Choose your Path.";
        } catch (e) {
            // Fallback if storage is blocked
            return "Begin the Hunt. Choose your Path.";
        }
    }

    mount() {
        const el = document.createElement('div');
        el.className = 'screen home-screen fade-in';

        // Select a random invocation for this session
        const randomInvocation = INVOCATIONS[Math.floor(Math.random() * INVOCATIONS.length)];
        
        // Resolve subtitle based on state
        const subtitleText = this.getSubtitle();

        el.innerHTML = `
            <div class="home-content-wrapper centered-layout">
                
                <!-- ⚜️ Title Block: The Sigil Zone -->
                <header class="home-header title-block sigil-zone">
                    <div class="sigil-container sigil-glow">
                        <h1 class="mythic-title">PATTERN HUNTER</h1>
                    </div>
                    <div class="title-separator"></div>
                    <p class="mythic-subtitle">${subtitleText}</p>
                </header>

                <!-- ⚜️ Flavor Panel: The Invocation Zone -->
                <div class="flavor-panel invocation-zone">
                    <div class="invocation-box invocation-breath">
                        <span class="rune-decor start"></span>
                        <!-- Added opacity and transition for ritual timing -->
                        <p id="invocation-text" class="invocation-text whisper-text" style="opacity: 0; transition: opacity 2s ease-in-out;">"${randomInvocation}"</p>
                        <span class="rune-decor end"></span>
                    </div>
                </div>

                <!-- ⚜️ Action Zone: The Threshold -->
                <div class="button-zone threshold-zone threshold-pulse">
                    <!-- Enhanced hierarchy: Primary is bold/prominent -->
                    <button id="start-btn" class="control-btn primary home-start-btn" style="font-weight: 700; letter-spacing: 0.05em;">
                        Enter the Temple
                    </button>
                    <!-- Enhanced hierarchy: Secondary is visually quieter -->
                    <button id="lore-btn" class="control-btn secondary home-lore-btn" style="opacity: 0.85; font-size: 0.9em;">
                        The Prophecy
                    </button>
                </div>
            </div>

            <!-- ⚜️ Lore Modal: Hidden by default -->
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

                            <!-- Micro-orientation line: Mythic bridge to mechanics -->
                            <p style="margin-top: 1.5rem; color: #88a; font-style: italic; text-align: center;">
                                To restore the Archive, you must align the Lens, decipher the Glyph, and forge the Sigil.
                            </p>

                            <!-- Concept Triad: Revealed knowledge -->
                            <div class="concept-triad" style="display: flex; justify-content: space-evenly; margin-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem;">
                                <div style="text-align: center;">
                                    <div style="font-size: 1.5em; margin-bottom: 0.2rem;">⟡</div>
                                    <div style="font-size: 0.8em; letter-spacing: 0.1em; opacity: 0.8;">GLYPH</div>
                                </div>
                                <div style="text-align: center;">
                                    <div style="font-size: 1.5em; margin-bottom: 0.2rem;">◎</div>
                                    <div style="font-size: 0.8em; letter-spacing: 0.1em; opacity: 0.8;">LENS</div>
                                </div>
                                <div style="text-align: center;">
                                    <div style="font-size: 1.5em; margin-bottom: 0.2rem;">꩜</div>
                                    <div style="font-size: 0.8em; letter-spacing: 0.1em; opacity: 0.8;">SIGIL</div>
                                </div>
                            </div>
                        </div>

                        <div class="lore-footer footer-sigil">
                            <span class="sigil-mark">📜</span>
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

        // Ritual Timing: Fade in invocation text after title stabilizes
        // This creates a sense of the Archive "waking up" to the user's presence
        setTimeout(() => {
            const invocationText = el.querySelector('#invocation-text');
            if (invocationText) {
                invocationText.style.opacity = '1';
            }
        }, 1200);

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
