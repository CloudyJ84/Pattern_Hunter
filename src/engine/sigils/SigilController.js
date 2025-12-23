/**
 * SigilController.js
 * * The semantic engine for the "Sigil" subsystem.
 * It manages the registry of symbolic truths (sigils) and determines which ones
 * manifest based on the analytical properties of the dataset.
 * * "The codex of sigils — a registry of signs that burn bright when the numbers align."
 * * Responsibilities:
 * - Registering sigil definitions (Plug-ins).
 * - Computing active sigils by interrogating analytics metadata.
 * - Providing a pure, deterministic output for the UI to render.
 * * Constraints:
 * - Pure engine logic. No UI, DOM, or CSS.
 * - Deterministic output.
 * - Operates solely on analytics data.
 */

export const SigilController = {

    /**
     * Internal registry of sigil definitions.
     * Maps sigilId -> SigilDefinition
     */
    _registry: new Map(),

    /**
     * Registers a new sigil definition into the codex.
     * Overwrites any existing sigil with the same ID.
     * * @param {Object} sigilDef - The sigil definition object.
     * @param {string} sigilDef.id - Unique identifier (e.g., 'sigil_peak').
     * @param {string} sigilDef.name - Display name.
     * @param {string} sigilDef.icon - Symbolic character (e.g., '🗻').
     * @param {string} sigilDef.hint - A brief hint about the sigil's nature.
     * @param {string} sigilDef.description - Detailed lore or explanation.
     * @param {Function} sigilDef.compute - Function(analytics) -> { active: boolean, strength: number, metadata: Object }.
     * @throws {Error} If the definition is malformed.
     */
    registerSigil(sigilDef) {
        if (!sigilDef || typeof sigilDef !== 'object') {
            throw new Error('SigilController: Invalid sigil definition provided.');
        }

        if (!sigilDef.id || typeof sigilDef.id !== 'string') {
            throw new Error('SigilController: Sigil must have a valid string ID.');
        }

        if (typeof sigilDef.compute !== 'function') {
            throw new Error(`SigilController: Sigil "${sigilDef.id}" is missing a compute function.`);
        }

        this._registry.set(sigilDef.id, sigilDef);
        // console.debug(`SigilController: Registered symbol "${sigilDef.id}"`);
    },

    /**
     * Retrieves a single sigil definition by ID.
     * @param {string} sigilId 
     * @returns {Object|undefined}
     */
    getSigil(sigilId) {
        return this._registry.get(sigilId);
    },

    /**
     * Returns a list of all registered sigil definitions.
     * @returns {Array<Object>}
     */
    getAllSigils() {
        return Array.from(this._registry.values());
    },

    /**
     * Computes the set of active sigils for the current dataset state.
     * Iterates through all registered symbols; those that resonate with the
     * provided analytics metadata will return output.
     * * @param {Object} analytics - The pure analytics metadata derived from the dataset.
     * @returns {Array<Object>} Array of SigilOutput objects ready for rendering.
     */
    computeSigils(analytics) {
        const outputs = [];

        if (!analytics) {
            console.warn('SigilController: No analytics provided for computation.');
            return outputs;
        }

        for (const sigilDef of this._registry.values()) {
            try {
                // Execute the ritual (Compute the sigil state)
                const result = sigilDef.compute(analytics);

                // Only manifest sigils that are explicitly active
                if (result && result.active === true) {
                    outputs.push({
                        id: sigilDef.id,
                        name: sigilDef.name,
                        icon: sigilDef.icon,
                        hint: sigilDef.hint || '',
                        description: sigilDef.description || '',
                        active: true,
                        strength: (typeof result.strength === 'number') ? result.strength : 1.0,
                        metadata: result.metadata || {}
                    });
                }
            } catch (error) {
                console.error(`SigilController: The symbol "${sigilDef.id}" failed to ignite.`, error);
            }
        }

        return outputs;
    },

    /**
     * Clears the registry. Mostly for testing or resets.
     */
    reset() {
        this._registry.clear();
    }
};
