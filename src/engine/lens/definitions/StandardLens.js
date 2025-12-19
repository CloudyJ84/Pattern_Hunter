import { LensController } from '../LensController.js';

/**
 * StandardLens
 * The baseline reality. Clears all optical distortions.
 */
export const StandardLens = {
  id: 'lens_standard',
  name: 'Standard',
  type: 'standard', // Maps to default neutral tokens
  description: 'The unadorned truth. Raw data without augmentation.',
  
  compute(gridData) {
    // The standard lens explicitly returns empty arrays to clear the renderer.
    return {
      overlays: [],
      annotations: [],
      highlights: [],
      legends: [],
      meta: {}
    };
  }
};

LensController.registerLens(StandardLens);
