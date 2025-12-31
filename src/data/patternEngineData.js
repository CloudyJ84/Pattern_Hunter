export default {
  "numbers": {
    "rising_flame": {
      "id": "rising_flame",
      "label": "Rising Flame",
      "difficulty": 1,
      "category": "threshold",
      "requires": {
        "datasetType": "numbers",
        "minRows": 5
      },
      "semantics": {
        "structure": "elevation",
        "location": "scattered",
        "visibility": "highlighted_values",
        "playerGoal": "identify values ascending above the mean",
        "questionFocus": [
          "countAboveThreshold",
          "whichValueIsHighlighted"
        ]
      },
      "contextRequirements": {
        "requiresHighlightedCells": true
      },
      "context": {
        "glyphsToActivate": [
          "above"
        ],
        "lensSummaries": [
          "stats"
        ],
        "highlightColumn": false
      },
      "questionHints": {
        "preferredQuestionTypes": [
          "countAboveThreshold"
        ],
        "avoidQuestionTypes": [
          "countBelowThreshold",
          "whichValueIsLowest"
        ]
      },
      "scoring": {
        "basePoints": 100,
        "difficultyMultiplier": 1.0,
        "bonusConditions": [
          "noHints"
        ]
      }
    },
    "falling_stone": {
      "id": "falling_stone",
      "label": "Falling Stone",
      "difficulty": 1,
      "category": "threshold",
      "requires": {
        "datasetType": "numbers",
        "minRows": 5
      },
      "semantics": {
        "structure": "depression",
        "location": "scattered",
        "visibility": "highlighted_values",
        "playerGoal": "identify values sinking below the mean",
        "questionFocus": [
          "countBelowThreshold",
          "whichValueIsHighlighted"
        ]
      },
      "contextRequirements": {
        "requiresHighlightedCells": true
      },
      "context": {
        "glyphsToActivate": [
          "below"
        ],
        "lensSummaries": [
          "stats"
        ],
        "highlightColumn": false
      },
      "questionHints": {
        "preferredQuestionTypes": [
          "countBelowThreshold"
        ],
        "avoidQuestionTypes": [
          "countAboveThreshold",
          "whichValueIsHighest"
        ]
      },
      "scoring": {
        "basePoints": 100,
        "difficultyMultiplier": 1.0,
        "bonusConditions": [
          "noHints"
        ]
      }
    },
    "broken_pattern": {
      "id": "broken_pattern",
      "label": "Broken Pattern",
      "difficulty": 2,
      "category": "outlier",
      "requires": {
        "datasetType": "numbers",
        "minRows": 5
      },
      "semantics": {
        "structure": "deviation",
        "location": "single_point",
        "visibility": "highlighted_value",
        "playerGoal": "find the statistical anomaly",
        "questionFocus": [
          "whichValueIsOutlier",
          "rowWithOutlier"
        ]
      },
      "contextRequirements": {
        "requiresHighlightedCells": true
      },
      "context": {
        "glyphsToActivate": [
          "outlier"
        ],
        "lensSummaries": [
          "stats"
        ],
        "highlightColumn": false
      },
      "questionHints": {
        "preferredQuestionTypes": [
          "whichValueIsOutlier",
          "whichValueIsHighest",
          "whichValueIsLowest"
        ],
        "avoidQuestionTypes": [
          "whichClusterIsLargest"
        ]
      },
      "scoring": {
        "basePoints": 150,
        "difficultyMultiplier": 1.5,
        "bonusConditions": [
          "firstTry"
        ]
      }
    },
    "convergence": {
      "id": "convergence",
      "label": "Convergence",
      "difficulty": 2,
      "category": "cluster",
      "requires": {
        "datasetType": "numbers",
        "minRows": 10
      },
      "semantics": {
        "structure": "grouping",
        "location": "value_band",
        "visibility": "highlighted_cluster",
        "playerGoal": "identify the dense grouping of values",
        "questionFocus": [
          "howManyInCluster",
          "whichClusterIsLargest"
        ]
      },
      "contextRequirements": {
        "requiresHighlightedCells": true,
        "requiresRange": true
      },
      "context": {
        "glyphsToActivate": [
          "cluster"
        ],
        "lensSummaries": [
          "stats"
        ],
        "highlightRange": true
      },
      "questionHints": {
        "preferredQuestionTypes": [
          "whichValueIsHighlighted"
        ],
        "avoidQuestionTypes": [
          "whichValueIsOutlier"
        ]
      },
      "scoring": {
        "basePoints": 120,
        "difficultyMultiplier": 1.2
      }
    },
    "peak_valley": {
      "id": "peak_valley",
      "label": "Peak and Valley",
      "difficulty": 1,
      "category": "extremes",
      "requires": {
        "datasetType": "numbers"
      },
      "semantics": {
        "structure": "boundary",
        "location": "extremities",
        "visibility": "highlighted_min_max",
        "playerGoal": "find the absolute limits of the dataset",
        "questionFocus": [
          "whichValueIsLowest",
          "whichValueIsHighest"
        ]
      },
      "contextRequirements": {
        "requiresHighlightedCells": true
      },
      "context": {
        "glyphsToActivate": [
          "unique"
        ],
        "lensSummaries": [
          "stats"
        ],
        "highlightColumn": false
      },
      "questionHints": {
        "preferredQuestionTypes": [
          "whichValueIsLowest",
          "whichValueIsHighest"
        ],
        "avoidQuestionTypes": [
          "whichClusterIsLargest"
        ]
      },
      "scoring": {
        "basePoints": 80,
        "difficultyMultiplier": 1.0
      }
    }
  },
  "dates": {
    "twin_suns": {
      "id": "twin_suns",
      "label": "Twin Suns",
      "difficulty": 2,
      "category": "weekend",
      "requires": {
        "datasetType": "dates",
        "minRows": 7
      },
      "semantics": {
        "structure": "recurrence",
        "location": "scattered",
        "visibility": "highlighted_weekends",
        "playerGoal": "identify the days of rest",
        "questionFocus": [
          "countWeekendDates",
          "whichDateIsHighlighted"
        ]
      },
      "contextRequirements": {
        "requiresHighlightedCells": true
      },
      "context": {
        "glyphsToActivate": [
          "weekend"
        ],
        "lensSummaries": [
          "frequencySummary"
        ],
        "highlightColumn": false
      },
      "questionHints": {
        "preferredQuestionTypes": [
          "countWeekendDates"
        ],
        "avoidQuestionTypes": [
          "whichDateIsEarliest",
          "whichDateIsLatest"
        ]
      },
      "scoring": {
        "basePoints": 110,
        "difficultyMultiplier": 1.2
      }
    },
    "day_alignment": {
      "id": "day_alignment",
      "label": "Day Alignment",
      "difficulty": 2,
      "category": "frequency",
      "requires": {
        "datasetType": "dates",
        "minRows": 7
      },
      "semantics": {
        "structure": "repetition",
        "location": "scattered",
        "visibility": "highlighted_weekday",
        "playerGoal": "spot the repeating day of the week",
        "questionFocus": [
          "mostFrequentWeekday",
          "countWeekendDates"
        ]
      },
      "contextRequirements": {
        "requiresHighlightedCells": true
      },
      "context": {
        "glyphsToActivate": [
          "frequency"
        ],
        "lensSummaries": [
          "frequencySummary"
        ],
        "highlightColumn": false
      },
      "questionHints": {
        "preferredQuestionTypes": [
          "mostFrequentWeekday"
        ],
        "avoidQuestionTypes": [
          "whichCategoryIsUnique"
        ]
      },
      "scoring": {
        "basePoints": 120,
        "difficultyMultiplier": 1.3
      }
    },
    "time_anchor": {
      "id": "time_anchor",
      "label": "Time Anchor",
      "difficulty": 1,
      "category": "extremes",
      "requires": {
        "datasetType": "dates"
      },
      "semantics": {
        "structure": "boundary",
        "location": "extremities",
        "visibility": "highlighted_earliest_latest",
        "playerGoal": "find the beginning or the end",
        "questionFocus": [
          "rowWithEarliestDate",
          "whichDateIsLatest"
        ]
      },
      "contextRequirements": {
        "requiresHighlightedCells": true
      },
      "context": {
        "glyphsToActivate": [
          "unique"
        ],
        "lensSummaries": [
          "stats"
        ],
        "highlightColumn": false
      },
      "questionHints": {
        "preferredQuestionTypes": [
          "rowWithEarliestDate"
        ],
        "avoidQuestionTypes": [
          "countWeekendDates"
        ]
      },
      "scoring": {
        "basePoints": 90,
        "difficultyMultiplier": 1.0
      }
    },
    "temporal_rift": {
      "id": "temporal_rift",
      "label": "Temporal Rift",
      "difficulty": 2,
      "category": "range",
      "requires": {
        "datasetType": "dates",
        "minRows": 10
      },
      "semantics": {
        "structure": "continuity",
        "location": "range",
        "visibility": "highlighted_range",
        "playerGoal": "identify a continuous block of time",
        "questionFocus": [
          "whichDatesInRange",
          "howManyInRange"
        ]
      },
      "contextRequirements": {
        "requiresHighlightedCells": true,
        "requiresRange": true
      },
      "context": {
        "glyphsToActivate": [
          "frequency"
        ],
        "lensSummaries": [
          "stats"
        ],
        "highlightRange": true
      },
      "questionHints": {
        "preferredQuestionTypes": [
          "whichDateIsHighlighted"
        ],
        "avoidQuestionTypes": [
          "whichValueIsOutlier"
        ]
      },
      "scoring": {
        "basePoints": 130,
        "difficultyMultiplier": 1.4
      }
    }
  },
  "times": {
    "dawn_dusk": {
      "id": "dawn_dusk",
      "label": "Dawn and Dusk",
      "difficulty": 1,
      "category": "threshold",
      "requires": {
        "datasetType": "times"
      },
      "semantics": {
        "structure": "boundary_exclusion",
        "location": "scattered",
        "visibility": "highlighted_extremes",
        "playerGoal": "identify times outside standard business hours",
        "questionFocus": [
          "countEarlyOrLate",
          "whichTimeIsHighlighted"
        ]
      },
      "contextRequirements": {
        "requiresHighlightedCells": true
      },
      "context": {
        "glyphsToActivate": [
          "outlier"
        ],
        "lensSummaries": [
          "stats"
        ],
        "highlightColumn": false
      },
      "questionHints": {
        "preferredQuestionTypes": [
          "whichTimeIsHighlighted"
        ],
        "avoidQuestionTypes": [
          "mostFrequentWeekday"
        ]
      },
      "scoring": {
        "basePoints": 100,
        "difficultyMultiplier": 1.1
      }
    },
    "meridian_shift": {
      "id": "meridian_shift",
      "label": "Meridian Shift",
      "difficulty": 1,
      "category": "binary",
      "requires": {
        "datasetType": "times"
      },
      "semantics": {
        "structure": "division",
        "location": "scattered",
        "visibility": "highlighted_pm",
        "playerGoal": "distinguish post-meridian times",
        "questionFocus": [
          "howManyPmTimes",
          "whichTimeIsPm"
        ]
      },
      "contextRequirements": {
        "requiresHighlightedCells": true
      },
      "context": {
        "glyphsToActivate": [
          "above"
        ],
        "lensSummaries": [
          "categoryCounts"
        ],
        "highlightColumn": false
      },
      "questionHints": {
        "preferredQuestionTypes": [
          "howManyPmTimes"
        ],
        "avoidQuestionTypes": [
          "whichCategoryIsUnique"
        ]
      },
      "scoring": {
        "basePoints": 90,
        "difficultyMultiplier": 1.0
      }
    },
    "chrono_limit": {
      "id": "chrono_limit",
      "label": "Chronological Limit",
      "difficulty": 1,
      "category": "extremes",
      "requires": {
        "datasetType": "times"
      },
      "semantics": {
        "structure": "boundary",
        "location": "extremities",
        "visibility": "highlighted_min_max",
        "playerGoal": "find the earliest or latest timestamp",
        "questionFocus": [
          "whichTimeIsEarliest",
          "whichTimeIsLatest"
        ]
      },
      "contextRequirements": {
        "requiresHighlightedCells": true
      },
      "context": {
        "glyphsToActivate": [
          "unique"
        ],
        "lensSummaries": [
          "stats"
        ],
        "highlightColumn": false
      },
      "questionHints": {
        "preferredQuestionTypes": [
          "whichTimeIsEarliest"
        ],
        "avoidQuestionTypes": [
          "mostFrequentWeekday"
        ]
      },
      "scoring": {
        "basePoints": 80,
        "difficultyMultiplier": 1.0
      }
    },
    "hour_glass": {
      "id": "hour_glass",
      "label": "Hourglass",
      "difficulty": 2,
      "category": "range",
      "requires": {
        "datasetType": "times"
      },
      "semantics": {
        "structure": "concentration",
        "location": "range",
        "visibility": "highlighted_window",
        "playerGoal": "identify times within a specific window",
        "questionFocus": [
          "howManyInTimeRange",
          "whichTimesInRange"
        ]
      },
      "contextRequirements": {
        "requiresHighlightedCells": true,
        "requiresRange": true
      },
      "context": {
        "glyphsToActivate": [
          "frequency"
        ],
        "lensSummaries": [
          "stats"
        ],
        "highlightRange": true
      },
      "questionHints": {
        "preferredQuestionTypes": [
          "howManyInTimeRange"
        ],
        "avoidQuestionTypes": [
          "whichValueIsOutlier"
        ]
      },
      "scoring": {
        "basePoints": 120,
        "difficultyMultiplier": 1.2
      }
    }
  },
  "categories": {
    "echo": {
      "id": "echo",
      "label": "Echo of the Archive",
      "difficulty": 2,
      "category": "frequency",
      "requires": {
        "datasetType": "categories",
        "minRows": 5
      },
      "semantics": {
        "structure": "repetition",
        "location": "scattered",
        "visibility": "highlighted_frequency",
        "playerGoal": "identify the most frequent category",
        "questionFocus": [
          "howManyTimesCategoryAppears",
          "whichCategoryIsMostFrequent"
        ]
      },
      "contextRequirements": {
        "requiresHighlightedCells": true
      },
      "context": {
        "glyphsToActivate": [
          "frequency"
        ],
        "lensSummaries": [
          "frequencySummary"
        ],
        "highlightColumn": false
      },
      "questionHints": {
        "preferredQuestionTypes": [
          "howManyTimesCategoryAppears"
        ],
        "avoidQuestionTypes": [
          "whichCategoryIsUnique"
        ]
      },
      "scoring": {
        "basePoints": 100,
        "difficultyMultiplier": 1.1
      }
    },
    "silent_note": {
      "id": "silent_note",
      "label": "The Silent Note",
      "difficulty": 3,
      "category": "unique",
      "requires": {
        "datasetType": "categories",
        "minRows": 5
      },
      "semantics": {
        "structure": "isolation",
        "location": "single_point",
        "visibility": "highlighted_unique",
        "playerGoal": "find the category that appears exactly once",
        "questionFocus": [
          "whichCategoryIsUnique",
          "rowWithUniqueCategory"
        ]
      },
      "contextRequirements": {
        "requiresHighlightedCells": true
      },
      "context": {
        "glyphsToActivate": [
          "unique"
        ],
        "lensSummaries": [
          "categoryCounts"
        ],
        "highlightColumn": false
      },
      "questionHints": {
        "preferredQuestionTypes": [
          "whichCategoryIsUnique"
        ],
        "avoidQuestionTypes": [
          "howManyTimesCategoryAppears",
          "whichCategoryIsMostFrequent"
        ]
      },
      "scoring": {
        "basePoints": 150,
        "difficultyMultiplier": 1.4
      }
    },
    "lone_star": {
      "id": "lone_star",
      "label": "The Lone Star",
      "difficulty": 3,
      "category": "unique",
      "requires": {
        "datasetType": "categories",
        "minRows": 5
      },
      "semantics": {
        "structure": "singularity",
        "location": "single_point",
        "visibility": "highlighted_unique",
        "playerGoal": "identify the anomaly in the pattern",
        "questionFocus": [
          "whichCategoryIsUnique",
          "howManyUniqueCategories"
        ]
      },
      "contextRequirements": {
        "requiresHighlightedCells": true
      },
      "context": {
        "glyphsToActivate": [
          "unique"
        ],
        "lensSummaries": [
          "categoryCounts"
        ],
        "highlightColumn": false
      },
      "questionHints": {
        "preferredQuestionTypes": [
          "whichCategoryIsUnique"
        ],
        "avoidQuestionTypes": [
          "howManyTimesCategoryAppears"
        ]
      },
      "scoring": {
        "basePoints": 150,
        "difficultyMultiplier": 1.4
      }
    },
    "vector_alignment": {
      "id": "vector_alignment",
      "label": "Vector Alignment",
      "difficulty": 2,
      "category": "sequence",
      "requires": {
        "datasetType": "categories",
        "minRows": 4,
        "minCols": 2
      },
      "semantics": {
        "structure": "linearity",
        "location": "row_or_column",
        "visibility": "highlighted_vector",
        "playerGoal": "find the row or column filled with a single category",
        "questionFocus": [
          "whichRowHasPattern",
          "whichColumnHasPattern"
        ]
      },
      "contextRequirements": {
        "requiresHighlightedCells": true,
        "requiresColumnStructure": true
      },
      "context": {
        "glyphsToActivate": [
          "sequence"
        ],
        "lensSummaries": [
          "categoryCounts"
        ],
        "highlightColumn": true
      },
      "questionHints": {
        "preferredQuestionTypes": [
          "whichRowHasPattern",
          "whichColumnHasPattern"
        ],
        "avoidQuestionTypes": [
          "whichCategoryIsUnique"
        ]
      },
      "scoring": {
        "basePoints": 130,
        "difficultyMultiplier": 1.3
      }
    }
  }
};
