/**
 * SequenceGlyph.js
 * * "Path of the Hunter"
 * * A rune that traces sequential connections through the data.
 * * "Footsteps in the snow, leading to the quarry."
 */

export const SequenceGlyph = {
    id: "sequence",
    name: "Path of the Hunter",
    icon: "👣",
    cssClass: "fmt-sequence",
    description: "Traces sequential connections through the data.",
    category: "pattern",

    compute(gridData, patternMetadata, datasetRules) {
        if (!patternMetadata.sequences || !Array.isArray(patternMetadata.sequences)) {
            return { indices: [] };
        }

        // Flatten all sequence indices into a single array
        const indices = patternMetadata.sequences.flatMap(s => s.indices);

        return {
            indices: indices,
            strength: 1.2,
            category: "pattern"
        };
    }
};
