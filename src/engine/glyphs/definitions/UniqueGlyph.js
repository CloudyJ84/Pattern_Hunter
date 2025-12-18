/**
 * UniqueGlyph.js
 * * "Lone Star"
 * * A rune that identifies singular values standing alone in the dataset.
 * * "In a field of grass, the single flower demands the eye."
 */

export const UniqueGlyph = {
    id: "unique",
    name: "Lone Star",
    icon: "★",
    cssClass: "fmt-unique",
    description: "Marks values that stand alone in the dataset.",
    category: "uniqueness",

    compute(gridData, patternMetadata, datasetRules) {
        // New pattern engine structure possibilities:
        // patternMetadata.unique.indices = [...]
        // patternMetadata.uniques.indices = [...]
        // patternMetadata.frequency.unique = [...]
        // Legacy: patternMetadata.frequency.uniqueIndices = [...]

        const indices =
            patternMetadata?.unique?.indices ||             // NEW schema
            patternMetadata?.uniques?.indices ||            // alt schema
            patternMetadata?.frequency?.unique ||           // alt schema
            patternMetadata?.frequency?.uniqueIndices ||    // legacy schema
            [];

        return {
            indices,
            strength: 1.5,
            category: "uniqueness"
        };
    }
};
