/**
 * Sigil: The Spark
 * Detects statistical outliers.
 */
export const sigil_outlier = {
    id: 'sigil_outlier',
    name: 'The Spark',
    icon: '⚡',
    hint: 'Outlier / Anomaly',
    description: 'A rogue element breaks the established norm, demanding attention.',
    compute(analytics) {
        const outlierIndices = analytics?.outliers?.indices;
        if (outlierIndices && outlierIndices.length > 0) {
            return {
                active: true,
                strength: 1.0,
                metadata: {
                    indices: outlierIndices
                }
            };
        }
        return { active: false };
    }
};
