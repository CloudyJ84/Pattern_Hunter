/**
 * FrequencyGlyph.js
 * * "Echo"
 * * A rune that highlights values repeating across the grid.
 * * "A whisper spoken once is silence; spoken thrice, it becomes a chant."
 */

export const FrequencyGlyph = {
    id: "frequency",
    name: "Echo",
    icon: "〰",
    cssClass: "fmt-frequency",
    description: "Highlights values that repeat across the grid.",
    category: "frequency",

    compute(gridData, patternMetadata, datasetRules) {
        // Safe access to frequency metadata
        const indices = patternMetadata.frequency && patternMetadata.frequency.repeatedIndices 
            ? patternMetadata.frequency.repeatedIndices 
            : [];

        return {
            indices: indices,
            strength: 1.0,
            category: "frequency"
        };
    }
};
