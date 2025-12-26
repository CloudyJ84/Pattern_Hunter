{
  // --- Identity ---
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

  // --- Teaching Intent ---
  teachingFocus: {
    concept: "threshold_detection",
    description: "Identify values exceeding a defined threshold.",
    introduces: ["glyph_reveal_above_threshold"],
    reinforces: []
  },

  // --- Grid Definition ---
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

  // --- Allowed Systems ---
  systems: {
    glyphs: ["glyph_reveal_above_threshold"],
    lenses: ["lens_focus"],
    sigils: []
  },

  // --- Player Guidance ---
  guidance: {
    showHints: true,
    hintText: ["Some values exceed expectation."],
    highlightOnFailure: true
  },

  // --- Success Conditions ---
  successCriteria: {
    type: "cell_selection",
    correctCells: [{ row: 1, col: 1 }],
    allowMultipleAttempts: true
  },

  // --- Scoring ---
  scoring: {
    enabled: true,
    baseScore: 100,
    penalties: {
      incorrectSelection: 10
    }
  },

  // --- Progression Hooks ---
  progression: {
    unlocks: {
      glyphs: ["glyph_reveal_above_threshold"],
      lenses: ["lens_focus"],
      sigils: []
    },
    marksComplete: true
  },

  // --- Tier Progression ---
  tierProgression: {
    pointsAwarded: 25
  }
}
