import { Injectable } from '@nestjs/common';
import { PageAgent } from '@accessaudit/core';
import type { BehaviorResult, BehaviorTask, TestType, OperationPath, BehaviorTestResult } from '@accessaudit/core';

interface BehaviorTestOptions {
  url: string;
  testType: TestType;
  target?: string;
  expected?: string;
  maxIterations?: number;
}

interface BatchTestOptions {
  url: string;
  tests: { testType: TestType; target?: string }[];
}

interface BatchTestResult {
  url: string;
  totalTests: number;
  passed: number;
  failed: number;
  results: { testType: TestType; status: 'pass' | 'fail' }[];
}

interface PathDiscoveryOptions {
  url: string;
  testType: TestType;
}

interface PathExecutionOptions {
  url: string;
  testType: TestType;
  path: OperationPath;
}

@Injectable()
export class AgentService {
  async behaviorTest(options: BehaviorTestOptions): Promise<BehaviorResult> {
    const agent = new PageAgent();
    const task: BehaviorTask = {
      type: options.testType,
      name: this.getTestTypeName(options.testType),
      priority: 'high',
      target: options.target,
    };
    return agent.executeTask(task);
  }

  async batchTest(options: BatchTestOptions): Promise<BatchTestResult> {
    const results: { testType: TestType; status: 'pass' | 'fail' }[] = [];
    let passed = 0;

    for (const test of options.tests) {
      const result = await this.behaviorTest({
        url: options.url,
        testType: test.testType,
        target: test.target,
      });
      results.push({ testType: test.testType, status: result.status === 'pass' ? 'pass' : 'fail' });
      if (result.status === 'pass') passed++;
    }

    return {
      url: options.url,
      totalTests: options.tests.length,
      passed,
      failed: options.tests.length - passed,
      results,
    };
  }

  async discoverPaths(options: PathDiscoveryOptions): Promise<OperationPath[]> {
    const agent = new PageAgent();
    try {
      const paths = await agent.discoverPaths(options.url, options.testType);
      return paths;
    } finally {
      await agent.close();
    }
  }

  async executePath(options: PathExecutionOptions): Promise<BehaviorTestResult> {
    const agent = new PageAgent();
    try {
      const result = await agent.executePath(options.path, options.testType);
      return result;
    } finally {
      await agent.close();
    }
  }

  private getTestTypeName(testType: string): string {
    const names: Record<string, string> = {
      'keyboard-reachability': '键盘可达性检测',
      'keyboard-trap': '键盘陷阱检测',
      'focus-visibility': '焦点可见性检测',
      'focus-order': '焦点顺序检测',
      'modal-focus-return': 'Modal 焦点回弹检测',
    };
    return names[testType] || testType;
  }
}
