export class Cell {
    constructor(data) {
        this.data = data;
        this.element = document.createElement('div');
        this.element.className = 'grid-cell';

        // Etch coordinates and index onto the physical substrate
        // Required for GlyphRenderer (index) and LensRenderer (row/col)
        if (this.data.index !== undefined) {
            this.element.setAttribute('data-index', this.data.index);
        }
        if (this.data.row !== undefined) {
            this.element.setAttribute('data-row', this.data.row);
        }
        if (this.data.col !== undefined) {
            this.element.setAttribute('data-col', this.data.col);
        }

        this.render();
    }

    render() {
        let val = this.data.value;

        // Simple date display fallback
        if (val instanceof Date) {
            val = val.getDate();
        }

        // Defensive fallback for null/undefined
        if (val === null || val === undefined) {
            val = '';
        }

        this.element.textContent = val;
    }

    highlight(cssClass) {
        if (!cssClass || cssClass === 'fmt-default') return;
        this.element.classList.add(cssClass);
    }

    clearFormatting() {
        // Remove all fmt-* classes if needed
        const classes = [...this.element.classList].filter(c => c.startsWith('fmt-'));
        classes.forEach(c => this.element.classList.remove(c));
    }

    destroy() {
        // Lifecycle consistency with other components
        this.element = null;
        this.data = null;
    }
}
