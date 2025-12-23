/**
 * Sigil: The Solitary
 * Detects a single unique value.
 */
export const sigil_unique = {
    id: 'sigil_unique',
    name: 'The Solitary',
    icon: '⭐',
    hint: 'Unique / One-of-a-kind',
    description: 'A singular entity stands apart, defying the common pattern.',
    compute(analytics) {
        if (analytics?.unique?.indices?.length === 1) {
            return {
                active: true,
                strength: 1.0,
                metadata: {
                    index: analytics.unique.indices[0]
                }
            };
        }
        return { active: false };
    }
};
