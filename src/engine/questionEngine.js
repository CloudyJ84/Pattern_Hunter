/**
 * questionEngine.js
 * A modular Query Engine that generates context-aware, tier-based questions 
 * for the Pattern Hunter "Trial of the Field".
 * * Refactored to be fully data-driven via questionGenerator.json.
 */

import questionDefinitions from '../data/questionGenerator.json';

// --- Registry Initialization ---

/**
 * Builds the runtime registry by flattening the categorized JSON structure.
 * This ensures questionGenerator.json is the single source of truth.
 */
const buildRegistry = () => {
    const generator = questionDefinitions.questionGenerator || {};
    const categories = [
        'dateQuestions', 
        'numberQuestions', 
        'categoryQuestions', 
        'timeQuestions'
    ];
    
    let registry = [];
    categories.forEach(cat => {
        if (generator[cat]) {
            registry = registry.concat(Object.values(generator[cat]));
        }
    });
    return registry;
};

const QUESTION_REGISTRY = buildRegistry();

// --- Compute Strategies ---

/**
 * Strategy pattern for computing answers based on the 'answerLogic' field in JSON.
 * Replaces hard-coded compute functions.
 */
const COMPUTE_STRATEGIES = {
    // Value Retrieval
    highlightedValue: (context) => context.highlightedValues[0] || "-",
    highlightedList: (context) => context.highlightedValues.join(", ") || "-",
    
    // Counting
    highlightedCount: (context) => context.highlightedCells.length,
    
    // Statistical Extremes
    minValue: (context) => context.stats.min ?? "-",
    maxValue: (context) => context.stats.max ?? "-",
    
    // Row/Column Location
    rowOfMinValue: (context) => _findRowByValue(context, context.stats.min),
    rowOfMaxValue: (context) => _findRowByValue(context, context.stats.max),
    rowOfHighlighted: (context) => context.highlightedCells.length ? context.highlightedCells[0].row + 1 : "-",
    rowOfUnique: (context) => _findRowByValue(context, context.stats.uniqueValue),
    
    // Pattern Location
    rowOfPattern: (context) => context.highlightedCells.length ? context.highlightedCells[0].row + 1 : "-",
    columnOfPattern: (context) => context.highlightedCells.length ? context.highlightedCells[0].col + 1 : "-",
    
    // Frequency / Clusters
    mostFrequentWeekday: (context) => context.stats.mode || "-",
    mostFrequentCategory: (context) => context.stats.mode || "-",
    uniqueCategory: (context) => context.stats.uniqueValue || "-",
    uniqueCategoryCount: (context) => context.stats.uniqueCount || 0,
    clusterIdentifier: (context) => context.stats.mode || "Cluster", // simplified for visualization
    
    // Fallback
    default: () => "-"
};

// --- Main Engine Logic ---

/**
 * Generates a context-aware question based on the dataset and pattern.
 * Fully driven by JSON configuration.
 * * @param {string} patternType - The mythic pattern ID (e.g., 'twin_suns', 'rising_flame')
 * @param {string} datasetType - The data type (numbers, dates, categories, times)
 * @param {Array} dataset - 2D grid of values
 * @param {Array} highlightedCells - Cells pre-selected by the LevelEngine
 * @param {Object} thresholdConfig - Contains hintLevel, tier, etc.
 * @param {Object} patternMeta - Metadata from PatternEngine (sigils, hints, lens).
 */
export function generateQuestion(patternType, datasetType, dataset, highlightedCells, thresholdConfig = {}, patternMeta = null) {
    
    // 1. Generate Query Context
    const context = _generateQueryContext(dataset, highlightedCells, datasetType, patternType, patternMeta);

    // 2. Filter Registry via JSON Requirements
    const candidates = QUESTION_REGISTRY.filter(q => _checkRequirements(q, context));

    // 3. Select Best Candidate (Prioritize via PatternMeta)
    let pool = [];

    // 3a. Check for Pattern Engine Preferences (patternMeta.questionHints)
    if (patternMeta?.questionHints?.preferredQuestionTypes?.length) {
        const preferred = candidates.filter(q => 
            patternMeta.questionHints.preferredQuestionTypes.includes(q.id)
        );
        if (preferred.length > 0) pool = preferred;
    }

    // 3b. Fallback: Match by Pattern ID in Requirements
    if (pool.length === 0) {
        const primaryCandidates = candidates.filter(q => 
            q.requirements?.patternIds?.includes(patternType)
        );
        pool = primaryCandidates.length > 0 ? primaryCandidates : candidates;
    }

    // 3c. Filter out Avoided Types
    if (patternMeta?.questionHints?.avoidQuestionTypes?.length) {
        pool = pool.filter(q => 
            !patternMeta.questionHints.avoidQuestionTypes.includes(q.id)
        );
    }
    
    // Fallback if no valid question found
    if (pool.length === 0) {
        return _createFallbackResponse(patternMeta);
    }

    const selectedQ = pool[Math.floor(Math.random() * pool.length)];

    // 4. Resolve Phrasing based on Tier
    const tierMap = { 0: 'scout', 1: 'hunter', 2: 'tracker', 3: 'mythic' };
    const tierId = thresholdConfig.tier !== undefined ? thresholdConfig.tier : 1; 
    const tierKey = tierMap[tierId] || 'hunter';
    
    const phrasing = _resolveTemplate(selectedQ, tierKey);

    // 5. Compute Answer using JSON logic strategy
    let answer = "-";
    const logicKey = selectedQ.answerLogic;
    if (COMPUTE_STRATEGIES[logicKey]) {
        try {
            answer = COMPUTE_STRATEGIES[logicKey](context);
        } catch (e) {
            console.warn(`Compute failed for logic: ${logicKey}`, e);
        }
    } else {
        console.warn(`No compute strategy found for: ${logicKey}`);
    }

    // 6. Return Standardized Object
    // Sigil and Lens data now comes strictly from patternMeta, not internal maps.
    return {
        text: phrasing,
        answer: answer,
        type: selectedQ.id, // Mythic ID from JSON
        
        // Metadata from Pattern Engine
        sigilType: patternMeta?.sigil?.type || "FALLBACK",
        sigilIcon: patternMeta?.sigil?.icon || "🔮",
        sigilHint: patternMeta?.sigil?.hint || "Analyze the grid.",
        
        // Contextual Visuals
        lensType: patternMeta?.lens?.type || "none",
        glyphs: patternMeta?.glyphs?.activate || []
    };
}

