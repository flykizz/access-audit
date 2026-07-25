import type { BehaviorTask, ScanTask, AuditConfig, CoverageData, GoldenPath } from '../types/index.js';
import { CoverageTracker } from './coverage-tracker.js';

export class TaskGenerator {
  private coverageTracker: CoverageTracker;

  constructor(coverageTracker: CoverageTracker) {
    this.coverageTracker = coverageTracker;
  }

  generateTasks(config: AuditConfig): (ScanTask | BehaviorTask)[] {
    const tasks: (ScanTask | BehaviorTask)[] = [];

    if (config.includeStaticScan) {
      tasks.push(...this.generateStaticTasks(config));
    }

    if (config.includeBehaviorTest) {
      tasks.push(...this.generateBehaviorTasks(config));
    }

    if (config.goldenPaths.length > 0) {
      tasks.push(...this.generatePathTasks(config));
    }

    return this.prioritizeTasks(tasks);
  }

  private generateStaticTasks(config: AuditConfig): ScanTask[] {
    const tasks: ScanTask[] = [];

    if (config.goldenPaths.length > 0) {
      config.goldenPaths.forEach((path) => {
        path.steps.forEach((step) => {
          tasks.push({
            type: 'static-scan',
            name: `静态扫描: ${path.name} - ${step.name}`,
            rules: config.scanRules.length > 0 ? config.scanRules : [],
          });
        });
      });
    } else {
      tasks.push({
        type: 'static-scan',
        name: 'WCAG 2.1 AA 静态扫描',
        rules: config.scanRules.length > 0 ? config.scanRules : [],
      });
    }

    return tasks;
  }

  private generateBehaviorTasks(config: AuditConfig): BehaviorTask[] {
    const tasks: BehaviorTask[] = [];
    const coverage = this.coverageTracker.getCoverage();

    config.behaviorTests.forEach((testType) => {
      const task = this.createBehaviorTask(testType, coverage);
      if (task) {
        tasks.push(task);
      }
    });

    return tasks;
  }

  private generatePathTasks(config: AuditConfig): BehaviorTask[] {
    const tasks: BehaviorTask[] = [];

    config.goldenPaths.forEach((path) => {
      tasks.push(...this.generateTasksForPath(path, config.behaviorTests));
    });

    return tasks;
  }

  private generateTasksForPath(path: GoldenPath, behaviorTests: string[]): BehaviorTask[] {
    const tasks: BehaviorTask[] = [];
    const priorityMap: Record<string, 'high' | 'medium' | 'low'> = {
      critical: 'high',
      high: 'high',
      medium: 'medium',
      low: 'low',
    };

    const effectivePriority = priorityMap[path.priority];

    path.steps.forEach((step, stepIndex) => {
      if (behaviorTests.includes('focus-order')) {
        tasks.push({
          type: 'focus-order',
          name: `${path.name} - ${step.name} (焦点顺序)`,
          priority: effectivePriority,
          target: step.url,
          path: path.steps.slice(0, stepIndex + 1).map((s) => s.url),
        });
      }

      if (behaviorTests.includes('keyboard-reachability')) {
        tasks.push({
          type: 'keyboard-reachability',
          name: `${path.name} - ${step.name} (键盘可达性)`,
          priority: effectivePriority,
          target: step.url,
        });
      }

      if (behaviorTests.includes('keyboard-trap')) {
        tasks.push({
          type: 'keyboard-trap',
          name: `${path.name} - ${step.name} (键盘陷阱)`,
          priority: 'high',
          target: step.url,
        });
      }

      if (behaviorTests.includes('focus-visibility')) {
        tasks.push({
          type: 'focus-visibility',
          name: `${path.name} - ${step.name} (焦点可见性)`,
          priority: effectivePriority,
          target: step.url,
        });
      }

      if (behaviorTests.includes('modal-focus-return')) {
        tasks.push({
          type: 'modal-focus-return',
          name: `${path.name} - ${step.name} (模态框焦点回弹)`,
          priority: effectivePriority,
          target: step.url,
        });
      }
    });

    return tasks;
  }

  private createBehaviorTask(testType: string, coverage: CoverageData): BehaviorTask | null {
    const taskMap: Record<string, BehaviorTask> = {
      'keyboard-reachability': {
        type: 'keyboard-reachability',
        name: '键盘可达性检测',
        priority: coverage.keyboardReachRate < 100 ? 'high' : 'medium',
      },
      'keyboard-trap': {
        type: 'keyboard-trap',
        name: '键盘陷阱检测',
        priority: 'high',
      },
      'focus-visibility': {
        type: 'focus-visibility',
        name: '焦点可见性检测',
        priority: coverage.focusVisibleRate < 100 ? 'high' : 'medium',
      },
      'focus-order': {
        type: 'focus-order',
        name: '焦点顺序检测',
        priority: 'high',
      },
      'modal-focus-return': {
        type: 'modal-focus-return',
        name: 'Modal 焦点回弹检测',
        priority: coverage.modalFocusReturnRate < 100 ? 'high' : 'medium',
      },
    };

    return taskMap[testType] || null;
  }

  private prioritizeTasks(tasks: (ScanTask | BehaviorTask)[]): (ScanTask | BehaviorTask)[] {
    return tasks.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const aPriority = 'priority' in a ? a.priority : 'medium';
      const bPriority = 'priority' in b ? b.priority : 'medium';
      return priorityOrder[aPriority] - priorityOrder[bPriority];
    });
  }
}