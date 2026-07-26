/**
 * 国际化工具
 *
 * 包装 chrome.i18n API，同时兼容 Firefox 的 browser.i18n。
 * 所有文案应通过 `t('message_key')` 引用，对应 src/_locales/{en,zh_CN}/messages.json。
 */

/** 统一的 i18n API 句柄 */
function getI18nApi(): typeof chrome.i18n | null {
  const api: any =
    typeof browser !== 'undefined' ? browser : typeof chrome !== 'undefined' ? chrome : undefined;
  return api?.i18n ?? null;
}

/**
 * 翻译 message key，找不到时回退为 key 本身。
 *
 * @example
 *   t('scan_start') // → "开始扫描"
 */
export function t(key: string): string {
  const i18n = getI18nApi();
  if (!i18n?.getMessage) return key;
  const message = i18n.getMessage(key);
  return message || key;
}

/**
 * 带替换的国际化。
 *
 * chrome.i18n.getMessage 支持 $1、$2 占位符（在 messages.json 中用 $CHROME_PLACEHOLDER$ 写法）。
 *
 * @example
 *   // messages.json: "scan_progress": { "message": "已扫描 $1/$2 页" }
 *   tWith('scan_progress', [3, 10]) // → "已扫描 3/10 页"
 */
export function tWith(key: string, substitutions: string | string[]): string {
  const i18n = getI18nApi();
  if (!i18n?.getMessage) return key;
  const message = i18n.getMessage(key, substitutions);
  return message || key;
}

/**
 * 获取当前 UI 语言。
 *
 * chrome.i18n.getUILanguage() 返回 BCP-47 字符串，例如 "zh-CN" / "en-US"。
 */
export function getLocale(): string {
  const i18n = getI18nApi();
  if (!i18n?.getUILanguage) return 'en-US';
  return i18n.getUILanguage();
}

/**
 * 判断当前是否为中文环境。
 *
 * 用于没有 _locales 翻译时的兜底文案选择。
 */
export function isChineseLocale(): boolean {
  return getLocale().toLowerCase().startsWith('zh');
}
