export const defaultRules = [
    'color-contrast',
    'image-alt',
    'label',
    'aria-valid-attr',
    'button-name',
    'link-name',
    'list',
    'listitem',
];
export const ruleCategories = {
    perceivable: ['color-contrast', 'image-alt', 'audio-description', 'caption'],
    operable: ['keyboard', 'focus', 'navigation', 'timing', 'motion'],
    understandable: ['language', 'readability', 'input-assistance'],
    robust: ['aria', 'parsing', 'name-role-value'],
};
export const customRules = [];
export function getRulesByCategory(category) {
    return ruleCategories[category] || [];
}
export function getAllRuleIds() {
    return Object.values(ruleCategories).flat();
}
