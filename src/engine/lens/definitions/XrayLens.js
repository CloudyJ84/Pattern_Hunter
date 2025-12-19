import { LensController } from '../LensController.js';

/**
 * XrayLens (Pivot Lens)
 * A structural lens that aggregates row and column data to reveal high-level trends.
 */
export const XrayLens = {
  id: 'lens_xray',
  name: 'X-Ray (Pivot)',
  type: 'pivot', // Maps to Renderer 'pivot' token set
  description: 'Structural transparency showing aggregate sums and means across axes.',
  
  compute(gridData) {
    if (!gridData || gridData.length === 0) {
        return { overlays: [], annotations: [], highlights: [], legends: [], meta: {} };
    }

    const annotations = [];
    const highlights = [];
    const rowCount = gridData.length;
    const colCount = gridData[0].length;

    // Helper to calculate sum/avg safely
    const aggregate = (values) => {
      const nums = values.filter(v => typeof v === 'number');
      if (nums.length === 0) return null;
      const sum = nums.reduce((a, b) => a + b, 0);
      return { sum, avg: (sum / nums.length).toFixed(1) };
    };

    // 1. Row Aggregates (Right edge)
    for (let r = 0; r < rowCount; r++) {
      const rowValues = gridData[r];
      const stats = aggregate(rowValues);
      
      if (stats) {
        annotations.push({
          row: r,
          col: colCount - 1,
          text: `Σ ${stats.sum}`,
          style: 'subtle'
        });
        // Highlight the edge cell to anchor the annotation
        highlights.push({ row: r, col: colCount - 1, style: 'dim' });
      }
    }

    // 2. Column Aggregates (Bottom edge)
    for (let c = 0; c < colCount; c++) {
      const colValues = [];
      for (let r = 0; r < rowCount; r++) {
        colValues.push(gridData[r][c]);
      }
      const stats = aggregate(colValues);

      if (stats) {
        annotations.push({
          row: rowCount - 1,
          col: c,
          text: `μ ${stats.avg}`,
          style: 'header'
        });
        highlights.push({ row: rowCount - 1, col: c, style: 'dim' });
      }
    }

    const legends = [
      { label: 'Row Sum', icon: 'Σ', description: 'Total value per row' },
      { label: 'Col Mean', icon: 'μ', description: 'Average value per column' }
    ];

    return {
      overlays: [],
      annotations,
      highlights,
      legends,
      meta: {}
    };
  }
};

LensController.registerLens(XrayLens);
