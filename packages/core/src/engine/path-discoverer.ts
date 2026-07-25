import { Page, chromium } from 'playwright';
import type { GoldenPath, PathStep, PathDiscoveryResult } from '../types/index.js';
import { logger } from '../utils/logger.js';

const COMMON_PATH_PATTERNS: Record<string, { name: string; priority: 'critical' | 'high' | 'medium' }> = {
  '/login': { name: '用户登录', priority: 'critical' },
  '/register': { name: '用户注册', priority: 'critical' },
  '/signup': { name: '用户注册', priority: 'critical' },
  '/checkout': { name: '结账流程', priority: 'critical' },
  '/payment': { name: '支付流程', priority: 'critical' },
  '/cart': { name: '购物车', priority: 'high' },
  '/search': { name: '搜索功能', priority: 'high' },
  '/product': { name: '产品详情', priority: 'high' },
  '/products': { name: '产品列表', priority: 'high' },
  '/profile': { name: '用户中心', priority: 'medium' },
  '/account': { name: '账户设置', priority: 'medium' },
  '/settings': { name: '设置页面', priority: 'medium' },
};

const IGNORED_PATTERNS = [
  /\.(jpg|jpeg|png|gif|svg|pdf|doc|docx|xls|xlsx|zip|rar|exe)$/i,
  /^\/api\//,
  /^\/admin\//,
  /^\/privacy/,
  /^\/terms/,
];

export class PathDiscoverer {
  private visitedUrls = new Set<string>();
  private discoveredPaths: GoldenPath[] = [];
  private baseDomain = '';

  async discover(baseUrl: string, depth: number = 3, maxPaths: number = 10): Promise<PathDiscoveryResult> {
    this.visitedUrls.clear();
    this.discoveredPaths = [];
    this.baseDomain = new URL(baseUrl).hostname;

    logger.info(`Starting path discovery from ${baseUrl}, depth: ${depth}, maxPaths: ${maxPaths}`);

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
      await this.crawl(page, baseUrl, depth, maxPaths);
      await this.analyzeAndClassifyPaths(baseUrl);

      logger.info(`Path discovery completed. Found ${this.discoveredPaths.length} paths.`);
    } catch (error) {
      logger.error(`Path discovery failed: ${(error as Error).message}`);
    } finally {
      await browser.close();
    }

