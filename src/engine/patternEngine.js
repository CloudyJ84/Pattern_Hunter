/**
 * patternEngine.js
 * A semantic, metadata-driven engine that constructs meaningful data patterns
 * for the Pattern Hunter "Trial of the Field".
 */

// --- Internal State ---
let legacyConfig = null; // Kept for legacy init compatibility

/**
 * The Pattern Registry
 * Defines patterns as structured objects with identity, logic, and metadata.
 */
const PATTERN_REGISTRY = {
    // --- CATEGORY PATTERNS ---
    categories: {
        frequency: {
            id: 'frequency',
            label: 'Echo of the Archive',
            difficulty: 2,
            category: 'sequence',
            requires: { datasetType: 'categories', minRows: 4 },
            
            // Logic: Force a specific value to appear multiple times
            inject: (dataset, params) => {
                const flat = dataset.flat();
                const targetCount = params.count || 3;
                const targetValue = flat[Math.floor(Math.random() * flat.length)].value;
                
                // Pick random cells to overwrite
                const targetCells = _pickRandomCells(flat, targetCount);
                targetCells.forEach(cell => cell.value = targetValue);
                
                return { targetCells, targetValue };
            },

            // Logic: Is this value the target?
            highlight: (val, context) => val === context.targetValue,

            scoring: { basePoints: 100, difficultyMultiplier: 1.2 },
            
            context: {
                glyphsToActivate: ['frequency'], // "Echo"
                lensSummaries: ['frequency'],
                highlightColumn: false,
                lensType: 'frequency'
            },

            sigil: {
                icon: '🔁',
                type: 'FREQUENCY',
                hint: 'Repeated values (frequency)'
            },

            questionHints: {
                preferredQuestionTypes: ['frequency_count'],
                avoidQuestionTypes: ['unique_category', 'min_value']
            }
        },

        unique: {
            id: 'unique',
            label: 'The Lone Star',
            difficulty: 3,
            category: 'unique',
            requires: { datasetType: 'categories', minRows: 3 },

            // Logic: Insert a value that DOES NOT exist elsewhere
            inject: (dataset, params) => {
                const flat = dataset.flat();
                const existingValues = new Set(flat.map(c => c.value));
                let uniqueVal = "Anomaly-" + Math.floor(Math.random() * 999);
                
                // Ensure uniqueness (simple check)
                while(existingValues.has(uniqueVal)) {
                     uniqueVal = "Anomaly-" + Math.floor(Math.random() * 999);
                }

                const targetCell = _pickRandomCells(flat, 1)[0];
                targetCell.value = uniqueVal;
                
                return { targetCells: [targetCell], targetValue: uniqueVal };
            },

            highlight: (val, context) => val === context.targetValue,

            scoring: { basePoints: 150, difficultyMultiplier: 1.5 },
            
            context: {
                glyphsToActivate: ['unique'], // "Lone Star"
                lensSummaries: ['unique'],
                highlightColumn: false,
                lensType: 'frequency'
            },

            sigil: {
                icon: '⭐',
                type: 'UNIQUE',
                hint: 'Unique value (appears once)'
            },

            questionHints: {
                preferredQuestionTypes: ['unique_category'],
                avoidQuestionTypes: ['frequency_count']
            }
        }
    },

    // --- NUMBER PATTERNS ---
    numbers: {
        outlier: {
            id: 'outlier',
            label: 'The Broken Pattern',
            difficulty: 2,
            category: 'outlier',
            requires: { datasetType: 'numbers' },

            // Logic: Create a statistical outlier (Mean + 2*StdDev)
            inject: (dataset, params) => {
                const flat = dataset.flat();
                const nums = flat.map(c => parseFloat(c.value)).filter(n => !isNaN(n));
                
                if (!nums.length) return { targetCells: [] };

                const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
                // Simple std dev approximation or fixed boost
                const outlierVal = Math.floor(mean * 2.5) + 100;

                const targetCell = _pickRandomCells(flat, 1)[0];
                targetCell.value = outlierVal;

                return { targetCells: [targetCell], targetValue: outlierVal };
            },

            highlight: (val, context) => parseFloat(val) === context.targetValue,

            scoring: { basePoints: 120, difficultyMultiplier: 1.3 },
            
            context: {
                glyphsToActivate: ['outlier', 'above'], // "Broken Pattern", "Rising Flame"
                lensSummaries: ['stats'],
                highlightColumn: false,
                lensType: 'stats'
            },

            sigil: {
                icon: '⚡',
                type: 'OUTLIER',
                hint: 'Anomaly / Outlier'
            },

            questionHints: {
                preferredQuestionTypes: ['value_above_mean', 'max_value'],
                avoidQuestionTypes: ['min_value']
            }
        },

        range: {
            id: 'range',
            label: 'The Deep Valley',
            difficulty: 1,
            category: 'range',
            requires: { datasetType: 'numbers' },

            // Logic: Create a value significantly below the mean
            inject: (dataset, params) => {
                const flat = dataset.flat();
                const nums = flat.map(c => parseFloat(c.value)).filter(n => !isNaN(n));
                if (!nums.length) return { targetCells: [] };

                const min = Math.min(...nums);
                const deepVal = Math.floor(min / 2); // Force new min

                const targetCell = _pickRandomCells(flat, 1)[0];
                targetCell.value = deepVal;

                return { targetCells: [targetCell], targetValue: deepVal };
            },

            highlight: (val, context) => parseFloat(val) === context.targetValue,

            scoring: { basePoints: 100, difficultyMultiplier: 1.0 },

            context: {
                glyphsToActivate: ['below'], // "Falling Stone"
                lensSummaries: ['stats'],
                highlightColumn: false,
                lensType: 'stats'
            },

            sigil: {
                icon: '🕳️',
                type: 'MIN_VALUE',
                hint: 'Smallest number (MIN)'
            },

            questionHints: {
                preferredQuestionTypes: ['value_below_mean', 'min_value'],
                avoidQuestionTypes: ['max_value']
            }
        }
    },

    // --- DATE PATTERNS ---
    dates: {
        weekend: {
            id: 'weekend',
            label: 'Twin Suns',
            difficulty: 2,
            category: 'date',
            requires: { datasetType: 'dates' },

            // Logic: Ensure target cells are Sat or Sun
            inject: (dataset, params) => {
                const flat = dataset.flat();
                const targetCount = params.count || 2;
                const targetCells = _pickRandomCells(flat, targetCount);

                // Helper to generate a random weekend date
                // Note: Real date logic would be more robust, this is a simulation for the pattern
                const weekends = ["2023-10-21", "2023-10-22", "2023-10-28", "2023-10-29"]; // Mock samples

                targetCells.forEach((cell, i) => {
                    // Update: ensure we inject a Date object to maintain purity with the datasetGenerator
                    cell.value = new Date(weekends[i % weekends.length]);
                });

                return { targetCells, weekends };
            },

            highlight: (val, context) => {
                // Check if value is one of the weekends
                if (!context.weekends) return false;
                
                // If val is a Date object (expected), convert to string for comparison
                const valStr = val instanceof Date 
                    ? val.toISOString().split('T')[0] 
                    : String(val);

                return context.weekends.includes(valStr);
            },

            scoring: { basePoints: 110, difficultyMultiplier: 1.2 },

            context: {
                glyphsToActivate: ['weekend'], // "Twin Suns"
                lensSummaries: [],
                highlightColumn: false,
                lensType: 'weekend'
            },

            sigil: {
                icon: '☀️☀️',
                type: 'WEEKEND',
                hint: 'Weekend dates (Sat/Sun)'
            },

            questionHints: {
                preferredQuestionTypes: ['count_weekends', 'identify_date_pattern'],
                avoidQuestionTypes: []
            }
        }
    }
};

