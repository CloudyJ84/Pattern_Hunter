import { UIRouter } from '../UIRouter.js';
export class HomeScreen {
    mount() {
        const el = document.createElement('div');
        el.className = 'screen centered-layout';
        el.innerHTML = `<h1>PATTERN HUNTER</h1><button class="control-btn primary" style="padding:20px 40px; font-size:1.2rem;">Start Game</button>`;
        el.querySelector('button').onclick = () => UIRouter.navigateTo('LevelSelectScreen');
        return el;
    }
}
