import { Cell } from './Cell.js';

export class GridRenderer {
    constructor(containerElement) {
        this.container = containerElement;
        this.cells = [];
    }

    render(gridData) {
        this.container.innerHTML = '';
        this.cells = [];

        const rows = gridData.length;
        const cols = gridData[0].length;

        this.container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        this.container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

        gridData.forEach(row => {
            row.forEach(cellData => {
                const cellComponent = new Cell(cellData);
                this.cells.push(cellComponent);
                this.container.appendChild(cellComponent.element);
            });
        });
    }

    applyFormatting(cellsToHighlight, cssClass) {
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
