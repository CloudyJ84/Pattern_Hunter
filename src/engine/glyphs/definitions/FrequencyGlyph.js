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
        // New pattern engine structure:
        // patternMetadata.frequency.repeated = [...]
        // patternMetadata.frequency.indices = [...]
        // patternMetadata.frequency.repeatedIndices = [...] (legacy)

        const indices =
            patternMetadata?.frequency?.repeated ||          // NEW schema
            patternMetadata?.frequency?.indices ||           // alt schema
            patternMetadata?.frequency?.repeatedIndices ||   // legacy schema
            [];

        return {
            indices,
            strength: 1.0,
            category: "frequency"
        };
    }
};
