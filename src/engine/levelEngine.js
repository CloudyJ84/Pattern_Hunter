import { generateRawDataset } from './datasetGenerator.js';
import { injectPattern } from './patternEngine.js';
import { applyFormatting } from './formattingEngine.js';
import { generateQuestion } from './questionEngine.js';

let progressionRules = null;

export function initLevelEngine(levelProgressionConfig) {
    progressionRules = levelProgressionConfig;
}

export function generateLevel(levelNumber) {
    if (!progressionRules) throw new Error("LevelEngine not initialized");

    // 1. Get Level Config
    const config = getLevelConfig(levelNumber);
    if (!config) throw new Error(`No configuration found for level ${levelNumber}`);

    // 2. Determine Parameters
    // Handle "5-7" string ranges if present, or use object
    let rows = config.datasetSize.rows;
    let cols = config.datasetSize.cols;
    
    // 3. Choose Dataset Type
    // If array, pick random. 
    const datasetType = Array.isArray(config.datasetTypes) 
        ? config.datasetTypes[Math.floor(Math.random() * config.datasetTypes.length)]
        : config.datasetTypes;

    // 4. Choose Pattern
    let patternType;
    if (config.patternTypes === "ALL" || (Array.isArray(config.patternTypes) && config.patternTypes.length > 0)) {
        // Real app would check available patterns for the datasetType
        // For now we assume the list in config is valid for the chosen datasetType
        // OR we pick a random one if "ALL"
        if (config.patternTypes === "ALL") {
             patternType = "random"; // logic needed to fetch available patterns
        } else {
             patternType = config.patternTypes[Math.floor(Math.random() * config.patternTypes.length)];
        }
    }

    // 5. Generate Raw Dataset
    let dataset = generateRawDataset(datasetType, { rows, cols });

    // 6. Inject Pattern
    dataset = injectPattern(dataset, datasetType, patternType);

    // 7. Apply Formatting (Calculate highlights)
    const formattingResult = applyFormatting(dataset, datasetType, patternType);

    // 8. Generate Question
    const question = generateQuestion(patternType, datasetType, dataset, formattingResult.highlightedCells);

    // 9. Return Challenge Object
    return {
        level: levelNumber,
        datasetType: datasetType,
        patternType: patternType,
        grid: dataset,
        formatting: formattingResult,
        question: question,
        config: config
    };
}

function getLevelConfig(level) {
    // Find the config block that contains this level
    const match = progressionRules.find(rule => {
        if (Array.isArray(rule.levels)) {
            return rule.levels.includes(level);
        } else if (typeof rule.levels === 'string' && rule.levels.endsWith('+')) {
            const min = parseInt(rule.levels);
            return level >= min;
        }
        return false;
    });
    return match || progressionRules[progressionRules.length - 1]; // Fallback
}