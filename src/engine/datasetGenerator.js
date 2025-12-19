let rules = null;

export function initDatasetGenerator(config) {
    rules = config;
}

export function destroyDatasetGenerator() {
    rules = null;
}

export function generateRawDataset(datasetType, size, thresholdConfig = {}) {
    if (!rules) {
        throw new Error("DatasetGenerator not initialized");
    }

    const config = rules.datasetTypes?.[datasetType];
    if (!config) {
        throw new Error(`Unknown dataset type: ${datasetType}`);
    }

    const { rows, cols } = size;
    const grid = [];

    // Threshold-tier hooks (future use)
    const distractorDensity = thresholdConfig.distractorDensity || 0;
    const jitter = thresholdConfig.valueJitter || 0;

    for (let r = 0; r < rows; r++) {
        const row = [];

        for (let c = 0; c < cols; c++) {
            let value = null;

            if (datasetType === 'dates') {
                value = randomDate(config.generation);
            } else if (datasetType === 'numbers') {
                value = randomNumber(config.generation, jitter);
            } else if (datasetType === 'categories') {
                value = randomCategory(config.generation);
            } else if (datasetType === 'times') {
                value = randomTime(config.generation);
            }

            row.push({
                row: r,
                col: c,
                value,
                type: datasetType
            });
        }

        grid.push(row);
    }

    // NEW: return datasetRules alongside the grid
    return {
        grid,
        datasetRules: {
            type: datasetType,
            generation: config.generation
        }
    };
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(gen) {
    const d = new Date();
    d.setDate(d.getDate() + randomInt(-gen.rangeDaysBefore, gen.rangeDaysAfter));
    d.setHours(0, 0, 0, 0);
    return d;
}

function randomNumber(gen, jitter = 0) {
    let base = randomInt(gen.minValue, gen.maxValue);

    if (jitter > 0) {
        const delta = Math.floor((Math.random() - 0.5) * jitter);
        base += delta;
    }

    return base;
}

function randomCategory(gen) {
    const cats = ['A', 'B', 'C', 'D', 'E', 'F'];
    return cats[randomInt(0, cats.length - 1)];
}

function randomTime(gen) {
    const h = randomInt(8, 18);
    const m = randomInt(0, 59);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
