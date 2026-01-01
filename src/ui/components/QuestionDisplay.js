export class QuestionDisplay {

    constructor(container, onSubmit) {
        this.container = container;
        this.onSubmit = onSubmit;
        this.element = container;
    }

    /**
     * Expected Question object (modern engine):
     * {
     * text: string,
     * noInput?: boolean,   // true for cell-selection questions
     * hint?: string,       // reserved for future UI
     * sigilId?: string     // handled by SigilRenderer, not here
     * }
     */
    render(question) {
        if (!question || !question.text) {
            console.error("QuestionDisplay: invalid question object", question);
            this.container.innerHTML = "<h3 class='error-message'>Invalid question</h3>";
            return;
        }

        // 🔮 Mythic UI: Structure wrapping
        // Sigil logic removed; purely renders text and ritual zone now.
        this.container.innerHTML = `
            <div class="query-rune">
                <h3 class="rune-text" aria-live="polite">${question.text}</h3>
                <div class="question-hint"></div>
                <div class="input-group ritual-zone"></div>
            </div>
        `;

        const group = this.container.querySelector('.input-group');

        // If no input is required (cell-selection mode), stop here
        if (question.noInput) {
            return;
        }

        const input = document.createElement('input');
        input.className = 'answer-input';
        input.placeholder = "Inscribe answer…";
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('aria-label', 'Answer input');

        const btn = document.createElement('button');
        btn.textContent = 'Submit';
        btn.className = 'control-btn primary submit-seal';

        // 🔮 Mythic UI: Focus Animation Logic
        input.addEventListener('focus', () => group.classList.add('ritual-active'));
        input.addEventListener('blur', () => group.classList.remove('ritual-active'));

        const submit = () => {
            const value = input.value?.trim();
            if (value) {
                this.onSubmit(value);
            }
        };

        btn.onclick = submit;
        input.onkeypress = (e) => {
            if (e.key === 'Enter') submit();
        };

        group.appendChild(input);
        group.appendChild(btn);

        // Focus after render
        setTimeout(() => input.focus(), 50);
    }

    destroy() {
        this.container.innerHTML = '';
        this.element = null;
        this.onSubmit = null;
    }
}
