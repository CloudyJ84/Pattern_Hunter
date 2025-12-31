export default [
  {
    "id": "band_initiate",
    "levels": [
      1,
      2,
      3
    ],
    "datasetSize": {
      "rows": 3,
      "cols": 3
    },
    "datasetTypes": [
      "numbers"
    ],
    "patternTypes": {
      "numbers": [
        "rising_flame",
        "falling_stone"
      ]
    },
    "questionTypes": {
      "numbers": [
        "countAboveThreshold"
      ]
    },
    "difficulty": {
      "patternComplexity": 1,
      "questionComplexity": 1,
      "formattingComplexity": 1
    },
    "tierScaling": {
      "minTier": "SCOUT",
      "maxTier": "SCOUT",
      "recommendedTier": "SCOUT"
    },
    "unlocks": {
      "glyphs": [
        "above"
      ],
      "datasetTypes": [
        "numbers"
      ]
    },
    "notes": "The Initiate's Path. Simple numeric thresholds to teach the mechanics of the Lens."
  },
  {
    "id": "band_apprentice",
    "levels": [
      4,
      5,
      6
    ],
    "datasetSize": {
      "rows": 4,
      "cols": 4
    },
    "datasetTypes": [
      "numbers",
      "dates",
      "times"
    ],
    "patternTypes": {
      "numbers": [
        "peak_valley",
        "rising_flame"
      ],
      "dates": [
        "twin_suns",
        "time_anchor"
      ],
      "times": [
        "meridian_shift",
        "chrono_limit"
      ]
    },
    "questionTypes": {
      "numbers": [
        "whichValueIsHighest",
        "whichValueIsLowest",
        "countAboveThreshold"
      ],
      "dates": [
        "countWeekendDates",
        "howManyInRange"
      ],
      "times": [
        "howManyPmTimes",
        "whichTimeIsEarliest"
      ]
    },
    "difficulty": {
      "patternComplexity": 2,
      "questionComplexity": 2,
      "formattingComplexity": 2
    },
    "tierScaling": {
      "minTier": "SCOUT",
      "maxTier": "HUNTER",
      "recommendedTier": "HUNTER"
    },
    "unlocks": {
      "lensModes": [
        "lens_focus"
      ],
      "datasetTypes": [
        "dates",
        "times"
      ]
    },
    "notes": "The Apprentice's Trials. Introduction of temporal data and extreme value logic."
  },
  {
    "id": "band_adept",
    "levels": [
      7,
      8,
      9,
      10
    ],
    "datasetSize": {
      "rows": 5,
      "cols": 5
    },
    "datasetTypes": [
      "numbers",
      "dates",
      "times",
      "categories"
    ],
    "patternTypes": {
      "numbers": [
        "convergence",
        "broken_pattern",
        "peak_valley"
      ],
      "dates": [
        "day_alignment",
        "temporal_rift"
      ],
      "times": [
        "hour_glass",
        "dawn_dusk"
      ],
      "categories": [
        "echo",
        "silent_note",
        "lone_star"
      ]
    },
    "questionTypes": {
      "numbers": [
        "whichValueIsOutlier",
        "whichValueIsHighest",
        "whichValueIsLowest"
      ],
      "dates": [
        "mostFrequentWeekday",
        "howManyInRange"
      ],
      "times": [
        "whichTimesInRange",
        "howManyPmTimes"
      ],
      "categories": [
        "whichCategoryIsUnique",
        "howManyTimesCategoryAppears"
      ]
    },
    "difficulty": {
      "patternComplexity": 3,
      "questionComplexity": 3,
      "formattingComplexity": 3
    },
    "tierScaling": {
      "minTier": "HUNTER",
      "maxTier": "TRACKER",
      "recommendedTier": "TRACKER"
    },
    "unlocks": {
      "datasetTypes": [
        "categories"
      ],
      "patternFamilies": [
        "clustering",
        "uniqueness"
      ]
    },
    "notes": "The Adept's Challenge. Complex clustering and categorical taxonomy. Full variety."
  },
  {
    "id": "band_mastery_endless",
    "levels": "endless",
    "datasetSize": {
      "rows": 6,
      "cols": 6
    },
    "datasetTypes": [
      "numbers",
      "dates",
      "times",
      "categories"
    ],
    "patternTypes": {
      "numbers": "ALL_SAFE",
      "dates": "ALL_SAFE",
      "times": "ALL_SAFE",
      "categories": "ALL_SAFE"
    },
    "questionTypes": {
      "numbers": "ALL_SAFE",
      "dates": "ALL_SAFE",
      "times": "ALL_SAFE",
      "categories": "ALL_SAFE"
    },
    "difficulty": {
      "patternComplexity": 5,
      "questionComplexity": 5,
      "formattingComplexity": 5
    },
    "tierScaling": {
      "minTier": "TRACKER",
      "maxTier": "MYTHIC",
      "recommendedTier": "SEER"
    },
    "notes": "The Void. Endless scaling with dynamic grid sizes and all safe patterns enabled."
  }
];
