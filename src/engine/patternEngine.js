/**
 * patternEngine.js
 * A semantic, metadata-driven engine that constructs meaningful data patterns
 * for the Pattern Hunter "Trial of the Field".
 *
 * Refactored to use patternEngineData.js as the single source of truth.
 */

import patternDefinitions from '../data/patternEngineData.js';

// --- Pattern Logic Registry (Behavioral Implementation) ---
/**
 * Maps mythic pattern IDs to their specific inject and highlight logic.
 * This separates the "what" (JSON metadata) from the "how" (code).
 */
const PATTERN_LOGIC = {
  // --- Categories: Echo (Frequency) ---
  echo: {
    datasetType: 'categories',
    inject: (dataset, params) => {
      const flat = dataset.flat();
      const targetCount = params.count || 3;
      // Pick a random existing value to duplicate
      const targetValue = flat[Math.floor(Math.random() * flat.length)].value;

      const targetCells = _pickRandomCells(flat, targetCount);
      targetCells.forEach(cell => cell.value = targetValue);

      return { targetCells, targetValue };
    },
    highlight: (val, context) => val === context.targetValue
  },

  // --- Categories: Silent Note / Lone Star (Unique) ---
  silent_note: {
    datasetType: 'categories',
    inject: (dataset, params) => _injectUniqueCategory(dataset, params),
    highlight: (val, context) => val === context.targetValue
  },
  lone_star: {
    datasetType: 'categories',
    inject: (dataset, params) => _injectUniqueCategory(dataset, params),
    highlight: (val, context) => val === context.targetValue
  },

  // --- Numbers: Broken Pattern (Outlier - High) ---
  broken_pattern: {
    datasetType: 'numbers',
    inject: (dataset, params) => {
      const flat = dataset.flat();
      const nums = flat.map(c => parseFloat(c.value)).filter(n => !isNaN(n));
      if (!nums.length) return { targetCells: [] };

      const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
      // Create a significant outlier
      const outlierVal = Math.floor(mean * 2.5) + 100;

      const targetCell = _pickRandomCells(flat, 1)[0];
      targetCell.value = outlierVal;

      return { targetCells: [targetCell], targetValue: outlierVal };
    },
    highlight: (val, context) => parseFloat(val) === context.targetValue
  },

  // --- Numbers: Falling Stone (Threshold - Low/Min) ---
  falling_stone: {
    datasetType: 'numbers',
    inject: (dataset, params) => {
      const flat = dataset.flat();
      const nums = flat.map(c => parseFloat(c.value)).filter(n => !isNaN(n));
      if (!nums.length) return { targetCells: [] };

      const min = Math.min(...nums);
      const deepVal = Math.floor(min / 2); // Force new min significantly lower

      const targetCell = _pickRandomCells(flat, 1)[0];
      targetCell.value = deepVal;

      return { targetCells: [targetCell], targetValue: deepVal };
    },
    highlight: (val, context) => parseFloat(val) === context.targetValue
  },

  // --- Dates: Twin Suns (Weekend) ---
  twin_suns: {
    datasetType: 'dates',
    inject: (dataset, params) => {
      const flat = dataset.flat();
      const targetCount = params.count || 2;
      const targetCells = _pickRandomCells(flat, targetCount);

      const weekends = ["2023-10-21", "2023-10-22", "2023-10-28", "2023-10-29"]; // Mock samples

      targetCells.forEach((cell, i) => {
        cell.value = new Date(weekends[i % weekends.length]);
      });

      return { targetCells, weekends };
    },
    highlight: (val, context) => {
      if (!context.weekends) return false;
      const valStr = val instanceof Date 
        ? val.toISOString().split('T')[0] 
        : String(val);
      return context.weekends.includes(valStr);
    }
  }
  
  // Note: Patterns without explicit logic here (like vector_alignment, convergence, etc.)
  // will fallback to metadata-only patterns (ghost patterns) or use a default no-op inject
  // as defined in the registry build process below.
};


