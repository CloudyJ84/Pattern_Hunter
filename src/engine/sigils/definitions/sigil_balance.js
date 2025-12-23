/**
 * Sigil: The Scales
 * Detects if there is a distribution of values both above and below the mean.
 */
export const sigil_balance = {
    id: 'sigil_balance',
    name: 'The Scales',
    icon: '⚖️',
    hint: 'Above/Below Mean Balance',
    description: 'Opposing forces exist in equilibrium; the high and low coexist.',
    compute(analytics) {
        const above = analytics?.distribution?.above;
        const below = analytics?.distribution?.below;
        
        if (above && above.length > 0 && below && below.length > 0) {
            return {
                active: true,
                strength: 0.8,
                metadata: {
                    aboveCount: above.length,
                    belowCount: below.length
                }
            };
        }
        return { active: false };
    }
};
