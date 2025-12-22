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
 * - highlightedCells (modified by threshold tier and pattern metadata)
 * - lensType
 * - lensSummaries
 * - glyphs
 * - sigilType
 */
export function applyFormatting(dataset, datasetType, patternType, thresholdConfig = {}, patternMeta = null) {
    if (!rules) {
        throw new Error("FormattingEngine not initialized");
    }

    const patternConfig = rules[datasetType]?.[patternType];

    // Extract metadata with safe defaults for UI consumption
    const lensType = patternMeta?.lens?.type || "none";
    const lensSummaries = patternMeta?.lens?.summaries || [];
    const glyphs = patternMeta?.glyphs?.activate || [];
    const sigilType = patternMeta?.sigil?.type || "FALLBACK";
    const uiContext = patternMeta?.uiContext || {};

    // Fallback if config missing, ensuring UI still receives valid metadata
    if (!patternConfig) {
        return {
            formattingRule: "none",
            cssClass: "fmt-default",
            highlightedCells: [],
            lensType,
            lensSummaries,
            glyphs,
            sigilType
        };
    }

    const formattingRule = patternConfig.formattingRule;

    // 1. Determine all matching cells
    const allMatches = applyHighlightLogic(dataset, datasetType, patternType);

    // 2. Apply threshold-tier hint logic with metadata overrides
    const hintLevel = thresholdConfig.hintLevel || "medium";
    let highlightedCells = [];

    // Metadata context overrides to prevent hint logic from breaking specific patterns
    const highlightColumn = uiContext.highlightColumn === true;
    const minTargetCells = uiContext.targetCellsCount || 1;

    if (hintLevel === "none") {
        // Mythic: no hints
        highlightedCells = [];
    } else if (hintLevel === "low") {
        // Tracker: usually one hint, but respect metadata context
        if (highlightColumn) {
            // Column highlights are treated as a single visual unit; show all cells in the match
            highlightedCells = allMatches;
        } else if (minTargetCells > 1) {
            // If the pattern targets a specific count (e.g. "top 3"), ensure they are visible
            highlightedCells = allMatches.slice(0, minTargetCells);
        } else {
            // Default Tracker behavior: single hint
            highlightedCells = allMatches.slice(0, 1);
        }
    } else {
        // Scout / Hunter: full hints
        highlightedCells = allMatches;
    }

    // 3. Map formatting rule to CSS class
    const cssClass = getCssClassForRule(formattingRule);

    return {
        formattingRule,
        cssClass,
        highlightedCells,
        lensType,
        lensSummaries,
        glyphs,
        sigilType
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
