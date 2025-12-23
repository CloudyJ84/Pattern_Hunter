/**
 * Sigil: The Mirror
 * Detects symmetry in the distribution of values.
 */
export const sigil_symmetry = {
    id: 'sigil_symmetry',
    name: 'The Mirror',
    icon: '🔷',
    hint: 'Symmetry / Mirrored Values',
    description: 'One side reflects the other; a perfect balance of form.',
    compute(analytics) {
        const above = analytics?.distribution?.above || [];
        const below = analytics?.distribution?.below || [];
        
        // Heuristic: Active if we have data and the counts are roughly equal (within 1)
        const hasData = above.length > 0 || below.length > 0;
        const isSymmetric = Math.abs(above.length - below.length) <= 1;

        if (hasData && isSymmetric) {
            return {
                active: true,
                strength: 0.9,
                metadata: {
                    diff: Math.abs(above.length - below.length)
                }
            };
        }
        return { active: false };
    }
};
