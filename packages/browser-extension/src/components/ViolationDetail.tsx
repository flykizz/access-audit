import { useState } from 'react'
import { cn } from '@/lib/utils'
import { t } from '@/core/i18n'
import type { Violation } from '@/core/types'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'

interface ViolationDetailProps {
  violation: Violation
  nodeIndex: number
  onClose: () => void
  onLocate: () => void
  className?: string
}

type BadgeVariant = 'error' | 'warning' | 'info'

function getImpactVariant(impact: string): BadgeVariant {
  if (impact === 'critical' || impact === 'serious') return 'error'
  if (impact === 'moderate') return 'warning'
  return 'info'
}

/**
 * 根据规则 ID 提供修复建议。覆盖 axe-core 常见规则。
 */
function getFixSuggestion(ruleId: string): string {
  const suggestions: Record<string, string> = {
    'color-contrast':
      '提高文本与背景之间的颜色对比度，确保对比度至少达到 4.5:1（普通文本）或 3:1（大文本）。可使用在线工具（如 WebAIM Contrast Checker）验证。',
    'image-alt':
      '为所有具有信息含义的 <img> 元素添加 alt 属性。装饰性图片使用 alt=""，功能性图片（如按钮中的图标）需提供描述性 alt。',
    'aria-label':
      '为交互元素提供唯一的、可读的 aria-label 或 aria-labelledby 属性，确保其名称对屏幕阅读器可见。',
    'aria-labelledby':
      '使用 aria-labelledby 关联可见文本作为元素的可达名称，确保引用的 ID 存在且唯一。',
    'aria-hidden-focus':
      '不要对可聚焦元素使用 aria-hidden="true"，否则键盘用户将无法操作该元素。',
    'aria-roles':
      '使用有效的 ARIA role 值，避免滥用 abstract role 或自定义 role。',
    'aria-valid-attr-value':
      '为 ARIA 属性提供符合规范的有效值，例如 aria-expanded 只能是 "true" 或 "false"。',
    'aria-valid-attr':
      '确保所有以 aria- 开头的属性都是有效的 ARIA 属性名。',
    'button-name':
      '确保按钮包含可访问的文本内容或 aria-label 属性，避免空按钮或仅含图标无文本标签的按钮。',
    'link-name':
      '确保链接包含可访问的文本内容、aria-label 或视觉上隐藏的文本，避免使用 "点击这里" 等无意义描述。',
    'link-in-text-block':
      '确保链接在文本块中通过颜色之外的方式（如下划线、加粗）进行视觉区分。',
    'label':
      '为所有 <input>、<select>、<textarea> 元素提供关联的 <label>，或使用 aria-label 显式标注。',
    'label-title-only':
      '不要仅依赖 title 属性作为表单元素的标签，应使用 <label> 或 aria-label。',
    'form-field-multiple-labels':
      '确保每个表单字段只关联一个 <label>，避免多个标签造成屏幕阅读器混淆。',
    'tabindex':
      '避免使用大于 0 的 tabindex 值，确保焦点顺序与 DOM 顺序一致。需要移除焦点时使用 tabindex="-1"。',
    'heading-order':
      '按层级顺序使用标题（h1-h6），不要跳过层级（如 h1 后直接 h3）。每个页面应有且仅有一个 h1。',
    'landmark-one-main':
      '确保每个页面包含一个 main landmark（<main> 或 role="main"），用于标识主要内容区域。',
    'landmark-unique':
      '确保同一页面内 landmark 通过 aria-label 或 aria-labelledby 拥有唯一的可区分名称。',
    'region':
      '使用语义化 HTML5 区域元素（<header>、<nav>、<main>、<aside>、<footer>）或 ARIA role 标注页面区域。',
    'html-has-lang':
      '为 <html> 元素添加 lang 属性，指定页面主语言，例如 <html lang="zh-CN">。',
    'html-lang-valid':
      '使用有效的 BCP 47 语言代码作为 lang 属性值，例如 "en"、"zh-CN"、"ja" 等。',
    'html-xml-lang-mismatch':
      '确保 XHTML 文档中 lang 和 xml:lang 属性值一致。',
    'document-title':
      '为页面提供唯一的、描述性的 <title> 元素，避免使用默认值（如 "Untitled"）。',
    'empty-heading':
      '移除空的标题元素，或为其添加描述性内容。',
    'page-has-heading-one':
      '确保每个页面至少包含一个 h1 标题，用于描述页面主题。',
    'list':
      '确保列表项 <li> 直接位于 <ul> 或 <ol> 内，不要将 <li> 用于非列表场景。',
    'listitem':
      '确保 <li> 元素包含在 <ul> 或 <ol> 中，避免直接放在其他容器内。',
    'duplicate-id':
      '避免重复的 id 属性值，确保每个 id 在文档中唯一。重复 id 会导致 label/aria 关联失效。',
    'duplicate-id-active':
      '对于关联交互元素的 id，必须确保其在文档中唯一。',
    'scope':
      '为表格的表头单元格使用 <th scope="col"> 或 <th scope="row">，明确其作用。',
    'td-headers':
      '确保 <td> 通过 headers 属性引用的表头 id 存在且唯一。',
    'th-has-data-cells':
      '确保 <th> 表头对应的 <td> 数据单元格存在，否则使用 colspan/ rowspan 调整结构。',
    'html-xml-lang-mismatch-check':
      '确保 XHTML 文档中 lang 和 xml:lang 属性值一致。',
    'meta-viewport-large':
      '避免在 viewport meta 中设置 user-scalable=no 或 maximum-scale 过小，确保用户可缩放。',
    'meta-viewport':
      '不要禁用用户缩放：<meta name="viewport" content="...user-scalable=no..."> 会导致无障碍问题。',
    'focus-order':
      '确保焦点顺序与阅读顺序一致，符合逻辑。避免使用 tabindex 改变自然焦点顺序。',
    'focusable-content':
      '确保嵌入的非交互内容不可聚焦，避免无效的 tabindex。',
    'focusable-disabled':
      '确保禁用的交互元素不可聚焦，或使用 disabled / aria-disabled 明确标注。',
    'interactive-element-affordance':
      '为交互元素提供清晰的视觉提示，如悬停状态、焦点指示器。',
    'nested-interactive':
      '避免将交互元素嵌套在另一个交互元素内（如 <a> 内嵌 <button>）。',
    'autocomplete-valid':
      '为表单输入提供正确的 autocomplete 属性值（如 "name"、"email"、"current-password"）。',
    'attribute-value':
      '确保元素属性值符合规范，避免空值或无效值。',
    'avoid-inline-spacing':
      '避免通过 inline style 设置文本间距，确保用户可通过样式表覆盖。',
    'frame-title':
      '为 <iframe> 和 <frame> 提供 title 属性，描述其内容用途。',
    'frame-title-unique':
      '确保每个 <iframe> 的 title 在页面内唯一，便于区分。',
    'definition-list':
      '确保 <dt>/<dd> 位于 <dl> 内，避免错误嵌套。',
    'dlitem':
      '确保 <dt> 和 <dd> 直接位于 <dl> 内。',
    'p-as-heading':
      '避免使用 <p> 加粗样式模拟标题，应使用语义化的 <h1>-<h6>。',
    'blink':
      '移除 <blink> 元素或闪烁效果，避免引发癫痫或干扰阅读。',
    'marquee':
      '移除 <marquee> 元素或滚动效果，使用 CSS 动画并尊重 prefers-reduced-motion。',
    'server-side-image-map':
      '避免使用服务端图像映射，改用客户端 <map>/<area>。',
    'target-size':
      '确保可点击目标的尺寸不小于 24x24 CSS 像素，相邻目标间距不小于 24px。',
    'css-orientation-lock':
      '不要通过 CSS 锁定屏幕方向，应尊重用户设备的方向设置。',
    'presentation-role-conflict':
      '避免在 role="presentation" 或 aria-hidden 的元素上放置交互子元素。',
    'avoid-capitalize-words':
      '避免使用全大写文本，影响可读性和屏幕阅读器朗读。',
  }
  return suggestions[ruleId] || t('noFixSuggestion')
}

