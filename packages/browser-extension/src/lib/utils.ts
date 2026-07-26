/**
 * 合并 className，过滤掉 falsy 值。
 * 原生实现，避免引入 clsx / tailwind-merge 依赖。
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ')
}
