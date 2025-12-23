/**
 * SigilRenderer.js
 * * SYSTEM ARCHITECT: UI Manifestation Layer
 * * CODEX: sigils.css
 * * A pure UI component responsible for inscribing "Sigils" — symbolic representations
 * * of statistical truths that hover near the question block.
 * * "Ancient marks burned into the parchment, whispering secrets of the numbers below."
 * * Architecture:
 * - Stateless: Does not calculate variance or entropy, only displays the results.
 * - Reactive: Respond to user invocation to transmute symbols into textual wisdom.
 * - Isolated: Operates strictly within the provided .sigil-zone container.
 */

export class SigilRenderer {
    /**
     * @param {HTMLElement} containerElement - The dedicated DOM container (e.g., .sigil-zone).
     */
    constructor(containerElement) {
        if (!containerElement) {
            console.warn("SigilRenderer: No container provided. The ritual cannot commence.");
        }
        this.container = containerElement;
        
        // Registry to track manifested sigils
        this.activeSigils = new Set();
    }

    /**
     * Inscribes a single sigil into the container.
     * @param {Object} sigilOutput - The sigil data contract { id, icon, hint, active, ... }
     */
    render(sigilOutput) {
        if (!this.container || !sigilOutput || !sigilOutput.active) return;

        // 1. Create the Sigil Vessel (Wrapper)
        const sigilNode = document.createElement('div');
        sigilNode.className = 'sigil-unit fade-in';
        sigilNode.setAttribute('data-sigil-id', sigilOutput.id);
        
        // Optional: Apply visual weight based on strength (0.0 - 1.0)
        if (typeof sigilOutput.strength === 'number') {
            sigilNode.style.setProperty('--sigil-strength', sigilOutput.strength);
        }

        // 2. The Mark (Icon State) - Visible by default
        const iconLayer = document.createElement('div');
        iconLayer.className = 'sigil-face sigil-face--icon';
        iconLayer.innerHTML = sigilOutput.icon || '🔮'; // Fallback rune
        sigilNode.appendChild(iconLayer);

        // 3. The Whisper (Hint State) - Hidden by default
        const hintLayer = document.createElement('div');
        hintLayer.className = 'sigil-face sigil-face--hint';
        hintLayer.innerText = sigilOutput.hint || sigilOutput.name;
        // Ideally hidden via CSS, but we ensure structure here
        sigilNode.appendChild(hintLayer);

        // 4. Manifestation
        this.container.appendChild(sigilNode);
        this.activeSigils.add(sigilOutput.id);
    }

    /**
     * Renders multiple sigils in a single pass.
     * @param {Array<Object>} sigilOutputs 
     */
    renderAll(sigilOutputs) {
        if (!Array.isArray(sigilOutputs)) return;
        
        // Clear previous marks before new inscription to avoid duplicates
        this.clearAll();

        sigilOutputs.forEach(sigil => {
            if (sigil.active) {
                this.render(sigil);
            }
        });
    }

    /**
     * Transmutes the sigil from its symbolic form to its textual truth.
     * @param {string} sigilId - The unique ID of the sigil to reveal.
     */
    revealHint(sigilId) {
        const sigilNode = this.container.querySelector(`[data-sigil-id="${sigilId}"]`);
        
        if (sigilNode) {
            // Apply the 'revealed' state class
            // CSS handles the transition/rotation/fade between .sigil-face--icon and .sigil-face--hint
            sigilNode.classList.add('is-revealed');
            
            // Add a mythic interaction marker
            sigilNode.classList.add('sigil-anim--pulse');
        }
    }

    /**
     * Clears the container, wiping all sigils from existence.
     * "The slate is wiped clean; the storm passes."
     */
    clearAll() {
        if (this.container) {
            // Remove all children safely
            while (this.container.firstChild) {
                this.container.removeChild(this.container.firstChild);
            }
        }
        this.activeSigils.clear();
    }
}
