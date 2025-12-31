/**
 * patternEngine.js
 * A semantic, metadata-driven engine that constructs meaningful data patterns
 * for the Pattern Hunter "Trial of the Field".
 * * UPDATED: Uses patternEngine.json as the single source of truth for metadata.
 * Pattern logic is now injected based on Mythic IDs.
 */

// --- Canonical Metadata Source (patternEngine.json) ---
const PATTERN_DEFINITIONS = {
  "numbers": {
    "rising_flame": {
      "id": "rising_flame",
      "label": "Rising Flame",
      "difficulty": 1,
      "category": "threshold",
      "requires": { "datasetType": "numbers", "minRows": 5 },
      "semantics": {
        "structure": "elevation", "location": "scattered", "visibility": "highlighted_values",
        "playerGoal": "identify values ascending above the mean",
        "questionFocus": ["countAboveThreshold", "whichValueIsHighlighted"]
      },
      "contextRequirements": { "requiresHighlightedCells": true },
      "context": { "glyphsToActivate": ["above"], "lensSummaries": ["stats"], "highlightColumn": false },
      "questionHints": { "preferredQuestionTypes": ["countAboveThreshold"], "avoidQuestionTypes": ["countBelowThreshold", "whichValueIsLowest"] },
      "scoring": { "basePoints": 100, "difficultyMultiplier": 1.0, "bonusConditions": ["noHints"] }
    },
    "falling_stone": {
      "id": "falling_stone",
      "label": "Falling Stone",
      "difficulty": 1,
      "category": "threshold",
      "requires": { "datasetType": "numbers", "minRows": 5 },
      "semantics": {
        "structure": "depression", "location": "scattered", "visibility": "highlighted_values",
        "playerGoal": "identify values sinking below the mean",
        "questionFocus": ["countBelowThreshold", "whichValueIsHighlighted"]
      },
      "contextRequirements": { "requiresHighlightedCells": true },
      "context": { "glyphsToActivate": ["below"], "lensSummaries": ["stats"], "highlightColumn": false },
      "questionHints": { "preferredQuestionTypes": ["countBelowThreshold"], "avoidQuestionTypes": ["countAboveThreshold", "whichValueIsHighest"] },
      "scoring": { "basePoints": 100, "difficultyMultiplier": 1.0, "bonusConditions": ["noHints"] }
    },
    "broken_pattern": {
      "id": "broken_pattern",
      "label": "Broken Pattern",
      "difficulty": 2,
      "category": "outlier",
      "requires": { "datasetType": "numbers", "minRows": 5 },
      "semantics": {
        "structure": "deviation", "location": "single_point", "visibility": "highlighted_value",
        "playerGoal": "find the statistical anomaly",
        "questionFocus": ["whichValueIsOutlier", "rowWithOutlier"]
      },
      "contextRequirements": { "requiresHighlightedCells": true },
      "context": { "glyphsToActivate": ["outlier"], "lensSummaries": ["stats"], "highlightColumn": false },
      "questionHints": { "preferredQuestionTypes": ["whichValueIsOutlier", "whichValueIsHighest", "whichValueIsLowest"], "avoidQuestionTypes": ["whichClusterIsLargest"] },
      "scoring": { "basePoints": 150, "difficultyMultiplier": 1.5, "bonusConditions": ["firstTry"] }
    },
    "convergence": {
      "id": "convergence",
      "label": "Convergence",
      "difficulty": 2,
      "category": "cluster",
      "requires": { "datasetType": "numbers", "minRows": 10 },
      "semantics": {
        "structure": "grouping", "location": "value_band", "visibility": "highlighted_cluster",
        "playerGoal": "identify the dense grouping of values",
        "questionFocus": ["howManyInCluster", "whichClusterIsLargest"]
      },
      "contextRequirements": { "requiresHighlightedCells": true, "requiresRange": true },
      "context": { "glyphsToActivate": ["cluster"], "lensSummaries": ["stats"], "highlightRange": true },
      "questionHints": { "preferredQuestionTypes": ["whichValueIsHighlighted"], "avoidQuestionTypes": ["whichValueIsOutlier"] },
      "scoring": { "basePoints": 120, "difficultyMultiplier": 1.2 }
    },
    "peak_valley": {
      "id": "peak_valley",
      "label": "Peak and Valley",
      "difficulty": 1,
      "category": "extremes",
      "requires": { "datasetType": "numbers" },
      "semantics": {
        "structure": "boundary", "location": "extremities", "visibility": "highlighted_min_max",
        "playerGoal": "find the absolute limits of the dataset",
        "questionFocus": ["whichValueIsLowest", "whichValueIsHighest"]
      },
      "contextRequirements": { "requiresHighlightedCells": true },
      "context": { "glyphsToActivate": ["unique"], "lensSummaries": ["stats"], "highlightColumn": false },
      "questionHints": { "preferredQuestionTypes": ["whichValueIsLowest", "whichValueIsHighest"], "avoidQuestionTypes": ["whichClusterIsLargest"] },
      "scoring": { "basePoints": 80, "difficultyMultiplier": 1.0 }
    }
  },
  "dates": {
    "twin_suns": {
      "id": "twin_suns",
      "label": "Twin Suns",
      "difficulty": 2,
      "category": "weekend",
      "requires": { "datasetType": "dates", "minRows": 7 },
      "semantics": {
        "structure": "recurrence", "location": "scattered", "visibility": "highlighted_weekends",
        "playerGoal": "identify the days of rest",
        "questionFocus": ["countWeekendDates", "whichDateIsHighlighted"]
      },
      "contextRequirements": { "requiresHighlightedCells": true },
      "context": { "glyphsToActivate": ["weekend"], "lensSummaries": ["frequencySummary"], "highlightColumn": false },
      "questionHints": { "preferredQuestionTypes": ["countWeekendDates"], "avoidQuestionTypes": ["whichDateIsEarliest", "whichDateIsLatest"] },
      "scoring": { "basePoints": 110, "difficultyMultiplier": 1.2 }
    },
    "day_alignment": {
      "id": "day_alignment",
      "label": "Day Alignment",
      "difficulty": 2,
      "category": "frequency",
      "requires": { "datasetType": "dates", "minRows": 7 },
      "semantics": {
        "structure": "repetition", "location": "scattered", "visibility": "highlighted_weekday",
        "playerGoal": "spot the repeating day of the week",
        "questionFocus": ["mostFrequentWeekday", "countWeekendDates"]
      },
      "contextRequirements": { "requiresHighlightedCells": true },
      "context": { "glyphsToActivate": ["frequency"], "lensSummaries": ["frequencySummary"], "highlightColumn": false },
      "questionHints": { "preferredQuestionTypes": ["mostFrequentWeekday"], "avoidQuestionTypes": ["whichCategoryIsUnique"] },
      "scoring": { "basePoints": 120, "difficultyMultiplier": 1.3 }
    },
    "time_anchor": {
      "id": "time_anchor",
      "label": "Time Anchor",
      "difficulty": 1,
      "category": "extremes",
      "requires": { "datasetType": "dates" },
      "semantics": {
        "structure": "boundary", "location": "extremities", "visibility": "highlighted_earliest_latest",
        "playerGoal": "find the beginning or the end",
        "questionFocus": ["rowWithEarliestDate", "whichDateIsLatest"]
      },
      "contextRequirements": { "requiresHighlightedCells": true },
      "context": { "glyphsToActivate": ["unique"], "lensSummaries": ["stats"], "highlightColumn": false },
      "questionHints": { "preferredQuestionTypes": ["rowWithEarliestDate"], "avoidQuestionTypes": ["countWeekendDates"] },
      "scoring": { "basePoints": 90, "difficultyMultiplier": 1.0 }
    },
    "temporal_rift": {
      "id": "temporal_rift",
      "label": "Temporal Rift",
      "difficulty": 2,
      "category": "range",
      "requires": { "datasetType": "dates", "minRows": 10 },
      "semantics": {
        "structure": "continuity", "location": "range", "visibility": "highlighted_range",
        "playerGoal": "identify a continuous block of time",
        "questionFocus": ["whichDatesInRange", "howManyInRange"]
      },
      "contextRequirements": { "requiresHighlightedCells": true, "requiresRange": true },
      "context": { "glyphsToActivate": ["frequency"], "lensSummaries": ["stats"], "highlightRange": true },
      "questionHints": { "preferredQuestionTypes": ["whichDateIsHighlighted"], "avoidQuestionTypes": ["whichValueIsOutlier"] },
      "scoring": { "basePoints": 130, "difficultyMultiplier": 1.4 }
    }
  },
  "times": {
    "dawn_dusk": {
      "id": "dawn_dusk",
      "label": "Dawn and Dusk",
      "difficulty": 1,
      "category": "threshold",
      "requires": { "datasetType": "times" },
      "semantics": {
        "structure": "boundary_exclusion", "location": "scattered", "visibility": "highlighted_extremes",
        "playerGoal": "identify times outside standard business hours",
        "questionFocus": ["countEarlyOrLate", "whichTimeIsHighlighted"]
      },
      "contextRequirements": { "requiresHighlightedCells": true },
      "context": { "glyphsToActivate": ["outlier"], "lensSummaries": ["stats"], "highlightColumn": false },
      "questionHints": { "preferredQuestionTypes": ["whichTimeIsHighlighted"], "avoidQuestionTypes": ["mostFrequentWeekday"] },
      "scoring": { "basePoints": 100, "difficultyMultiplier": 1.1 }
    },
    "meridian_shift": {
      "id": "meridian_shift",
      "label": "Meridian Shift",
      "difficulty": 1,
      "category": "binary",
      "requires": { "datasetType": "times" },
      "semantics": {
        "structure": "division", "location": "scattered", "visibility": "highlighted_pm",
        "playerGoal": "distinguish post-meridian times",
        "questionFocus": ["howManyPmTimes", "whichTimeIsPm"]
      },
      "contextRequirements": { "requiresHighlightedCells": true },
      "context": { "glyphsToActivate": ["above"], "lensSummaries": ["categoryCounts"], "highlightColumn": false },
      "questionHints": { "preferredQuestionTypes": ["howManyPmTimes"], "avoidQuestionTypes": ["whichCategoryIsUnique"] },
      "scoring": { "basePoints": 90, "difficultyMultiplier": 1.0 }
    },
    "chrono_limit": {
      "id": "chrono_limit",
      "label": "Chronological Limit",
      "difficulty": 1,
      "category": "extremes",
      "requires": { "datasetType": "times" },
      "semantics": {
        "structure": "boundary", "location": "extremities", "visibility": "highlighted_min_max",
        "playerGoal": "find the earliest or latest timestamp",
        "questionFocus": ["whichTimeIsEarliest", "whichTimeIsLatest"]
      },
      "contextRequirements": { "requiresHighlightedCells": true },
      "context": { "glyphsToActivate": ["unique"], "lensSummaries": ["stats"], "highlightColumn": false },
      "questionHints": { "preferredQuestionTypes": ["whichTimeIsEarliest"], "avoidQuestionTypes": ["mostFrequentWeekday"] },
      "scoring": { "basePoints": 80, "difficultyMultiplier": 1.0 }
    },
    "hour_glass": {
      "id": "hour_glass",
      "label": "Hourglass",
      "difficulty": 2,
      "category": "range",
      "requires": { "datasetType": "times" },
      "semantics": {
        "structure": "concentration", "location": "range", "visibility": "highlighted_window",
        "playerGoal": "identify times within a specific window",
        "questionFocus": ["howManyInTimeRange", "whichTimesInRange"]
      },
      "contextRequirements": { "requiresHighlightedCells": true, "requiresRange": true },
      "context": { "glyphsToActivate": ["frequency"], "lensSummaries": ["stats"], "highlightRange": true },
      "questionHints": { "preferredQuestionTypes": ["howManyInTimeRange"], "avoidQuestionTypes": ["whichValueIsOutlier"] },
      "scoring": { "basePoints": 120, "difficultyMultiplier": 1.2 }
    }
  },
  "categories": {
    "echo": {
      "id": "echo",
      "label": "Echo of the Archive",
      "difficulty": 2,
      "category": "frequency",
      "requires": { "datasetType": "categories", "minRows": 5 },
      "semantics": {
        "structure": "repetition", "location": "scattered", "visibility": "highlighted_frequency",
        "playerGoal": "identify the most frequent category",
        "questionFocus": ["howManyTimesCategoryAppears", "whichCategoryIsMostFrequent"]
      },
      "contextRequirements": { "requiresHighlightedCells": true },
      "context": { "glyphsToActivate": ["frequency"], "lensSummaries": ["frequencySummary"], "highlightColumn": false },
      "questionHints": { "preferredQuestionTypes": ["howManyTimesCategoryAppears"], "avoidQuestionTypes": ["whichCategoryIsUnique"] },
      "scoring": { "basePoints": 100, "difficultyMultiplier": 1.1 }
    },
    "silent_note": {
      "id": "silent_note",
      "label": "The Silent Note",
      "difficulty": 3,
      "category": "unique",
      "requires": { "datasetType": "categories", "minRows": 5 },
      "semantics": {
        "structure": "isolation", "location": "single_point", "visibility": "highlighted_unique",
        "playerGoal": "find the category that appears exactly once",
        "questionFocus": ["whichCategoryIsUnique", "rowWithUniqueCategory"]
      },
      "contextRequirements": { "requiresHighlightedCells": true },
      "context": { "glyphsToActivate": ["unique"], "lensSummaries": ["categoryCounts"], "highlightColumn": false },
      "questionHints": { "preferredQuestionTypes": ["whichCategoryIsUnique"], "avoidQuestionTypes": ["howManyTimesCategoryAppears", "whichCategoryIsMostFrequent"] },
      "scoring": { "basePoints": 150, "difficultyMultiplier": 1.4 }
    },
    "lone_star": {
      "id": "lone_star",
      "label": "The Lone Star",
      "difficulty": 3,
      "category": "unique",
      "requires": { "datasetType": "categories", "minRows": 5 },
      "semantics": {
        "structure": "singularity", "location": "single_point", "visibility": "highlighted_unique",
        "playerGoal": "identify the anomaly in the pattern",
        "questionFocus": ["whichCategoryIsUnique", "howManyUniqueCategories"]
      },
      "contextRequirements": { "requiresHighlightedCells": true },
      "context": { "glyphsToActivate": ["unique"], "lensSummaries": ["categoryCounts"], "highlightColumn": false },
      "questionHints": { "preferredQuestionTypes": ["whichCategoryIsUnique"], "avoidQuestionTypes": ["howManyTimesCategoryAppears"] },
      "scoring": { "basePoints": 150, "difficultyMultiplier": 1.4 }
    },
    "vector_alignment": {
      "id": "vector_alignment",
      "label": "Vector Alignment",
      "difficulty": 2,
      "category": "sequence",
      "requires": { "datasetType": "categories", "minRows": 4, "minCols": 2 },
      "semantics": {
        "structure": "linearity", "location": "row_or_column", "visibility": "highlighted_vector",
        "playerGoal": "find the row or column filled with a single category",
        "questionFocus": ["whichRowHasPattern", "whichColumnHasPattern"]
      },
      "contextRequirements": { "requiresHighlightedCells": true, "requiresColumnStructure": true },
      "context": { "glyphsToActivate": ["sequence"], "lensSummaries": ["categoryCounts"], "highlightColumn": true },
      "questionHints": { "preferredQuestionTypes": ["whichRowHasPattern", "whichColumnHasPattern"], "avoidQuestionTypes": ["whichCategoryIsUnique"] },
      "scoring": { "basePoints": 130, "difficultyMultiplier": 1.3 }
    }
  }
};

