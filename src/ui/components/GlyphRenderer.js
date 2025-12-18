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
        if (this.activeGlyphs.has(glyphOutput.id)) {
            this._clearGlyph(glyphOutput.id);
            this.activeGlyphs.delete(glyphOutput.id);
        } else {
            this.render(glyphOutput);
            this.activeGlyphs.add(glyphOutput.id);
        }
    }

    /**
     * Renders a single glyph visualization.
     * @param {Object} glyphOutput - { id, cssClass, indices, icon, strength, ... }
     */
    render(glyphOutput) {
        if (!glyphOutput || !glyphOutput.indices) return;

        // RESOLVE TOKENS: Consult the Codex
        const tokens = this._getTokens(glyphOutput);

        // Register the exact configuration for this render pass
        this.registry.set(glyphOutput.id, {
            cssClass: glyphOutput.cssClass,
            tokens: tokens
        });

        // 1. Apply CSS classes to the grid cells (The "Glow")
        glyphOutput.indices.forEach(index => {
            const cell = this._getCellByIndex(index);
            if (cell) {
                // [LEGACY] Add the primary semantic class (e.g., 'fmt-outlier')
                if (glyphOutput.cssClass) {
                    cell.classList.add(glyphOutput.cssClass);
                }

                // [MODULAR] Apply the new token bundle
                if (tokens.length > 0) {
                    cell.classList.add(...tokens);
                }

                // Mark with specific glyph ID for precise removal later
                cell.classList.add(`glyph-id-${glyphOutput.id}`);
                
                // Optional: Apply visual strength via opacity or scale variable
                if (glyphOutput.strength !== undefined) {
                    cell.style.setProperty('--glyph-strength', glyphOutput.strength);
                }
            }
        });

        // 2. Render Symbolic Icons (The "Rune")
        // We only add icons if specifically requested, to avoid clutter
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
        // Retrieve the configuration used to render this glyph
        const entry = this.registry.get(glyphId);

        // 1. Remove CSS classes from cells
        const affectedCells = this.gridElement.querySelectorAll(`.glyph-id-${glyphId}`);
        affectedCells.forEach(cell => {
            // Remove the tracking class
            cell.classList.remove(`glyph-id-${glyphId}`);
            
            // Remove Legacy Class
            if (entry && entry.cssClass) {
                cell.classList.remove(entry.cssClass);
            }

            // Remove Modular Tokens
            if (entry && entry.tokens) {
                cell.classList.remove(...entry.tokens);
            }
            
            // Cleanup custom properties
            cell.style.removeProperty('--glyph-strength');
        });

        // 2. Remove Overlay Icons
        const icons = this.overlayLayer.querySelectorAll(`[data-glyph-origin="${glyphId}"]`);
        icons.forEach(icon => icon.remove());
        
        // Clean up registry
        this.registry.delete(glyphId);
    }

    /**
     * Completely resets the renderer, removing all glyphs.
     */
    clearAll() {
        // Clear all cells
        const cells = this.gridElement.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            // Remove all classes starting with 'glyph-id-', 'fmt-', or 'glyph'
            // This is a "hard reset" for the ritual space
            const classesToRemove = [];
            cell.classList.forEach(cls => {
                if (cls.startsWith('glyph-id-') || 
                    cls.startsWith('fmt-') || 
                    cls.startsWith('glyph')) {
                    classesToRemove.push(cls);
                }
            });
            classesToRemove.forEach(c => cell.classList.remove(c));
            cell.style.removeProperty('--glyph-strength');
        });

        // Clear overlays
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
        let tokens = [];

        // 1. Direct ID Mapping (Specific overrides)
        if (GLYPH_TOKEN_MAP[glyphOutput.id]) {
            tokens = [...GLYPH_TOKEN_MAP[glyphOutput.id]];
        }
        // 2. Category Mapping (Broad strokes)
        else if (glyphOutput.category && GLYPH_TOKEN_MAP[glyphOutput.category]) {
            tokens = [...GLYPH_TOKEN_MAP[glyphOutput.category]];
        }
        // 3. Fallback based on CSS class hints
        else if (glyphOutput.cssClass && glyphOutput.cssClass.includes('outlier')) {
            tokens = [...GLYPH_TOKEN_MAP['outlier']];
        } 
        else {
            // Default generic glyph
            tokens = ['glyph', 'glyph--dataset', 'glyph--md'];
        }

        // 4. Apply State Modifiers (The Ritual Charge)
        // If the glyph is marked as "extreme" or has high strength, charge it.
        if (glyphOutput.strength > 0.8 || glyphOutput.id === 'extreme') {
            if (!tokens.includes('glyph--charged')) {
                tokens.push('glyph--charged');
            }
            // Add pulse animation for high energy glyphs
            tokens.push('glyph-anim--pulse');
        }

        return tokens;
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
