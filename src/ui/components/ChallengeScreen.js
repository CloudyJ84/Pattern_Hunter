import { generateLevel } from '../engine/levelEngine.js';
import { GridRenderer } from './GridRenderer.js';
import { QuestionDisplay } from './QuestionDisplay.js';

export class ChallengeScreen {
    constructor(container) {
        this.container = container;
        this.currentChallenge = null;
    }

    loadLevel(levelNumber) {
        // Generate challenge from engine
        this.currentChallenge = generateLevel(levelNumber);

        // Clear screen
        this.container.innerHTML = '';

        // Render grid
        const grid = new GridRenderer(
            this.currentChallenge.grid,
            this.currentChallenge.formatting
        );
        this.container.appendChild(grid.render());

        // Render question
        const question = new QuestionDisplay(this.currentChallenge.question);
        const questionEl = question.render();

        // Add answer checking
        const checkBtn = document.createElement('button');
        checkBtn.textContent = 'Check Answer';
        checkBtn.addEventListener('click', () => {
            const userAnswer = question.getAnswer();
            this.evaluateAnswer(userAnswer);
        });

        this.container.appendChild(questionEl);
        this.container.appendChild(checkBtn);
    }

    evaluateAnswer(userAnswer) {
        const correct = userAnswer == this.currentChallenge.question.answer;

        const result = document.createElement('div');
        result.className = 'answer-result';
        result.textContent = correct
            ? 'Correct!'
            : `Incorrect — correct answer is ${this.currentChallenge.question.answer}`;

        this.container.appendChild(result);
    }
}
