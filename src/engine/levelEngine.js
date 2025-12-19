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
    let patternType;
    if (Array.isArray(config.patternTypes)) {
        patternType = config.patternTypes[Math.floor(Math.random() * config.patternTypes.length)];
    } else if (config.patternTypes === "ALL") {
        patternType = "random";
    } else {
        patternType = config.patternTypes;
    }

    // 6. Generate Raw Dataset (now returns { grid, datasetRules })
    const raw = generateRawDataset(datasetType, { rows, cols }, thresholdConfig);
    let dataset = raw.grid;
    const datasetRules = raw.datasetRules;

    // 7. Inject Pattern (for question logic)
    const patternResult = injectPattern(dataset, datasetType, patternType, thresholdConfig);
    dataset = patternResult.dataset || dataset;

    // 8. Compute analytic metadata (for glyphs + lenses)
    const patternMetadata = computePatternMetadata(dataset, datasetRules);

    // 9. Apply Formatting
    const formattingResult = applyFormatting(dataset, datasetType, patternType, thresholdConfig);

    // 10. Generate Question
    const question = generateQuestion(
        patternType,
        datasetType,
        dataset,
        formattingResult.highlightedCells,
        thresholdConfig
    );

    // 11. Return Challenge Object
    return {
        level: levelNumber,
        datasetType,
        patternType,
        grid: dataset,
        formatting: formattingResult,
        question,
        thresholdConfig,
        config,

        // NEW: analytics + dataset rules
        patternMetadata,
        datasetRules
    };
}

function getLevelConfig(level) {
    const match = progressionRules.find(rule => {
        if (Array.isArray(rule.levels)) {
            return rule.levels.includes(level);
        } else if (typeof rule.levels === 'string' && rule.levels.endsWith('+')) {
            const min = parseInt(rule.levels);
            return level >= min;
        }
        return false;
    });

    return match || progressionRules[progressionRules.length - 1];
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