function formatTarget(target: unknown): string {
  if (!target) return ''
  if (typeof target === 'string') return target
  if (Array.isArray(target)) {
    return target
      .map((item) => (Array.isArray(item) ? item.join(' > ') : String(item)))
      .join(', ')
  }
  return String(target)
}

export function ViolationDetail({
  violation,
  nodeIndex,
  onClose,
  onLocate,
  className,
}: ViolationDetailProps) {
  const [copied, setCopied] = useState(false)
  const node = violation.nodes?.[nodeIndex]
  const variant = getImpactVariant(violation.impact)

  const target = formatTarget(node?.target)
  const html = node?.html || ''
  const failureSummary = node?.failureSummary || ''

  const handleCopy = async () => {
    const text = [
      `Rule: ${violation.id}`,
      `Impact: ${violation.impact}`,
      `Description: ${violation.description}`,
      `Help: ${violation.help}`,
      `Target: ${target}`,
      `HTML: ${html}`,
      `Fix: ${getFixSuggestion(violation.id)}`,
    ].join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 剪贴板不可用时静默忽略
    }
  }

  return (
    <div
      className={cn('aa-modal', className)}
      role="dialog"
      aria-modal="true"
      aria-label={violation.help || violation.id}
    >
      <div className="aa-modal-header">
        <div className="aa-flex-1 aa-min-w-0 aa-pr-2">
          <div className="aa-flex aa-items-center aa-gap-2 aa-mb-1">
            <Badge variant={variant}>{violation.impact}</Badge>
            <code className="aa-violation-code">
              {violation.id}
            </code>
          </div>
          <h3 className="aa-modal-title">
            {violation.help}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="aa-modal-close"
          aria-label={t('close')}
        >
          <svg className="aa-w-5 aa-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="aa-modal-body">
        <section>
          <h4 className="aa-modal-section-title">
            {t('description')}
          </h4>
          <p className="aa-modal-section-text">{violation.description}</p>
        </section>

        {failureSummary && (
          <section>
            <h4 className="aa-modal-section-title">
              {t('impact')}
            </h4>
            <p className="aa-modal-section-text aa-whitespace-pre-wrap">{failureSummary}</p>
          </section>
        )}

        {target && (
          <section>
            <h4 className="aa-modal-section-title">
              {t('targetSelector')}
            </h4>
            <code className="aa-modal-target">
              {target}
            </code>
          </section>
        )}

        {html && (
          <section>
            <h4 className="aa-modal-section-title">
              {t('htmlSnippet')}
            </h4>
            <pre className="aa-modal-pre">
              <code>{html}</code>
            </pre>
          </section>
        )}

        <section>
          <h4 className="aa-modal-section-title">
            {t('fixSuggestion')}
          </h4>
          <p className="aa-modal-section-text">{getFixSuggestion(violation.id)}</p>
        </section>
      </div>

      <div className="aa-modal-footer">
        <Button variant="primary" size="sm" onClick={onLocate}>
          <svg
            className="aa-w-4 aa-h-4 aa-mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {t('locate')}
        </Button>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? t('copied') : t('copyDetails')}
        </Button>
        <div className="aa-flex-1" />
        <Button variant="ghost" size="sm" onClick={onClose}>
          {t('close')}
        </Button>
      </div>
    </div>
  )
}
