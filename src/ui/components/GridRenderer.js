import { Cell } from './Cell.js';

export class GridRenderer {

    constructor(container) {
        this.container = container;
        this.element = container;
        this.cells = [];
        this.gridCells = []; // Internal registry for fast lookups
        this.cols = 0;       // Track column count for index math
    }

    render(gridData, highlightedCells = []) {
        if (!Array.isArray(gridData) || gridData.length === 0) {
            console.error("GridRenderer: invalid gridData", gridData);
            this.container.innerHTML = '';
            return;
        }

        this.container.innerHTML = '';
        this.cells = [];
        this.gridCells = []; // Clear flat registry

        // Set column count based on first row
        this.cols = gridData[0].length;
        this.container.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;

        // Build cells with coordinate injection
        let flatIndex = 0;

        for (let r = 0; r < gridData.length; r++) {
            const rowData = gridData[r];
            for (let c = 0; c < rowData.length; c++) {
                const rawCellData = rowData[c];

                // Construct enriched data packet for the ritual
                // Ensures downstream renderers can locate this entity
                const cellData = {
                    ...rawCellData,
                    value: rawCellData.value, // Ensure value is explicit
                    row: r,
                    col: c,
                    index: flatIndex++
                };

                const cell = new Cell(cellData);
                this.cells.push(cell);
                this.container.appendChild(cell.element);

                // Populate internal registry for ChallengeScreen and Sigil access
                this.gridCells.push({
                    element: cell.element,
                    value: cellData.value,
                    row: r,
                    col: c
                });
            }
        }

        // Apply highlights passed from formattingEngine during render
        this.highlightCells(highlightedCells);
    }

    /**
     * Highlights specific cells based on {row, col} objects.
     * Used by formattingEngine.
     * @param {Array} cells - Array of objects containing row and col properties
     */
    highlightCells(cells) {
        this.clearHighlights();

        if (!cells || !Array.isArray(cells)) return;

        cells.forEach(cell => {
            // Calculate flat index based on row/col
            const idx = cell.row * this.cols + cell.col;
            const entry = this.gridCells[idx];
            if (entry) {
                entry.element.classList.add('highlighted');
            }
        });
    }

    /**
     * Highlights cells based on flat array indices.
     * Used by Sigil logic in ChallengeScreen.
     * @param {Array<number>} indices - Array of integer indices
     */
    highlightIndices(indices) {
        if (!indices || !Array.isArray(indices)) return;

        indices.forEach(i => {
            const entry = this.gridCells[i];
            if (entry) {
                entry.element.classList.add('highlighted');
            }
        });
    }

    /**
     * Clears the 'highlighted' class from all registered cells.
     */
    clearHighlights() {
        this.gridCells.forEach(entry => {
            entry.element.classList.remove('highlighted');
        });
    }

    /**
     * Future-proof hook for lens overlays.
     * @param {string} lensType 
     * @param {object} analytics 
     */
    applyLens(lensType, analytics) {
        // Future expansion: color overlays, column/row shading, etc.
        // Leave empty for now.
    }

    applyFormatting(formattingResult) {
        // Preserved for backward compatibility / existing flows
        if (!formattingResult || !formattingResult.highlightedCells) return;

        const highlighted = new Set(
            formattingResult.highlightedCells.map(c => `${c.row},${c.col}`)
        );

        for (const cell of this.cells) {
            const key = `${cell.data.row},${cell.data.col}`;
            if (highlighted.has(key)) {
                cell.highlight(formattingResult.cssClass);
            }
        }
    }

    destroy() {
        // No persistent listeners, but lifecycle consistency matters
        this.cells = [];
        this.gridCells = [];
        this.container.innerHTML = '';
    }
}
