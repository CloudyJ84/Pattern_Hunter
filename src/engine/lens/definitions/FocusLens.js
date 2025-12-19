import { LensController } from '../LensController.js';

export const FocusLens = {
  id: 'lens_focus',
  name: 'Focus (Clusters)',
  type: 'cluster',
  description: 'Segmentation by cluster groups, revealing hidden bonds.',
  compute(grid, meta) {
    const highlights = meta.clusters.flat().map(idx => {
      const row = Math.floor(idx / grid[0].length);
      const col = idx % grid[0].length;
      return { row, col, style: 'focus' };
    });
    const legends = [{ label: 'Cluster', icon: '◼', description: 'Grouped cells' }];
    return { overlays: [], annotations: [], highlights, legends, meta: {} };
  }
};

LensController.registerLens(FocusLens);