// --- Runtime Registry Construction ---

/**
 * PATTERN_REGISTRY is the merged runtime object containing
 * metadata (from JSON) + logic (from PATTERN_LOGIC).
 */
const PATTERN_REGISTRY = {};

function _buildRegistry(definitions) {
  const registry = {};
  for (const datasetType of Object.keys(definitions)) {
    registry[datasetType] = {};
    for (const patternId of Object.keys(definitions[datasetType])) {
      const def = definitions[datasetType][patternId];
      const logic = PATTERN_LOGIC[patternId] || {};

      registry[datasetType][patternId] = {
        ...def,
        // Bind inject/highlight logic, defaulting to safe no-ops if undefined
        inject: logic.inject || ((dataset) => ({ targetCells: [] })),
        highlight: logic.highlight || (() => false),
      };
    }
  }
  return registry;
}

// Initial build from imported JSON
let currentRegistry = _buildRegistry(patternDefinitions);
let configDefinitions = null; // Allows override via init


// --- Initialization ---

export function initPatternEngine(config) {
  if (config && config.patternDefinitions) {
    configDefinitions = config.patternDefinitions;
    // Rebuild registry if config overrides are provided
    currentRegistry = _buildRegistry(configDefinitions);
  }
}

export function destroyPatternEngine() {
  configDefinitions = null;
  currentRegistry = _buildRegistry(patternDefinitions); // Reset to default
}


// --- Main Engine Logic ---

/**
 * Semantic Injection System.
 * Selects a pattern from the Registry and executes its logic.
 */
export function injectPattern(dataset, datasetType, patternType, thresholdConfig = {}) {
  
  // 1. Resolve Pattern from Registry
  const patternObj = _resolvePattern(datasetType, patternType);

  // 2. Validate Requirements (Fallback if invalid or missing definition)
  if (!_checkRequirements(patternObj, dataset, datasetType)) {
    console.warn(`Pattern requirements failed or definition missing for ${patternType}. Falling back.`);
    return { 
      dataset, 
      targetCells: [], 
      patternType: 'none', 
      meta: _createFallbackMeta('none', thresholdConfig)
    }; 
  }

  // 3. Execute Injection Logic
  // Logic is now attached directly to the pattern object in the registry
  let result = { targetCells: [] };
  
  if (patternObj.inject) {
    result = patternObj.inject(dataset, {});
  } else {
    console.log(`No inject logic defined for ${patternObj.id}, treating as metadata-only pattern.`);
  }

  // 4. Validate Injection Purity (Guardrail)
  if (!_validateInjectedValues(dataset, datasetType, result.targetCells, patternType)) {
    console.warn("Pattern injection produced invalid value types for datasetType:", datasetType, "patternType:", patternType);
    return {
      dataset,
      targetCells: [],
      patternType: 'none',
      params: {},
      meta: _createFallbackMeta(patternType, thresholdConfig)
    };
  }

  // 5. Construct Metadata
  // Uses canonical properties from the JSON source (patternObj)
  const meta = {
    id: patternObj.id,
    label: patternObj.label,
    category: patternObj.category,
    
    // Scoring: Merge JSON scoring with Tier Multiplier
    scoring: {
      ...(patternObj.scoring || {}),
      tierMultiplier: _getTierMultiplier(thresholdConfig)
    },

    // Query Engine Hooks: Directly from JSON
    questionHints: patternObj.questionHints || {},

    // UI Context Hooks: From JSON context + dynamic results
    uiContext: {
      ...(patternObj.context || {}),
      targetCellsCount: result.targetCells.length
    },

    // Sigil: Use default since JSON doesn't specify icons, 
    // or derived from category if needed.
    sigil: {
      icon: '🔮', // Default
      type: (patternObj.category || 'UNKNOWN').toUpperCase(),
      hint: patternObj.semantics?.playerGoal || 'Analyze the grid.'
    },

    // Lens Metadata: From JSON context
    lens: {
      type: patternObj.context?.lensType || 'none',
      summaries: patternObj.context?.lensSummaries || []
    },

    // Glyph Metadata: From JSON context
    glyphs: {
      activate: patternObj.context?.glyphsToActivate || [],
      metadata: {} 
    },
    
    // Data needed for highlighting later
    injectionResult: result
  };

  return {
    dataset,
    targetCells: result.targetCells,
    patternType: patternObj.id,
    params: result, 
    meta: meta      
  };
}

