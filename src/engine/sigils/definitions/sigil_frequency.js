/**
 * Sigil: The Echo
 * Detects repeated values or frequencies.
 */
export const sigil_frequency = {
    id: 'sigil_frequency',
    name: 'The Echo',
    icon: '🔁',
    hint: 'Frequency / Repetition',
    description: 'Voices in the data repeat themselves, forming a rhythmic chant.',
    compute(analytics) {
        const repeated = analytics?.frequency?.repeated;
        if (repeated && repeated.length > 0) {
            // Strength based on how many items are repeated (capped at 1.0)
            const strength = Math.min(repeated.length * 0.2, 1.0);
            return {
                active: true,
                strength: strength,
                metadata: {
                    count: repeated.length
                }
            };
        }
        return { active: false };
    }
};
