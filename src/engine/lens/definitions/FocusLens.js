import { LensController } from '../LensController.js';

/**
 * FocusLens (Cluster Lens)
 * Reveals segmentation and grouping within the dataset.
 */
export const FocusLens = {
  id: 'lens_focus',
  name: 'Focus (Clusters)',
  type: 'cluster', // Maps to Renderer 'cluster' token set
  description: 'Segmentation by cluster groups, revealing hidden bonds between entities.',
  
  compute(gridData, analytics) {
    if (!gridData || gridData.length === 0) {
        return { overlays: [], annotations: [], highlights: [], legends: [], meta: {} };
    }

    const cols = gridData[0].length;
    const highlights = [];
    const overlays = [];
    const clusters = analytics.clusters || [];

    // 1. Process Clusters
    clusters.forEach((clusterIndices) => {
      // Calculate bounds for region overlay
      let minRow = Infinity, maxRow = -Infinity;
      let minCol = Infinity, maxCol = -Infinity;

      clusterIndices.forEach(idx => {
        const row = Math.floor(idx / cols);
        const col = idx % cols;

        // Add Highlight
        highlights.push({ 
          row, 
          col, 
          style: 'focus' 
        });

        // Update Bounds
        if (row < minRow) minRow = row;
        if (row > maxRow) maxRow = row;
        if (col < minCol) minCol = col;
        if (col > maxCol) maxCol = col;
      });

      // Add Region Overlay if cluster is valid
      if (minRow !== Infinity) {
        overlays.push({
          type: 'region',
          bounds: { minRow, maxRow, minCol, maxCol },
          style: 'region-focus'
        });
      }
    });

    const legends = [
      { label: 'Cluster Group', icon: '◳', description: 'Cohesive data segments' },
      { label: 'Focus Zone', icon: '◼', description: 'High density regions' }
    ];

    return {
      overlays,
      annotations: [],
      highlights,
      legends,
      meta: { clusterCount: clusters.length }
    };
  }
};

LensController.registerLens(FocusLens);
