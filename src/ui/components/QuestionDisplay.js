/**
 * Configuration for Sigil Mappings
 * Maps internal question types to Mythic Icons and Spreadsheet hints.
 */
const SIGIL_MAP = {
    'MAX_VALUE': { icon: '🗻', hint: 'Max Value / Largest number' },
    'MIN_VALUE': { icon: '🕳️', hint: 'Min Value / Smallest number' },
    'FLOOR': { icon: '🧱', hint: 'FLOOR() / Lowest level' },
    'OUTLIER': { icon: '⚡', hint: 'Outlier / Anomaly' },
    'SEQUENCE': { icon: '🔗', hint: 'Sequence / Range' },
    'UNIQUE': { icon: '⭐', hint: 'Unique / One-of-a-kind' }
};

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

        // 🔮 Mythic UI: Sigil Construction
        const rawType = question.type || '';
        const sigilData = this._getSigilData(rawType);

        // We use .query-sigil as the container for the icon/hint
        const sigilHtml = rawType 
            ? `<div class="query-sigil" data-type="${rawType}" title="Pattern Type">${sigilData.icon}</div>` 
            : '';
            
        // Keep existing hint-sigil as a secondary flavor element if needed (usually hidden by default CSS or unused in this new layout)
        const hintHtml = question.hint 
            ? `<div class="meta-rune hint-sigil" title="Hint: ${question.hint}">? <span class="hint-text">${question.hint}</span></div>` 
            : '';

        const metaSection = (sigilHtml || hintHtml) 
            ? `<div class="rune-metadata">${sigilHtml}${hintHtml}</div>` 
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

    /**
     * Helper to retrieve icon and hint for a given type.
     */
    _getSigilData(type) {
        return SIGIL_MAP[type] || { icon: '🔮', hint: 'Analyze the data pattern' };
    }

    /**
     * Reveals the human-readable spreadsheet hint for the current sigil.
     * Transforms the cryptic icon into an actionable text clue.
     */
    revealSigilHint() {
        const sigilEl = this.container.querySelector('.query-sigil');
        
        if (sigilEl) {
            const type = sigilEl.getAttribute('data-type');
            const sigilData = this._getSigilData(type);

            if (sigilData && sigilData.hint) {
                // Apply visual transformation
                sigilEl.style.transform = 'scale(0.8)';
                sigilEl.style.opacity = '0';
                
                setTimeout(() => {
                    sigilEl.textContent = sigilData.hint;
                    sigilEl.classList.add('sigil-revealed');
                    sigilEl.style.opacity = '1';
                    sigilEl.style.transform = 'scale(1)';
                }, 250); 
            }
        }
    }

    destroy() {
        this.container.innerHTML = '';
        this.element = null;
        this.onSubmit = null;
    }
}
