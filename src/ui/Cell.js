/**
 * Represents a single cell in the dataset grid.
 * Responsible for rendering value types correctly and applying visual states.
 */
export class Cell {
    constructor(cellData) {
        this.data = cellData; // { row, col, value, type }
        this.element = document.createElement('div');
        this.init();
    }

    init() {
        this.element.className = 'grid-cell reveal-anim';
        this.element.dataset.row = this.data.row;
        this.element.dataset.col = this.data.col;
        
        // Render content based on type
        this.element.textContent = this.formatValue();
        
        // Stagger animation based on index
        const delay = (this.data.row * 0.1) + (this.data.col * 0.1);
        this.element.style.animationDelay = `${delay}s`;
    }

    formatValue() {
        const val = this.data.value;
        const type = this.data.type;

        if (val === null || val === undefined) return '-';

        switch (type) {
            case 'dates':
                return val instanceof Date 
                    ? val.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) 
                    : String(val);
            
            case 'times':
                return String(val); // Already HH:MM from engine
            
            case 'numbers':
                return String(val);
            
            case 'categories':
                return String(val).toUpperCase();
            
            default:
                return String(val);
        }
    }

    /**
     * Applies a formatting class to the cell.
     * @param {string} cssClass - The class name from formattingEngine
     */
    highlight(cssClass) {
        if (cssClass && cssClass !== 'fmt-default') {
            this.element.classList.add(cssClass);
        }
    }

    /**
     * Removes formatting classes.
     * @param {string} cssClass 
     */
    resetHighlight(cssClass) {
        if (cssClass) {
            this.element.classList.remove(cssClass);
        }
    }
}
