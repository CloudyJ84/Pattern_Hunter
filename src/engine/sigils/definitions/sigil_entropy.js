/**
 * Sigil: The Storm
 * Detects high variance or chaos (Standard Deviation).
 */
export const sigil_entropy = {
    id: 'sigil_entropy',
    name: 'The Storm',
    icon: '🌪️',
    hint: 'Variance / Chaos',
    description: 'Turbulence disrupts the order; the values scatter wildly.',
    compute(analytics) {
        const stdDev = analytics?.lens?.stats?.std;
        
        // Heuristic: Arbitrary threshold for "high" variance. 
        // Assuming normalized data or general scale, > 15 might be "chaotic" for some datasets,
        // but without scale context, we check if it exists and is non-zero.
        // A robust heuristic would need context, but for now we check existence.
        if (typeof stdDev === 'number' && stdDev > 10) {
            return {
                active: true,
                strength: Math.min(stdDev / 50, 1.0),
                metadata: {
                    stdDev: stdDev
                }
            };
        }
        return { active: false };
    }
};
