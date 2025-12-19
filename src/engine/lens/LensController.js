/**
 * LensController.js
 * * The semantic dispatcher for the "Lens" system.
 * It manages the registry of available perspectives (lenses) and orchestrates
 * their application to the dataset.
 * * "The codex of perspectives — a registry of ways of seeing, each lens a ritual that reveals a different truth."
 * * Responsibilities:
 * - Registering lens definitions (Plug-ins).
 * - Managing the active lens state.
 * - Computing the "LensOutput" by applying the active lens to the current grid.
 * * Constraints:
 * - Pure engine logic. No UI, DOM, or CSS.
 * - Deterministic output.
 */

export const LensController = {
    
    /**
     * Internal registry of lens definitions.
     * Maps lensId -> LensDefinition
     */
    _registry: new Map(),

    /**
     * The ID of the currently active lens.
     * Defaults to the base reality.
     */
    _activeLensId: 'lens_standard',

    /**
     * Registers a new lens definition into the codex.
     * Overwrites any existing lens with the same ID.
     * * @param {Object} lensDef - The lens definition object.
     * @param {string} lensDef.id - Unique identifier (e.g., 'lens_focus').
     * @param {string} lensDef.name - Display name.
     * @param {string} lensDef.type - Visual archetype (e.g., 'heatmap', 'cluster').
     * @param {Function} lensDef.compute - Function(grid, meta, rules, tier) -> LensOutput.
     * @throws {Error} If the definition is malformed.
     */
    registerLens(lensDef) {
        if (!lensDef || typeof lensDef !== 'object') {
            throw new Error('LensController: Invalid lens definition provided.');
        }

        if (!lensDef.id || typeof lensDef.id !== 'string') {
            throw new Error('LensController: Lens must have a valid string ID.');
        }

        if (typeof lensDef.compute !== 'function') {
            throw new Error(`LensController: Lens "${lensDef.id}" is missing a compute function.`);
        }

        this._registry.set(lensDef.id, lensDef);
        // console.debug(`LensController: Registered perspective "${lensDef.id}"`);
    },

    /**
     * Sets the active lens to the specified ID.
     * If the requested lens is not found, falls back to 'lens_standard'.
     * * @param {string} lensId - The ID of the lens to activate.
     */
    setActiveLens(lensId) {
        if (this._registry.has(lensId)) {
            this._activeLensId = lensId;
        } else {
            console.warn(`LensController: Perspective "${lensId}" unknown. Reverting to standard vision.`);
            this._activeLensId = 'lens_standard';
        }
    },

    /**
     * Returns the ID of the currently active lens.
     * @returns {string}
     */
    getActiveLens() {
        return this._activeLensId;
    },

    /**
     * Applies the currently active lens to the provided data.
     * This is a pure computation that returns a description of visual overlays.
     * * @param {Array} gridData - The raw dataset grid.
     * @param {Object} patternMetadata - Truth about the hidden pattern.
     * @param {Object} datasetRules - Rules governing the data type.
     * @param {Object} tierConfig - Configuration for the current difficulty tier.
     * @returns {Object} LensOutput - The contract for the Renderer.
     */
    applyLens(gridData, patternMetadata, datasetRules, tierConfig) {
        let lens = this._registry.get(this._activeLensId);

        // Fallback safety if active lens is missing (e.g. registry cleared)
        if (!lens) {
            lens = this._registry.get('lens_standard');
        }

        // Ultimate safety: If even standard is missing, return a null output
        if (!lens) {
            return this._createEmptyOutput();
        }

        try {
            // Execute the ritual (Compute the lens output)
            const output = lens.compute(gridData, patternMetadata, datasetRules, tierConfig);
            
            // Ensure the output adheres to the basic contract structure
            return {
                id: lens.id,
                name: lens.name,
                type: lens.type || 'heatmap', // Pass through type for Renderer CSS tokens
                description: lens.description || '',
                overlays: output.overlays || [],
                annotations: output.annotations || [],
                highlights: output.highlights || [],
                legends: output.legends || [],
                meta: output.meta || {}
            };
        } catch (error) {
            console.error(`LensController: The ritual for "${this._activeLensId}" failed.`, error);
            return this._createEmptyOutput();
        }
    },

    /**
     * Returns a list of all registered lens definitions.
     * Useful for UI selectors.
     * @returns {Array<Object>}
     */
    getAllLenses() {
        return Array.from(this._registry.values());
    },

    /**
     * Helper to create a safe, empty output object.
     * Used when lenses fail or are missing.
     * @private
     */
    _createEmptyOutput() {
        return {
            id: 'lens_void',
            name: 'Void',
            type: 'anomaly', // Default type for safety
            description: 'No vision available.',
            overlays: [],
            annotations: [],
            highlights: [],
            legends: [],
            meta: {}
        };
    },
    
    /**
     * Clears the registry. Mostly for testing or resets.
     */
    reset() {
        this._registry.clear();
        this._activeLensId = 'lens_standard';
    }
};

/* * DEFAULT LENS: STANDARD
 * We auto-register the standard lens to ensure the system is always viable.
 */
LensController.registerLens({
    id: 'lens_standard',
    name: 'Standard',
    type: 'heatmap',
    description: 'The unadorned truth. Raw data without augmentation.',
    appliesTo: 'all',
    compute: (gridData) => {
        // Standard lens returns nothing but the base grid implication.
        // It clears away other overlays.
        return {
            overlays: [],
            annotations: [],
            highlights: [],
            legends: [],
            meta: {}
        };
    }
});
