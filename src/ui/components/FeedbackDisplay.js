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

        // Reset + apply success styling
        this.container.className = 'panel feedback-panel success';

        this.container.innerHTML = `
            <h3>Correct!</h3>
            <p>Reward Multiplier: <strong>${multiplier}x</strong></p>
            <button class="control-btn primary full-width">Next Level</button>
        `;

        const btn = this.container.querySelector('button');
        btn.onclick = onNext;

        this.container.classList.remove('hidden');
    }

    showIncorrect(correctAnswer) {
        // Reset + apply error styling
        this.container.className = 'panel feedback-panel error';

        this.container.innerHTML = `
            <h3>Incorrect</h3>
            <p>Answer: <strong>${correctAnswer}</strong></p>
            <button class="control-btn secondary full-width">Try Again</button>
        `;

        const btn = this.container.querySelector('button');
        btn.onclick = () => this.clear();

        this.container.classList.remove('hidden');
    }

    clear() {
        this.container.innerHTML = '';
        this.container.classList.add('hidden');
    }

    destroy() {
        // Lifecycle consistency with other components
        this.clear();
        this.element = null;
        this.container = null;
    }
}