// --- Pattern Logic Registry (Behavioral Implementation) ---
/**
 * Maps mythic pattern IDs to their injection and highlight logic.
 * Patterns not listed here will fallback gracefully.
 */
const INJECT_LOGIC = {
    // --- Categories: Echo (Frequency) ---
    echo: {
        inject: (dataset, params) => {
            const flat = dataset.flat();
            const targetCount = params.count || 3;
            // Pick a random existing value to duplicate
            const targetValue = flat[Math.floor(Math.random() * flat.length)].value;
            
            const targetCells = _pickRandomCells(flat, targetCount);
            targetCells.forEach(cell => cell.value = targetValue);
            
            return { targetCells, targetValue };
        },
        highlight: (val, context) => val === context.targetValue
    },

    // --- Categories: Silent Note / Lone Star (Unique) ---
    silent_note: {
        inject: (dataset, params) => _injectUniqueCategory(dataset, params),
        highlight: (val, context) => val === context.targetValue
    },
    lone_star: {
        inject: (dataset, params) => _injectUniqueCategory(dataset, params),
        highlight: (val, context) => val === context.targetValue
    },

    // --- Numbers: Broken Pattern (Outlier - High) ---
    broken_pattern: {
        inject: (dataset, params) => {
            const flat = dataset.flat();
            const nums = flat.map(c => parseFloat(c.value)).filter(n => !isNaN(n));
            if (!nums.length) return { targetCells: [] };

            const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
            // Create a significant outlier
            const outlierVal = Math.floor(mean * 2.5) + 100;

            const targetCell = _pickRandomCells(flat, 1)[0];
            targetCell.value = outlierVal;

            return { targetCells: [targetCell], targetValue: outlierVal };
        },
        highlight: (val, context) => parseFloat(val) === context.targetValue
    },

    // --- Numbers: Falling Stone (Threshold - Low/Min) ---
    // Replaces the old 'range'/'Deep Valley' logic
    falling_stone: {
        inject: (dataset, params) => {
            const flat = dataset.flat();
            const nums = flat.map(c => parseFloat(c.value)).filter(n => !isNaN(n));
            if (!nums.length) return { targetCells: [] };

            const min = Math.min(...nums);
            const deepVal = Math.floor(min / 2); // Force new min significantly lower

            const targetCell = _pickRandomCells(flat, 1)[0];
            targetCell.value = deepVal;

            return { targetCells: [targetCell], targetValue: deepVal };
        },
        highlight: (val, context) => parseFloat(val) === context.targetValue
    },

    // --- Dates: Twin Suns (Weekend) ---
    twin_suns: {
        inject: (dataset, params) => {
            const flat = dataset.flat();
            const targetCount = params.count || 2;
            const targetCells = _pickRandomCells(flat, targetCount);

            const weekends = ["2023-10-21", "2023-10-22", "2023-10-28", "2023-10-29"]; // Mock samples

            targetCells.forEach((cell, i) => {
                cell.value = new Date(weekends[i % weekends.length]);
            });

            return { targetCells, weekends };
        },
        highlight: (val, context) => {
            if (!context.weekends) return false;
            const valStr = val instanceof Date 
                ? val.toISOString().split('T')[0] 
                : String(val);
            return context.weekends.includes(valStr);
        }
    }
};

