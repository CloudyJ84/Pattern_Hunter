export class QuestionDisplay {

    constructor(container, onSubmit) {
        this.container = container;
        this.onSubmit = onSubmit;
        this.element = container;
    }

    render(question) {
        if (!question || !question.text) {
            console.error("QuestionDisplay: invalid question object", question);
            this.container.innerHTML = "<h3>Invalid question</h3>";
            return;
        }

        this.container.innerHTML = `
            <h3>${question.text}</h3>
            <div class="input-group"></div>
        `;

        const group = this.container.querySelector('.input-group');

        const input = document.createElement('input');
        input.className = 'answer-input';
        input.placeholder = "Type answer…";

        const btn = document.createElement('button');
        btn.textContent = 'Submit';
        btn.className = 'control-btn primary';

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
