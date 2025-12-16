export class ControlsBar {
    constructor(containerId, callbacks) {
        this.container = document.getElementById(containerId);
        this.callbacks = callbacks; // { onGenerate: (level) => {} }
        this.init();
    }

    init() {
        this.container.innerHTML = '';

        this.createButton('Level 1 (Simple)', () => this.callbacks.onGenerate(1));
        this.createButton('Level 4 (Dates/Times)', () => this.callbacks.onGenerate(4));
        this.createButton('Level 7 (Complex)', () => this.callbacks.onGenerate(7));
        this.createButton('Random (1-10)', () => this.callbacks.onGenerate(Math.floor(Math.random() * 10) + 1));
        
        const spacer = document.createElement('div');
        spacer.style.flex = "1";
        this.container.appendChild(spacer);

        this.createButton('Stress Test (x10)', () => this.callbacks.onStressTest(), 'secondary');
    }

    createButton(label, onClick, style = '') {
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.className = `control-btn ${style}`;
        btn.onclick = onClick;
        this.container.appendChild(btn);
    }
}
