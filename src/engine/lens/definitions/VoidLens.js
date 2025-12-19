import { LensController } from '../LensController.js';

/**
 * VoidLens (Anomaly Lens)
 * Spotlights outliers and deviations from the norm.
 */
export const VoidLens = {
  id: 'lens_void',
  name: 'The Void (Anomalies)',
  type: 'anomaly', // Maps to Renderer 'anomaly' token set
  description: 'A dark lens that suppresses noise to reveal statistical aberrations.',
  
  compute(gridData, patternMetadata) {
    if (!gridData || gridData.length === 0) {
        return { overlays: [], annotations: [], highlights: [], legends: [], meta: {} };
    }

    const cols = gridData[0].length;
    const overlays = [];
    const highlights = [];
    const annotations = [];
    
    // Check both potential data structures for outliers
    const outlierIndices = patternMetadata.outliers?.indices || patternMetadata.outliers || [];

    outlierIndices.forEach(idx => {
      const row = Math.floor(idx / cols);
      const col = idx % cols;

      // 1. Halo Overlay
      overlays.push({
        type: 'halo',
        row,
        col,
        style: 'warn'
      });

      // 2. Severe Highlight
      highlights.push({
        row,
        col,
        style: 'warn'
      });

      // 3. Warning Annotation
      annotations.push({
        row,
        col,
        text: '!',
        style: 'rune'
      });
    });

    const legends = [
      { label: 'Anomaly', icon: '⚠', description: 'Statistical outlier detected' },
      { label: 'Variance', icon: '≋', description: 'High deviation zone' }
    ];

    return {
      overlays,
      annotations,
      highlights,
      legends,
      meta: { outlierCount: outlierIndices.length }
    };
  }
};

LensController.registerLens(VoidLens);
