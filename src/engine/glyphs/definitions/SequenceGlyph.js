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
        // New pattern engine structure possibilities:
        // patternMetadata.sequences = [{ indices: [...] }, ...]
        // patternMetadata.sequence = [{ indices: [...] }, ...]
        // patternMetadata.paths = [{ indices: [...] }, ...]
        // Legacy: patternMetadata.sequences = [...]

        const sequences =
            patternMetadata?.sequences ||      // NEW or legacy
            patternMetadata?.sequence ||       // alt schema
            patternMetadata?.paths ||          // alt schema
            [];

        if (!Array.isArray(sequences)) {
            return { indices: [] };
        }

        // Flatten all sequence indices safely
        const indices = sequences.flatMap(s => s?.indices || []);

        return {
            indices,
            strength: 1.2,
            category: "pattern"
        };
    }
};
