export default {
  "tiers": [
    {
      "id": "SCOUT",
      "name": "Scout",
      "tier": 0,
      "flavor": "The world is literal and clear. Use your tools to learn the patterns.",
      "rewardMultiplier": 1.0,
      "hintLevel": "high",
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
      "tier": 1,
      "flavor": "Patterns begin to hide. Focus your lens to isolate the signal.",
      "rewardMultiplier": 1.25,
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
      "tier": 2,
      "flavor": "The questions grow metaphorical. Read the signs, not just the text.",
      "rewardMultiplier": 1.5,
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
      "tier": 3,
      "flavor": "See through the noise. The surface is a distraction.",
      "rewardMultiplier": 2.0,
      "hintLevel": "low",
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
      "tier": 4,
      "flavor": "The data speaks in riddles. Only the pattern remains.",
      "rewardMultiplier": 3.0,
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
