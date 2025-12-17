import { UIRouter } from '../UIRouter.js';
import { GameState } from '../../state/gameState.js';

export class LevelSelectScreen {
    constructor() { this.tier = 1; }
    mount() {
        const el = document.createElement('div');
        el.className = 'screen';
        el.innerHTML = `
            <header class="game-header"><button id="back">Back</button><h2>Select Level</h2><div></div></header>
            <div style="padding:20px; text-align:center;">
                <div class="tier-buttons">
                    <button class="tier-btn" data-t="0">Scout</button>
                    <button class="tier-btn active" data-t="1">Hunter</button>
                    <button class="tier-btn" data-t="2">Tracker</button>
                    <button class="tier-btn" data-t="3">Mythic</button>
                </div>
                <div class="level-grid"></div>
            </div>
        `;
        
        el.querySelector('#back').onclick = () => UIRouter.navigateTo('HomeScreen');

        const btns = el.querySelectorAll('.tier-btn');
        btns.forEach(b => b.onclick = () => {
            btns.forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            this.tier = parseInt(b.dataset.t);
        });

        const grid = el.querySelector('.level-grid');
        for(let i=1; i<=10; i++) {
            const btn = document.createElement('button');
            btn.className = 'level-node';
            btn.textContent = i;
            if(GameState.state.maxLevelReached >= i) {
                btn.onclick = () => UIRouter.navigateTo('ChallengeScreen', { level: i, tier: this.tier });
            } else {
                btn.classList.add('locked');
            }
            grid.appendChild(btn);
        }
        return el;
    }
}
