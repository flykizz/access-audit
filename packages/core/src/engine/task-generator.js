export class TaskGenerator {
    coverageTracker;
    constructor(coverageTracker) {
        this.coverageTracker = coverageTracker;
    }
    generateTasks(config) {
        const tasks = [];
        if (config.includeStaticScan) {
            tasks.push(...this.generateStaticTasks(config));
        }
        if (config.includeBehaviorTest) {
            tasks.push(...this.generateBehaviorTasks(config));
        }
        return this.prioritizeTasks(tasks);
    }
    generateStaticTasks(config) {
        return [
            {
                type: 'static-scan',
                name: 'WCAG 2.1 AA 静态扫描',
                rules: config.scanRules.length > 0 ? config.scanRules : [],
            },
        ];
    }
    generateBehaviorTasks(config) {
        const tasks = [];
        const coverage = this.coverageTracker.getCoverage();
        config.behaviorTests.forEach((testType) => {
            const task = this.createBehaviorTask(testType, coverage);
            if (task) {
                tasks.push(task);
            }
        });
        config.goldenPaths.forEach((path, index) => {
            tasks.push({
                type: 'focus-order',
                name: `黄金路径 #${index + 1}: ${path.name}`,
                priority: 'high',
                path: path.steps,
            });
        });
        return tasks;
    }
    createBehaviorTask(testType, coverage) {
        const taskMap = {
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
    prioritizeTasks(tasks) {
        return tasks.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            const aPriority = 'priority' in a ? a.priority : 'medium';
            const bPriority = 'priority' in b ? b.priority : 'medium';
            return priorityOrder[aPriority] - priorityOrder[bPriority];
        });
    }
}
