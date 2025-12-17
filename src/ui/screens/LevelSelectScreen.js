import { UIRouter } from '../UIRouter.js';
import { GameState } from '../../state/gameState.js';

export class LevelSelectScreen {

    constructor() {
        this.selectedTier = 1; // Default: Hunter
        this.element = null;
    }

    mount() {
        const el = document.createElement('div');
        el.className = 'screen fade-in';

        el.innerHTML = `
            <header class="game-header">
                <button id="back" class="control-btn secondary">Back</button>
                <h2>Select Level</h2>
                <div style="width:50px"></div>
            </header>

            <div class="centered-layout" style="flex:1; padding:20px;">
                <div class="tier-buttons">
                    <button class="tier-btn" data-t="0">Scout</button>
                    <button class="tier-btn active" data-t="1">Hunter</button>
                    <button class="tier-btn" data-t="2">Tracker</button>
                    <button class="tier-btn" data-t="3">Mythic</button>
                </div>

                <div class="level-grid"></div>
            </div>
        `;

        // Back navigation
        el.querySelector('#back').onclick = () => {
            UIRouter.navigateTo('HomeScreen');
        };

        // Tier selection logic
        const tierButtons = el.querySelectorAll('.tier-btn');
        tierButtons.forEach(btn => {
            btn.onclick = () => {
                tierButtons.forEach(x => x.classList.remove('active'));
                btn.classList.add('active');
                this.selectedTier = parseInt(btn.dataset.t);
            };
        });

        // Level grid
        const grid = el.querySelector('.level-grid');
        for (let i = 1; i <= 10; i++) {
            const node = document.createElement('button');
            node.className = 'level-node';
            node.textContent = i;

            if (GameState.state.maxLevelReached >= i) {
                node.onclick = () => {
                    UIRouter.navigateTo('ChallengeScreen', {
                        levelId: i,
                        thresholdTier: this.selectedTier
                    });
                };
            } else {
                node.classList.add('locked');
            }

            grid.appendChild(node);
        }

        this.element = el;
        return el;
    }

    destroy() {
        // No persistent listeners yet, but this keeps lifecycle consistent
        this.element = null;
    }
}
