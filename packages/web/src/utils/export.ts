import type { ScanResult } from '@accessaudit/core';

interface ExportData {
  scanId: string;
  timestamp: string;
  results: ScanResult[];
  overallScore: number;
  totalViolations: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
}

export const exportToJSON = (data: ExportData): void => {
  const jsonString = JSON.stringify(data, null, 2);
  downloadFile(jsonString, `accessibility-report-${data.scanId}.json`, 'application/json');
};

export const exportToHTML = (data: ExportData): void => {
  const html = generateHTML(data);
  downloadFile(html, `accessibility-report-${data.scanId}.html`, 'text/html');
};

export const exportToPDF = (data: ExportData): void => {
  const html = generateHTML(data);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
};

export const createIssue = (data: ExportData): void => {
  const issueTitle = `Accessibility Audit Report: ${data.scanId}`;
  const issueBody = generateIssueBody(data);
  
  const githubUrl = 'https://github.com/issues/new';
  const params = new URLSearchParams({
    title: issueTitle,
    body: issueBody,
  });
  
  window.open(`${githubUrl}?${params.toString()}`, '_blank');
};

const downloadFile = (content: string, filename: string, contentType: string): void => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const generateHTML = (data: ExportData): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Audit Report - ${data.scanId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; max-width: 1200px; margin: 0 auto; line-height: 1.6; }
    h1 { color: #1a1a2e; margin-bottom: 20px; }
    h2 { color: #16213e; margin: 30px 0 15px; border-bottom: 2px solid #e94560; padding-bottom: 10px; }
    h3 { color: #0f3460; margin: 20px 0 10px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin: 30px 0; }
    .summary-item { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
    .summary-item .value { font-size: 28px; font-weight: bold; color: #1a1a2e; }
    .summary-item .label { color: #666; font-size: 14px; }
    .score-circle { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; font-size: 24px; font-weight: bold; }
    .score-high { background: #d4edda; color: #155724; }
    .score-medium { background: #fff3cd; color: #856404; }
    .score-low { background: #f8d7da; color: #721c24; }
    .violation { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin: 10px 0; }
    .violation-header { display: flex; gap: 10px; margin-bottom: 10px; }
    .severity { padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .severity-critical { background: #dc3545; color: white; }
    .severity-serious { background: #fd7e14; color: white; }
    .severity-moderate { background: #ffc107; color: #333; }
    .severity-minor { background: #17a2b8; color: white; }
    .wcag-tag { padding: 3px 10px; border-radius: 4px; font-size: 12px; background: #e9ecef; color: #495057; }
    .violation-message { font-weight: bold; color: #333; margin-bottom: 5px; }
    .violation-element { font-family: monospace; font-size: 13px; color: #666; background: #f8f9fa; padding: 5px; border-radius: 4px; }
    .fix-suggestion { background: #d4edda; color: #155724; padding: 10px; border-radius: 4px; margin-top: 10px; font-size: 14px; }
    .passed-rules { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .passed-rule { background: #d4edda; color: #155724; padding: 5px 12px; border-radius: 4px; font-size: 12px; }
    .page-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .page-url { color: #007bff; word-break: break-all; }
    .timestamp { color: #666; font-size: 14px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>Accessibility Audit Report</h1>
  <div class="timestamp">Generated on ${data.timestamp} | Report ID: ${data.scanId}</div>
  
  <h2>Overall Summary</h2>
  <div class="summary">
    <div class="summary-item">
      <div class="value" style="color: ${data.totalViolations > 0 ? '#dc3545' : '#28a745'}">${data.totalViolations}</div>
      <div class="label">Total Violations</div>
    </div>
    <div class="summary-item">
      <div class="value" style="color: #dc3545">${data.critical}</div>
      <div class="label">Critical</div>
    </div>
    <div class="summary-item">
      <div class="value" style="color: #fd7e14">${data.serious}</div>
      <div class="label">Serious</div>
    </div>
    <div class="summary-item">
      <div class="value" style="color: #ffc107">${data.moderate}</div>
      <div class="label">Moderate</div>
    </div>
    <div class="summary-item">
      <div class="value" style="color: #17a2b8">${data.minor}</div>
      <div class="label">Minor</div>
    </div>
    <div class="summary-item">
      <div class="score-circle ${data.overallScore >= 80 ? 'score-high' : data.overallScore >= 60 ? 'score-medium' : 'score-low'}">${data.overallScore}</div>
      <div class="label">Overall Score</div>
    </div>
  </div>
  
  ${data.results.map((result, index) => `
    <div class="page-card">
      <div class="page-header">
        <div>
          <h3>Page ${index + 1}</h3>
          <div class="page-url">${result.url}</div>
        </div>
        <div class="score-circle ${result.score && result.score >= 80 ? 'score-high' : result.score && result.score >= 60 ? 'score-medium' : 'score-low'}">${result.score || '-'}</div>
      </div>
      
      <div style="display: flex; gap: 15px; margin-bottom: 15px;">
        <span class="severity severity-critical">${result.critical} Critical</span>
        <span class="severity severity-serious">${result.serious} Serious</span>
        <span class="severity severity-moderate">${result.moderate} Moderate</span>
        <span class="severity severity-minor">${result.minor} Minor</span>
      </div>
      
      ${result.violations.length > 0 ? `
        <h4 style="margin: 15px 0 10px; color: #dc3545;">Violations (${result.violations.length})</h4>
        ${result.violations.map((v) => `
          <div class="violation">
            <div class="violation-header">
              <span class="severity severity-${v.severity}">${v.severity.toUpperCase()}</span>
              <span class="wcag-tag">${v.wcagTag}</span>
            </div>
            <div class="violation-message">${v.message}</div>
            <div class="violation-element">${v.element}</div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">Selector: ${v.selector}</div>
            <div class="fix-suggestion">Fix: ${v.fixSuggestion}</div>
          </div>
        `).join('')}
      ` : `
        <div style="background: #d4edda; color: #155724; padding: 10px; border-radius: 4px; text-align: center;">
          No accessibility violations detected on this page.
        </div>
      `}
      
      ${result.passedRules && result.passedRules.length > 0 ? `
        <h4 style="margin: 15px 0 10px; color: #28a745;">Passed Checks (${result.passedRules.length})</h4>
        <div class="passed-rules">
          ${result.passedRules.map((r) => `<span class="passed-rule">${r.replace(/-/g, ' ')}</span>`).join('')}
        </div>
      ` : ''}
      
      <div style="margin-top: 15px; font-size: 12px; color: #666;">
        Scan Time: ${result.scanTime}ms
      </div>
    </div>
  `).join('')}
</body>
</html>`;
};

const generateIssueBody = (data: ExportData): string => {
  return `## Accessibility Audit Report

**Report ID:** ${data.scanId}
**Generated:** ${data.timestamp}

### Summary
- Total Violations: ${data.totalViolations}
- Critical: ${data.critical}
- Serious: ${data.serious}
- Moderate: ${data.moderate}
- Minor: ${data.minor}
- Overall Score: ${data.overallScore}/100

### Pages Scanned
${data.results.map((result, index) => `
**Page ${index + 1}: ${result.url}**
- Score: ${result.score || '-'}
- Violations: ${result.totalViolations} (${result.critical} critical, ${result.serious} serious, ${result.moderate} moderate, ${result.minor} minor)
`).join('')}

### Action Required
${data.critical > 0 ? `**${data.critical} critical issue(s) found** - These must be fixed immediately.` : ''}
${data.serious > 0 ? `**${data.serious} serious issue(s) found** - These should be fixed as soon as possible.` : ''}

---

*This issue was automatically generated by AccessAudit.*`;
};
