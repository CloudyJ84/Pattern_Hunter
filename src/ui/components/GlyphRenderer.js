/**
 * GlyphRenderer.js
 * * SYSTEM ARCHITECT: Modular CSS Implementation
 * CODEX: main.css & glyphs.css
 * * A pure UI component responsible for manifesting "Glyphs" — symbolic overlays
 * that highlight semantic structure in the dataset.
 * * "Runes awakening on the surface of the grid, revealing truths the world was not ready to speak aloud."
 * * Architecture:
 * - Stateless: Does not store game logic, only renders provided GlyphOutput objects.
 * - Non-destructive: Applies reversible CSS classes and DOM overlays.
 * - Layered: Operates on a dedicated visual layer above the grid but below lenses.
 * - Hybrid: Supports both legacy 'fmt-' classes and new modular 'glyph--' tokens.
 */

/**
 * NOTE: In the modern engine, GlyphRenderer is a purely visual overlay system.
 * It no longer applies formattingEngine classes or highlight logic.
 * It renders optional symbolic overlays and token-based CSS only.
 */

// --- MYTHIC TOKEN DEFINITIONS ---
// Maps engine IDs to the new visual language of glyphs.css
const GLYPH_TOKEN_MAP = {
    // [LEGACY MAPPINGS]
    // The "Outlier": A warning from the void. Data that refuses to fit.
    'outlier':   ['glyph', 'glyph--warning', 'glyph--md'],
    
    // "Extreme Values": High energy, potentially unstable.
    'extreme':   ['glyph', 'glyph--warning', 'glyph--lg', 'glyph--charged'],
    
    // "Weekend": The resting time, a structural pattern in the timeline.
    'weekend':   ['glyph', 'glyph--dataset', 'glyph--md'],
    
    // "Above Average": A minor victory.
    'above':     ['glyph', 'glyph--reward', 'glyph--sm'],
    
    // "Below Average": A minor deficit.
    'below':     ['glyph', 'glyph--warning', 'glyph--sm'],

    // "Unique": A singularity. Treasure in the noise.
    'unique':    ['glyph', 'glyph--reward', 'glyph--md', 'glyph--charged'],
    
    // [SEMANTIC ROLES]
    'pattern':   ['glyph', 'glyph--pattern', 'glyph--md'],   // The Rune
    'dataset':   ['glyph', 'glyph--dataset', 'glyph--lg'],   // The Cell
    'question':  ['glyph', 'glyph--question', 'glyph--md'],  // The Oracle
    'threshold': ['glyph', 'glyph--threshold', 'glyph--sm'], // The Gate
    'reward':    ['glyph', 'glyph--reward', 'glyph--md'],    // The Gold
    'warning':   ['glyph', 'glyph--warning', 'glyph--md']    // The Hazard
};

export class GlyphRenderer {
    /**
     * @param {HTMLElement} gridElement - The root grid container (the .dataset-grid).
     */
    constructor(gridElement) {
        this.gridElement = gridElement;
        
        // Track active glyph IDs to manage toggling
        this.activeGlyphs = new Set();
        
        // Registry to store exactly what classes were applied for each glyph ID
        // Structure: Map<glyphId, { cssClass: string, tokens: string[] }>
        this.registry = new Map();
        
        // Create a dedicated layer for symbolic icons/runes
        this.overlayLayer = this._initOverlayLayer();
    }

    /**
     * Toggles a specific glyph on or off.
     * @param {Object} glyphOutput - The glyph data contract.
     */
    toggle(glyphOutput) {
        // Deprecated: Glyphs are now static per challenge.
        // Use render() or renderAll() instead.
        return;
    }

    /**
     * Renders a single glyph visualization.
     * @param {Object} glyphOutput - { id, cssClass, indices, icon, strength, ... }
     */
    render(glyphOutput) {
        if (!glyphOutput || !glyphOutput.indices) return;

        const tokens = this._getTokens(glyphOutput);

        // Register tokens for cleanup
        this.registry.set(glyphOutput.id, { tokens });

        // Apply token classes only
        glyphOutput.indices.forEach(index => {
            const cell = this._getCellByIndex(index);
            if (cell) {
                cell.classList.add(...tokens);
            }
        });

        // Render icons only if explicitly provided
        if (glyphOutput.icon) {
            this._renderIcons(glyphOutput, tokens);
        }
    }

    /**
     * Renders multiple glyphs at once.
     * @param {Array<Object>} glyphOutputs 
     */
    renderAll(glyphOutputs) {
        glyphOutputs.forEach(g => {
            this.render(g);
            this.activeGlyphs.add(g.id);
        });
    }

