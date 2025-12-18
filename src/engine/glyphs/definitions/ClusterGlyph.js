/**
 * ClusterGlyph.js
 * * "Gathering"
 * * A rune that highlights tight groupings of data.
 * * "Stars huddle together against the dark."
 */

export const ClusterGlyph = {
    id: "cluster",
    name: "Gathering",
    icon: "❄",
    cssClass: "fmt-cluster",
    description: "Highlights tight groupings of data.",
    category: "pattern",

    compute(gridData, patternMetadata, datasetRules) {
        if (!patternMetadata.clusters || !Array.isArray(patternMetadata.clusters)) {
            return { indices: [] };
        }

        // Flatten all cluster indices
        const indices = patternMetadata.clusters.flatMap(c => c.indices);

        return {
            indices: indices,
            strength: 1.1,
            category: "pattern"
        };
    }
};
