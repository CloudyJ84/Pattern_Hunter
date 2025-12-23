/**
 * Sigil: The Flow
 * Detects directional trends or long sequences.
 */
export const sigil_trend = {
    id: 'sigil_trend',
    name: 'The Flow',
    icon: '📈',
    hint: 'Trend / Directional Flow',
    description: 'A current runs through the numbers, moving with purpose.',
    compute(analytics) {
        const sequences = analytics?.sequences;
        if (sequences && sequences.length > 0) {
            // Strength proportional to the longest sequence
            const longest = sequences.reduce((max, seq) => Math.max(max, seq.length), 0);
            const strength = Math.min(longest / 5, 1.0); // Assuming 5 is a strong trend length

            return {
                active: true,
                strength: strength,
                metadata: {
                    maxLength: longest
                }
            };
        }
        return { active: false };
    }
};
