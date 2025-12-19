/**
 * LensController.js
 * 
 * Manages grid-level perspectives (lenses).
 * Lenses do not alter the dataset itself — only how it is seen.
 * Each lens returns a structured output for LensRenderer to apply.
 */

export const LensController = {
    _activeLens: 'lens_standard',

    /**
     * Set the active lens mode.
     * @param {string} lensId 
     */
    setActiveLens(lensId) {
        this._activeLens = lensId;
    },

    /**
     * Apply the active lens to the dataset.
     * @param {Array} grid - The dataset grid.
     * @param {Object} patternMetadata - Analytic metadata.
     * @param {Object} datasetRules - Dataset rules (type, generation).
     * @param {Object} thresholdConfig - Tier config.
     * @returns {Object} lensOutput
     */
    applyLens(grid, patternMetadata, datasetRules, thresholdConfig) {
        switch (this._activeLens) {

            // 1. Standard Lens — baseline, no alterations
            case 'lens_standard':
                return {
                    id: 'lens_standard',
                    name: 'Standard',
                    summary: { message: 'Neutral baseline view' },
                    indices: [],
                    transform: { type: 'none' }
                };

            // 2. Focus Lens — cluster segmentation
            case 'lens_focus':
                return {
                    id: 'lens_focus',
                    name: 'Focus (Clusters)',
                    summary: {
                        clusters: patternMetadata.clusters.length,
                        message: 'Segmentation by cluster groups'
                    },
                    indices: patternMetadata.clusters.flat(),
                    transform: { type: 'spacing', clusters: patternMetadata.clusters }
                };

            // 3. X-Ray Lens — pivot / structural view
            case 'lens_xray':
                // Compute row/col summaries
                const rowSums = grid.map(row => row.reduce((a, c) => a + (Number(c.value) || 0), 0));
                const colSums = grid[0].map((_, c) =>
                    grid.reduce((a, row) => a + (Number(row[c].value) || 0), 0)
                );

                return {
                    id: 'lens_xray',
                    name: 'X-Ray (Pivot)',
                    summary: {
                        rows: rowSums,
                        cols: colSums,
                        message: 'Structural view with row/col aggregates'
                    },
                    indices: [],
                    transform: { type: 'pivot', rowSums, colSums }
                };

            // 4. Summary Lens — timeline / temporal emphasis
            case 'lens_summary':
                return {
                    id: 'lens_summary',
                    name: 'Summary (Timeline)',
                    summary: {
                        sequences: patternMetadata.sequences.length,
                        message: 'Temporal emphasis / linear progression'
                    },
                    indices: patternMetadata.sequences.flat(),
                    transform: { type: 'timeline', sequences: patternMetadata.sequences }
                };

            // 5. Void Lens — anomaly spotlight
            case 'lens_void':
                return {
                    id: 'lens_void',
                    name: 'Void (Anomalies)',
                    summary: {
                        outliers: patternMetadata.outliers.indices.length,
                        message: 'Spotlight anomalies, dim normal cells'
                    },
                    indices: patternMetadata.outliers.indices,
                    transform: { type: 'zoom', outliers: patternMetadata.outliers.indices }
                };

            // Fallback
            default:
                return {
                    id: 'lens_standard',
                    name: 'Standard',
                    summary: { message: 'Neutral baseline view' },
                    indices: [],
                    transform: { type: 'none' }
                };
        }
    }
};
