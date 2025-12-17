export const GameState = {

    version: 1, // Save schema version

    state: {
        maxLevelReached: 1,
        completedLevels: []
    },

    init() {
        const saved = localStorage.getItem('patternHunterState');

        if (saved) {
            try {
                const parsed = JSON.parse(saved);

                // Validate structure
                if (typeof parsed.maxLevelReached === 'number' &&
                    Array.isArray(parsed.completedLevels)) {

                    this.state = parsed;

                } else {
                    console.warn("GameState: Invalid save structure. Resetting.");
                    this.reset();
                }

            } catch (e) {
                console.warn("GameState: Corrupt save file. Resetting.");
                this.reset();
            }
        }
    },

    completeLevel(levelId) {
        if (!this.state.completedLevels.includes(levelId)) {
            this.state.completedLevels.push(levelId);
        }

        if (levelId >= this.state.maxLevelReached) {
            this.state.maxLevelReached = levelId + 1;
        }

        this.save();
    },

    isLevelUnlocked(levelId) {
        return levelId <= this.state.maxLevelReached;
    },

    hasCompleted(levelId) {
        return this.state.completedLevels.includes(levelId);
    },

    save() {
        localStorage.setItem('patternHunterState', JSON.stringify(this.state));
    },

    reset() {
        this.state = {
            maxLevelReached: 1,
            completedLevels: []
        };
        this.save();
    },

    destroy() {
        // Lifecycle consistency
        this.state = null;
    }
};
