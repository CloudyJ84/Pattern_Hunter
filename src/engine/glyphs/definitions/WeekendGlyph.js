/**
 * WeekendGlyph.js
 * * "Twin Suns"
 * * A temporal rune revealing the resting days (Saturday/Sunday).
 * * "The cycle pauses, allowing time to breathe before the wheel turns again."
 */

export const WeekendGlyph = {
    id: "weekend",
    name: "Twin Suns",
    icon: "☀",
    cssClass: "fmt-weekend",
    description: "Reveals the resting days of the temporal cycle.",
    category: "temporal",

    compute(gridData, patternMetadata, datasetRules) {
        // Guard clause: Only applies to date datasets
        const isDateType =
            datasetRules &&
            (datasetRules.type === 'dates' || datasetRules.id === 'dataset_dates');

        const isDateValue =
            datasetRules &&
            datasetRules.generation &&
            datasetRules.generation.cellValueType === 'date';

        if (!isDateType && !isDateValue) {
            return { indices: [] };
        }

        // New pattern engine structure possibilities:
        // patternMetadata.weekends.indices = [...]
        // patternMetadata.weekend.indices = [...]
        // patternMetadata.temporal.weekends = [...]
        // Legacy: patternMetadata.weekendIndices = [...]

        const indices =
            patternMetadata?.weekends?.indices ||          // NEW schema
            patternMetadata?.weekend?.indices ||           // alt schema
            patternMetadata?.temporal?.weekends ||         // alt schema
            patternMetadata?.weekendIndices ||             // legacy schema
            [];

        return {
            indices,
            strength: 1.0,
            category: "temporal"
        };
    }
};
