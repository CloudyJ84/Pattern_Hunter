import { Cell } from './Cell.js';

export class GridRenderer {

    constructor(container) {
        this.container = container;
        this.element = container;
        this.cells = [];
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

        for (const target of cells) {
            for (const cell of this.cells) {
                if (cell.data.row === target.row && cell.data.col === target.col) {
                    cell.element.classList.add('highlighted');
                }
            }
        }
    }

    /**
     * Highlights cells based on flat array indices.
     * Used by Sigil logic in ChallengeScreen.
     * @param {Array<number>} indices - Array of integer indices
     */
    highlightIndices(indices) {
        if (!indices || !Array.isArray(indices)) return;

        for (const i of indices) {
            const cell = this.cells.find(c => c.data.index === i);
            if (cell) {
                cell.element.classList.add('highlighted');
            }
        }
    }

    /**
     * Clears the 'highlighted' class from all registered cells.
     */
    clearHighlights() {
        this.cells.forEach(cell => {
            cell.element.classList.remove('highlighted');
        });
    }

    /**
     * Reserved for future lens overlays.
     * Expected input:
     * lensType: string
     * analytics: object
     * Will apply visual overlays based on lensType and analytics metadata.
     */
    applyLens(lensType, analytics) {
        // Future expansion: color overlays, column/row shading, etc.
        // Leave empty for now.
    }

    applyFormatting(formattingResult) {
        if (!formattingResult || !formattingResult.highlightedCells) return;

        const cssClass = formattingResult.cssClass || 'highlighted';

        for (const cell of this.cells) {
            const match = formattingResult.highlightedCells.some(
                c => c.row === cell.data.row && c.col === cell.data.col
            );
            if (match) {
                cell.element.classList.add(cssClass);
            }
        }
    }

    destroy() {
        // No persistent listeners, but lifecycle consistency matters
        this.cells = [];
        this.container.innerHTML = '';
    }
}
