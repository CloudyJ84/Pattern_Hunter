import { Cell } from './Cell.js';

export class Grid {
    constructor(containerElement) {
        this.container = containerElement;
        this.cells = []; // Array of Cell instances
    }

    /**
     * Renders the grid based on the provided 2D dataset.
     * @param {Array<Array<Object>>} gridData - 2D array from engine
     */
    render(gridData) {
        this.container.innerHTML = '';
        this.cells = [];

        const rows = gridData.length;
        const cols = gridData[0].length;

        // Apply CSS Grid layout dynamic properties
        this.container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        this.container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        
        // Flatten loop to render cells
        gridData.forEach(row => {
            row.forEach(cellData => {
                const cellComponent = new Cell(cellData);
                this.cells.push(cellComponent);
                this.container.appendChild(cellComponent.element);
            });
        });
    }

    /**
     * Applies highlighting to specific cells.
     * @param {Array<Object>} cellsToHighlight - Array of {row, col} objects
     * @param {string} cssClass - The CSS class to apply
     */
    applyFormatting(cellsToHighlight, cssClass) {
        // Create a lookup set for O(1) access
        const highlightSet = new Set(
            cellsToHighlight.map(c => `${c.row},${c.col}`)
        );

        this.cells.forEach(cell => {
            const key = `${cell.data.row},${cell.data.col}`;
            if (highlightSet.has(key)) {
                cell.highlight(cssClass);
            }
        });
    }
}
