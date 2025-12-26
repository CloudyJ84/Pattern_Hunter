/**
 * LevelController.js
 * * The conductor of the ritual.
 * LevelController is responsible for ingesting a Level Definition (The Contract),
 * interpreting its intent, and orchestrating the flow of the Challenge.
 * * It acts as the bridge between the static Level Definition (JSON) and the 
 * interactive ChallengeScreen (UI). It does not render pixels, but it determines 
 * what pixels represent and whether they align with the Truth.
 * * 🎯 Core Responsibilities:
 * 1. Ingest Level Definition.
 * 2. Validate Player Actions against Success Criteria.
 * 3. Manage Level State (Active, Success, Failure).
 * 4. Dispense Lore and Pedagogy upon completion.
 */

export const LevelController = {

    // --- Internal State ---
    _level: null,      // The current Level Definition object
    _state: 'IDLE',    // IDLE, ACTIVE, SUCCESS, FAILURE
    _attempts: 0,      // Track attempts for scoring/progression

    /**
     * Initializes the controller with a specific Level Definition.
     * This is the "Load" phase.
     * * @param {Object} levelDefinition - The JSON object defining the level.
     * @returns {Object} - The operational configuration for the view.
     */
    init(levelDefinition) {
        if (!levelDefinition) {
            console.error("LevelController: No level definition provided.");
            return null;
        }

        this._level = levelDefinition;
        this._state = 'ACTIVE';
        this._attempts = 0;

        // console.log(`LevelController: Initialized Level "${this._level.name}" (${this._level.id})`);

        return this.getLevelConfig();
    },

    /**
     * Returns the configuration object needed by the ChallengeScreen to render.
     * This acts as the ViewModel, stripping away internal logic fields if necessary.
     */
    getLevelConfig() {
        if (!this._level) return null;

        return {
            identity: {
                id: this._level.id,
                name: this._level.name,
                subtitle: this._level.subtitle,
                tier: this._level.tier,
                rune: this._getTierRune(this._level.tier)
            },
            narrative: {
                intro: this._level.narrative.intro
            },
            grid: this._level.grid,
            systems: this._level.systems || { glyphs: [], lenses: [], sigils: [] },
            guidance: this._level.guidance || { showHints: false },
            // Provide initial feedback state
            feedback: {
                message: this._level.narrative.intro,
                type: 'neutral'
            },
            // Explicitly tell the UI what kind of input we expect
            inputType: this._level.successCriteria ? this._level.successCriteria.type : 'text_input'
        };
    },

    /**
     * Configures the provided ChallengeScreen instance with initial data.
     * This is a convenience method to wire up the View directly if the architecture prefers it.
     * * @param {Object} challengeScreen - The instance of the ChallengeScreen.
     */
    configureChallenge(challengeScreen) {
        if (!this._level || !challengeScreen) return;

        // Apply Grid Data
        if (challengeScreen.grid) {
            challengeScreen.grid.render(this._level.grid);
            
            // If the level defines formatting hints (e.g., specific cell styles), apply them
            if (this._level.grid.formatting) {
                challengeScreen.grid.applyFormatting(this._level.grid.formatting);
            }
        }

        // Apply Question/Narrative
        if (challengeScreen.question) {
            challengeScreen.question.setText(this._level.narrative.intro);
        }

        // Configure Systems (enable/disable specific glyphs/lenses in UI)
        // This assumes the Screen has methods to set available tools
        if (challengeScreen.updateLensBar) {
            challengeScreen.updateLensBar({ 
                lens: { type: 'lens_standard' }, // Default to standard
                available: this._level.systems.lenses 
            });
        }
    },

    /**
     * Evaluates a player's action against the level's success criteria.
     * * @param {Object} actionPayload
     * @param {string} actionPayload.type - 'cell_selection' | 'text_input'
     * @param {Array|string} actionPayload.value - The user's input.
     * @returns {Object} Result object { success: boolean, feedback: string, payload: Object }
     */
    evaluatePlayerAction(actionPayload) {
        if (this._state !== 'ACTIVE' && this._state !== 'FAILURE') {
            return { success: false, feedback: "Level is already complete." };
        }

        this._attempts++;
        const criteria = this._level.successCriteria;
        let isSuccess = false;

        // Route evaluation based on action type
        // Supports both legacy string answers and grid-based selections
        switch (criteria.type) {
            case 'cell_selection':
                isSuccess = this._evaluateSelection(actionPayload.value, criteria.correctCells);
                break;
            case 'text_input':
            case 'value_input':
                isSuccess = this._evaluateInput(actionPayload.value, criteria.correctAnswer);
                break;
            default:
                console.warn(`LevelController: Unknown criteria type '${criteria.type}'`);
                isSuccess = false;
        }

        if (isSuccess) {
            return this.handleSuccess();
        } else {
            return this.handleFailure();
        }
    },

    /**
     * Internal logic for validating cell selection.
     * @param {Array} userSelection - Array of {row, col} objects.
     * @param {Array} correctCells - Array of {row, col} objects.
     */
    _evaluateSelection(userSelection, correctCells) {
        if (!Array.isArray(userSelection) || !Array.isArray(correctCells)) return false;
        
        // Basic implementation: Exact match of set.
        // If correctCells has 1 item, user must select exactly that 1 item (unless multi-select allowed).
        
        // 1. Check counts
        if (userSelection.length !== correctCells.length) return false;

        // 2. Check existence of every correct cell in user selection
        // O(n^2) is fine for grid sizes in this game (usually < 10x10)
        const allFound = correctCells.every(target => 
            userSelection.some(user => user.row === target.row && user.col === target.col)
        );

        return allFound;
    },

    /**
     * Internal logic for validating text/value input.
     * @param {string|number} userInput 
     * @param {string|number} correctAnswer 
     */
    _evaluateInput(userInput, correctAnswer) {
        const normUser = String(userInput).trim().toLowerCase();
        // Handle cases where correctAnswer might not exist in criteria (legacy)
        const target = correctAnswer !== undefined ? correctAnswer : this._level.question?.answer;
        const normCorrect = String(target).trim().toLowerCase();
        return normUser === normCorrect;
    },

    /**
     * Transitions state to SUCCESS and generates the victory payload.
     */
    handleSuccess() {
        this._state = 'SUCCESS';
        
        // Construct the Lore/Pedagogy Payload
        const lore = this._constructPedagogicalLore();

        return {
            success: true,
            title: "PATTERN RECOGNIZED",
            feedback: this._level.narrative.success,
            score: this._calculateScore(),
            lore: lore,
            progression: this._level.progression
        };
    },

    /**
     * Transitions state to FAILURE (or keeps active) and generates feedback.
     */
    handleFailure() {
        this._state = 'FAILURE'; // Or remain active depending on game design
        
        // Check if we should offer a hint based on failure
        const showHint = this._level.guidance.highlightOnFailure && this._attempts >= 2;

        return {
            success: false,
            title: "PATTERN DISSONANCE",
            feedback: this._level.narrative.failure,
            hint: showHint ? (this._level.guidance.hintText[0] || "Look closer.") : null
        };
    },

    /**
     * Constructs the educational bridge between the Mythic and the Real.
     */
    _constructPedagogicalLore() {
        const focus = this._level.teachingFocus;
        if (!focus) return null;

        return {
            concept: focus.concept,
            mythicText: this._level.narrative.success,
            realWorldAnalogy: focus.description,
            // Dynamic insertion: "The Lens isolates... much like [Concept Description]"
            pedagogyText: `The ${this._level.tier} Level demonstrates **${focus.concept}**. ${focus.description}`,
            introduces: focus.introduces || []
        };
    },

    /**
     * Calculates score based on attempts and tier.
     */
    _calculateScore() {
        if (!this._level.scoring || !this._level.scoring.enabled) return 0;

        const base = this._level.scoring.baseScore || 100;
        const penalty = (this._level.scoring.penalties?.incorrectSelection || 10) * (this._attempts - 1);
        
        return Math.max(0, base - penalty);
    },

    /**
     * Resets the controller.
     */
    teardown() {
        this._level = null;
        this._state = 'IDLE';
        this._attempts = 0;
    },

    // --- Helpers ---

    _getTierRune(tierName) {
        const MAP = {
            'SCOUT': '👁️',
            'HUNTER': '🏹',
            'TRACKER': '🐾',
            'MYTHIC': '🔮'
        };
        return MAP[tierName] || '✨';
    }
};
