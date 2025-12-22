/**
 * questionEngine.js
 * A modular Query Engine that generates context-aware, tier-based questions 
 * for the Pattern Hunter "Trial of the Field".
 */

// --- Internal State ---
let rules = null; // Kept for legacy init compatibility

/**
 * SIGIL TYPE MAPPING
 * Maps internal question IDs to generic UI Sigil types.
 * This ensures the UI receives consistent types for iconography and feedback.
 */
const SIGIL_TYPE_MAP = {
    max_value: "MAX_VALUE",
    min_value: "MIN_VALUE",
    value_above_mean: "MAX_VALUE",
    value_below_mean: "MIN_VALUE",
    count_weekends: "WEEKEND",
    identify_date_pattern: "DATE_MATCH",
    unique_category: "UNIQUE",
    frequency_count: "FREQUENCY",
    highlight_value: "FALLBACK",
    highlight_row: "FALLBACK",
    fallback: "FALLBACK"
};

/**
 * The Query Registry
 * Defines all possible questions, their requirements, phrasing templates, and answer logic.
 */
const QUERY_REGISTRY = [
    // --- DATE QUESTIONS ---
    {
        id: 'count_weekends',
        requires: {
            datasetType: ['dates'],
            patternType: ['weekend'],
            highlighted: true
        },
        templates: {
            scout: "Count the weekend dates (Saturday & Sunday).",
            hunter: "How many Twin Suns shine in this sequence?",
            tracker: "Count the days of rest.",
            mythic: "Quantify the Twin Suns."
        },
        compute: (context) => context.highlightedCells.length
    },
    {
        id: 'identify_date_pattern',
        requires: {
            datasetType: ['dates'],
            highlighted: true
        },
        templates: {
            scout: "Identify the highlighted date.",
            hunter: "What date marks the anomaly?",
            tracker: "Identify the mark.",
            mythic: "Name the echo."
        },
        compute: (context) => context.highlightedValues[0] || "N/A"
    },

    // --- NUMBER QUESTIONS ---
    {
        id: 'value_above_mean',
        requires: {
            datasetType: ['numbers'],
            patternType: ['above', 'outlier'],
            highlighted: true
        },
        templates: {
            scout: "Identify the value above the average.",
            hunter: "Find the Rising Flame among the numbers.",
            tracker: "Seek the high ground.",
            mythic: "What ascends?"
        },
        compute: (context) => context.highlightedValues[0]
    },
    {
        id: 'value_below_mean',
        requires: {
            datasetType: ['numbers'],
            patternType: ['below', 'outlier'],
            highlighted: true
        },
        templates: {
            scout: "Identify the value below the average.",
            hunter: "Find the Falling Stone.",
            tracker: "Seek the depth.",
            mythic: "What descends?"
        },
        compute: (context) => context.highlightedValues[0]
    },
    {
        id: 'min_value',
        requires: {
            datasetType: ['numbers'],
            lens: ['stats']
        },
        templates: {
            scout: "What is the lowest value?",
            hunter: "Where is the floor of the dataset?",
            tracker: "Find the minimum.",
            mythic: "The lowest depth."
        },
        compute: (context) => context.stats.min
    },
    {
        id: 'max_value',
        requires: {
            datasetType: ['numbers'],
            lens: ['stats']
        },
        templates: {
            scout: "What is the highest value?",
            hunter: "Where is the peak?",
            tracker: "Find the maximum.",
            mythic: "The highest reach."
        },
        compute: (context) => context.stats.max
    },

    // --- CATEGORY / FREQUENCY QUESTIONS ---
    {
        id: 'unique_category',
        requires: {
            datasetType: ['categories', 'numbers'],
            patternType: ['unique'],
            highlighted: true
        },
        templates: {
            scout: "Identify the unique value.",
            hunter: "Find the Lone Star.",
            tracker: "What stands alone?",
            mythic: "The singularity."
        },
        compute: (context) => context.highlightedValues[0]
    },
    {
        id: 'frequency_count',
        requires: {
            datasetType: ['categories', 'numbers'],
            patternType: ['frequency'],
            highlighted: true
        },
        templates: {
            scout: "How many times does this value appear?",
            hunter: "Count the Echoes of the pattern.",
            tracker: "Count the repetition.",
            mythic: "Quantify the resonance."
        },
        compute: (context) => context.highlightedCells.length
    },

    // --- GENERIC / FALLBACK ---
    {
        id: 'highlight_value',
        requires: {
            highlighted: true
        },
        templates: {
            scout: "What is the value of the highlighted cell?",
            hunter: "Read the marked glyph.",
            tracker: "Identify target.",
            mythic: "Speak the mark."
        },
        compute: (context) => context.highlightedValues[0]
    },
    {
        id: 'highlight_row',
        requires: {
            highlighted: true
        },
        templates: {
            scout: "Which row contains the highlighted cell?",
            hunter: "In which stratum does the mark lie?",
            tracker: "Row number.",
            mythic: "Locate the vector."
        },
        compute: (context) => context.highlightedCells[0].row + 1 // 1-based index
    }
];

// --- Initialization (Legacy Compatibility) ---

export function initQuestionEngine(questionGeneratorConfig) {
    // We store the config if needed, but the Registry replaces the logic.
    rules = questionGeneratorConfig?.questionGenerator || {};
}

export function destroyQuestionEngine() {
    rules = null;
}

// --- Main Engine Logic ---

/**
 * Generates a context-aware question based on the dataset and pattern.
 * @param {string} patternType - The type of pattern (weekend, outlier, etc.)
 * @param {string} datasetType - The data type (numbers, dates, categories)
 * @param {Array} dataset - 2D grid of values
 * @param {Array} highlightedCells - Cells pre-selected by the LevelEngine
 * @param {Object} thresholdConfig - Contains hintLevel, tier, etc.
 * @param {Object} patternMeta - (New) Metadata from PatternEngine containing sigil, hints, and lens info.
 */
