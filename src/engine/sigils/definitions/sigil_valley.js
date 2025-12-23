/**
 * Sigil: The Valley
 * Detects the minimum value in the dataset.
 */
export const sigil_valley = {
    id: 'sigil_valley',
    name: 'The Valley',
    icon: '🕳️',
    hint: 'Min Value / Smallest number',
    description: 'A depth revealed; the lowest point in the landscape of data.',
    compute(analytics) {
        if (analytics?.sigilSupport?.minValue !== undefined) {
            return {
                active: true,
                strength: 1.0,
                metadata: {
                    value: analytics.sigilSupport.minValue
                }
            };
        }
        return { active: false };
    }
};
