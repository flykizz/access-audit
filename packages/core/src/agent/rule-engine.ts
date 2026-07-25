import type { Page } from 'playwright';
import type { RuleResult, TestType } from '../types/index.js';

export class RuleEngine {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async execute(type: TestType, target?: string): Promise<RuleResult> {
    switch (type) {
      case 'keyboard-reachability':
        return this.checkKeyboardReachability(target);
      case 'keyboard-trap':
        return this.checkKeyboardTrap(target);
      case 'focus-visibility':
        return this.checkFocusVisibility(target);
      case 'focus-order':
        return this.checkFocusOrder(target);
      case 'modal-focus-return':
        return this.checkModalFocusReturn(target);
      default:
        return { status: 'unknown', details: {} };
    }
  }

  private async checkKeyboardReachability(target?: string): Promise<RuleResult> {
    const unreachable = await this.page.evaluate(() => {
      const interactiveElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const unreachable: HTMLElement[] = [];
      interactiveElements.forEach((el) => {
        const tabindex = parseInt(el.getAttribute('tabindex') || '0');
        if (tabindex < 0) {
          unreachable.push(el as HTMLElement);
        }
      });
      return unreachable.length;
    });

    return {
      status: unreachable === 0 ? 'pass' : 'fail',
      details: { unreachableCount: unreachable },
    };
  }

  private async checkKeyboardTrap(target?: string): Promise<RuleResult> {
    const result = await this.page.evaluate((selector) => {
      const modal = selector ? document.querySelector(selector) : document.body;
      if (!modal) return { isTrapped: false, focusableElements: 0 };

      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) {
        return { isTrapped: false, focusableElements: 0 };
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      return {
        isTrapped: !(first && last),
        focusableElements: focusableElements.length,
        firstElement: first?.tagName,
        lastElement: last?.tagName,
      };
    }, target || '');

    return {
      status: result.isTrapped ? 'fail' : 'pass',
      details: result,
    };
  }

  private async checkFocusVisibility(target?: string): Promise<RuleResult> {
    const result = await this.page.evaluate(() => {
      const focusedElement = document.activeElement;
      if (!focusedElement) {
        return { hasFocusVisible: false, focusedElement: null };
      }

      const computedStyle = window.getComputedStyle(focusedElement);
      const outline = computedStyle.outline;
      const boxShadow = computedStyle.boxShadow;

      return {
        hasFocusVisible: outline !== 'none' || boxShadow !== 'none',
        focusedElement: focusedElement.tagName,
        outline,
        boxShadow,
      };
    });

    return {
      status: result.hasFocusVisible ? 'pass' : 'fail',
      details: result,
    };
  }

  private async checkFocusOrder(target?: string): Promise<RuleResult> {
    const result = await this.page.evaluate(() => {
      const focusableElements = Array.from(
        document.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );

      const tabOrder: string[] = [];
      focusableElements.forEach((el) => {
        const tabindex = parseInt(el.getAttribute('tabindex') || '0');
        tabOrder.push(`${el.tagName}:${tabindex}`);
      });

      const sortedOrder = [...tabOrder].sort();
      const isCorrectOrder = tabOrder.every((val, idx) => val === sortedOrder[idx]);

      return {
        isCorrectOrder,
        totalElements: focusableElements.length,
        tabOrder,
      };
    });

    return {
      status: result.isCorrectOrder ? 'pass' : 'fail',
      details: result,
    };
  }

  private async checkModalFocusReturn(target?: string): Promise<RuleResult> {
    const result = await this.page.evaluate((selector) => {
      const modal = selector ? document.querySelector(selector) : null;
      if (!modal) {
        return { focusReturned: false, modalFound: false };
      }

      const triggerButton = document.querySelector('[data-modal-trigger]');
      const isHidden = modal.getAttribute('aria-hidden') === 'true';

      return {
        focusReturned: isHidden && triggerButton?.contains(document.activeElement),
        modalFound: true,
        modalHidden: isHidden,
      };
    }, target || '');

    return {
      status: result.focusReturned ? 'pass' : 'fail',
      details: result,
    };
  }
}
