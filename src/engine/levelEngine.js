import { generateRawDataset } from './datasetGenerator.js';
import { injectPattern } from './patternEngine.js';
import { applyFormatting } from './formattingEngine.js';
import { generateQuestion } from './questionEngine.js';
import { computePatternMetadata } from './analyticsEngine.js';

let progressionRules = null;

export function initLevelEngine(levelProgressionConfig) {
    progressionRules = levelProgressionConfig;
}

export function generateLevel(levelNumber, thresholdTier = 1) {
    if (!progressionRules) {
        throw new Error("LevelEngine not initialized");
    }

    // 1. Get Level Config
    const config = getLevelConfig(levelNumber);
    if (!config) {
        throw new Error(`No configuration found for level ${levelNumber}`);
    }

    // 2. Threshold Tier Config
    const thresholdConfig = getThresholdConfig(thresholdTier);

    // 3. Dataset Size
    let rows = config.datasetSize.rows;
    let cols = config.datasetSize.cols;

    // 4. Dataset Type
    const datasetType = Array.isArray(config.datasetTypes)
        ? config.datasetTypes[Math.floor(Math.random() * config.datasetTypes.length)]
        : config.datasetTypes;

    // 5. Pattern Type
    let requestedPatternType;
    if (Array.isArray(config.patternTypes)) {
        requestedPatternType = config.patternTypes[Math.floor(Math.random() * config.patternTypes.length)];
    } else if (config.patternTypes === "ALL") {
        requestedPatternType = "random";
    } else {
        requestedPatternType = config.patternTypes;
    }

    // Stabilize pattern selection: only allow patterns valid for this datasetType
    let patternType = resolveValidPattern(datasetType, requestedPatternType);

    // 6. Generate Raw Dataset
    // Expects raw to contain { grid, datasetRules } or { grid, datasetMeta }
    const raw = generateRawDataset(datasetType, { rows, cols }, thresholdConfig);
    let dataset = raw.grid;
    // Normalize dataset metadata reference
    const datasetMeta = raw.datasetMeta || raw.datasetRules || {};

    // Purity Check 1: Pre-injection
    // Validate dataset purity to ensure raw generation didn't create mixed types
    const preTypes = new Set(dataset.flat().map(c => typeof c.value));
    if (preTypes.size > 1) {
        console.warn("Mixed dataset detected before pattern injection. LevelEngine will enforce purity.");
    }

    // 7. Inject Pattern (for question logic)
    // patternResult is expected to contain { dataset, patternType, meta }
    const patternResult = injectPattern(dataset, datasetType, patternType, thresholdConfig);
    dataset = patternResult.dataset || dataset;

    // Purity Check 2: Post-injection
    // Validate again after pattern injection to prevent broken grids in UI
    const postTypes = new Set(dataset.flat().map(c => typeof c.value));
    if (postTypes.size > 1) {
        console.error("Pattern injection produced mixed dataset types. Falling back to no-op pattern.");
        patternResult.patternType = "none";
        // Force fallback meta logic by clearing any existing meta
        patternResult.meta = null;
    }

    // Handle Fallback / Missing Meta
    // If pattern resolved to "none" or injection failed, provide safe defaults for UI
    if (patternType === "none" || patternResult.patternType === "none" || !patternResult.meta) {
        if (patternType !== "none" && patternResult.patternType !== "none") {
            console.warn("Using fallback pattern for level", levelNumber);
        }

        patternResult.patternType = "none";
        patternType = "none";

        patternResult.meta = {
            id: "none",
            label: "No Pattern",
            category: "none",
            sigil: { icon: "🔮", type: "FALLBACK", hint: "Analyze the grid." },
            lens: { type: "none", summaries: [] },
            glyphs: { activate: [], metadata: {} },
            uiContext: { glyphsToActivate: [], lensSummaries: [], highlightColumn: false, targetCellsCount: 0 },
            questionHints: { preferredQuestionTypes: [], avoidQuestionTypes: [] },
            scoring: { basePoints: 0, difficultyMultiplier: 1.0, tierMultiplier: thresholdConfig.rewardMultiplier }
        };
    }

    // 8. Compute analytic metadata (for glyphs + lenses)
    const patternMetadata = computePatternMetadata(dataset, datasetMeta);

    // 9. Apply Formatting
    // NOW PASSING patternResult.meta to wire up UI formatting
    const formattingResult = applyFormatting(
        dataset, 
        datasetType, 
        patternResult.patternType, 
        thresholdConfig, 
        patternResult.meta
    );

    // 10. Generate Question
    // NOW PASSING patternResult.meta to inform question generation
    const question = generateQuestion(
        patternResult.patternType,
        datasetType,
        dataset,
        formattingResult.highlightedCells,
        thresholdConfig,
        patternResult.meta
    );

    // 11. Return Challenge Object
    return {
        level: levelNumber,
        datasetType,
        patternType: patternResult.patternType,
        grid: dataset,
        formatting: formattingResult,
        question,
        thresholdConfig,
        config,

        // NEW: unified metadata for UI and analytics
        patternMeta: patternResult.meta,
        analytics: patternMetadata,
        datasetMeta: datasetMeta,
        
        // Preserve legacy field for backward compatibility
        datasetRules: datasetMeta, 
        patternMetadata: patternMetadata
    };
}

function resolveValidPattern(datasetType, patternType) {
    // Gracefully handle legacy config (array) where patternRegistry doesn't exist
    const registry = progressionRules.patternRegistry;
    if (!registry) return patternType;

    const group = registry[datasetType];
    
    // If we have a registry but no group for this type, fallback to none
    if (!group) return "none";

    if (patternType === "random") {
        const keys = Object.keys(group);
        return keys[Math.floor(Math.random() * keys.length)];
    }

    return group[patternType] ? patternType : "none";
}

function getLevelConfig(level) {
    // Handle both legacy array config and new object config with .levels
    const levels = Array.isArray(progressionRules) ? progressionRules : (progressionRules.levels || []);
    
    const match = levels.find(rule => {
        if (Array.isArray(rule.levels)) {
            return rule.levels.includes(level);
        } else if (typeof rule.levels === 'string' && rule.levels.endsWith('+')) {
            const min = parseInt(rule.levels);
            return level >= min;
        }
        return false;
    });

    return match || levels[levels.length - 1];
}

function getThresholdConfig(tier) {
    const tiers = [
        { tier: 0, name: "Scout", hintLevel: "high", rewardMultiplier: 1.0 },
        { tier: 1, name: "Hunter", hintLevel: "medium", rewardMultiplier: 1.5 },
        { tier: 2, name: "Tracker", hintLevel: "low", rewardMultiplier: 2.0 },
        { tier: 3, name: "Mythic", hintLevel: "none", rewardMultiplier: 3.0 }
    ];

    return tiers[tier] || tiers[1];
}