    /**
     * Clears all visuals for a specific glyph ID.
     * @param {string} glyphId 
     */
    _clearGlyph(glyphId) {
        const entry = this.registry.get(glyphId);
        if (!entry) return;

        // Remove token classes
        const cells = this.gridElement.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            cell.classList.remove(...entry.tokens);
        });

        // Remove overlay icons
        const icons = this.overlayLayer.querySelectorAll(`[data-glyph-origin="${glyphId}"]`);
        icons.forEach(icon => icon.remove());

        this.registry.delete(glyphId);
    }

    /**
     * Completely resets the renderer, removing all glyphs.
     */
    clearAll() {
        const cells = this.gridElement.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            const classesToRemove = [];
            cell.classList.forEach(cls => {
                if (cls.startsWith('glyph')) {
                    classesToRemove.push(cls);
                }
            });
            classesToRemove.forEach(c => cell.classList.remove(c));
            cell.style.removeProperty('--glyph-strength');
        });

        this.overlayLayer.innerHTML = '';
        this.activeGlyphs.clear();
        this.registry.clear();
    }

    /* -------------------------------------------------------------------------- */
    /* INTERNAL HELPERS                                                           */
    /* -------------------------------------------------------------------------- */

    /**
     * Resolves the appropriate token bundle for a glyph.
     * Maps ID -> Tokens, or Category -> Tokens, or falls back to generic defaults.
     */
    _getTokens(glyphOutput) {
        // Direct ID mapping only
        if (GLYPH_TOKEN_MAP[glyphOutput.id]) {
            return [...GLYPH_TOKEN_MAP[glyphOutput.id]];
        }
        // Default generic glyph
        return ['glyph', 'glyph--dataset', 'glyph--md'];
    }

    /**
     * Initializes the overlay layer DOM element.
     */
    _initOverlayLayer() {
        let layer = this.gridElement.querySelector('.glyph-overlay-layer');
        if (!layer) {
            layer = document.createElement('div');
            layer.className = 'glyph-overlay-layer';
            // Styling to ensure it sits correctly above grid but doesn't block clicks
            layer.style.position = 'absolute';
            layer.style.top = '0';
            layer.style.left = '0';
            layer.style.width = '100%';
            layer.style.height = '100%';
            layer.style.pointerEvents = 'none'; // Crucial: Don't block gameplay
            layer.style.zIndex = '5'; // Below Lens (10/20), Above Grid (1)
            this.gridElement.appendChild(layer);
        }
        return layer;
    }

    /**
     * Renders icon overlays for a glyph.
     * Now updated to respect the token system.
     */
    _renderIcons(glyphOutput, tokens) {
        glyphOutput.indices.forEach(index => {
            const cell = this._getCellByIndex(index);
            if (cell) {
                const icon = document.createElement('div');
                
                // Base icon class + The gathered tokens
                icon.className = 'glyph-icon-marker fade-in';
                // We add the tokens to the icon too, so it inherits the "Warning" or "Reward" colors
                if (tokens) icon.classList.add(...tokens);
                
                // Ensure it floats
                icon.style.position = 'absolute';
                icon.innerHTML = glyphOutput.icon;
                icon.setAttribute('data-glyph-origin', glyphOutput.id);
                
                // Position logic
                const rect = this._getRelativeRect(cell);
                
                // Center the rune
                icon.style.left = `${rect.x + (rect.width / 2)}px`;
                icon.style.top = `${rect.y + (rect.height / 2)}px`;
                icon.style.transform = 'translate(-50%, -50%)'; // CSS centering
                
                // Mythic animation hook - Legacy + New
                if (glyphOutput.category === 'anomaly') {
                    icon.classList.add('glyph-anim--flicker'); // New token
                } else if (glyphOutput.category === 'temporal') {
                    icon.classList.add('glyph-anim--breath'); // New token
                }

                this.overlayLayer.appendChild(icon);
            }
        });
    }

    _getCellByIndex(index) {
        // Assuming flat index mapping to children or specific data-index attribute
        // GridRenderer usually adds data-index
        return this.gridElement.querySelector(`[data-index="${index}"]`);
    }

    _getRelativeRect(element) {
        const containerRect = this.gridElement.getBoundingClientRect();
        const elRect = element.getBoundingClientRect();
        return {
            x: elRect.left - containerRect.left,
            y: elRect.top - containerRect.top,
            width: elRect.width,
            height: elRect.height
        };
    }
}

/* -------------------------------------------------------------------------- */
/* USAGE EXAMPLE                                                              */
/* -------------------------------------------------------------------------- */
/*
    // In ChallengeScreen.js:
    
    // 1. Instantiate
    this.glyphRenderer = new GlyphRenderer(document.getElementById('grid'));

    // 2. Data from GlyphController (or mock)
    const glyphData = {
        id: 'outlier',
        name: 'Broken Pattern',
        icon: '⚡',
        cssClass: 'fmt-outlier',
        indices: [4, 12, 15],
        category: 'warning' // Now maps to glyph--warning
    };

    // 3. Render
    this.glyphRenderer.toggle(glyphData);

    // 4. Clear
    // this.glyphRenderer.clearAll();
*/
