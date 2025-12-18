/**
 * LensRenderer.js
 * * SYSTEM ARCHITECT: Modular CSS Implementation
 * CODEX: main.css & lenses.css
 * * A pure UI component responsible for manifesting "Lens" visualizations
 * onto the Challenge Screen. It renders non-destructive overlays, annotations,
 * and highlights based on the output of the LensController.
 * * "A diviner's lens revealing the skeleton of the world."
 */

// --- MYTHIC TOKEN DEFINITIONS ---
// Maps engine lens types to the new visual language of lenses.css
const LENS_TOKEN_MAP = {
    'heatmap':  ['lens', 'lens--heatmap', 'lens--active', 'lens-anim--reveal'],
    'timeline': ['lens', 'lens--timeline', 'lens--active', 'lens-anim--shift'],
    'cluster':  ['lens', 'lens--cluster', 'lens--active', 'lens-anim--reveal'],
    'anomaly':  ['lens', 'lens--anomaly', 'lens--active', 'lens-anim--pulse'],
    'flow':     ['lens', 'lens--flow', 'lens--active', 'lens-anim--scanline'],
    'pivot':    ['lens', 'lens--pivot', 'lens--active', 'lens-anim--reveal']
};

export class LensRenderer {
  /**
   * @param {HTMLElement} gridContainer - The DOM element containing the grid cells.
   * @param {HTMLElement} legendContainer - The DOM element where legends should appear.
   */
  constructor(gridContainer, legendContainer) {
    this.gridContainer = gridContainer;
    this.legendContainer = legendContainer;
    
    // Registry to track active lenses and their artifacts
    // Map<lensId, { tokens, fxNodes, summaryNode, legacyClass, highlightRefs, svgNodes, annotationNodes }>
    this.registry = new Map();

    // Create or retrieve the specific layers for rendering
    this.layers = {
      // New modular lens container (z: 20)
      lensContainer: this._initLensContainer(),
      // Legacy SVG layer (z: 10)
      svg: this._initSvgLayer(),
      // Legacy Annotations layer (z: 20)
      annotations: this._initHtmlLayer('lens-annotations-layer'),
    };
  }

  /* -------------------------------------------------------------------------- */
  /* LIFECYCLE METHODS                                                          */
  /* -------------------------------------------------------------------------- */

  /**
   * Main render entry point.
   * Manifests the vision provided by the LensOutput.
   * Handles both new token-based lenses and legacy behaviors.
   * * @param {Object} lensOutput - The standard data contract from LensController.
   */
  render(lensOutput) {
    // 1. Clear previous visions (Legacy behavior requires single active lens usually, 
    // but we prepare for multi-lens future by clearing specific ID if provided, 
    // or everything if this is a "set active" call).
    // For compatibility with existing GameController, we assume one active lens at a time for now.
    this.clearAll();

    if (!lensOutput) return;

    this.activate(lensOutput);
  }

