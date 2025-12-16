// Responsible for mapping pattern types to visual styles

import { applyHighlightLogic } from './patternEngine.js';

let rules = null;

export function initFormattingEngine(patternEngineConfig) {
    rules = patternEngineConfig;
}

export function applyFormatting(dataset, datasetType, patternType) {
    if (!rules) throw new Error("FormattingEngine not initialized");

    const patternConfig = rules[datasetType][patternType];
    
    // Fallback if config missing
    if (!patternConfig) {
        return {
            formattingRule: "none",
            cssClass: "fmt-default",
            highlightedCells: []
        };
    }

    const formattingRule = patternConfig.formattingRule;
    
    // 1. Determine which cells match the logic
    const highlightedCells = applyHighlightLogic(dataset, datasetType, patternType);

    // 2. Get the CSS class string
    const cssClass = getCssClassForRule(formattingRule);

    return {
        formattingRule: formattingRule,
        cssClass: cssClass,
        highlightedCells: highlightedCells
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