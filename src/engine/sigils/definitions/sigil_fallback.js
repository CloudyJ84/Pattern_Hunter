/**
 * Sigil: The Void
 * A fallback sigil for when no others manifest.
 */
export const sigil_fallback = {
    id: 'sigil_fallback',
    name: 'The Void',
    icon: '🔮',
    hint: 'Analyze the grid.',
    description: 'Silence reigns. No clear signs have yet revealed themselves.',
    compute(analytics) {
        // Always inactive by default; the controller or UI can manually fallback to this
        // if the active sigil list is empty.
        return { active: false };
    }
};
