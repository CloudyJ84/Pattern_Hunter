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
    currentScreen: null,

    init(containerId) {
        const el = document.getElementById(containerId);
        if (!el) {
            console.error(`UIRouter: container #${containerId} not found`);
            return;
        }
        this.container = el;
    },

    navigateTo(screenName, params = {}) {
        if (!this.container) return;

        // Cleanup previous screen
        if (this.currentScreen && typeof this.currentScreen.destroy === 'function') {
            this.currentScreen.destroy();
        }

        // Clear container
        this.container.innerHTML = '';

        // Resolve screen class
        const ScreenClass = ROUTES[screenName];
        if (!ScreenClass) {
            console.error("Unknown route:", screenName);
            return;
        }

        // Instantiate and mount
        const instance = new ScreenClass(params);
        this.currentScreen = instance;

        const element = instance.mount();
        if (element) {
            this.container.appendChild(element);
        } else {
            console.error(`${screenName} did not return a valid DOM element from mount().`);
        }
    }
};
