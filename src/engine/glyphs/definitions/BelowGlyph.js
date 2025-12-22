/**
 * BelowGlyph.js
 * * "Falling Stone"
 * * A rune that marks values sinking below the dataset's center.
 * * "Gravity claims what is heavy, pulling it towards the foundation."
 */

export const BelowGlyph = {
    id: "below",
    name: "Falling Stone",
    icon: "🌑",
    cssClass: "fmt-below",
    description: "Marks values sinking below the dataset’s center.",
    category: "distribution",

    compute(gridData, patternMetadata, analyticsMetadata, datasetRules) {
        // New pattern engine structure:
        // patternMetadata.distribution.below = [...]
        const indices =
            analyticsMetadata?.distribution?.below ||
            patternMetadata?.distribution?.below ||
            patternMetadata?.belowMean || // Legacy fallback
            [];

        return {
            indices,
            strength: 1.0,
            category: "distribution"
        };
    }
};
