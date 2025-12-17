// Pattern Engine — injects patterns and returns metadata for formatting + questions

let rules = null;

export function initPatternEngine(config) {
    rules = config;
}

export function destroyPatternEngine() {
    rules = null;
}

/**
 * Injects a pattern into a dataset and returns:
 * - modified dataset
 * - targetCells (the “correct” cells)
 * - patternType
 * - params (pattern-specific metadata)
 */
export function injectPattern(dataset, datasetType, patternType, thresholdConfig = {}) {
    if (!rules) throw new Error("PatternEngine not initialized");

    const typeRules = rules[datasetType];
    if (!typeRules) throw new Error(`No rules for dataset type: ${datasetType}`);

    const patternRule = typeRules[patternType];
    if (!patternRule) {
        console.warn(`Pattern ${patternType} not found for ${datasetType}. Skipping injection.`);
        return { dataset, targetCells: [], patternType, params: {} };
    }

    const flat = dataset.flat();

    // Determine how many cells to modify
    const count = patternRule.targetCount || 1;
    const targetCells = pickRandomCells(flat, count);

    // Apply pattern logic
    for (const cell of targetCells) {
        applyPatternToCell(cell, datasetType, patternRule, thresholdConfig);
    }

    return {
        dataset,
        targetCells,
        patternType,
        params: patternRule.params || {}
    };
}

/**
 * Highlight logic — returns the cells that match the pattern.
 * This is used by formattingEngine.
 */
export function applyHighlightLogic(dataset, datasetType, patternType) {
    if (!rules) throw new Error("PatternEngine not initialized");

    const typeRules = rules[datasetType];
    if (!typeRules) return [];

    const patternRule = typeRules[patternType];
    if (!patternRule || !patternRule.highlight) return [];

    const flat = dataset.flat();
    return flat.filter(cell => patternRule.highlight(cell.value));
}

/* ------------------------------
   Internal Helpers
--------------------------------*/

function pickRandomCells(flat, count) {
    const shuffled = [...flat].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

function applyPatternToCell(cell, datasetType, patternRule, thresholdConfig) {
    // If rule provides a generator function, use it
    if (typeof patternRule.generateValue === 'function') {
        cell.value = patternRule.generateValue(cell.value, thresholdConfig);
        return;
    }

    // Fallback: static override
    if (patternRule.staticValue !== undefined) {
        cell.value = patternRule.staticValue;
    }
}
