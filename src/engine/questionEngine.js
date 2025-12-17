let rules = null;

export function initQuestionEngine(questionGeneratorConfig) {
    rules = questionGeneratorConfig.questionGenerator;
}

export function destroyQuestionEngine() {
    rules = null;
}

/**
 * Generates a question based on:
 * - datasetType
 * - patternType
 * - highlightedCells
 * - thresholdConfig (for minimal phrasing)
 */
export function generateQuestion(patternType, datasetType, dataset, highlightedCells, thresholdConfig = {}) {
    if (!rules) {
        throw new Error("QuestionEngine not initialized");
    }

    // 1. Determine question group
    let groupKey;
    switch (datasetType) {
        case 'dates': groupKey = 'dateQuestions'; break;
        case 'numbers': groupKey = 'numberQuestions'; break;
        case 'categories': groupKey = 'categoryQuestions'; break;
        case 'times': groupKey = 'timeQuestions'; break;
        default:
            return { text: "Invalid dataset type", answer: "-", type: "error" };
    }

    const questionGroup = rules[groupKey];
    if (!questionGroup) {
        return { text: "No questions available", answer: "-", type: "error" };
    }

    // 2. Choose a question type
    const availableTypes = Object.keys(questionGroup);
    const chosenType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    const questionConfig = questionGroup[chosenType];

    // 3. Choose template
    let template = questionConfig.templates[0];

    // 4. Threshold-tier minimal phrasing (Mythic)
    if (thresholdConfig.hintLevel === "none") {
        template = "Identify the pattern target.";
    }

    // 5. Compute answer
    const answer = computeAnswer(questionConfig.answerLogic, dataset, highlightedCells);

    return {
        text: template,
        answer,
        type: chosenType
    };
}

export function computeAnswer(answerLogic, dataset, highlightedCells) {
    const flatData = dataset.flat();

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
            return getMin().row + 1;

        case "rowOfHighlighted":
            return highlightedCells.length > 0 ? highlightedCells[0].row + 1 : "N/A";

        case "highlightedList":
            return getValues(highlightedCells).join(", ");

        case "mostFrequentWeekday":
            // Placeholder — can be expanded later
            return "Monday";

        case "mostFrequentCategory":
            const counts = {};
            flatData.forEach(c => counts[c.value] = (counts[c.value] || 0) + 1);
            return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

        case "uniqueCategory":
            const countsU = {};
            flatData.forEach(c => countsU[c.value] = (countsU[c.value] || 0) + 1);
            return Object.keys(countsU).find(key => countsU[key] === 1);

        case "uniqueCategoryCount":
            const countsUC = {};
            flatData.forEach(c => countsUC[c.value] = (countsUC[c.value] || 0) + 1);
            return Object.values(countsUC).filter(v => v === 1).length;

        case "rowOfPattern":
            return highlightedCells.length > 0 ? highlightedCells[0].row + 1 : 0;

        case "columnOfPattern":
            return highlightedCells.length > 0 ? highlightedCells[0].col + 1 : 0;

        case "clusterIdentifier":
            return "Around 50";

        default:
            return "Unknown";
    }
}
