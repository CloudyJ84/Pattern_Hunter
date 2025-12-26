import { HomeScreen } from './screens/HomeScreen.js';
import { LevelSelectScreen } from './screens/LevelSelectScreen.js';
import { ChallengeScreen } from './screens/ChallengeScreen.js';
// 🔧 Import the Scout Level for hard-wired navigation
import scoutLevel from './scout_threshold_01.js';

const ROUTES = {
    'HomeScreen': HomeScreen,
    'LevelSelectScreen': LevelSelectScreen,
    'ChallengeScreen': ChallengeScreen,
    // 🔧 Route alias for Scout Demo
    'ScoutMission': ChallengeScreen
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

    /**
     * Navigates to a specific screen.
     * @param {string} screenName - Key from ROUTES
     * @param {Object} params - Data to pass to the screen constructor
     */
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

        // 🔧 Hard-wired injection for ScoutMission route
        if (screenName === 'ScoutMission') {
            params.levelDef = scoutLevel;
            params.levelId = 'SCOUT-01';
            params.thresholdTier = 0; // Scout Tier
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
    },

    // 🔧 Convenience method to launch the scripted scout level
    playScoutLevel() {
        this.navigateTo('ScoutMission');
    }
};
