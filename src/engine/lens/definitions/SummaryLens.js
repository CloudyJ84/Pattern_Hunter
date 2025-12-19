import { LensController } from '../LensController.js';

/**
 * SummaryLens (Timeline Lens)
 * Emphasizes sequential connections and temporal progression.
 */
export const SummaryLens = {
  id: 'lens_summary',
  name: 'Summary (Timeline)',
  type: 'timeline', // Maps to Renderer 'timeline' token set
  description: 'Reveals the hidden currents of time and sequential progression.',
  
  compute(gridData, patternMetadata) {
    if (!gridData || gridData.length === 0) {
        return { overlays: [], annotations: [], highlights: [], legends: [], meta: {} };
    }

    const cols = gridData[0].length;
    const overlays = [];
    const highlights = [];
    const sequences = patternMetadata.sequences || [];

    sequences.forEach((seqIndices) => {
      // Process each step in the sequence
      for (let i = 0; i < seqIndices.length; i++) {
        const currIdx = seqIndices[i];
        const currRow = Math.floor(currIdx / cols);
        const currCol = currIdx % cols;

        // Highlight the node
        highlights.push({
          row: currRow,
          col: currCol,
          style: i === 0 ? 'focus' : 'dim' // Focus start, dim rest
        });

        // Draw connection to next node
        if (i < seqIndices.length - 1) {
          const nextIdx = seqIndices[i+1];
          const nextRow = Math.floor(nextIdx / cols);
          const nextCol = nextIdx % cols;

          overlays.push({
            type: 'line',
            start: { row: currRow, col: currCol },
            end: { row: nextRow, col: nextCol },
            style: 'flow' // Arrow style
          });
        }
      }
    });

    const legends = [
      { label: 'Sequence', icon: '→', description: 'Chronological flow' },
      { label: 'Origin', icon: '◎', description: 'Sequence start point' }
    ];

    return {
      overlays,
      annotations: [],
      highlights,
      legends,
      meta: { sequenceCount: sequences.length }
    };
  }
};

LensController.registerLens(SummaryLens);
