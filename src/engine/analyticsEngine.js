/**
 * analyticsEngine.js
 * 
 * Produces analytic metadata for glyphs.
 * This is separate from the Pattern Engine (which injects patterns for questions).
 * 
 * The Glyph System expects metadata in this shape:
 * {
 *   distribution: { above: [], below: [] },
 *   outliers: { indices: [] },
 *   frequency: { repeated: [] },
 *   unique: { indices: [] },
 *   weekends: { indices: [] },
 *   clusters: [...],
 *   sequences: [...]
 * }
 */

export function computePatternMetadata(grid, datasetRules = {}) {
    const flat = grid.flat();
    const type = datasetRules.type;

    const metadata = {
        distribution: { above: [], below: [] },
        outliers: { indices: [] },
        frequency: { repeated: [] },
        unique: { indices: [] },
        weekends: { indices: [] },
        clusters: [],
        sequences: []
    };

    // --- NUMERIC ANALYTICS ---
    if (type === 'numbers') {
        const nums = flat.map(c => Number(c.value));
        const mean = nums.reduce((a, b) => a + b, 0) / nums.length;

        // Above / Below Mean
        flat.forEach((cell, idx) => {
            const val = Number(cell.value);
            if (val > mean) metadata.distribution.above.push(idx);
            if (val < mean) metadata.distribution.below.push(idx);
        });

        // Outliers (simple z-score > 2)
        const variance = nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nums.length;
        const std = Math.sqrt(variance);

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
        const nums = flat.map(c => Number(c.value));

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

    return metadata;
}
