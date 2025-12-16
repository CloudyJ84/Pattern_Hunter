import { generateLevel } from '../engine/levelEngine.js';
import { ControlsBar } from './components/ControlsBar.js';
import { GridRenderer } from './components/GridRenderer.js';
import { QuestionDisplay } from './components/QuestionDisplay.js';
import { FeedbackDisplay } from './components/FeedbackDisplay.js';
import { DebugPanel } from './components/DebugPanel.js';

export class UIManager {
    constructor() {
        this.currentChallenge = null;
        
        // Initialize Components
        this.controls = new ControlsBar('controls-bar', {
            onGenerate: (level) => this.generateLevel(level),
            onStressTest: () => this.runStressTest()
        });
        
        this.grid = new GridRenderer('grid-container');
        
        this.question = new QuestionDisplay('question-panel', (answer) => this.handleSubmit(answer));
        
        this.feedback = new FeedbackDisplay('feedback-panel');
        
        this.debug = new DebugPanel('debug-panel', 'debug-toggle-container');
    }

    generateLevel(levelNum) {
        console.log(`Generating Level ${levelNum}...`);
        
        try {
            // 1. Engine Call
            this.currentChallenge = generateLevel(levelNum);
            
            // 2. Clear previous state
            this.feedback.clear();

            // 3. Update UI Components
            this.grid.render(this.currentChallenge.grid);
            this.question.render(this.currentChallenge.question);
            
            // 4. Debug Output
            this.debug.render(this.currentChallenge);

            // 5. Auto-apply formatting for Dev Harness (Optional, but user asked for it in Main Grid Area desc)
            // "Apply formatting classes" was requested.
            this.grid.applyFormatting(this.currentChallenge.formatting);

        } catch (e) {
            console.error("Level Generation Error:", e);
            alert("Error generating level: " + e.message);
        }
    }

    handleSubmit(userAnswer) {
        if (!this.currentChallenge) return;

        const correctAnswer = String(this.currentChallenge.question.answer).toLowerCase().trim();
        const input = String(userAnswer).toLowerCase().trim();

        if (input === correctAnswer) {
            this.feedback.showCorrect();
        } else {
            this.feedback.showIncorrect(this.currentChallenge.question.answer);
        }
    }

    runStressTest() {
        console.log("Starting Stress Test...");
        let errors = 0;
        for(let i=1; i<=10; i++) {
            try {
                const c = generateLevel(i);
                if(!c.grid || !c.question) throw new Error("Incomplete object");
            } catch(e) {
                console.error(`Stress Test Failed at Level ${i}`, e);
                errors++;
            }
        }
        if(errors === 0) alert("Stress Test Passed: 10 levels generated successfully.");
        else alert(`Stress Test Failed with ${errors} errors. Check console.`);
    }
}
