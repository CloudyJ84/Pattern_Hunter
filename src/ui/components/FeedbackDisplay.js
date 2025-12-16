export class FeedbackDisplay {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    showCorrect() {
        this.container.classList.remove('hidden');
        this.container.innerHTML = `
            <h3 style="color: var(--success); margin: 0;">Correct!</h3>
            <p>Well done. Proceed to next level.</p>
        `;
    }

    showIncorrect(correctAnswer) {
        this.container.classList.remove('hidden');
        this.container.innerHTML = `
            <h3 style="color: var(--error); margin: 0;">Incorrect</h3>
            <p>The correct answer was: <strong>${correctAnswer}</strong></p>
        `;
    }

    clear() {
        this.container.innerHTML = '';
        this.container.classList.add('hidden');
    }
}
