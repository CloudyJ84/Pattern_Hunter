/**
 * Sigil: The Constellation
 * Detects clusters or adjacency patterns.
 */
export const sigil_cluster = {
    id: 'sigil_cluster',
    name: 'The Constellation',
    icon: '🧩',
    hint: 'Cluster / Adjacency Pattern',
    description: 'Data points gather together, forming a tight-knit community.',
    compute(analytics) {
        const clusters = analytics?.clusters;
        if (clusters && clusters.length > 0) {
            return {
                active: true,
                strength: Math.min(clusters.length * 0.5, 1.0),
                metadata: {
                    count: clusters.length
                }
            };
        }
        return { active: false };
    }
};
