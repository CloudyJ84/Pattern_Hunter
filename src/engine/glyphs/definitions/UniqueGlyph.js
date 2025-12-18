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
        // Safe access to unique indices
        const indices = patternMetadata.frequency && patternMetadata.frequency.uniqueIndices 
            ? patternMetadata.frequency.uniqueIndices 
            : [];

        return {
            indices: indices,
            strength: 1.5, // Slightly higher emphasis for uniqueness
            category: "uniqueness"
        };
    }
};
