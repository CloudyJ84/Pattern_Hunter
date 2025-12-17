import { generateLevel } from '../../engine/levelEngine.js';
import { GameState } from '../../state/gameState.js';
import { UIRouter } from '../UIRouter.js';
import { GridRenderer } from '../components/GridRenderer.js';
import { QuestionDisplay } from '../components/QuestionDisplay.js';
import { FeedbackDisplay } from '../components/FeedbackDisplay.js';

export class ChallengeScreen {

    constructor(params) {
        this.levelId = params.levelId;
        this.thresholdTier = params.thresholdTier;
        this.data = null;
        this.element = null;
    }

    mount() {
        const el = document.createElement('div');
        el.className = 'screen fade-in';

        el.innerHTML = `
            <header class="game-header">
                <button id="back" class="control-btn secondary">Menu</button>
                <h2>Level ${this.levelId} (Tier ${this.thresholdTier})</h2>
                <div style="width:50px"></div>
            </header>

            <div class="game-content">
                <div class="grid-area">
                    <div class="dataset-grid" id="grid"></div>
                </div>

                <div class="sidebar-area">
                    <div id="question" class="panel"></div>
                    <button id="fmt-btn" class="control-btn secondary">Apply Hint</button>
                    <div id="feedback" class="panel hidden"></div>
                </div>
            </div>
        `;

        // Back navigation
        el.querySelector('#back').onclick = () => {
            UIRouter.navigateTo('LevelSelectScreen');
        };

        // Component instances
        this.grid = new GridRenderer(el.querySelector('#grid'));
        this.question = new QuestionDisplay(
            el.querySelector('#question'),
            (ans) => this.handleSubmit(ans)
        );
        this.feedback = new FeedbackDisplay(el.querySelector('#feedback'));

        // Hint button
        this.fmtBtn = el.querySelector('#fmt-btn');
        this.fmtBtn.onclick = () => {
            this.grid.applyFormatting(this.data.formatting);
            this.fmtBtn.disabled = true;
            this.fmtBtn.textContent = "Hint Applied";
        };

        this.element = el;
        this.loadLevel();
        return el;
    }

    loadLevel() {
        this.data = generateLevel(this.levelId, this.thresholdTier);

        // Render grid + question
        this.grid.render(this.data.grid);
        this.question.render(this.data.question);

        // Hint button logic
        const hintLevel = this.data.thresholdConfig.hintLevel;
        if (hintLevel === 'none') {
            this.fmtBtn.style.display = 'none';
        } else {
            this.fmtBtn.style.display = 'block';
            this.fmtBtn.textContent = `Apply Hint (${hintLevel})`;
        }
    }

    handleSubmit(ans) {
        const correct = String(this.data.question.answer).toLowerCase().trim();
        const input = String(ans).toLowerCase().trim();

        if (input === correct) {
            GameState.completeLevel(this.levelId);

            this.feedback.showCorrect(
                () => {
                    UIRouter.navigateTo('ChallengeScreen', {
                        levelId: this.levelId + 1,
                        thresholdTier: this.thresholdTier
                    });
                },
                this.data.thresholdConfig.rewardMultiplier
            );

        } else {
            this.feedback.showIncorrect(correct);
        }
    }

    destroy() {
        // No persistent listeners yet, but lifecycle consistency matters
        this.element = null;
    }
}
