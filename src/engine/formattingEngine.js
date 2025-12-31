// Responsible for mapping pattern types to visual styles

/**
 * Applies formatting rules to a dataset and returns unified formatting result.
 * aligned with Mythic-First architecture.
 */
export function applyFormatting(
    grid,
    datasetType,
    patternType,
    thresholdConfig = {},
    patternMeta = {}
) {
    // 1. Extract Metadata
    const activeGlyphs = patternMeta?.glyphs?.activate || [];
    const lensSummaries = patternMeta?.lens?.summaries || [];
    const uiContext = patternMeta?.uiContext || {};
    
    // 2. Identify Matches
    // In Mythic architecture, patternEngine has already computed matches.
    // We expect them in patternMeta.matches.
    const allMatches = patternMeta?.matches || [];

    // 3. Apply Highlight Logic (Threshold/Hinting)
    const hintLevel = thresholdConfig.hintLevel || "medium";
    const highlightColumn = uiContext.highlightColumn === true;
    const minTargetCells = uiContext.targetCellsCount || 1;

    let highlightedCells = [];

    if (hintLevel === "none") {
        // Mythic: no hints
        highlightedCells = [];
    } else if (hintLevel === "low") {
        // Tracker: usually one hint, but respect metadata context
        if (highlightColumn) {
            // Column highlights are treated as a single visual unit; show all cells in the match
            highlightedCells = [...allMatches];
        } else if (minTargetCells > 1) {
            // If the pattern targets a specific count (e.g. "top 3"), ensure they are visible
            highlightedCells = allMatches.slice(0, minTargetCells);
        } else {
            // Default Tracker behavior: single hint
            highlightedCells = allMatches.slice(0, 1);
        }
    } else {
        // Scout / Hunter: full hints
        highlightedCells = [...allMatches];
    }

    // 4. Unified Return
    return {
        grid,                    // The formatted grid
        highlightedCells,        // Array of { row, col }
        activeGlyphs,            // From patternMeta
        lensSummaries,           // From patternMeta
        uiContext                // Passed through
    };
}

export function getCssClassForRule(formattingRule) {
    switch (formattingRule) {
        case "highlightWeekends":
            return "fmt-weekend";

        case "highlightSpecificWeekday":
            return "fmt-weekday";

        case "highlightEarliestOrLatest":
            return "fmt-extreme";

        case "highlightDateRange":
            return "fmt-range";

        case "highlightAboveThreshold":
            return "fmt-above";

        case "highlightBelowThreshold":
            return "fmt-below";

        case "highlightOutlier":
            return "fmt-outlier";

        case "highlightCluster":
            return "fmt-cluster";

        case "highlightMaxOrMin":
            return "fmt-extreme";

        case "highlightMostFrequent":
            return "fmt-frequency";

        case "highlightUnique":
            return "fmt-unique";

        case "highlightRowOrColumnPattern":
            return "fmt-rowcol";

        case "highlightEarlyLate":
            return "fmt-earlylate";

        case "highlightAmPm":
            return "fmt-ampm";

        case "highlightTimeRange":
            return "fmt-timerange";

        default:
            return "fmt-default";
    }
}