// --- Initialization (Legacy Compatibility) ---

export function initPatternEngine(config) {
    legacyConfig = config; // Store but largely ignore in favor of registry
}

export function destroyPatternEngine() {
    legacyConfig = null;
}

// --- Main Engine Logic ---

/**
 * Semantic Injection System.
 * Selects a pattern from the Registry, validates requirements, and applies it.
 */
export function injectPattern(dataset, datasetType, patternType, thresholdConfig = {}) {
    
    // 1. Resolve Pattern Object
    let patternObj = _resolvePattern(datasetType, patternType);

    // 2. Validate Requirements (Fallback if invalid)
    if (!_checkRequirements(patternObj, dataset, datasetType)) {
        console.warn(`Pattern requirements failed for ${patternType}. Falling back.`);
        // Fallback strategy: pick a simple one or create a dummy object
        // For safety, we return a "no-op" pattern if validation fails severely
        return { 
            dataset, 
            targetCells: [], 
            patternType: 'none', 
            meta: _createFallbackMeta('none', thresholdConfig)
        }; 
    }

    // 3. Inject Logic
    const result = patternObj.inject(dataset, {});

    // 4. Validate Injection Purity (Guardrail)
    // Ensures pattern didn't corrupt the dataset with mixed types
    if (!_validateInjectedValues(dataset, datasetType, result.targetCells, patternType)) {
        console.warn("Pattern injection produced invalid value types for datasetType:", datasetType, "patternType:", patternType);
        
        // Revert or no-op return to prevent crash downstream
        return {
            dataset,
            targetCells: [],
            patternType: 'none',
            params: {},
            meta: _createFallbackMeta(patternType, thresholdConfig)
        };
    }

    // 5. Construct Metadata & Context
    // This feeds the Query Engine and UI
    const meta = {
        id: patternObj.id,
        label: patternObj.label,
        category: patternObj.category,
        
        // Scoring Hooks
        scoring: {
            ...patternObj.scoring,
            tierMultiplier: _getTierMultiplier(thresholdConfig)
        },

        // Query Engine Hooks
        questionHints: patternObj.questionHints,

        // UI Context Hooks
        uiContext: {
            ...patternObj.context,
            targetCellsCount: result.targetCells.length
        },

        // Sigil Metadata
        sigil: patternObj.sigil || {
            icon: '🔮',
            type: 'FALLBACK',
            hint: 'Analyze the grid.'
        },

        // Lens Metadata
        lens: {
            type: patternObj.context?.lensType || 'none',
            summaries: patternObj.context?.lensSummaries || []
        },

        // Glyph Metadata
        glyphs: {
            activate: patternObj.context?.glyphsToActivate || [],
            metadata: {} // analyticsEngine will populate this later
        },
        
        // Data needed for highlighting later
        injectionResult: result
    };

    return {
        dataset,
        targetCells: result.targetCells,
        patternType: patternObj.id,
        params: result, // Legacy compatibility
        meta: meta      // New semantic metadata
    };
}

