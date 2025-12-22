/**
 * GlyphController.js
 * * The semantic engine for the "Glyph" system.
 * It manages the registry of runic symbols (glyphs) and determines which ones
 * awaken based on the hidden structure of the dataset.
 * * "The codex of runes — a registry of symbols that awaken when the world’s hidden structures align."
 * * Responsibilities:
 * - Registering glyph definitions (Plug-ins).
 * - Computing active glyphs by cross-referencing definitions with pattern metadata.
 * - Providing a pure, deterministic output for the UI to render.
 * * Constraints:
 * - Pure engine logic. No UI, DOM, or CSS.
 * - Deterministic output.
 */

export const GlyphController = {

    /**
     * Internal registry of glyph definitions.
     * Maps glyphId -> GlyphDefinition
     */
    _registry: new Map(),

    /**
     * Maps legacy glyph IDs to new modular glyph categories.
     * These categories correspond to token bundles in glyphs.css and GlyphRenderer.
     */
    _categoryMap: {
        'weekend': 'dataset',
        'above': 'reward',
        'below': 'warning',
        'outlier': 'warning',
        'unique': 'reward',
        'frequency': 'pattern',   // or dataset, depending on your design
        'general': 'dataset'
    },

    /**
     * Registers a new glyph definition into the codex.
     * Overwrites any existing glyph with the same ID.
     * * @param {Object} glyphDef - The glyph definition object.
     * @param {string} glyphDef.id - Unique identifier (e.g., 'glyph_outlier').
     * @param {string} glyphDef.name - Display name.
     * @param {string} glyphDef.icon - Symbolic character (e.g., '⚡').
     * @param {string} glyphDef.cssClass - CSS class for visual formatting.
     * @param {Function} glyphDef.compute - Function(grid, meta, rules) -> { indices: [] }.
     * @throws {Error} If the definition is malformed.
     */
    registerGlyph(glyphDef) {
        if (!glyphDef || typeof glyphDef !== 'object') {
            throw new Error('GlyphController: Invalid glyph definition provided.');
        }

        if (!glyphDef.id || typeof glyphDef.id !== 'string') {
            throw new Error('GlyphController: Glyph must have a valid string ID.');
        }

        if (typeof glyphDef.compute !== 'function') {
            throw new Error(`GlyphController: Glyph "${glyphDef.id}" is missing a compute function.`);
        }

        this._registry.set(glyphDef.id, glyphDef);
    },

    /**
     * Retrieves a single glyph definition by ID.
     * @param {string} glyphId 
     * @returns {Object|undefined}
     */
    getGlyph(glyphId) {
        return this._registry.get(glyphId);
    },

    /**
     * Returns a list of all registered glyph definitions.
     * @returns {Array<Object>}
     */
    getAllGlyphs() {
        return Array.from(this._registry.values());
    },

    /**
     * Computes the set of active glyphs for the current state.
     * Iterates through all registered runes; those that find purchase in the
     * pattern metadata or grid structure will return output.
     * * @param {Array} gridData - The raw dataset grid.
     * @param {Object} patternMetadata - Truth about the hidden pattern (from Pattern Engine).
     * @param {Object} [analyticsMetadata] - (Optional) Detailed analytics metadata.
     * @param {Object} [datasetRules] - Rules governing the data type.
     * @returns {Array<Object>} Array of GlyphOutput objects ready for rendering.
     */
    computeGlyphs(gridData, patternMetadata, analyticsMetadata = null, datasetRules = {}) {
        const outputs = [];

        // Fallback: if analyticsMetadata is not provided, alias it to patternMetadata
        const analytics = analyticsMetadata || patternMetadata;

        for (const glyphDef of this._registry.values()) {
            try {
                // NOTE: We now pass analytics as the third argument.
                const result = glyphDef.compute(gridData, patternMetadata, analytics, datasetRules);

                if (result && Array.isArray(result.indices) && result.indices.length > 0) {
                    const category =
                        result.category ||
                        glyphDef.category ||
                        this._categoryMap[glyphDef.id] ||
                        'dataset';

                    outputs.push({
                        id: glyphDef.id,
                        name: glyphDef.name,
                        icon: glyphDef.icon,
                        cssClass: glyphDef.cssClass,
                        description: glyphDef.description || '',
                        category,
                        indices: result.indices,
                        strength: result.strength || 1.0,
                        meta: result.meta || {}
                    });
                }
            } catch (error) {
                console.error(`GlyphController: The rune "${glyphDef.id}" failed to manifest.`, error);
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