// --- Reusable Logic Helpers ---

function _injectUniqueCategory(dataset, params) {
    const flat = dataset.flat();
    const existingValues = new Set(flat.map(c => c.value));
    let uniqueVal = "Anomaly-" + Math.floor(Math.random() * 999);
    
    while(existingValues.has(uniqueVal)) {
          uniqueVal = "Anomaly-" + Math.floor(Math.random() * 999);
    }

    const targetCell = _pickRandomCells(flat, 1)[0];
    targetCell.value = uniqueVal;
    
    return { targetCells: [targetCell], targetValue: uniqueVal };
}


// --- Internal State ---
let configDefinitions = null; // Allows override via init

// --- Initialization ---

export function initPatternEngine(config) {
    if (config && config.patternDefinitions) {
        configDefinitions = config.patternDefinitions;
    }
}

export function destroyPatternEngine() {
    configDefinitions = null;
}

// --- Main Engine Logic ---

/**
 * Semantic Injection System.
 * Selects a pattern from the JSON Definitions, maps it to logic, and applies it.
 */
export function injectPattern(dataset, datasetType, patternType, thresholdConfig = {}) {
    
    // 1. Resolve Pattern Definition from JSON
    const patternDef = _resolvePatternDefinition(datasetType, patternType);

    // 2. Validate Requirements (Fallback if invalid or missing definition)
    if (!_checkRequirements(patternDef, dataset, datasetType)) {
        console.warn(`Pattern requirements failed or definition missing for ${patternType}. Falling back.`);
        return { 
            dataset, 
            targetCells: [], 
            patternType: 'none', 
            meta: _createFallbackMeta('none', thresholdConfig)
        }; 
    }

    // 3. Resolve Inject Logic (Behavior)
    // If specific logic isn't defined for this mythic ID, we return a safe no-op
    // allowing the pattern metadata to exist without altering the grid (ghost pattern).
    const logic = INJECT_LOGIC[patternDef.id];
    
    let result = { targetCells: [] };
    
    if (logic && logic.inject) {
        result = logic.inject(dataset, {});
    } else {
        // "Ghost" pattern - valid metadata, but no grid changes
        console.log(`No inject logic defined for ${patternDef.id}, treating as metadata-only pattern.`);
    }

    // 4. Validate Injection Purity (Guardrail)
    if (!_validateInjectedValues(dataset, datasetType, result.targetCells, patternType)) {
        console.warn("Pattern injection produced invalid value types for datasetType:", datasetType, "patternType:", patternType);
        return {
            dataset,
            targetCells: [],
            patternType: 'none',
            params: {},
            meta: _createFallbackMeta(patternType, thresholdConfig)
        };
    }

    // 5. Construct Metadata from Canonical JSON
    const meta = {
        id: patternDef.id,
        label: patternDef.label,
        category: patternDef.category,
        
        // Scoring: Merge JSON scoring with Tier Multiplier
        scoring: {
            ...(patternDef.scoring || {}),
            tierMultiplier: _getTierMultiplier(thresholdConfig)
        },

        // Query Engine Hooks: Directly from JSON
        questionHints: patternDef.questionHints || {},

        // UI Context Hooks: From JSON context + dynamic results
        uiContext: {
            ...(patternDef.context || {}),
            targetCellsCount: result.targetCells.length
        },

        // Sigil: Use default since JSON doesn't specify icons, 
        // or derived from category if needed.
        sigil: {
            icon: '🔮', // Default, logic could map category to icon if desired
            type: (patternDef.category || 'UNKNOWN').toUpperCase(),
            hint: patternDef.semantics?.playerGoal || 'Analyze the grid.'
        },

        // Lens Metadata: From JSON context
        lens: {
            type: patternDef.context?.lensType || 'none',
            summaries: patternDef.context?.lensSummaries || []
        },

        // Glyph Metadata: From JSON context
        glyphs: {
            activate: patternDef.context?.glyphsToActivate || [],
            metadata: {} 
        },
        
        // Data needed for highlighting later
        injectionResult: result
    };

    return {
        dataset,
        targetCells: result.targetCells,
        patternType: patternDef.id,
        params: result, 
        meta: meta      
    };
}