/**
 * Highlight Logic Delegate.
 * Resolves pattern registry object -> applies attached highlight logic.
 */
export function applyHighlightLogic(dataset, datasetType, patternType, injectionResult) {
  const patternObj = _resolvePattern(datasetType, patternType);

  if (!patternObj || !patternObj.highlight || !injectionResult) return [];

  const flat = dataset.flat();
  return flat.filter(cell => patternObj.highlight(cell.value, injectionResult));
}


// --- Internal Helpers ---

function _resolvePattern(datasetType, patternType) {
  const group = currentRegistry[datasetType];
  if (group && group[patternType]) return group[patternType];
  return null;
}

function _checkRequirements(patternDef, dataset, datasetType) {
  if (!patternDef) return false;
  const req = patternDef.requires || {};
  
  if (req.datasetType && req.datasetType !== datasetType) return false;
  
  // Check dataset size constraints if defined
  if (req.minRows && dataset.length < req.minRows) return false;
  if (req.minCols && dataset[0] && dataset[0].length < req.minCols) return false;

  return true;
}

function _pickRandomCells(flat, count) {
  const shuffled = [...flat].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function _injectUniqueCategory(dataset, params) {
  const flat = dataset.flat();
  const existingValues = new Set(flat.map(c => c.value));
  let uniqueVal = "Anomaly-" + Math.floor(Math.random() * 999);
  
  while(existingValues.has(uniqueVal)) {
     uniqueVal = "Anomaly-" + Math.floor(Math.random() * 999);
  }

  const targetCell = _pickRandomCells(flat, 1)[0];
  targetCell.value = uniqueVal;
  
  return { targetCells: [targetCell], targetValue: uniqueVal };
}

function _getTierMultiplier(thresholdConfig) {
  const tier = thresholdConfig.tier !== undefined ? thresholdConfig.tier : 1;
  const mults = { 0: 1.0, 1: 1.5, 2: 2.0, 3: 3.0 };
  return mults[tier] || 1.0;
}

function _validateInjectedValues(dataset, datasetType, targetCells, patternType) {
  if (!targetCells || targetCells.length === 0) return true;

  for (const cell of targetCells) {
    const val = cell.value;
    if (val === null || val === undefined) return false;

    switch (datasetType) {
      case 'numbers':
        if (typeof val !== 'number' || isNaN(val)) return false;
        break;
      case 'categories':
        if (typeof val !== 'string') return false;
        break;
      case 'dates':
        if (!(val instanceof Date) || isNaN(val.getTime())) return false;
        break;
      case 'times':
        if (typeof val !== 'string' || !/^\d{2}:\d{2}$/.test(val)) return false;
        break;
      default:
        return false;
    }
  }
  return true;
}

function _createFallbackMeta(id, thresholdConfig) {
  return {
    id: id,
    label: 'No Pattern',
    category: 'none',
    scoring: {
      basePoints: 0,
      difficultyMultiplier: 1.0,
      tierMultiplier: _getTierMultiplier(thresholdConfig)
    },
    questionHints: { preferredQuestionTypes: [], avoidQuestionTypes: [] },
    uiContext: {
      glyphsToActivate: [],
      lensSummaries: [],
      highlightColumn: false,
      targetCellsCount: 0
    },
    sigil: {
      icon: '🔮',
      type: 'FALLBACK',
      hint: 'Analyze the grid.'
    },
    lens: { type: 'none', summaries: [] },
    glyphs: { activate: [], metadata: {} }
  };
}


