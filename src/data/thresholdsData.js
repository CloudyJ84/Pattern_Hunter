export default {
  "tiers": [
    {
      "id": "SCOUT",
      "name": "Scout",
      "flavor": {
        "title": "The Initiate's Eye",
        "description": "The world is literal and clear. Use your tools to learn the patterns."
      },
      "multiplier": 1.0,
      "hintLevel": "full",
      "phrasing": "explicit",
      "lensModes": [
        "lens_standard"
      ],
      "glyphs": [
        "above",
        "below"
      ],
      "uiVisibility": {
        "showContextPanels": true,
        "showLensSummaries": true,
        "showGlyphTooltips": true
      },
      "unlocks": {
        "lensModes": [
          "lens_standard"
        ],
        "glyphs": [
          "above",
          "below"
        ]
      },
      "notes": "Base tier. Maximum assistance, minimum ambiguity."
    },
    {
      "id": "HUNTER",
      "name": "Hunter",
      "flavor": {
        "title": "The Hunter's Focus",
        "description": "Patterns begin to hide. Focus your lens to isolate the signal."
      },
      "multiplier": 1.25,
      "hintLevel": "medium",
      "phrasing": "explicit",
      "lensModes": [
        "lens_standard",
        "lens_focus"
      ],
      "glyphs": [
        "above",
        "below",
        "unique"
      ],
      "uiVisibility": {
        "showContextPanels": true,
        "showLensSummaries": true,
        "showGlyphTooltips": true
      },
      "unlocks": {
        "lensModes": [
          "lens_focus"
        ],
        "glyphs": [
          "unique"
        ]
      },
      "notes": "Introduction of the Focus Lens and basic matching glyphs."
    },
    {
      "id": "TRACKER",
      "name": "Tracker",
      "flavor": {
        "title": "The Tracker's Path",
        "description": "The questions grow metaphorical. Read the signs, not just the text."
      },
      "multiplier": 1.5,
      "hintLevel": "medium",
      "phrasing": "flavored",
      "lensModes": [
        "lens_standard",
        "lens_focus",
        "lens_summary"
      ],
      "glyphs": [
        "above",
        "below",
        "unique",
        "weekend",
        "sequence"
      ],
      "uiVisibility": {
        "showContextPanels": true,
        "showLensSummaries": true,
        "showGlyphTooltips": false
      },
      "unlocks": {
        "lensModes": [
          "lens_summary"
        ],
        "glyphs": [
          "weekend",
          "sequence"
        ]
      },
      "notes": "Phrasing shifts to flavored. Tooltips disappear. Summary lens unlocked."
    },
    {
      "id": "SEER",
      "name": "Seer",
      "flavor": {
        "title": "The Seer's Vision",
        "description": "See through the noise. The surface is a distraction."
      },
      "multiplier": 2.0,
      "hintLevel": "minimal",
      "phrasing": "flavored",
      "lensModes": [
        "lens_standard",
        "lens_focus",
        "lens_summary",
        "lens_xray"
      ],
      "glyphs": [
        "above",
        "below",
        "unique",
        "weekend",
        "sequence",
        "cluster",
        "outlier"
      ],
      "uiVisibility": {
        "showContextPanels": false,
        "showLensSummaries": true,
        "showGlyphTooltips": false
      },
      "unlocks": {
        "lensModes": [
          "lens_xray"
        ],
        "glyphs": [
          "cluster",
          "outlier"
        ]
      },
      "notes": "Context panels removed. Hints become cryptic. X-Ray lens unlocked."
    },
    {
      "id": "MYTHIC",
      "name": "Mythic",
      "flavor": {
        "title": "The Arithmancer's Truth",
        "description": "The data speaks in riddles. Only the pattern remains."
      },
      "multiplier": 3.0,
      "hintLevel": "none",
      "phrasing": "mythic",
      "lensModes": [
        "lens_standard",
        "lens_focus",
        "lens_summary",
        "lens_xray",
        "lens_void"
      ],
      "glyphs": [
        "above",
        "below",
        "unique",
        "weekend",
        "sequence",
        "cluster",
        "outlier",
        "frequency"
      ],
      "uiVisibility": {
        "showContextPanels": false,
        "showLensSummaries": false,
        "showGlyphTooltips": false
      },
      "unlocks": {
        "lensModes": [
          "lens_void"
        ],
        "glyphs": [
          "frequency"
        ]
      },
      "notes": "Endgame tier. No hints. Mythic phrasing. All tools available but no UI hand-holding."
    }
  ]
};
