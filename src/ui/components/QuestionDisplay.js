export class QuestionDisplay {

    constructor(container, onSubmit) {
        this.container = container;
        this.onSubmit = onSubmit;
        this.element = container;
    }

    render(question) {
        if (!question || !question.text) {
            console.error("QuestionDisplay: invalid question object", question);
            this.container.innerHTML = "<h3 class='error-sigil'>Invalid question</h3>";
            return;
        }

        // 🔮 Mythic UI: Metadata Extraction
        const typeHtml = question.type 
            ? `<span class="meta-rune type-sigil" title="Pattern Type">${question.type.toUpperCase()}</span>` 
            : '';
            
        const hintHtml = question.hint 
            ? `<div class="meta-rune hint-sigil" title="Hint: ${question.hint}">? <span class="hint-text">${question.hint}</span></div>` 
            : '';

        const metaSection = (typeHtml || hintHtml) 
            ? `<div class="rune-metadata">${typeHtml}${hintHtml}</div>` 
            : '';

        // 🔮 Mythic UI: Structure wrapping
        this.container.innerHTML = `
            <div class="query-rune">
                ${metaSection}
                <h3 class="rune-text">${question.text}</h3>
                <div class="input-group ritual-zone"></div>
            </div>
        `;

        const group = this.container.querySelector('.input-group');

        const input = document.createElement('input');
        input.className = 'answer-input';
        input.placeholder = "Inscribe answer…";
        input.setAttribute('autocomplete', 'off');

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
        // Lifecycle consistency with other components
        this.container.innerHTML = '';
        this.element = null;
        this.onSubmit = null;
    }
}
