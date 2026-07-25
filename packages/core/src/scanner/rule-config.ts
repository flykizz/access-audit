import type { RuleObject } from 'axe-core';

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

export const ruleCategories: Record<string, string[]> = {
  perceivable: ['color-contrast', 'image-alt', 'audio-description', 'caption'],
  operable: ['keyboard', 'focus', 'navigation', 'timing', 'motion'],
  understandable: ['language', 'readability', 'input-assistance'],
  robust: ['aria', 'parsing', 'name-role-value'],
};

export const customRules: RuleObject[] = [];

export function getRulesByCategory(category: string): string[] {
  return ruleCategories[category] || [];
}

export function getAllRuleIds(): string[] {
  return Object.values(ruleCategories).flat();
}