  /**
   * Activates a specific lens visualization.
   */
  activate(lensOutput) {
    const lensId = lensOutput.id || 'default-lens';
    const entry = {
        tokens: [],
        fxNodes: [],
        summaryNode: null,
        legacyClass: null,
        highlightRefs: [],
        // We don't strictly track SVG/Annotation nodes individually in registry 
        // because the layers are cleared globally in clearAll(), but for robust
        // multi-lens support we could. For now, we follow the current "clear all" pattern.
    };

    // 1. Resolve Tokens & Apply to Lens Container
    const type = lensOutput.type || (lensOutput.id.includes('heatmap') ? 'heatmap' : 'cluster'); // Fallback logic
    const tokens = LENS_TOKEN_MAP[type] || ['lens', 'lens--active'];
    
    // Apply tokens to the dedicated lens container
    this.layers.lensContainer.classList.add(...tokens);
    entry.tokens = tokens;

    // 2. Render FX Layers (The Mythic Composition)
    if (lensOutput.fx) {
        lensOutput.fx.forEach(fxType => {
            const fxNode = document.createElement('div');
            fxNode.className = `lens-layer lens-layer--${fxType}`;
            this.layers.lensContainer.appendChild(fxNode);
            entry.fxNodes.push(fxNode);
        });
    }

    // 3. Render Summary Label (The Title)
    if (lensOutput.summary || lensOutput.name) {
        const text = lensOutput.summary || lensOutput.name;
        const summaryNode = document.createElement('div');
        summaryNode.className = 'lens-summary fade-in';
        summaryNode.innerText = text;
        this.layers.lensContainer.appendChild(summaryNode);
        entry.summaryNode = summaryNode;
    }

    // 4. Handle Legacy CSS Classes (The Bridge)
    if (lensOutput.cssClass) {
        this.gridContainer.classList.add(lensOutput.cssClass);
        entry.legacyClass = lensOutput.cssClass;
    }

    // 5. Render Highlights (Cell-level classes) - Token & Legacy compatible
    if (lensOutput.highlights) {
        // We pass the entry.highlightRefs array to populate it
        this._renderHighlights(lensOutput.highlights, entry.highlightRefs);
    }

    // 6. Render Overlays (SVG Lines/Regions)
    if (lensOutput.overlays) {
        this._renderOverlays(lensOutput.overlays);
    }

    // 7. Render Annotations (Floating Text)
    if (lensOutput.annotations) {
        this._renderAnnotations(lensOutput.annotations);
    }

    // 8. Render Legends (Side panel)
    if (lensOutput.legends) {
        this._renderLegends(lensOutput.legends);
    }

    this.registry.set(lensId, entry);
  }

  /**
   * Clears all visual artifacts.
   * "Dissolving the illusion, returning to the raw grid."
   */
  clearAll() {
    // 1. Reset Lens Container (Tokens & FX)
    this.layers.lensContainer.className = 'lens'; // Reset to base class
    this.layers.lensContainer.innerHTML = ''; // Remove FX layers & summary

    // 2. Clear Legacy Grid Classes
    this.registry.forEach(entry => {
        if (entry.legacyClass) {
            this.gridContainer.classList.remove(entry.legacyClass);
        }
        // Clear active highlights
        entry.highlightRefs.forEach(({ element, className }) => {
            if (element) element.classList.remove(className);
        });
    });
    this.registry.clear();

    // 3. Clear SVG content (lines, shapes)
    while (this.layers.svg.firstChild) {
      this.layers.svg.removeChild(this.layers.svg.firstChild);
    }

    // 4. Clear Annotation content (labels, runes)
    this.layers.annotations.innerHTML = '';

    // 5. Clear Legend
    if (this.legendContainer) {
      this.legendContainer.innerHTML = '';
    }
  }

  // Alias for backward compatibility
  clear() {
      this.clearAll();
  }

  /* -------------------------------------------------------------------------- */
  /* INTERNAL LAYERS & RENDERING                                                */
  /* -------------------------------------------------------------------------- */

  /**
   * Applies direct CSS classes to grid cells.
   * Used for soft emphasis like glows, borders, or dims.
   * Now pushes references into a provided array for registry tracking.
   * * @param {Array} highlights - [{ row, col, style }]
   * * @param {Array} refArray - Array to store cleanup references
   */
  _renderHighlights(highlights, refArray) {
    highlights.forEach(highlight => {
      const cell = this._getCellElement(highlight.row, highlight.col);
      if (cell) {
        // Map abstract style names to mythic CSS classes
        const className = this._mapStyleToClass(highlight.style, 'highlight');
        cell.classList.add(className);
        
        // Track for cleanup
        if (refArray) {
            refArray.push({ element: cell, className });
        }
      }
    });
  }

  /**
   * Renders graphical shapes connecting or encompassing cells.
   * Uses SVG for crisp lines and complex geometries.
   * * @param {Array} overlays - [{ type: 'line'|'region'|'halo', ... }]
   */
  _renderOverlays(overlays) {
    overlays.forEach(overlay => {
      if (overlay.type === 'line') {
        this._drawLink(overlay.start, overlay.end, overlay.style);
      } else if (overlay.type === 'region') {
        this._drawRegion(overlay.bounds, overlay.style);
      } else if (overlay.type === 'halo') {
        this._drawHalo(overlay.row, overlay.col, overlay.style);
      }
    });
  }

