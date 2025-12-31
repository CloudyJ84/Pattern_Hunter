export default {
  "datasetTypes": {
    "numbers": {
      "id": "numbers",
      "flavor": {
        "name": "The Arithmancer's Grid",
        "description": "A field of raw quantitative data where outliers and clusters hide among the noise."
      },
      "generation": {
        "cellValueType": "number",
        "ensurePatternPresence": true,
        "minValue": 1,
        "maxValue": 100
      },
      "constraints": {
        "minRows": 3,
        "minCols": 3,
        "minUniqueValues": 5,
        "structural": []
      },
      "patterns": [
        "rising_flame",
        "falling_stone",
        "broken_pattern",
        "convergence",
        "peak_valley"
      ],
      "patternCompatibility": {
        "rising_flame": {
          "allowed": true,
          "notes": "Standard threshold check."
        },
        "falling_stone": {
          "allowed": true,
          "notes": "Standard threshold check."
        },
        "broken_pattern": {
          "allowed": true,
          "notes": "Requires significant deviation from mean."
        },
        "convergence": {
          "allowed": true,
          "notes": "Requires ensuring background noise is sufficiently random."
        },
        "peak_valley": {
          "allowed": true,
          "notes": "Highlights global max or min."
        },
        "twin_suns": {
          "allowed": false,
          "notes": "Incompatible: Numeric data lacks calendar context."
        },
        "echo": {
          "allowed": false,
          "notes": "Numeric distributions handled via clusters, not strict frequency."
        }
      },
      "questionCompatibility": {
        "whichValueIsOutlier": {
          "allowed": true,
          "notes": "Find the value deviating from the set."
        },
        "countAboveThreshold": {
          "allowed": true,
          "notes": "Count values > X."
        },
        "whichValueIsHighest": {
          "allowed": true,
          "notes": "Find max."
        },
        "whichValueIsLowest": {
          "allowed": true,
          "notes": "Find min."
        },
        "whichDateIsHighlighted": {
          "allowed": false,
          "notes": "No dates present."
        }
      }
    },
    "dates": {
      "id": "dates",
      "flavor": {
        "name": "The Chronomancer's Timeline",
        "description": "A sequence of days where weekends and weekdays form temporal rhythms."
      },
      "generation": {
        "cellValueType": "date",
        "ensurePatternPresence": true,
        "rangeDaysBefore": 30,
        "rangeDaysAfter": 30
      },
      "constraints": {
        "minRows": 3,
        "minCols": 3,
        "structural": []
      },
      "patterns": [
        "twin_suns",
        "day_alignment",
        "time_anchor",
        "temporal_rift"
      ],
      "patternCompatibility": {
        "twin_suns": {
          "allowed": true,
          "notes": "Injects Saturday/Sunday."
        },
        "day_alignment": {
          "allowed": true,
          "notes": "Injects multiple matching weekdays (e.g., all Fridays)."
        },
        "time_anchor": {
          "allowed": true,
          "notes": "Earliest or latest date in set."
        },
        "temporal_rift": {
          "allowed": true,
          "notes": "Cluster of dates within a 7-day window."
        },
        "broken_pattern": {
          "allowed": false,
          "notes": "Date outliers are handled via extremes pattern."
        }
      },
      "questionCompatibility": {
        "countWeekendDates": {
          "allowed": true,
          "notes": "Identify Sat/Sun."
        },
        "howManyInRange": {
          "allowed": true,
          "notes": "Count dates between X and Y."
        },
        "mostFrequentWeekday": {
          "allowed": true,
          "notes": "Identify the day appearing most often."
        }
      }
    },
    "times": {
      "id": "times",
      "flavor": {
        "name": "The Clockwork Register",
        "description": "A precise log of moments, split by the meridian and defined by the hour."
      },
      "generation": {
        "cellValueType": "time",
        "ensurePatternPresence": true,
        "startTime": "08:00",
        "endTime": "18:00"
      },
      "constraints": {
        "minRows": 3,
        "minCols": 3,
        "structural": []
      },
      "patterns": [
        "dawn_dusk",
        "meridian_shift",
        "chrono_limit",
        "hour_glass"
      ],
      "patternCompatibility": {
        "dawn_dusk": {
          "allowed": true,
          "notes": "Early morning or late evening."
        },
        "meridian_shift": {
          "allowed": true,
          "notes": "Distinction between pre-noon and post-noon."
        },
        "chrono_limit": {
          "allowed": true,
          "notes": "Earliest start or latest finish."
        },
        "hour_glass": {
          "allowed": true,
          "notes": "Events occurring during lunch (12-14)."
        },
        "lone_star": {
          "allowed": false,
          "notes": "Time uniqueness is handled via extremes or threshold."
        }
      },
      "questionCompatibility": {
        "howManyPmTimes": {
          "allowed": true,
          "notes": "Count times > 12:00."
        },
        "whichTimeIsEarliest": {
          "allowed": true,
          "notes": "Find min time."
        },
        "whichTimesInRange": {
          "allowed": true,
          "notes": "Is time X between A and B?"
        }
      }
    },
    "categories": {
      "id": "categories",
      "flavor": {
        "name": "The Archivist's Taxonomy",
        "description": "A categorical inventory where rarity and frequency define the structure."
      },
      "generation": {
        "cellValueType": "category",
        "ensurePatternPresence": true,
        "categoryListSize": {
          "min": 3,
          "max": 6
        }
      },
      "constraints": {
        "minRows": 4,
        "minCols": 4,
        "minUniqueValues": 3,
        "structural": [
          "rowStructure",
          "columnStructure"
        ]
      },
      "patterns": [
        "echo",
        "silent_note",
        "lone_star",
        "vector_alignment"
      ],
      "patternCompatibility": {
        "echo": {
          "allowed": true,
          "notes": "Requires category pool < cell count."
        },
        "silent_note": {
          "allowed": true,
          "notes": "Single instance injection."
        },
        "lone_star": {
          "allowed": true,
          "notes": "Category X appears exactly once, effectively a 'needle in haystack'."
        },
        "vector_alignment": {
          "allowed": true,
          "notes": "Entire row or column filled with same category."
        },
        "rising_flame": {
          "allowed": false,
          "notes": "Categories cannot be numerically compared."
        }
      },
      "questionCompatibility": {
        "whichCategoryIsUnique": {
          "allowed": true,
          "notes": "Which item appears only once?"
        },
        "howManyTimesCategoryAppears": {
          "allowed": true,
          "notes": "How many X are there?"
        },
        "whichRowHasPattern": {
          "allowed": true,
          "notes": "Which row has all the same value?"
        }
      }
    }
  },
  "globalMetadata": {
    "version": "2.0.0",
    "compatibilityMode": "strict",
    "defaultScaling": "linear"
  }
};
