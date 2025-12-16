// Responsible for injecting patterns and determining which cells match logic

let rules = null;

export function initPatternEngine(patternEngineConfig) {
    rules = patternEngineConfig;
}

// --- Injection Logic ---

export function injectPattern(dataset, datasetType, patternType) {
    if (!rules) throw new Error("PatternEngine not initialized");
    
    // Safety check for valid pattern
    if (!rules[datasetType] || !rules[datasetType][patternType]) {
        console.warn(`Pattern ${patternType} not found for ${datasetType}. Skipping injection.`);
        return dataset;
    }

    const flatList = dataset.flat();
    
    switch (patternType) {
        // --- Dates ---
        case 'weekendHighlight':
            ensureCondition(flatList, (cell) => {
                const day = cell.value.getDay();
                return day === 0 || day === 6;
            }, (cell) => {
                // Force to nearest Saturday
                const d = new Date(cell.value);
                d.setDate(d.getDate() + (6 - d.getDay())); 
                cell.value = d;
            });
            break;

        case 'weekdayCluster':
            // Inject 3 dates with the same weekday (e.g., Monday)
            injectCluster(flatList, 3, (cell) => {
                const targetDay = 1; // Monday
                const d = new Date(cell.value);
                const diff = targetDay - d.getDay();
                d.setDate(d.getDate() + diff);
                cell.value = d;
            });
            break;

        case 'earliestOrLatest':
            // Force a very old date
            const targetMin = flatList[Math.floor(Math.random() * flatList.length)];
            const d = new Date(); 
            d.setFullYear(d.getFullYear() - 2);
            targetMin.value = d; 
            break;
            
        case 'dateRange':
            // Inject sequential days starting from today
            const startRange = new Date();
            injectCluster(flatList, 3, (cell, i) => {
                const d = new Date(startRange);
                d.setDate(d.getDate() + i); 
                cell.value = d;
            });
            break;

        // --- Numbers ---
        case 'aboveThreshold':
            ensureCondition(flatList, c => c.value > 80, c => c.value = 85 + Math.floor(Math.random() * 10));
            break;
            
        case 'belowThreshold':
            ensureCondition(flatList, c => c.value < 20, c => c.value = 5 + Math.floor(Math.random() * 10));
            break;

        case 'outlier':
            flatList[Math.floor(Math.random() * flatList.length)].value = 999;
            break;
            
        case 'cluster':
            injectCluster(flatList, 4, c => c.value = 50 + Math.floor(Math.random() * 3));
            break;

        case 'maxOrMin':
            flatList[0].value = 100; // Simplistic max injection
            break;

        // --- Categories ---
        case 'mostFrequent':
            injectCluster(flatList, 4, c => c.value = 'A');
            break;
            
        case 'uniqueCategory':
            // Clean 'Z' from existing, then inject one 'Z'
            flatList.forEach(c => { if(c.value === 'Z') c.value = 'B'; });
            flatList[Math.floor(Math.random() * flatList.length)].value = 'Z';
            break;

        case 'rowOrColumnPattern':
            // Fill first row
            const firstVal = dataset[0][0].value;
            dataset[0].forEach(cell => cell.value = firstVal);
            break;

        // --- Times ---
        case 'earlyLate':
            ensureCondition(flatList, c => parseInt(c.value) < 10, c => c.value = "09:00");
            break;
            
        case 'amPm':
            ensureCondition(flatList, c => parseInt(c.value) >= 12, c => c.value = "14:00");
            break;
            
        case 'earliestLatest':
            flatList[0].value = "00:01";
            break;
            
        case 'timeRange':
            injectCluster(flatList, 3, c => c.value = "13:00");
            break;
    }
    return dataset;
}

// Helpers
function ensureCondition(list, predicate, fixer) {
    if (!list.some(predicate)) {
        const cell = list[Math.floor(Math.random() * list.length)];
        fixer(cell);
    }
}

function injectCluster(list, count, fixer) {
    let indices = new Set();
    while(indices.size < count && indices.size < list.length) {
        indices.add(Math.floor(Math.random() * list.length));
    }
    let i = 0;
    indices.forEach(idx => {
        fixer(list[idx], i);
        i++;
    });
}

// --- Highlight Logic ---

export function applyHighlightLogic(dataset, datasetType, patternType) {
    if (!rules) throw new Error("PatternEngine not initialized");
    
    const flatList = dataset.flat();
    const values = flatList.map(c => c.value);

    // Hardcoded thresholds for this prototype
    const thresholdHigh = 80;
    const thresholdLow = 20;
    
    switch (patternType) {
        case 'weekendHighlight':
            return flatList.filter(c => {
                const d = c.value.getDay();
                return d === 0 || d === 6;
            });
        
        case 'weekdayCluster':
            // Find most frequent day
            const days = values.map(v => v.getDay());
            const counts = {};
            days.forEach(d => counts[d] = (counts[d]||0)+1);
            const freqDay = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
            return flatList.filter(c => c.value.getDay() == freqDay);

        case 'earliestOrLatest':
        case 'earliestLatest':
        case 'maxOrMin':
             // Sort by value (Works for numbers and dates)
             const sorted = [...flatList].sort((a,b) => {
                 if (a.value < b.value) return -1;
                 if (a.value > b.value) return 1;
                 return 0;
             });
             // Highlight min and max
             return [sorted[0], sorted[sorted.length-1]];

        case 'dateRange':
             // Highlighting simplified: return the injected sequential dates logic 
             // (In real app, we'd store the injected range start/end)
             // Here we assume checking for "today" range injected above
             return flatList.filter(c => {
                 const diff = Math.abs(new Date().getTime() - c.value.getTime());
                 return diff < (4 * 24 * 60 * 60 * 1000); // within 4 days
             });

        case 'aboveThreshold':
            return flatList.filter(c => c.value > thresholdHigh);
            
        case 'belowThreshold':
            return flatList.filter(c => c.value < thresholdLow);

        case 'outlier':
            return flatList.filter(c => c.value === 999); 
            
        case 'cluster':
             return flatList.filter(c => c.value >= 50 && c.value <= 55);

        case 'mostFrequent':
            const countsC = {};
            values.forEach(v => countsC[v] = (countsC[v]||0)+1);
            const freqC = Object.keys(countsC).reduce((a, b) => countsC[a] > countsC[b] ? a : b);
            return flatList.filter(c => c.value == freqC);

        case 'uniqueCategory':
        case 'leastFrequent':
            const countsU = {};
            values.forEach(v => countsU[v] = (countsU[v]||0)+1);
            return flatList.filter(c => countsU[c.value] === 1);

        case 'rowOrColumnPattern':
            for (let row of dataset) {
                if (row.every(c => c.value === row[0].value)) return row;
            }
            return []; // Simplified (only checks rows)

        case 'earlyLate':
            return flatList.filter(c => parseInt(c.value) < 10 || parseInt(c.value) > 16);

        case 'amPm':
            return flatList.filter(c => parseInt(c.value) >= 12);
            
        case 'timeRange':
             return flatList.filter(c => parseInt(c.value) === 13);

        default:
            return [];
    }
}