/**
 * analyticsEngine.js
 * Pure analysis layer for the Pattern Hunter system.
 * * Responsibilities:
 * - Computes raw statistical metadata from the grid.
 * - Determines structural properties (rows, cols).
 * - Aggregates value distributions (min, max, mean, categories).
 * - Does NOT compute pattern matches, scoring, or UI states.
 * - Does NOT modify the grid.
 */

export function computePatternMetadata(grid, datasetMeta = {}) {
    // 1. Structural Analytics
    const rows = grid.length;
    const cols = grid[0] ? grid[0].length : 0;
    const cellCount = rows * cols;
    const flatGrid = grid.flat();

    // Extract valid values for analysis
    const values = flatGrid
        .map(cell => cell.value)
        .filter(v => v !== null && v !== undefined && v !== "");

    // 2. Type Resolution
    // Default to 'string' if not specified in metadata
    const valueType = datasetMeta.valueType || 'string';

    // 3. Initialize Analytics Containers
    let minValue = null;
    let maxValue = null;
    let meanValue = null;
    let categoryCounts = {};
    let earliestDate = null;
    let latestDate = null;
    let hourDistribution = {};

    // 4. Compute Statistics based on Value Type
    if (valueType === 'number') {
        const nums = values.map(v => Number(v)).filter(n => !isNaN(n));
        
        if (nums.length > 0) {
            minValue = Math.min(...nums);
            maxValue = Math.max(...nums);
            const sum = nums.reduce((a, b) => a + b, 0);
            meanValue = sum / nums.length;
        }

        // Optional: Simple category count for repeated numbers (modes)
        nums.forEach(n => {
            categoryCounts[n] = (categoryCounts[n] || 0) + 1;
        });

    } else if (valueType === 'date') {
        const dates = values.map(v => new Date(v)).filter(d => !isNaN(d.getTime()));
        
        if (dates.length > 0) {
            const timestamps = dates.map(d => d.getTime());
            earliestDate = new Date(Math.min(...timestamps));
            latestDate = new Date(Math.max(...timestamps));
        }

    } else if (valueType === 'time') {
        // analyze hour distribution
        values.forEach(v => {
            if (typeof v === 'string' && v.includes(':')) {
                // Assumes "HH:MM" format
                const hour = v.split(':')[0];
                if (hour) {
                    hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
                }
            }
        });

    } else if (valueType === 'category' || valueType === 'string') {
        // standard frequency analysis
        values.forEach(v => {
            categoryCounts[v] = (categoryCounts[v] || 0) + 1;
        });
    }

    // 5. Construct Unified Analytics Object
    return {
        // Identity & Structure
        datasetId: datasetMeta.datasetId,
        datasetType: datasetMeta.datasetType,
        rows: rows,
        cols: cols,
        cellCount: cellCount,
        valueType: valueType,

        // Numeric Stats
        minValue,
        maxValue,
        meanValue,

        // Category / Frequency Stats
        // (Included if populated, otherwise undefined)
        categoryCounts: Object.keys(categoryCounts).length > 0 ? categoryCounts : undefined,

        // Temporal Stats
        earliestDate,
        latestDate,
        hourDistribution: Object.keys(hourDistribution).length > 0 ? hourDistribution : undefined
    };
}
