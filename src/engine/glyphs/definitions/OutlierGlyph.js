/**
 * OutlierGlyph.js
 * * "Broken Pattern"
 * * A rune that exposes data defying the established norm.
 * * "When the choir sings in unison, the discordant note rings loudest."
 */

export const OutlierGlyph = {
    id: "outlier",
    name: "Broken Pattern",
    icon: "⚡",
    cssClass: "fmt-outlier",
    description: "Highlights values that defy the expected structure.",
    category: "anomaly",

    compute(gridData, patternMetadata, datasetRules) {
        // New pattern engine structure:
        // patternMetadata.outliers.indices = [...]
        // patternMetadata.anomaly.indices = [...]
        // patternMetadata.outlier.indices = [...]
        // Legacy: patternMetadata.outliers = [...]

        const indices =
            patternMetadata?.outliers?.indices ||   // NEW schema
            patternMetadata?.anomaly?.indices ||    // alt schema
            patternMetadata?.outlier?.indices ||    // alt schema
            patternMetadata?.outliers ||            // legacy schema
            [];

        return {
            indices,
            strength: 1.0,
            category: "anomaly"
        };
    }
};
