const scout_threshold_01 = {
  id: "scout_threshold_01",
  tier: "SCOUT",
  band: "initiate",

  name: "The Rising Signal",
  subtitle: "Not all values speak equally.",

  sequence: {
    order: 1,
    location: "Entrance"
  },

  narrative: {
    intro: "The grid hums softly. One value rises above the rest.",
    success: "You isolate the signal. The Archive acknowledges clarity.",
    failure: "Noise overwhelms perception."
  },

  teachingFocus: {
    concept: "threshold_detection",
    description: "Identify values exceeding a defined threshold.",
    introduces: ["glyph_reveal_above_threshold"],
    reinforces: []
  },

  grid: {
    rows: 3,
    cols: 3,
    datasetType: "numbers",
    dataset: [
      [12, 14, 13],
      [11, 42, 15],
      [10, 13, 12]
    ],
    metadata: {
      threshold: 30
    }
  },

  systems: {
    glyphs: ["glyph_reveal_above_threshold"],
    lenses: ["lens_focus"],
    sigils: []
  },

  guidance: {
    showHints: true,
    hintText: ["Some values exceed expectation."],
    highlightOnFailure: true
  },

  successCriteria: {
    type: "cell_selection",
    correctCells: [{ row: 1, col: 1 }],
    allowMultipleAttempts: true
  },

  scoring: {
    enabled: true,
    baseScore: 100,
    penalties: {
      incorrectSelection: 10
    }
  },

  progression: {
    unlocks: {
      glyphs: ["glyph_reveal_above_threshold"],
      lenses: ["lens_focus"],
      sigils: []
    },
    marksComplete: true
  },

  tierProgression: {
    pointsAwarded: 25
  }
};

export default scout_threshold_01;
