/**
 * AboveGlyph.js
 * * "Rising Flame"
 * * A rune that marks values ascending above the dataset's center.
 * * "The heat rises, separating the ethereal from the mundane."
 */

export const AboveGlyph = {
    id: "above",
    name: "Rising Flame",
    icon: "🔥",
    cssClass: "fmt-above",
    description: "Marks values rising above the dataset’s center.",
    category: "distribution",

    compute(gridData, patternMetadata, analyticsMetadata, datasetRules) {
        // New pattern engine structure:
        // patternMetadata.distribution.above = [...]
        const indices =
            analyticsMetadata?.distribution?.above ||
            patternMetadata?.distribution?.above ||
            patternMetadata?.aboveMean || // fallback for older levels
            [];

        return {
            indices,
            strength: 1.0,
            category: "distribution"
        };
    }
};
