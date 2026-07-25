import { TaskGenerator } from './task-generator';
export class StrategyScheduler {
    taskGenerator;
    coverageTracker;
    constructor(coverageTracker) {
        this.coverageTracker = coverageTracker;
        this.taskGenerator = new TaskGenerator(coverageTracker);
    }
    schedule(strategy, config) {
        switch (strategy) {
            case 'incremental':
                return this.scheduleIncremental(config);
            case 'daily':
                return this.scheduleDaily(config);
            case 'weekly':
                return this.scheduleWeekly(config);
            case 'on-demand':
                return this.scheduleOnDemand(config);
            default:
                return [];
        }
    }
    scheduleIncremental(config) {
        const tasks = [];
        tasks.push({
            type: 'static-scan',
            name: '增量静态扫描',
            rules: config.scanRules,
        });
        const missingCoverage = this.coverageTracker.getMissingCoverage();
        if (missingCoverage.includes('componentInteractionCoverage')) {
            tasks.push({
                type: 'keyboard-reachability',
                name: '组件交互覆盖率检测',
                priority: 'high',
            });
        }
        return tasks;
    }
    scheduleDaily(config) {
        const tasks = [];
        tasks.push({
            type: 'static-scan',
            name: '日构建静态扫描',
            rules: config.scanRules,
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
    scheduleWeekly(config) {
        const tasks = [];
        tasks.push({
            type: 'static-scan',
            name: '周探索静态扫描',
            rules: config.scanRules,
        });
        config.behaviorTests.forEach((testType) => {
            tasks.push({
                type: testType,
                name: `探索性测试: ${this.getTestTypeName(testType)}`,
                priority: 'medium',
            });
        });
        tasks.push({
            type: 'focus-order',
            name: '探索性模糊测试',
            priority: 'low',
        });
        return tasks;
    }
    scheduleOnDemand(config) {
        return this.taskGenerator.generateTasks(config);
    }
    getTestTypeName(testType) {
        const names = {
            'keyboard-reachability': '键盘可达性',
            'keyboard-trap': '键盘陷阱',
            'focus-visibility': '焦点可见性',
            'focus-order': '焦点顺序',
            'modal-focus-return': 'Modal 焦点回弹',
        };
        return names[testType] || testType;
    }
}
