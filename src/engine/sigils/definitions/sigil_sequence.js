/**
 * Sigil: The Chain
 * Detects sequential runs of numbers.
 */
export const sigil_sequence = {
    id: 'sigil_sequence',
    name: 'The Chain',
    icon: '🔗',
    hint: 'Sequence / Range',
    description: 'Order emerges from chaos as values link together in succession.',
    compute(analytics) {
        const sequences = analytics?.sequences;
        if (sequences && sequences.length > 0) {
            // Find longest sequence for metadata
            const longest = sequences.reduce((prev, current) => 
                (prev.length > current.length) ? prev : current
            , []);

            return {
                active: true,
                strength: Math.min(longest.length * 0.3, 1.0),
                metadata: {
                    longestLength: longest.length,
                    count: sequences.length
                }
            };
        }
        return { active: false };
    }
};
