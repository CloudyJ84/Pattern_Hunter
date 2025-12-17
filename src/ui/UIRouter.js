import { HomeScreen } from './screens/HomeScreen.js';
import { LevelSelectScreen } from './screens/LevelSelectScreen.js';
import { ChallengeScreen } from './screens/ChallengeScreen.js';

const ROUTES = {
    'HomeScreen': HomeScreen,
    'LevelSelectScreen': LevelSelectScreen,
    'ChallengeScreen': ChallengeScreen
};

export const UIRouter = {
    container: null,
    init(container) { this.container = container; },
    navigateTo(screenName, params = {}) {
        if(!this.container) return;
        this.container.innerHTML = '';
        const ScreenClass = ROUTES[screenName];
        const instance = new ScreenClass(params);
        this.container.appendChild(instance.mount());
    }
};
