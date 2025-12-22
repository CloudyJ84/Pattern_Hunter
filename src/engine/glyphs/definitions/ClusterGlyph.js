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

    compute(gridData, patternMetadata, analyticsMetadata, datasetRules) {
        // New pattern engine structure:
        // patternMetadata.clusters = [{ indices: [...] }, ...]
        const clusters =
            analyticsMetadata?.clusters ||
            patternMetadata?.clusters ||      // NEW schema
            patternMetadata?.clusterGroups || // possible alt schema
            [];

        if (!Array.isArray(clusters)) {
            return { indices: [] };
        }

        // Flatten all cluster indices safely
        const indices = clusters.flatMap(c => c?.indices || []);

        return {
            indices,
            strength: 1.1,
            category: "pattern"
        };
    }
};