    return {
      paths: this.discoveredPaths,
      discoveredUrls: Array.from(this.visitedUrls),
      pathCoverage: this.calculateCoverage(),
    };
  }

  async discoverAllPages(baseUrl: string, maxPages: number = 50): Promise<PathDiscoveryResult> {
    this.visitedUrls.clear();
    this.discoveredPaths = [];
    this.baseDomain = new URL(baseUrl).hostname;

    logger.info(`Starting full site discovery from ${baseUrl}, maxPages: ${maxPages}`);

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
      await this.crawlAllPages(page, baseUrl, maxPages);
      await this.classifyAllPages();

      logger.info(`Full site discovery completed. Found ${this.discoveredPaths.length} pages.`);
    } catch (error) {
      logger.error(`Full site discovery failed: ${(error as Error).message}`);
    } finally {
      await browser.close();
    }

    return {
      paths: this.discoveredPaths,
      discoveredUrls: Array.from(this.visitedUrls),
      pathCoverage: this.calculateFullSiteCoverage(),
    };
  }

  private async crawlAllPages(page: Page, url: string, maxPages: number): Promise<void> {
    if (this.visitedUrls.size >= maxPages) return;
    if (this.visitedUrls.has(url)) return;

    const urlObj = new URL(url);
    if (urlObj.hostname !== this.baseDomain) return;

    if (IGNORED_PATTERNS.some((pattern) => pattern.test(urlObj.pathname))) return;

    this.visitedUrls.add(url);

    try {
      await page.goto(url, { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded');

      const links = await this.extractAllLinks(page, url);

      for (const link of links) {
        if (this.visitedUrls.size >= maxPages) break;
        await this.crawlAllPages(page, link, maxPages);
      }
    } catch (error) {
      logger.warn(`Failed to crawl ${url}: ${(error as Error).message}`);
    }
  }

  private async extractAllLinks(page: Page, baseUrl: string): Promise<string[]> {
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href]'))
        .map((a) => a.getAttribute('href') || '')
        .filter((href) => href && (href.startsWith('/') || href.startsWith(window.location.origin)));
    });

    const uniqueLinks = [...new Set(links)];
    
    return uniqueLinks.map((href) => {
      if (href.startsWith('/')) {
        return new URL(href, baseUrl).href;
      }
      return href;
    }).filter((href) => {
      const urlObj = new URL(href);
      return urlObj.hostname === this.baseDomain && !IGNORED_PATTERNS.some((pattern) => pattern.test(urlObj.pathname));
    });
  }

  private async classifyAllPages(): Promise<void> {
    this.discoveredPaths = Array.from(this.visitedUrls).map((url) => {
      const pathname = new URL(url).pathname;
      const matchedPattern = this.matchPattern(pathname);

      let name = '页面';
      let priority: 'critical' | 'high' | 'medium' | 'low' = 'low';

      if (matchedPattern) {
        name = matchedPattern.name;
        priority = matchedPattern.priority;
      } else if (this.containsInteractiveElements(url)) {
        name = '交互页面';
        priority = 'high';
      } else if (pathname.length > 1) {
        name = pathname.split('/').filter(Boolean).pop() || '页面';
        priority = 'medium';
      }

      const steps: PathStep[] = [{ name, url }];

      return {
        id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        steps,
        priority,
        businessWeight: this.calculateBusinessWeight(priority),
        urlPattern: pathname,
        tags: [priority, 'full-site'],
      };
    }).sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    this.discoveredPaths.forEach((path, index) => {
      path.id = `page-${index + 1}`;
    });
  }

  private async crawl(page: Page, url: string, depth: number, maxPaths: number): Promise<void> {
    if (depth <= 0 || this.discoveredPaths.length >= maxPaths) return;
    if (this.visitedUrls.has(url)) return;

    const urlObj = new URL(url);
    if (urlObj.hostname !== this.baseDomain) return;

    this.visitedUrls.add(url);

    try {
      await page.goto(url, { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded');

      const links = await this.extractLinks(page, url);

      for (const link of links.slice(0, 20)) {
        if (this.discoveredPaths.length >= maxPaths) break;

        const pathInfo = this.analyzeLink(link);
        if (pathInfo.isSignificant) {
          this.discoveredPaths.push(pathInfo.path);
        }

        await this.crawl(page, link, depth - 1, maxPaths);
      }
    } catch (error) {
      logger.warn(`Failed to crawl ${url}: ${(error as Error).message}`);
    }
  }

  private async extractLinks(page: Page, baseUrl: string): Promise<string[]> {
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href]'))
        .map((a) => a.getAttribute('href') || '')
        .filter((href) => href && href.startsWith('/'));
    });

    return links.map((href) => new URL(href, baseUrl).href);
  }

  private analyzeLink(url: string): { isSignificant: boolean; path: GoldenPath } {
    const pathname = new URL(url).pathname;
    const matchedPattern = this.matchPattern(pathname);

    if (matchedPattern) {
      return {
        isSignificant: true,
        path: this.createGoldenPath(url, matchedPattern),
      };
    }

    if (this.containsInteractiveElements(url)) {
      return {
        isSignificant: true,
        path: this.createGoldenPath(url, { name: '发现路径', priority: 'medium' }),
      };
    }

    return {
      isSignificant: false,
      path: this.createGoldenPath(url, { name: '其他路径', priority: 'medium' }),
    };
  }

  private matchPattern(pathname: string): { name: string; priority: 'critical' | 'high' | 'medium' } | null {
    for (const [pattern, info] of Object.entries(COMMON_PATH_PATTERNS)) {
      if (pathname.startsWith(pattern) || pathname.includes(pattern)) {
        return info;
      }
    }
    return null;
  }

  private containsInteractiveElements(url: string): boolean {
    const interactivePatterns = ['/form', '/submit', '/save', '/confirm', '/apply', '/subscribe'];
    return interactivePatterns.some((pattern) => url.toLowerCase().includes(pattern));
  }

  private createGoldenPath(url: string, patternInfo: { name: string; priority: 'critical' | 'high' | 'medium' }): GoldenPath {
    const steps: PathStep[] = [{ name: patternInfo.name, url }];

    return {
      id: `path-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: patternInfo.name,
      steps,
      priority: patternInfo.priority,
      businessWeight: this.calculateBusinessWeight(patternInfo.priority),
      urlPattern: new URL(url).pathname,
      tags: [patternInfo.priority],
    };
  }

  private calculateBusinessWeight(priority: 'critical' | 'high' | 'medium' | 'low'): number {
    const weights: Record<string, number> = {
      critical: 100,
      high: 75,
      medium: 50,
      low: 25,
    };
    return weights[priority];
  }

  private async analyzeAndClassifyPaths(baseUrl: string): Promise<void> {
    this.discoveredPaths = this.discoveredPaths
      .filter((path, index, self) => index === self.findIndex((p) => p.urlPattern === path.urlPattern))
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 10);

    this.discoveredPaths.forEach((path, index) => {
      path.id = `path-${index + 1}`;
    });
  }

  private calculateCoverage(): number {
    if (this.visitedUrls.size === 0) return 0;

    const domain = this.discoveredPaths[0]?.urlPattern?.split('/')[1] || '';
    const expectedCriticalPaths = this.getExpectedCriticalPaths(domain);

    let matched = 0;
    for (const expected of expectedCriticalPaths) {
      if (this.discoveredPaths.some((p) => p.urlPattern?.includes(expected))) {
        matched++;
      }
    }

    const baseCoverage = Math.round((this.discoveredPaths.length / Math.min(this.visitedUrls.size, 20)) * 100);
    const criticalCoverage = expectedCriticalPaths.length > 0 
      ? Math.round((matched / expectedCriticalPaths.length) * 100) 
      : 100;

    return Math.round((baseCoverage * 0.6 + criticalCoverage * 0.4));
  }

  private calculateFullSiteCoverage(): number {
    if (this.visitedUrls.size === 0) return 0;

    const domain = this.discoveredPaths[0]?.urlPattern?.split('/')[1] || '';
    const expectedCriticalPaths = this.getExpectedCriticalPaths(domain);

    let matched = 0;
    for (const expected of expectedCriticalPaths) {
      if (this.discoveredPaths.some((p) => p.urlPattern?.includes(expected))) {
        matched++;
      }
    }

    const criticalCoverage = expectedCriticalPaths.length > 0 
      ? Math.round((matched / expectedCriticalPaths.length) * 100) 
      : 100;

    return Math.round((this.visitedUrls.size / 50) * 50 + criticalCoverage * 0.5);
  }

  private getExpectedCriticalPaths(domain: string): string[] {
    if (domain.includes('banking') || domain.includes('finance') || domain.includes('account')) {
      return ['/login', '/register', '/online-banking', '/apply', '/accounts'];
    }
    if (domain.includes('shop') || domain.includes('store') || domain.includes('commerce')) {
      return ['/login', '/register', '/checkout', '/payment', '/cart'];
    }
    if (domain.includes('news') || domain.includes('blog')) {
      return ['/search', '/subscribe', '/login'];
    }
    return ['/login', '/register', '/search'];
  }
}