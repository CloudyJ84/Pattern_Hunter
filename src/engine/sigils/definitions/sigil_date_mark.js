/**
 * Sigil: The Epoch
 * Identifies date-based patterns.
 */
export const sigil_date_mark = {
    id: 'sigil_date_mark',
    name: 'The Epoch',
    icon: '📅',
    hint: 'Identify the highlighted date',
    description: 'The grid is not merely numbers, but moments in time.',
    compute(analytics) {
        // Heuristic: Check if dateStats logic ran and produced an 'earliest' date
        if (analytics?.dateStats?.earliest) {
            return {
                active: true,
                strength: 1.0,
                metadata: {
                    range: analytics.dateStats.range
                }
            };
        }
        return { active: false };
    }
};
