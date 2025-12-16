export class QuestionPanel {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.onSubmitCallback = null;
    }

    /**
     * Renders the question UI.
     * @param {Object} questionData - { text, type } from engine
     * @param {Function} onSubmit - Callback when user submits answer
     */
    render(questionData, onSubmit) {
        this.onSubmitCallback = onSubmit;
        this.container.innerHTML = '';

        const wrapper = document.createElement('div');
        wrapper.className = 'question-box reveal-anim';

        // Question Text
        const text = document.createElement('h3');
        text.textContent = questionData.text;
        wrapper.appendChild(text);

        // Input Area
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';
        inputGroup.style.marginTop = '15px';
        inputGroup.style.display = 'flex';
        inputGroup.style.gap = '10px';

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Your answer...';
        input.className = 'answer-input';
        input.style.padding = '8px';
        input.style.flex = '1';

        const btn = document.createElement('button');
        btn.textContent = 'Submit';
        btn.className = 'primary-btn';
        btn.onclick = () => this.handleSubmit(input.value);

        // Allow Enter key
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSubmit(input.value);
        });

        inputGroup.appendChild(input);
        inputGroup.appendChild(btn);
        wrapper.appendChild(inputGroup);
        
        this.container.appendChild(wrapper);
    }

    handleSubmit(value) {
        if (!value) return;
        if (this.onSubmitCallback) {
            this.onSubmitCallback(value);
        }
    }

    showFeedback(isCorrect, correctAnswer) {
        // Simple visual feedback
        const input = this.container.querySelector('input');
        if (isCorrect) {
            input.style.borderColor = '#1dd1a1';
            input.style.backgroundColor = 'rgba(29, 209, 161, 0.1)';
        } else {
            input.style.borderColor = '#ee5253';
            input.style.backgroundColor = 'rgba(238, 82, 83, 0.1)';
            input.value = '';
            input.placeholder = 'Try again...';
        }
    }
}
