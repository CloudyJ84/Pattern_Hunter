// Responsible for mapping pattern types to visual styles

import { applyHighlightLogic } from './patternEngine.js';

let rules = null;

export function initFormattingEngine(patternEngineConfig) {
    rules = patternEngineConfig;
}

export function destroyFormattingEngine() {
    rules = null;
}

/**
 * Applies formatting rules to a dataset and returns:
 * - formattingRule
 * - cssClass
 * - highlightedCells (modified by threshold tier)
 */
export function applyFormatting(dataset, datasetType, patternType, thresholdConfig = {}) {
    if (!rules) {
        throw new Error("FormattingEngine not initialized");
    }

    const patternConfig = rules[datasetType]?.[patternType];

    // Fallback if config missing
    if (!patternConfig) {
        return {
            formattingRule: "none",
            cssClass: "fmt-default",
            highlightedCells: []
        };
    }

    const formattingRule = patternConfig.formattingRule;

    // 1. Determine all matching cells
    const allMatches = applyHighlightLogic(dataset, datasetType, patternType);

    // 2. Apply threshold-tier hint logic
    const hintLevel = thresholdConfig.hintLevel || "medium";
    let highlightedCells = [];

    if (hintLevel === "none") {
        // Mythic: no hints
        highlightedCells = [];
    } else if (hintLevel === "low") {
        // Tracker: only one hint
        highlightedCells = allMatches.slice(0, 1);
    } else {
        // Scout / Hunter: full hints
        highlightedCells = allMatches;
    }

    // 3. Map formatting rule to CSS class
    const cssClass = getCssClassForRule(formattingRule);

    return {
        formattingRule,
        cssClass,
        highlightedCells
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
