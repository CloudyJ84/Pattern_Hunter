import { Cell } from './Cell.js';

export class GridRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.cells = [];
    }

    render(gridData) {
        this.container.innerHTML = '';
        this.cells = [];

        const rows = gridData.length;
        const cols = gridData[0].length;

        // --- CSS Grid Logic ---
        // Dynamically set columns variable for CSS
        this.container.style.setProperty('--cols', cols);
        this.container.style.display = 'grid';
        this.container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        this.container.style.gap = '8px';
        
        gridData.forEach(row => {
            row.forEach(cellData => {
                const cell = new Cell(cellData);
                this.cells.push(cell);
                this.container.appendChild(cell.element);
            });
        });
    }

    applyFormatting(formattingResult) {
        if (!formattingResult || !formattingResult.highlightedCells) return;

        const { cssClass, highlightedCells } = formattingResult;
        
        // Optimize lookup
        const highlightMap = new Set(
            highlightedCells.map(c => `${c.row},${c.col}`)
        );

        this.cells.forEach(cell => {
            const key = `${cell.data.row},${cell.data.col}`;
            if (highlightMap.has(key)) {
                cell.highlight(cssClass);
            }
        });
    }
}
