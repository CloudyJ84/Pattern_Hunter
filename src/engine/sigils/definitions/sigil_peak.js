/**
 * Sigil: The Peak
 * Detects the maximum value in the dataset.
 */
export const sigil_peak = {
    id: 'sigil_peak',
    name: 'The Peak',
    icon: '🗻',
    hint: 'Max Value / Largest number',
    description: 'A single value towers above the rest, marking the summit of the dataset.',
    compute(analytics) {
        if (analytics?.sigilSupport?.maxValue !== undefined) {
            return {
                active: true,
                strength: 1.0,
                metadata: {
                    value: analytics.sigilSupport.maxValue
                }
            };
        }
        return { active: false };
    }
};
