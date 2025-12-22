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

    // Threshold-tier hooks
    // These allow the Difficulty Engine to inject noise or variance later
    const distractorDensity = thresholdConfig.distractorDensity || 0; 
    const jitter = thresholdConfig.valueJitter || 0;

    // Resolve valueType for metadata
    let valueType = 'string';
    if (datasetType === 'numbers') valueType = 'number';
    if (datasetType === 'dates') valueType = 'date';
    if (datasetType === 'times') valueType = 'time';

    // Generate a unique ID for this dataset instance
    const datasetId = `ds-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    for (let r = 0; r < rows; r++) {
        const row = [];

        for (let c = 0; c < cols; c++) {
            let value = null;

            // --- Generation Logic ---
            if (datasetType === 'dates') {
                value = randomDate(config.generation);
            } else if (datasetType === 'numbers') {
                value = randomNumber(config.generation, jitter);
            } else if (datasetType === 'categories') {
                value = randomCategory(config.generation);
                // Hook: Future distractor injection logic would go here
                // if (Math.random() < distractorDensity) value = generateDistractor(...)
            } else if (datasetType === 'times') {
                value = randomTime(config.generation);
            }

            // --- Purity Guard ---
            // Validate that injected values match datasetType immediately upon creation
            if (!validateValueType(value, datasetType)) {
                throw new Error(`Purity Violation: Generated value [${value}] does not match dataset type [${datasetType}] at ${r},${c}`);
            }

            // --- Display Formatting Hook ---
            const displayValue = getDisplayValue(value, datasetType);

            row.push({
                row: r,
                col: c,
                value,
                type: datasetType,
                cellId: `${r}-${c}`,
                tags: [], // reserved for patternEngine and analyticsEngine (e.g., 'target', 'distractor')
                displayValue
            });
        }

        grid.push(row);
    }

    // --- Final Dataset Validation ---
    validateDataset(grid, datasetType);

    // --- Return Unified Schema ---
    return {
        grid,
        datasetMeta: {
            datasetType,
            cellCount: rows * cols,
            rows,
            cols,
            valueType,
            generationRules: config.generation,
            datasetId
        }
    };
}

// --- Validation Helpers ---

function validateValueType(value, type) {
    if (value === null || value === undefined) return false;
    
    switch (type) {
        case 'numbers':
            return typeof value === 'number' && !isNaN(value);
        case 'dates':
            return value instanceof Date && !isNaN(value);
        case 'categories':
            return typeof value === 'string';
        case 'times':
            // Simple regex for HH:MM format
            return typeof value === 'string' && /^\d{2}:\d{2}$/.test(value);
        default:
            return false;
    }
}

function validateDataset(grid, type) {
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            const cell = grid[r][c];
            
            // Check structural integrity
            if (!cell || typeof cell !== 'object') {
                throw new Error(`Dataset validation failed: Invalid cell structure at ${r},${c}`);
            }

            // Check type consistency
            if (cell.type !== type) {
                throw new Error(`Dataset validation failed: Mixed types detected at ${r},${c}. Expected ${type}, got ${cell.type}`);
            }

            // Check value validity
            if (!validateValueType(cell.value, type)) {
                throw new Error(`Dataset validation failed: Invalid value content at ${r},${c}`);
            }
        }
    }
}

// --- Formatting Helpers ---

function getDisplayValue(value, type) {
    if (value === null || value === undefined) return '';

    switch (type) {
        case 'numbers':
            return String(value);
        case 'categories':
            return value;
        case 'times':
            return value; // Already in HH:MM format
        case 'dates':
            if (!(value instanceof Date)) return String(value);
            const y = value.getFullYear();
            const m = String(value.getMonth() + 1).padStart(2, '0');
            const d = String(value.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        default:
            return String(value);
    }
}

// --- Generators ---

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
        // Apply jitter centered around 0
        const delta = Math.floor((Math.random() - 0.5) * jitter);
        base += delta;
    }

    return base;
}

function randomCategory(gen) {
    // Default categories if not provided in generation rules
    const cats = gen.categories || ['A', 'B', 'C', 'D', 'E', 'F'];
    return cats[randomInt(0, cats.length - 1)];
}

function randomTime(gen) {
    const h = randomInt(8, 18);
    const m = randomInt(0, 59);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