/**
 * Highlight Logic Delegate.
 * Resolves pattern definition -> resolves logic -> applies logic.
 */
export function applyHighlightLogic(dataset, datasetType, patternType, injectionResult) {
    // We only need the ID to look up the logic, but we respect the signature
    const logic = INJECT_LOGIC[patternType];

    if (!logic || !logic.highlight || !injectionResult) return [];

    const flat = dataset.flat();
    return flat.filter(cell => logic.highlight(cell.value, injectionResult));
}

// --- Internal Helpers ---

function _resolvePatternDefinition(datasetType, patternType) {
    // 1. Prefer injected config
    if (configDefinitions && configDefinitions[datasetType] && configDefinitions[datasetType][patternType]) {
        return configDefinitions[datasetType][patternType];
    }
    // 2. Fallback to local embedded definitions
    if (PATTERN_DEFINITIONS[datasetType] && PATTERN_DEFINITIONS[datasetType][patternType]) {
        return PATTERN_DEFINITIONS[datasetType][patternType];
    }
    return null;
}

function _checkRequirements(patternDef, dataset, datasetType) {
    if (!patternDef) return false;
    const req = patternDef.requires || {};
    
    if (req.datasetType && req.datasetType !== datasetType) return false;
    
    // Check dataset size constraints if defined
    if (req.minRows && dataset.length < req.minRows) return false;

    return true;
}

