export class FeedbackDisplay {

    constructor(container) {
        this.container = container;
        this.element = container;
    }

    showCorrect(onNext, multiplier = 1) {
        if (typeof onNext !== 'function') {
            console.error("FeedbackDisplay.showCorrect: onNext must be a function");
            return;
        }

        // Reset + apply success styling with mythic transition
        this.container.className = 'panel feedback-panel success mythic-fade-in';

        // 🔮 Mythic UI: Victory Glyphs and Treasure Runes
        this.container.innerHTML = `
            <div class="mythic-feedback-content">
                <div class="glyph-icon success-glyph">★</div>
                <h3>The Pattern Aligns</h3>
                <p class="flavor-text">The ancient mechanism clicks into place.</p>
                <div class="reward-container">
                    <span class="reward-label">Reward Multiplier</span>
                    <strong class="treasure-rune glow-gold">${multiplier}x</strong>
                </div>
                <button class="control-btn primary full-width next-level-btn">Next Level</button>
            </div>
        `;

        const btn = this.container.querySelector('button');
        btn.onclick = onNext;

        this.container.classList.remove('hidden');
    }

    showIncorrect(correctAnswer) {
        // Reset + apply error styling with mythic transition
        this.container.className = 'panel feedback-panel error mythic-pulse';

        // 🔮 Mythic UI: Failure Glyphs and Shake Animation
        this.container.innerHTML = `
            <div class="mythic-feedback-content">
                <div class="glyph-icon error-glyph">⚡</div>
                <h3>The Truth Eludes You</h3>
                <p class="flavor-text">The symbols remain dormant.</p>
                <div class="correction-zone">
                    <span class="correction-label">The correct sigil was:</span>
                    <strong class="reveal-answer">${correctAnswer}</strong>
                </div>
                <button class="control-btn secondary full-width try-again-btn flicker-effect">Try Again</button>
            </div>
        `;

        const btn = this.container.querySelector('button');
        btn.onclick = () => this.clear();

        this.container.classList.remove('hidden');
    }

    clear() {
        this.container.innerHTML = '';
        this.container.classList.add('hidden');
        // Clean up classes to default state
        this.container.className = 'panel feedback-panel hidden';
    }

    destroy() {
        // Lifecycle consistency with other components
        this.clear();
        this.element = null;
        this.container = null;
    }
}
