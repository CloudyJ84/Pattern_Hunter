import { UIRouter } from '../UIRouter.js';

export class HomeScreen {

    constructor() {
        this.element = null;
    }

    mount() {
        const el = document.createElement('div');
        el.className = 'screen centered-layout fade-in';

        el.innerHTML = `
            <h1 class="home-title">PATTERN HUNTER</h1>
            <p class="home-subtitle">Identify the Anomaly.</p>
            <button class="control-btn primary home-start-btn">
                Start Campaign
            </button>
        `;

        // Wire up navigation
        el.querySelector('.home-start-btn').onclick = () => {
            UIRouter.navigateTo('LevelSelectScreen');
        };

        this.element = el;
        return el;
    }

    destroy() {
        // No cleanup needed yet, but the method exists for consistency
        this.element = null;
    }
}