function _pickRandomCells(flat, count) {
    const shuffled = [...flat].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

function _getTierMultiplier(thresholdConfig) {
    const tier = thresholdConfig.tier !== undefined ? thresholdConfig.tier : 1;
    const mults = { 0: 1.0, 1: 1.5, 2: 2.0, 3: 3.0 };
    return mults[tier] || 1.0;
}

function _validateInjectedValues(dataset, datasetType, targetCells, patternType) {
    if (!targetCells || targetCells.length === 0) return true;

    for (const cell of targetCells) {
        const val = cell.value;
        if (val === null || val === undefined) return false;

        switch (datasetType) {
            case 'numbers':
                if (typeof val !== 'number' || isNaN(val)) return false;
                break;
            case 'categories':
                if (typeof val !== 'string') return false;
                break;
            case 'dates':
                if (!(val instanceof Date) || isNaN(val.getTime())) return false;
                break;
            case 'times':
                if (typeof val !== 'string' || !/^\d{2}:\d{2}$/.test(val)) return false;
                break;
            default:
                return false;
        }
    }
    return true;
}

function _createFallbackMeta(id, thresholdConfig) {
    return {
        id: id,
        label: 'No Pattern',
        category: 'none',
        scoring: {
            basePoints: 0,
            difficultyMultiplier: 1.0,
            tierMultiplier: _getTierMultiplier(thresholdConfig)
        },
        questionHints: { preferredQuestionTypes: [], avoidQuestionTypes: [] },
        uiContext: {
            glyphsToActivate: [],
            lensSummaries: [],
            highlightColumn: false,
            targetCellsCount: 0
        },
        sigil: {
            icon: '🔮',
            type: 'FALLBACK',
            hint: 'Analyze the grid.'
        },
        lens: { type: 'none', summaries: [] },
        glyphs: { activate: [], metadata: {} }
    };
}