/**
 * Computes Answer (Legacy Wrapper)
 * Retained for backward compatibility.
 */
export function computeAnswer(answerLogic, dataset, highlightedCells) {
    // Create a partial context to attempt computation
    const context = {
        highlightedCells: highlightedCells || [],
        highlightedValues: (highlightedCells || []).map(c => c.value),
        stats: {} 
    };
    
    if (COMPUTE_STRATEGIES[answerLogic]) {
        return COMPUTE_STRATEGIES[answerLogic](context);
    }
    return "-";
}

// --- Initialization ---

// Legacy init function - no longer needs to store rules as we import JSON directly.
export function initQuestionEngine(config) {
    // No-op: Registry is static
}

export function destroyQuestionEngine() {
    // No-op
}

// --- Internal Helpers ---

function _generateQueryContext(dataset, highlightedCells, datasetType, patternType, patternMeta) {
    const flatData = dataset.flat();
    const values = flatData.map(c => c.value);
    
    // 1. Calculate Statistics based on Dataset Type
    let stats = { min: null, max: null, mean: null, mode: null, uniqueValue: null, uniqueCount: 0 };
    
    if (datasetType === 'numbers') {
        const nums = values.map(v => parseFloat(v)).filter(n => !isNaN(n));
        if (nums.length) {
            stats.min = Math.min(...nums);
            stats.max = Math.max(...nums);
            stats.mean = nums.reduce((a, b) => a + b, 0) / nums.length;
        }
    }
    
    // Frequency Analysis (for Categories, Dates, Times)
    if (['categories', 'dates', 'times'].includes(datasetType)) {
        const counts = {};
        values.forEach(v => counts[v] = (counts[v] || 0) + 1);
        
        // Find Mode
        stats.mode = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
        
        // Find Unique (Singleton)
        const unique = Object.keys(counts).find(key => counts[key] === 1);
        stats.uniqueValue = unique || null;
        stats.uniqueCount = Object.keys(counts).filter(key => counts[key] === 1).length;
    }

    return {
        datasetType,
        patternType, // Mythic ID
        highlightedCells: highlightedCells || [],
        highlightedValues: (highlightedCells || []).map(c => c.value),
        dataset, // Full grid needed for row/col lookups
        stats,
        lens: patternMeta?.lens || {},
        hasHighlights: highlightedCells && highlightedCells.length > 0
    };
}

function _checkRequirements(question, context) {
    const req = question.requirements || {};

    // 1. Check Dataset Type (appliesTo in JSON)
    if (question.appliesTo && !question.appliesTo.includes(context.datasetType)) {
        return false;
    }

    // 2. Check Pattern ID Match
    if (req.patternIds && !req.patternIds.includes(context.patternType)) {
        return false;
    }

    // 3. Check Highlight Requirements
    if (req.requiresHighlightedCells && !context.hasHighlights) {
        return false;
    }

    // 4. Check Range Requirements (context implies range if highlights exist and span multiple)
    if (req.requiresRange && context.highlightedCells.length < 2) {
        return false;
    }

    return true;
}

function _resolveTemplate(question, tierKey) {
    const phrasings = question.tierPhrasing || {};
    
    // Try requested tier
    if (phrasings[tierKey] && phrasings[tierKey].length > 0) {
        return phrasings[tierKey][0];
    }
    
    // Fallback: Hunter -> Scout -> First Available
    if (phrasings.hunter && phrasings.hunter.length > 0) return phrasings.hunter[0];
    if (phrasings.scout && phrasings.scout.length > 0) return phrasings.scout[0];
    
    // Last resort
    const allTemplates = Object.values(phrasings).flat();
    return allTemplates.length > 0 ? allTemplates[0] : "Analyze the grid.";
}

function _findRowByValue(context, value) {
    if (value === null || value === undefined) return "-";
    for (let r = 0; r < context.dataset.length; r++) {
        for (let c = 0; c < context.dataset[r].length; c++) {
            // Loose equality for mixed types (number/string representations)
            if (context.dataset[r][c].value == value) {
                return r + 1;
            }
        }
    }
    return "-";
}

function _createFallbackResponse(patternMeta) {
    return {
        text: "Analyze the grid.",
        answer: "-",
        type: "fallback",
        sigilType: patternMeta?.sigil?.type || "FALLBACK",
        sigilIcon: patternMeta?.sigil?.icon || "🔮",
        sigilHint: patternMeta?.sigil?.hint || "Analyze the grid.",
        lensType: "none",
        glyphs: []
    };
}