  /**
   * Renders floating labels or runes above the grid.
   * * @param {Array} annotations - [{ row, col, text, style }]
   */
  _renderAnnotations(annotations) {
    annotations.forEach(note => {
      const cell = this._getCellElement(note.row, note.col);
      if (cell) {
        const noteEl = document.createElement('div');
        noteEl.className = `lens-annotation ${this._mapStyleToClass(note.style, 'text')}`;
        noteEl.innerHTML = note.text; // InnerHTML allowed for icons/runes

        // Position relative to the cell
        const rect = this._getRelativeRect(cell);
        
        // Center the annotation on the cell
        noteEl.style.left = `${rect.x + (rect.width / 2)}px`;
        noteEl.style.top = `${rect.y}px`; // Top of cell

        this.layers.annotations.appendChild(noteEl);
      }
    });
  }

  /**
   * Renders the explanation key for the current lens.
   * * @param {Array} legends - [{ label, icon, description }]
   */
  _renderLegends(legends) {
    if (!this.legendContainer) return;

    const list = document.createElement('ul');
    list.className = 'lens-legend-list';

    legends.forEach(item => {
      const li = document.createElement('li');
      li.className = 'lens-legend-item fade-in';
      li.innerHTML = `
        <span class="legend-icon">${item.icon || '•'}</span>
        <div class="legend-content">
          <span class="legend-label">${item.label}</span>
          ${item.description ? `<span class="legend-desc">${item.description}</span>` : ''}
        </div>
      `;
      list.appendChild(li);
    });

    this.legendContainer.appendChild(list);
  }

  /* -------------------------------------------------------------------------- */
  /* DRAWING PRIMITIVES (PRESERVED)                                             */
  /* -------------------------------------------------------------------------- */

  /**
   * Draws an SVG line between two cell centers.
   */
  _drawLink(start, end, style) {
    const startCell = this._getCellElement(start.row, start.col);
    const endCell = this._getCellElement(end.row, end.col);
    
    if (!startCell || !endCell) return;

    const p1 = this._getCellCenter(startCell);
    const p2 = this._getCellCenter(endCell);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', p1.x);
    line.setAttribute('y1', p1.y);
    line.setAttribute('x2', p2.x);
    line.setAttribute('y2', p2.y);
    line.setAttribute('class', `lens-line ${this._mapStyleToClass(style, 'line')}`);
    
    // Add arrow marker if directional
    if (style && style.includes('arrow')) {
        line.setAttribute('marker-end', 'url(#arrowhead)');
    }

    this.layers.svg.appendChild(line);
  }

  /**
   * Draws a rectangular highlight region (SVG rect).
   */
  _drawRegion(bounds, style) {
    // bounds: { minRow, maxRow, minCol, maxCol }
    const topLeft = this._getCellElement(bounds.minRow, bounds.minCol);
    const bottomRight = this._getCellElement(bounds.maxRow, bounds.maxCol);
    
    if (!topLeft || !bottomRight) return;

    const r1 = this._getRelativeRect(topLeft);
    const r2 = this._getRelativeRect(bottomRight);

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', r1.x - 2); // Slight padding
    rect.setAttribute('y', r1.y - 2);
    rect.setAttribute('width', (r2.x + r2.width - r1.x) + 4);
    rect.setAttribute('height', (r2.y + r2.height - r1.y) + 4);
    rect.setAttribute('class', `lens-region ${this._mapStyleToClass(style, 'region')}`);
    
    this.layers.svg.appendChild(rect);
  }

  /**
   * Draws a circular halo around a cell.
   */
  _drawHalo(row, col, style) {
    const cell = this._getCellElement(row, col);
    if (!cell) return;

    const center = this._getCellCenter(cell);
    const radius = Math.min(cell.offsetWidth, cell.offsetHeight) / 1.5;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', center.x);
    circle.setAttribute('cy', center.y);
    circle.setAttribute('r', radius);
    circle.setAttribute('class', `lens-halo ${this._mapStyleToClass(style, 'halo')}`);

    this.layers.svg.appendChild(circle);
  }

  /* -------------------------------------------------------------------------- */
  /* HELPERS                                                                    */
  /* -------------------------------------------------------------------------- */