export function generateQuestion(patternType, datasetType, dataset, highlightedCells, thresholdConfig = {}, patternMeta = null) {
    
    // 1. Generate Query Context
    const context = _generateQueryContext(dataset, highlightedCells, datasetType, patternType);

    // 2. Filter Registry for Valid Questions
    const candidates = QUERY_REGISTRY.filter(q => _checkRequirements(q, context));

    // 3. Select Best Candidate (Prioritize via PatternMeta > Internal Logic)
    let pool = [];

    // 3a. Check for Pattern Engine Preferences
    if (patternMeta?.questionHints?.preferredQuestionTypes?.length) {
        const preferred = candidates.filter(q => 
            patternMeta.questionHints.preferredQuestionTypes.includes(q.id)
        );
        if (preferred.length > 0) pool = preferred;
    }

    // 3b. Fallback to Internal Type Matching if no pool established yet
    if (pool.length === 0) {
        const primaryCandidates = candidates.filter(q => 
            q.requires.patternType && q.requires.patternType.includes(patternType)
        );
        pool = primaryCandidates.length > 0 ? primaryCandidates : candidates;
    }

    // 3c. Filter out Avoided Types
    if (patternMeta?.questionHints?.avoidQuestionTypes?.length) {
        pool = pool.filter(q => 
            !patternMeta.questionHints.avoidQuestionTypes.includes(q.id)
        );
    }
    
    // Fallback if no valid question found (Safe Fallback)
    if (pool.length === 0) {
        return {
            text: "Analyze the grid.",
            answer: "-",
            type: "fallback",
            sigilType: "FALLBACK",
            sigilIcon: "🔮",
            sigilHint: "Analyze the grid.",
            lensType: "none",
            glyphs: []
        };
    }

    const selectedQ = pool[Math.floor(Math.random() * pool.length)];

    // 4. Resolve Phrasing based on Tier and Hints
    const tierId = thresholdConfig.tier !== undefined ? thresholdConfig.tier : 1; // Default Hunter
    const phrasing = _resolveTemplate(selectedQ.templates, tierId, thresholdConfig);

    // 5. Compute Answer
    let answer;
    try {
        answer = selectedQ.compute(context);
    } catch (e) {
        console.warn("Question computation failed", e);
        answer = "Error";
    }

    // 6. Normalize Output with Sigil Metadata
    const questionType = selectedQ.id;
    const sigilType = SIGIL_TYPE_MAP[questionType] || "FALLBACK";

    return {
        text: phrasing,
        answer: answer,
        type: questionType,
        // New Metadata Fields
        sigilType,
        sigilIcon: patternMeta?.sigil?.icon || "🔮",
        sigilHint: patternMeta?.sigil?.hint || "Analyze the grid.",
        lensType: patternMeta?.lens?.type || "none",
        glyphs: patternMeta?.glyphs?.activate || []
    };
}

/**
 * Computes Answer (Legacy Wrapper)
 * Retained for compatibility if external modules call it directly,
 * though internal logic now delegates to the Registry.
 */
export function computeAnswer(answerLogic, dataset, highlightedCells) {
    // Shim to map old string-based logic keys to our new context-based computer
    // This is a minimal implementation to prevent crashes if called directly.
    if (highlightedCells && highlightedCells.length > 0) {
        if (answerLogic === "highlightedValue") return highlightedCells[0].value;
        if (answerLogic === "highlightedCount") return highlightedCells.length;
    }
    return "-";
}

// --- Internal Helpers ---

function _generateQueryContext(dataset, highlightedCells, datasetType, patternType) {
    const flatData = dataset.flat();
    const values = flatData.map(c => c.value);
    
    // Basic Stats for Numbers
    let stats = { min: null, max: null, mean: null };
    if (datasetType === 'numbers') {
        const nums = values.map(v => parseFloat(v)).filter(n => !isNaN(n));
        if (nums.length) {
            stats.min = Math.min(...nums);
            stats.max = Math.max(...nums);
            stats.mean = nums.reduce((a, b) => a + b, 0) / nums.length;
        }
    }

    return {
        datasetType,
        patternType,
        highlightedCells: highlightedCells || [],
        highlightedValues: (highlightedCells || []).map(c => c.value),
        stats,
        // Helper to check if context has highlights
        hasHighlights: highlightedCells && highlightedCells.length > 0
    };
}

function _checkRequirements(question, context) {
    const req = question.requires;

    // Check Dataset Type
    if (req.datasetType && !req.datasetType.includes(context.datasetType)) {
        return false;
    }

    // Check Pattern Match (Strict check if question requires specific pattern)
    // We allow general questions (no patternType req) to pass unless filtered later
    if (req.patternType && !req.patternType.includes(context.patternType)) {
        return false;
    }

    // Check Highlights
    if (req.highlighted === true && !context.hasHighlights) {
        return false;
    }

    return true;
}

function _resolveTemplate(templates, tierId, thresholdConfig) {
    // Optional: High clarity hints for Scout/Spreadsheet training modes
    if (thresholdConfig && thresholdConfig.hintLevel === "high" && templates.hint) {
        return templates.hint;
    }

    // Map numeric tier IDs to keys
    const tierMap = { 0: 'scout', 1: 'hunter', 2: 'tracker', 3: 'mythic' };
    const tierKey = tierMap[tierId] || 'hunter';

    // Fallback chain: Requested -> Hunter -> Scout -> First Available
    return templates[tierKey] || 
           templates['hunter'] || 
           templates['scout'] || 
           Object.values(templates)[0];
}
