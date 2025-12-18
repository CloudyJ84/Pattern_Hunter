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

    /**
     * Reads the outlier indices from the pattern metadata.
     */
    compute(gridData, patternMetadata, datasetRules) {
        return {
            indices: patternMetadata.outliers || [],
            strength: 1.0,
            category: "anomaly"
        };
    }
};
