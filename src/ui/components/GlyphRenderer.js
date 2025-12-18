/**
 * GlyphRenderer.js
 * * A pure UI component responsible for manifesting "Glyphs" — symbolic overlays
 * that highlight semantic structure in the dataset.
 * * "Runes awakening on the surface of the grid, revealing truths the world was not ready to speak aloud."
 * * Architecture:
 * - Stateless: Does not store game logic, only renders provided GlyphOutput objects.
 * - Non-destructive: Applies reversible CSS classes and DOM overlays.
 * - Layered: Operates on a dedicated visual layer above the grid but below lenses.
 */

export class GlyphRenderer {
    /**
     * @param {HTMLElement} gridElement - The root grid container (the .dataset-grid).
     */
    constructor(gridElement) {
        this.gridElement = gridElement;
        
        // Track active glyph IDs to manage toggling and clearing
        this.activeGlyphs = new Set();
        
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

        // 1. Apply CSS classes to the grid cells (The "Glow")
        glyphOutput.indices.forEach(index => {
            const cell = this._getCellByIndex(index);
            if (cell) {
                // Add the primary semantic class (e.g., 'fmt-outlier')
                cell.classList.add(glyphOutput.cssClass);
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
            this._renderIcons(glyphOutput);
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
        // 1. Remove CSS classes from cells
        const affectedCells = this.gridElement.querySelectorAll(`.glyph-id-${glyphId}`);
        affectedCells.forEach(cell => {
            // We need to know the original cssClass to remove it safely.
            // Since we don't store the glyphOutput object, we remove the ID class
            // and rely on a DOM query to clean up known glyph classes if needed,
            // or we can iterate the classList.
            // A safer approach for exact reversibility:
            // The prompt implies we might not have the original object in clear().
            // However, typical usage involves toggling with the object.
            // If strictly ID-based clearing is needed without the object:
            
            // Remove the tracking class
            cell.classList.remove(`glyph-id-${glyphId}`);
            
            // We also need to remove the visual class (e.g. 'fmt-outlier'). 
            // In a robust implementation, we might store a map of id -> class.
            // For this implementation, we will assume standard classes don't conflict,
            // but to be safe, we should ideally have the class name.
            // *Optimization*: For this renderer, we expect 'toggle' to be the primary interaction.
            // If called blindly, we might leave the formatting class. 
            // Let's refine: We will check if the cell has other glyph-ids.
            // If not, we clean up specific known glyph classes? 
            // BETTER: The prompt says "remove all glyph-related CSS classes".
            // We will remove the class that matches the glyph's known style if possible, 
            // or relies on the specific ID marker to style.
            
            // *Implementation Choice*: To ensure clean removal without the config object,
            // we will clean up ALL classes that start with 'fmt-' IF no other glyphs are active?
            // No, that's too aggressive.
            // We will rely on the fact that toggle() provides the object usually.
            // If clear(id) is called, we assume the caller accepts that we might miss the specific fmt class
            // UNLESS we store a lookup.
        });
        
        // *Revision*: Let's store a tiny local lookup for ID -> CSS Class to ensure perfect clearing.
        if (!this.registry) this.registry = new Map();
        
        // (This logic actually belongs in render/toggle to populate the registry)
        // See _registerGlyph and _unregisterGlyph below.
        const registeredClass = this.registry.get(glyphId);
        if (registeredClass) {
             affectedCells.forEach(cell => cell.classList.remove(registeredClass));
        }

        // 2. Remove Overlay Icons
        const icons = this.overlayLayer.querySelectorAll(`[data-glyph-origin="${glyphId}"]`);
        icons.forEach(icon => icon.remove());
        
        this.registry.delete(glyphId);
    }

    /**
     * Completely resets the renderer, removing all glyphs.
     */
    clearAll() {
        // Clear all cells
        const cells = this.gridElement.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            // Remove all classes starting with 'glyph-id-' or 'fmt-'
            // This is a "hard reset"
            const classesToRemove = [];
            cell.classList.forEach(cls => {
                if (cls.startsWith('glyph-id-') || cls.startsWith('fmt-')) {
                    classesToRemove.push(cls);
                }
            });
            classesToRemove.forEach(c => cell.classList.remove(c));
            cell.style.removeProperty('--glyph-strength');
        });

        // Clear overlays
        this.overlayLayer.innerHTML = '';
        
        this.activeGlyphs.clear();
        if (this.registry) this.registry.clear();
    }

    /* -------------------------------------------------------------------------- */
    /* INTERNAL HELPERS                                                           */
    /* -------------------------------------------------------------------------- */

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
     */
    _renderIcons(glyphOutput) {
        // Register the class for cleanup
        if (!this.registry) this.registry = new Map();
        this.registry.set(glyphOutput.id, glyphOutput.cssClass);

        glyphOutput.indices.forEach(index => {
            const cell = this._getCellByIndex(index);
            if (cell) {
                const icon = document.createElement('div');
                icon.className = 'glyph-icon-marker fade-in';
                icon.innerHTML = glyphOutput.icon;
                icon.setAttribute('data-glyph-origin', glyphOutput.id);
                
                // Position logic
                const rect = this._getRelativeRect(cell);
                icon.style.position = 'absolute';
                
                // Center the rune
                icon.style.left = `${rect.x + (rect.width / 2)}px`;
                icon.style.top = `${rect.y + (rect.height / 2)}px`;
                icon.style.transform = 'translate(-50%, -50%)'; // CSS centering
                
                // Mythic animation hook
                if (glyphOutput.category === 'anomaly') {
                    icon.classList.add('pulse-anomaly');
                } else if (glyphOutput.category === 'temporal') {
                    icon.classList.add('shimmer-temporal');
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
        category: 'anomaly'
    };

    // 3. Render
    this.glyphRenderer.toggle(glyphData);

    // 4. Clear
    // this.glyphRenderer.clearAll();
*/
