import { Cell } from './Cell.js';

export class GridRenderer {

    constructor(container) {
        this.container = container;
        this.element = container;
        this.cells = [];
    }

    render(gridData) {
        if (!Array.isArray(gridData) || gridData.length === 0) {
            console.error("GridRenderer: invalid gridData", gridData);
            this.container.innerHTML = '';
            return;
        }

        this.container.innerHTML = '';
        this.cells = [];

        // Set column count based on first row
        const cols = gridData[0].length;
        this.container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        // Build cells
        for (const row of gridData) {
            for (const cellData of row) {
                const cell = new Cell(cellData);
                this.cells.push(cell);
                this.container.appendChild(cell.element);
            }
        }
    }

    applyFormatting(formattingResult) {
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
        this.container.innerHTML = '';
    }
}