/**
 * Highlight Logic Delegate.
 * Allows FormattingEngine to check if a cell matches the semantic pattern.
 */
export function applyHighlightLogic(dataset, datasetType, patternType, injectionResult) {
    const patternObj = _resolvePattern(datasetType, patternType);
    if (!patternObj || !patternObj.highlight || !injectionResult) return [];

    const flat = dataset.flat();
    // Use the logic defined in the registry
    return flat.filter(cell => patternObj.highlight(cell.value, injectionResult));
}

// --- Internal Helpers ---

function _resolvePattern(datasetType, patternType) {
    const group = PATTERN_REGISTRY[datasetType];
    if (group && group[patternType]) {
        return group[patternType];
    }
    
    // Fuzzy matching or fallback
    // If exact patternType not found, try to find *any* pattern in that group
    if (group) {
        const keys = Object.keys(group);
        if (keys.length > 0) return group[keys[0]];
    }

    // Absolute fallback (should define a 'generic' pattern, but returning null handles safely above)
    return null;
}

function _checkRequirements(patternObj, dataset, datasetType) {
    if (!patternObj) return false;
    const req = patternObj.requires;
    
    if (req.datasetType && req.datasetType !== datasetType) return false;
    
    // Check dataset size constraints if defined
    if (req.minRows && dataset.length < req.minRows) return false;

    return true;
}

function _pickRandomCells(flat, count) {
    // Fisher-Yates shuffle or simple random sort
    const shuffled = [...flat].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

function _getTierMultiplier(thresholdConfig) {
    // Maps the numeric tier ID to a score multiplier
    // 0: Scout(1.0), 1: Hunter(1.5), 2: Tracker(2.0), 3: Mythic(3.0)
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
                // Check if it's a valid Date object
                if (!(val instanceof Date) || isNaN(val.getTime())) return false;
                break;
            case 'times':
                // Expect string in HH:MM format
                if (typeof val !== 'string' || !/^\d{2}:\d{2}$/.test(val)) return false;
                break;
            default:
                // Unknown type, assume safe? No, safe to fail.
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
        questionHints: {
            preferredQuestionTypes: [],
            avoidQuestionTypes: []
        },
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
        lens: {
            type: 'none',
            summaries: []
        },
        glyphs: {
            activate: [],
            metadata: {}
        }
    };
}
