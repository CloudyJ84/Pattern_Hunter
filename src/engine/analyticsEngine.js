/**
 * analyticsEngine.js
 * * Produces analytic metadata for glyphs.
 * This is separate from the Pattern Engine (which injects patterns for questions).
 * * The Glyph System expects metadata in this shape:
 * {
 * distribution: { above: [], below: [] },
 * outliers: { indices: [] },
 * frequency: { repeated: [] },
 * unique: { indices: [] },
 * weekends: { indices: [] },
 * clusters: [...],
 * sequences: [...],
 * // New V2 Fields
 * glyphs: { outlier: bool, frequency: bool, ... },
 * sigilSupport: { maxValue, minValue, uniqueValue, ... },
 * lens: { stats, frequency, ... },
 * dateStats: { earliest, latest },
 * categoryStats: { mode }
 * }
 */

export function computePatternMetadata(grid, datasetRules = {}) {
    const flat = grid.flat();
    const type = datasetRules.type;

    // --- DATASET PURITY VALIDATION ---
    // Prevent crashes by warning if mixed types find their way into the engine
    if (new Set(flat.map(c => typeof c.value)).size > 1) {
        console.warn("Mixed dataset detected in analyticsEngine. Only the primary type will be analyzed.");
    }

    const metadata = {
        distribution: { above: [], below: [] },
        outliers: { indices: [] },
        frequency: { repeated: [] },
        unique: { indices: [] },
        weekends: { indices: [] },
        clusters: [],
        sequences: []
    };

    // Shared state for Lens/Sigil logic later
    let mean = 0;
    let std = 0;
    let nums = [];

    // --- NUMERIC ANALYTICS ---
    if (type === 'numbers') {
        nums = flat.map(c => Number(c.value));
        mean = nums.reduce((a, b) => a + b, 0) / nums.length;

        // Above / Below Mean
        flat.forEach((cell, idx) => {
            const val = Number(cell.value);
            if (val > mean) metadata.distribution.above.push(idx);
            if (val < mean) metadata.distribution.below.push(idx);
        });

        // Outliers (simple z-score > 2)
        const variance = nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nums.length;
        std = Math.sqrt(variance);

        flat.forEach((cell, idx) => {
            const val = Number(cell.value);
            const z = (val - mean) / (std || 1);
            if (Math.abs(z) >= 2) {
                metadata.outliers.indices.push(idx);
            }
        });
    }

    // --- FREQUENCY & UNIQUE (all dataset types) ---
    const valueMap = new Map();
    flat.forEach((cell, idx) => {
        const v = cell.value;
        if (!valueMap.has(v)) valueMap.set(v, []);
        valueMap.get(v).push(idx);
    });

    for (const [val, indices] of valueMap.entries()) {
        if (indices.length > 1) {
            metadata.frequency.repeated.push(...indices);
        }
        if (indices.length === 1) {
            metadata.unique.indices.push(indices[0]);
        }
    }

    // --- WEEKENDS (date datasets) ---
    if (type === 'dates') {
        flat.forEach((cell, idx) => {
            const d = new Date(cell.value);
            const day = d.getDay(); // 0 = Sun, 6 = Sat
            if (day === 0 || day === 6) {
                metadata.weekends.indices.push(idx);
            }
        });
    }

    // --- CLUSTERS (simple adjacency clusters for numbers) ---
    if (type === 'numbers') {
        const rows = grid.length;
        const cols = grid[0].length;
        const visited = new Set();

        function neighbors(r, c) {
            return [
                [r - 1, c],
                [r + 1, c],
                [r, c - 1],
                [r, c + 1]
            ].filter(([rr, cc]) => rr >= 0 && rr < rows && cc >= 0 && cc < cols);
        }

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const idx = r * cols + c;
                if (visited.has(idx)) continue;

                const cluster = [];
                const stack = [[r, c]];

                while (stack.length) {
                    const [rr, cc] = stack.pop();
                    const ii = rr * cols + cc;
                    if (visited.has(ii)) continue;

                    visited.add(ii);
                    cluster.push(ii);

                    const val = Number(grid[rr][cc].value);

                    neighbors(rr, cc).forEach(([nr, nc]) => {
                        const ni = nr * cols + nc;
                        const nval = Number(grid[nr][nc].value);
                        if (!visited.has(ni) && Math.abs(nval - val) <= 5) {
                            stack.push([nr, nc]);
                        }
                    });
                }

                if (cluster.length > 1) {
                    metadata.clusters.push(cluster);
                }
            }
        }
    }

    // --- SEQUENCES (simple increasing/decreasing runs) ---
    if (type === 'numbers') {
        let current = [0];
        for (let i = 1; i < nums.length; i++) {
            if (nums[i] > nums[i - 1]) {
                current.push(i);
            } else {
                if (current.length >= 3) metadata.sequences.push([...current]);
                current = [i];
            }
        }
        if (current.length >= 3) metadata.sequences.push([...current]);
    }

    // =========================================================
    // V2 UNIFIED ANALYTICS UPGRADE
    // =========================================================

    // --- DATE STATS ---
    // Supports earliest/latest detection for future patterns
    metadata.dateStats = {
        earliest: null,
        latest: null
    };
    if (type === 'dates') {
        const stamps = flat.map(c => new Date(c.value).getTime()).filter(t => !isNaN(t));
        if (stamps.length > 0) {
            metadata.dateStats.earliest = new Date(Math.min(...stamps));
            metadata.dateStats.latest = new Date(Math.max(...stamps));
        }
    }

    // --- CATEGORY STATS ---
    // Supports mode detection
    metadata.categoryStats = {
        mode: [...valueMap.entries()].reduce((a, b) => 
            (b[1].length > (a?.count || 0)) ? { value: b[0], count: b[1].length } : a,
        null)
    };

    // --- GLYPH METADATA ---
    // Booleans for UI state toggling (lights up glyphs in the HUD)
    metadata.glyphs = {
        outlier: metadata.outliers.indices.length > 0,
        frequency: metadata.frequency.repeated.length > 0,
        unique: metadata.unique.indices.length > 0,
        weekend: metadata.weekends.indices.length > 0,
        sequence: metadata.sequences.length > 0
    };

    // --- SIGIL SUPPORT ---
    // Data required for Sigil highlighting logic
    metadata.sigilSupport = {
        maxValue: null,
        minValue: null,
        uniqueValue: null,
        frequencyValues: [],
        weekendIndices: metadata.weekends.indices
    };

    if (type === 'numbers' && nums.length > 0) {
        metadata.sigilSupport.maxValue = Math.max(...nums);
        metadata.sigilSupport.minValue = Math.min(...nums);
    } 
    
    if (type === 'categories' || type === 'numbers') {
        metadata.sigilSupport.uniqueValue = metadata.unique.indices.length === 1
            ? flat[metadata.unique.indices[0]].value
            : null;
        
        metadata.sigilSupport.frequencyValues = [...valueMap.entries()]
            .filter(([v, idxs]) => idxs.length > 1)
            .map(([v]) => v);
    }

    // --- LENS METADATA ---
    // Summaries for the Lens Bar
    metadata.lens = {
        stats: type === 'numbers' ? { mean, std } : null,
        frequency: metadata.frequency.repeated,
        unique: metadata.unique.indices,
        weekend: metadata.weekends.indices,
        sequence: metadata.sequences
    };

    return metadata;
}
