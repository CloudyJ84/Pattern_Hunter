/**
 * Sigil: The Respite
 * Detects weekend days in date datasets.
 */
export const sigil_weekend = {
    id: 'sigil_weekend',
    name: 'The Respite',
    icon: '🛌',
    hint: 'Weekend / Days of rest',
    description: 'Time pauses for breath; days of rest emerge from the calendar.',
    compute(analytics) {
        const weekends = analytics?.weekends?.indices;
        if (weekends && weekends.length > 0) {
            return {
                active: true,
                strength: 1.0,
                metadata: {
                    indices: weekends
                }
            };
        }
        return { active: false };
    }
};
