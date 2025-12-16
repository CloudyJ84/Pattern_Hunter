let rules = null;

export function initQuestionEngine(questionGeneratorConfig) {
    rules = questionGeneratorConfig.questionGenerator;
}

export function generateQuestion(patternType, datasetType, dataset, highlightedCells) {
    // 1. Determine allowed questions for this pattern type
    // In a real app, patternEngine.json lists specific questions allowed per pattern.
    // For this blueprint, we look up the group in questionGenerator based on datasetType.
    
    let groupKey;
    switch(datasetType) {
        case 'dates': groupKey = 'dateQuestions'; break;
        case 'numbers': groupKey = 'numberQuestions'; break;
        case 'categories': groupKey = 'categoryQuestions'; break;
        case 'times': groupKey = 'timeQuestions'; break;
    }

    const questionGroup = rules[groupKey];
    const availableQuestionTypes = Object.keys(questionGroup);
    
    // Randomly select one
    const chosenType = availableQuestionTypes[Math.floor(Math.random() * availableQuestionTypes.length)];
    const questionConfig = questionGroup[chosenType];

    const template = questionConfig.templates[0];
    const answer = computeAnswer(questionConfig.answerLogic, dataset, highlightedCells);

    return {
        text: template,
        answer: answer,
        type: chosenType
    };
}

export function computeAnswer(answerLogic, dataset, highlightedCells) {
    const flatData = dataset.flat();
    
    // Helpers
    const getValues = (cells) => cells.map(c => c.value);
    const getMin = () => flatData.reduce((min, c) => c.value < min.value ? c : min, flatData[0]);
    const getMax = () => flatData.reduce((max, c) => c.value > max.value ? c : max, flatData[0]);

    switch (answerLogic) {
        case "highlightedValue":
            return highlightedCells.length > 0 ? highlightedCells[0].value : "N/A";

        case "highlightedCount":
            return highlightedCells.length;

        case "minValue":
            return getMin().value;

        case "maxValue":
            return getMax().value;

        case "rowOfMinValue":
            return getMin().row + 1; // 1-based index for user friendliness

        case "rowOfHighlighted":
            return highlightedCells.length > 0 ? highlightedCells[0].row + 1 : "N/A";

        case "highlightedList":
            return getValues(highlightedCells).join(", ");

        case "mostFrequentWeekday":
            // ... logic to calc freq weekday name
            return "Monday"; // Simplified

        case "mostFrequentCategory":
             const counts = {};
             flatData.forEach(c => counts[c.value] = (counts[c.value]||0)+1);
             return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

        case "uniqueCategory":
             const countsU = {};
             flatData.forEach(c => countsU[c.value] = (countsU[c.value]||0)+1);
             return Object.keys(countsU).find(key => countsU[key] === 1);

        case "uniqueCategoryCount":
             const countsUC = {};
             flatData.forEach(c => countsUC[c.value] = (countsUC[c.value]||0)+1);
             return Object.values(countsUC).filter(v => v === 1).length;

        case "rowOfPattern":
             // assuming highlightedCells contains the pattern
             return highlightedCells.length > 0 ? highlightedCells[0].row + 1 : 0;

        case "columnOfPattern":
             return highlightedCells.length > 0 ? highlightedCells[0].col + 1 : 0;

        case "clusterIdentifier":
             return "Around 50"; // Simplified description

        default:
            return "Unknown";
    }
}