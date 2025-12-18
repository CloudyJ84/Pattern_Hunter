/**
 * LensRenderer.js
 * * A pure UI component responsible for manifesting the "Lens" visualizations
 * onto the Challenge Screen. It renders non-destructive overlays, annotations,
 * and highlights based on the output of the LensController.
 * * "A diviner's lens revealing the skeleton of the world."
 */

export class LensRenderer {
  /**
   * @param {HTMLElement} gridContainer - The DOM element containing the grid cells.
   * @param {HTMLElement} legendContainer - The DOM element where legends should appear.
   */
  constructor(gridContainer, legendContainer) {
    this.gridContainer = gridContainer;
    this.legendContainer = legendContainer;
    
    // Create or retrieve the specific layers for rendering
    this.layers = {
      svg: this._initSvgLayer(),
      annotations: this._initHtmlLayer('lens-annotations-layer'),
    };

    // Store references to highlighted cells to clean up efficiently
    this.activeHighlights = [];
  }

  /**
   * Main render entry point.
   * Manifests the vision provided by the LensOutput.
   * * @param {Object} lensOutput - The standard data contract from LensController.
   */
  render(lensOutput) {
    // 1. Clear previous visions
    this.clear();

    if (!lensOutput) return;

    // 2. Render Layers (Order matters for z-index visual stacking)
    if (lensOutput.highlights) this._renderHighlights(lensOutput.highlights);
    if (lensOutput.overlays) this._renderOverlays(lensOutput.overlays);
    if (lensOutput.annotations) this._renderAnnotations(lensOutput.annotations);
    if (lensOutput.legends) this._renderLegends(lensOutput.legends);
  }

  /**
   * Clears all visual artifacts.
   * "Dissolving the illusion, returning to the raw grid."
   */
  clear() {
    // Clear SVG content (lines, shapes)
    while (this.layers.svg.firstChild) {
      this.layers.svg.removeChild(this.layers.svg.firstChild);
    }

    // Clear Annotation content (labels, runes)
    this.layers.annotations.innerHTML = '';

    // Remove CSS highlights from cells
    this.activeHighlights.forEach(({ element, className }) => {
      if (element) element.classList.remove(className);
    });
    this.activeHighlights = [];

    // Clear Legend
    if (this.legendContainer) {
      this.legendContainer.innerHTML = '';
    }
  }

  /* -------------------------------------------------------------------------- */
  /* INTERNAL LAYERS                             */
  /* -------------------------------------------------------------------------- */

  /**
   * Applies direct CSS classes to grid cells.
   * Used for soft emphasis like glows, borders, or dims.
   * * @param {Array} highlights - [{ row, col, style }]
   */
  _renderHighlights(highlights) {
    highlights.forEach(highlight => {
      const cell = this._getCellElement(highlight.row, highlight.col);
      if (cell) {
        // Map abstract style names to mythic CSS classes
        const className = this._mapStyleToClass(highlight.style, 'highlight');
        cell.classList.add(className);
        
        // Track for cleanup
        this.activeHighlights.push({ element: cell, className });
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
  /* DRAWING PRIMITIVES                             */
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
    if (style.includes('arrow')) {
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
  /* HELPERS                                     */
  /* -------------------------------------------------------------------------- */

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
      svg.style.zIndex = '10'; // Above grid
      
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
      layer.style.zIndex = '20'; // Above SVG
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
/* USAGE EXAMPLE                               */
/* -------------------------------------------------------------------------- */
/*
  // 1. Initialize
  const gridEl = document.getElementById('game-grid');
  const legendEl = document.getElementById('lens-legend');
  const renderer = new LensRenderer(gridEl, legendEl);

  // 2. Data from LensController
  const lensOutput = {
    id: "lens_summary",
    name: "Summary Lens",
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

  // 4. Clear when lens is deactivated
  // renderer.clear();
*/
