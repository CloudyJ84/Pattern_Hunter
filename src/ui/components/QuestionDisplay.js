/**
 * Configuration for Sigil Mappings
 * Maps internal question types to Mythic labels and Spreadsheet hints.
 */
const SIGIL_MAP = {
    'MAX_VALUE': { label: 'Sigil: Peak Detection', hint: 'Hint: Find the highest value (MAX)' },
    'MIN_VALUE': { label: 'Sigil: Depth Trace', hint: 'Hint: Look for the smallest value (MIN)' },
    'FLOOR': { label: 'Sigil: Foundation Map', hint: 'Hint: Identify the lowest floor (FLOOR)' },
    'OUTLIER': { label: 'Sigil: Anomaly Trace', hint: 'Hint: Spot the outlier (OUTLIER)' },
    'SEQUENCE': { label: 'Sigil: Pattern Align', hint: 'Hint: Trace the sequence (e.g., A1:A5)' },
    'UNIQUE': { label: 'Sigil: Lone Signal', hint: 'Hint: Find the unique value' }
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

        // 🔮 Mythic UI: Resolve Sigil Metadata
        // Determine the label based on type, defaulting to a generic sigil if undefined
        const rawType = question.type || '';
        const sigilData = SIGIL_MAP[rawType] || { label: `Sigil: ${rawType}`, hint: 'Hint: Analyze the data pattern' };

        // 🔮 Mythic UI: Sigil Construction
        // We use .query-sigil as the target for the hint system
        const typeHtml = rawType 
            ? `<span class="meta-rune query-sigil" data-type="${rawType}" title="Pattern Type">${sigilData.label}</span>` 
            : '';
            
        // Keep existing hint-sigil as a secondary fallback or flavor element if needed
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

    /**
     * Reveals the human-readable spreadsheet hint for the current sigil.
     * Transforms the cryptic label into an actionable clue.
     */
    revealSigilHint() {
        const sigilEl = this.container.querySelector('.query-sigil');
        
        if (sigilEl) {
            const type = sigilEl.getAttribute('data-type');
            const sigilData = SIGIL_MAP[type];

            if (sigilData && sigilData.hint) {
                // Apply visual transformation
                sigilEl.style.opacity = '0';
                
                setTimeout(() => {
                    sigilEl.textContent = sigilData.hint;
                    sigilEl.classList.add('sigil-revealed');
                    sigilEl.style.opacity = '1';
                }, 200); // Short delay for fade effect
            }
        }
    }

    destroy() {
        // Lifecycle consistency with other components
        this.container.innerHTML = '';
        this.element = null;
        this.onSubmit = null;
    }
}
