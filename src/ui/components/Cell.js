export class Cell {
    constructor(data) {
        this.data = data;
        this.element = document.createElement('div');
        this.element.className = 'grid-cell';
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
