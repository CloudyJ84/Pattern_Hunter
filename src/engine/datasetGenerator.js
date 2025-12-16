// Responsible for creating the raw grid data based on datasetRules.json

let rules = null;

export function initDatasetGenerator(datasetRulesConfig) {
    rules = datasetRulesConfig;
}

export function generateRawDataset(datasetType, size) {
    if (!rules) throw new Error("DatasetGenerator not initialized");
    
    const config = rules.datasetTypes[datasetType];
    if (!config) throw new Error(`Unknown dataset type: ${datasetType}`);

    const { rows, cols } = size;
    const grid = [];

    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
            let value;
            switch (datasetType) {
                case 'dates':
                    value = generateRandomDate(config.generation);
                    break;
                case 'numbers':
                    value = generateRandomNumber(config.generation);
                    break;
                case 'categories':
                    value = generateRandomCategory(config.generation);
                    break;
                case 'times':
                    value = generateRandomTime(config.generation);
                    break;
                default:
                    value = null;
            }
            // Each cell is an object containing metadata
            row.push({ row: r, col: c, value: value, type: datasetType });
        }
        grid.push(row);
    }
    return grid;
}

// --- Helper Functions ---

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomDate(genConfig) {
    const today = new Date();
    // Clone today to avoid mutating reference
    const start = new Date(today); 
    start.setDate(today.getDate() - genConfig.rangeDaysBefore);
    
    const end = new Date(today);
    end.setDate(today.getDate() + genConfig.rangeDaysAfter);
    
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    const d = new Date(randomTime);
    d.setHours(0, 0, 0, 0); // Normalize to midnight for cleaner display
    return d;
}

function generateRandomNumber(genConfig) {
    return randomInt(genConfig.minValue, genConfig.maxValue);
}

function generateRandomCategory(genConfig) {
    // Generate a pool of categories (e.g., A-F)
    const poolSize = 6; 
    const categories = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].slice(0, poolSize);
    return categories[randomInt(0, categories.length - 1)];
}

function generateRandomTime(genConfig) {
    const parseTime = (t) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };
    
    const startMins = parseTime(genConfig.startTime);
    const endMins = parseTime(genConfig.endTime);
    const randomMins = randomInt(startMins, endMins);
    
    const h = Math.floor(randomMins / 60);
    const m = randomMins % 60;
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