  _initLensContainer() {
      let layer = this.gridContainer.querySelector('.lens');
      if (!layer) {
          layer = document.createElement('div');
          layer.className = 'lens'; // Base class from lenses.css
          // Note: positioning styles are handled by lenses.css
          this.gridContainer.appendChild(layer);
      }
      return layer;
  }

  _initSvgLayer() {
    let svg = this.gridContainer.querySelector('.lens-svg-layer');
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'lens-svg-layer');
      // Style logic should be in CSS, but structural styles here for safety
      svg.style.position = 'absolute';
      svg.style.top = '0';
      svg.style.left = '0';
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.style.pointerEvents = 'none';
      svg.style.zIndex = '10'; // Above grid, Below lens container (20)
      
      // Define reusable defs like arrowheads
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.innerHTML = `
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="var(--lens-color-primary, #a8d5e5)" />
        </marker>
      `;
      svg.appendChild(defs);

      this.gridContainer.appendChild(svg);
    }
    return svg;
  }

  _initHtmlLayer(className) {
    let layer = this.gridContainer.querySelector(`.${className}`);
    if (!layer) {
      layer = document.createElement('div');
      layer.className = className;
      layer.style.position = 'absolute';
      layer.style.top = '0';
      layer.style.left = '0';
      layer.style.width = '100%';
      layer.style.height = '100%';
      layer.style.pointerEvents = 'none';
      layer.style.zIndex = '25'; // Above Lens (20) and SVG (10) for text clarity
      this.gridContainer.appendChild(layer);
    }
    return layer;
  }

  _getCellElement(row, col) {
    // Assumes grid cells have data attributes: data-row="0" data-col="0"
    return this.gridContainer.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  }

  _getCellCenter(element) {
    const rect = this._getRelativeRect(element);
    return {
      x: rect.x + (rect.width / 2),
      y: rect.y + (rect.height / 2)
    };
  }

  _getRelativeRect(element) {
    const containerRect = this.gridContainer.getBoundingClientRect();
    const elRect = element.getBoundingClientRect();
    return {
      x: elRect.left - containerRect.left,
      y: elRect.top - containerRect.top,
      width: elRect.width,
      height: elRect.height
    };
  }

  _mapStyleToClass(styleName, type) {
    const map = {
      // Highlights
      'focus': 'lens-highlight-focus',       // Bright border
      'dim': 'lens-highlight-dim',           // Reduced opacity
      'warn': 'lens-highlight-warn',         // Red tint
      'success': 'lens-highlight-success',   // Green tint
      
      // Lines
      'flow': 'lens-line-flow',              // Solid, primary color
      'ghost': 'lens-line-ghost',            // Dashed, low opacity
      'connection': 'lens-line-connection',  // Simple connector
      
      // Annotations
      'header': 'lens-text-header',          // Bold, large
      'rune': 'lens-text-rune',              // Mythic font
      'subtle': 'lens-text-subtle'           // Small, grey
    };
    return map[styleName] || `lens-${type}-${styleName}`;
  }
}

/* -------------------------------------------------------------------------- */
/* USAGE EXAMPLE                                                              */
/* -------------------------------------------------------------------------- */
/*
  // 1. Initialize
  const gridEl = document.getElementById('game-grid');
  const legendEl = document.getElementById('lens-legend');
  const renderer = new LensRenderer(gridEl, legendEl);

  // 2. Data from LensController
  const lensOutput = {
    id: "heatmap-standard", // Maps to 'heatmap' token
    type: "heatmap",
    name: "Conditional Aura",
    summary: "Format: Active",
    fx: ['veil', 'mask'], // Adds lens-layer--veil, lens-layer--mask
    overlays: [
      { type: 'line', start: {row:0, col:0}, end: {row:2, col:2}, style: 'flow' }
    ],
    highlights: [
      { row: 0, col: 0, style: 'focus' },
      { row: 1, col: 1, style: 'dim' }
    ],
    annotations: [
      { row: 0, col: 0, text: "MAX", style: 'header' }
    ],
    legends: [
      { label: "Flow Path", icon: "→", description: "Shows data direction" }
    ]
  };

  // 3. Render
  renderer.render(lensOutput);

  // 4. Clear
  // renderer.clearAll();
*/
