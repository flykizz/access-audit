import { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  TextField,
  Grid,
  Paper,
  Link,
} from '@mui/material';
import { Search, ChevronRight, Menu, X } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import Header from './Header';

interface DocSection {
  id: string;
  title: string;
  description: string;
  items?: { id: string; title: string; description?: string }[];
}

interface DocsProps {
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

function Docs({ onThemeToggle, isDarkMode }: DocsProps) {
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['getting-started']));
  const [activeItem, setActiveItem] = useState('quick-start');

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    setMobileOpen(false);
  };

  const docSections: DocSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Set up AccessAudit and run your first accessibility scan',
      items: [
        { id: 'quick-start', title: 'Quick Start', description: 'Get started in minutes' },
        { id: 'key-concepts', title: 'Key Concepts', description: 'Understand how AccessAudit works' },
        { id: 'how-it-works', title: 'How It Works', description: 'Learn about our scanning process' },
        { id: 'scan-modes', title: 'Scan Modes', description: 'Quick vs Deep scans explained' },
      ],
    },
    {
      id: 'projects',
      title: 'Projects',
      description: 'Organize your websites and configure settings',
      items: [
        { id: 'create-project', title: 'Create a Project', description: 'Add your web application' },
        { id: 'project-settings', title: 'Project Settings', description: 'Configure scan options' },
        { id: 'webhooks', title: 'Webhooks', description: 'Set up notifications' },
      ],
    },
    {
      id: 'api',
      title: 'API Reference',
      description: 'Integrate AccessAudit into your CI/CD pipeline',
      items: [
        { id: 'overview', title: 'API Overview', description: 'Introduction to our API' },
        { id: 'scan-api', title: 'Run Scan API', description: 'Trigger scans programmatically' },
        { id: 'report-api', title: 'Report API', description: 'Retrieve scan results' },
        { id: 'cli', title: 'AccessAudit CLI', description: 'Command line interface' },
        { id: 'ci-integration', title: 'CI Integration', description: 'GitHub Actions and GitLab CI' },
      ],
    },
    {
      id: 'compliance',
      title: 'Compliance Standards',
      description: 'Understand accessibility standards and guidelines',
      items: [
        { id: 'wcag-21', title: 'WCAG 2.1', description: 'Web Content Accessibility Guidelines' },
        { id: 'wcag-22', title: 'WCAG 2.2', description: 'Latest accessibility guidelines' },
        { id: 'en-301-549', title: 'EN 301 549', description: 'EU accessibility requirements' },
        { id: 'ada', title: 'ADA Compliance', description: 'Americans with Disabilities Act' },
      ],
    },
    {
      id: 'advanced',
      title: 'Advanced Features',
      description: 'Advanced configuration and customization',
      items: [
        { id: 'custom-rules', title: 'Custom Rules', description: 'Define your own accessibility rules' },
        { id: 'authentication', title: 'Authentication', description: 'Test authenticated pages' },
        { id: 'tunnel-mode', title: 'Tunnel Mode', description: 'Test localhost and staging' },
        { id: 'team-collaboration', title: 'Team Collaboration', description: 'Work with your team' },
      ],
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      description: 'Common issues and solutions',
      items: [
        { id: 'scan-failures', title: 'Scan Failures', description: 'Why scans fail and how to fix' },
        { id: 'performance', title: 'Performance', description: 'Optimize scan speed' },
        { id: 'support', title: 'Support', description: 'Get help from our team' },
      ],
    },
  ];

  const renderSidebar = (showCloseButton = false) => (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="4" y="4" width="24" height="24" rx="6" fill="#6366f1" />
          <path
            d="M12 12l8 4-8 4V12z"
            fill="white"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <Typography
          variant="h6"
          sx={{
            ml: 2,
            fontSize: '1.25rem',
            fontWeight: 700,
            color: theme.palette.text.primary,
          }}
        >
          AccessAudit
        </Typography>
        {showCloseButton && (
          <Button onClick={() => setMobileOpen(false)} sx={{ ml: 'auto' }}>
            <X />
          </Button>
        )}
      </Box>

      <TextField
        label="Search"
        variant="outlined"
        size="small"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 4 }}
        InputProps={{
          startAdornment: <Search sx={{ mr: 1 }} />,
        }}
      />

      <List>
        {docSections.map((section) => (
          <div key={section.id}>
            <ListItem
              button
              onClick={() => toggleSection(section.id)}
              sx={{
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.main}5`,
                },
              }}
            >
              <ListItemText
                primary={section.title}
                secondary={section.description}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  },
                  '& .MuiListItemText-secondary': {
                    fontSize: '0.75rem',
                    opacity: 0.7,
                  },
                }}
              />
              <ChevronRight
                sx={{
                  transform: expandedSections.has(section.id) ? 'rotate(90deg)' : 'none',
                  transition: 'transform 0.2s',
                  color: theme.palette.text.secondary,
                }}
              />
            </ListItem>
            {expandedSections.has(section.id) && section.items && (
              <List component="div" disablePadding>
                {section.items.map((item) => (
                  <ListItem
                    button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    sx={{
                      pl: 6,
                      backgroundColor: activeItem === item.id ? `${theme.palette.primary.main}10` : 'transparent',
                      '&:hover': {
                        backgroundColor: `${theme.palette.primary.main}5`,
                      },
                    }}
                  >
                    <ListItemText
                      primary={item.title}
                      secondary={item.description}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontSize: '0.85rem',
                          color: activeItem === item.id ? theme.palette.primary.main : theme.palette.text.primary,
                        },
                        '& .MuiListItemText-secondary': {
                          fontSize: '0.7rem',
                          opacity: 0.6,
                        },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </div>
        ))}
      </List>
    </Box>
  );

  const renderContent = () => {
    switch (activeItem) {
      case 'quick-start':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              Quick Start
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Get started with AccessAudit in minutes. Follow these simple steps to run your first accessibility scan.
            </Typography>
            <ol>
              {[
                { title: 'Sign up for a free account', desc: 'Create your account with email and password. Get $3 free credits to start.' },
                { title: 'Create your first project', desc: 'Add your web application URL and configure basic settings.' },
                { title: 'Configure scan settings', desc: 'Choose between Quick and Deep scan modes based on your needs.' },
                { title: 'Run your first scan', desc: 'AI agents will navigate and test your application automatically.' },
                { title: 'Review the compliance report', desc: 'Get detailed accessibility reports with WCAG 2.1/2.2 compliance status.' },
              ].map((item, index) => (
                <li key={index}>
                  <Typography variant="h6" sx={{ fontSize: '1.25rem', fontWeight: 600, mt: 4, mb: 2, color: theme.palette.text.primary }}>
                    {index + 1}. {item.title}
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 2, pl: 4 }}>
                    {item.desc}
                  </Typography>
                </li>
              ))}
            </ol>
          </>
        );
      case 'key-concepts':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              Key Concepts
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Understand the core concepts of AccessAudit and how it works.
            </Typography>
            <Grid container spacing={4}>
              {[
                { title: 'Projects', desc: 'Organize your websites and configure webhooks for notifications' },
                { title: 'Scan Plans', desc: 'Describe accessibility tests in natural language with Quick and Deep modes' },
                { title: 'Schedules', desc: 'Automate accessibility monitoring with cron-based scheduling' },
                { title: 'API Reference', desc: 'Integrate AccessAudit into your CI/CD pipeline' },
              ].map((item) => (
                <Grid item xs={12} md={6} key={item.title}>
                  <Paper sx={{ p: 4, '&:hover': { boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', borderColor: theme.palette.primary.main }, transition: 'all 0.2s' }}>
                    <Typography variant="h5" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {item.desc}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </>
        );
      case 'how-it-works':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              How It Works
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Learn about our scanning process and how AI agents test your application.
            </Typography>
            <ol>
              {[
                'Create a Project - Add your web application with its URL',
                'Configure Scan Settings - Choose between Quick and Deep scan modes',
                'Run the Scan - AI agents navigate and test your app like real users',
                'Get Results - Receive detailed accessibility reports with WCAG compliance status',
              ].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1.125rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ol>
          </>
        );
      case 'scan-modes':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              Scan Modes
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Understand the difference between Quick and Deep scan modes.
            </Typography>
            <Grid container spacing={4}>
              {[
                { title: 'Quick Scan', desc: 'Fast scanning mode for rapid feedback. Checks common accessibility issues including contrast, alt text, and basic ARIA attributes.', features: ['Runs in 1-2 minutes', 'Basic WCAG checks', 'Ideal for development'], credits: '0.5 credits' },
                { title: 'Deep Scan', desc: 'Comprehensive scanning with AI-powered behavior testing. Tests keyboard navigation, screen reader compatibility, and complex interactions.', features: ['Runs in 10-15 minutes', 'Full WCAG 2.1/2.2 compliance', 'Keyboard navigation testing', 'Screen reader compatibility'], credits: '2 credits' },
              ].map((item) => (
                <Grid item xs={12} md={6} key={item.title}>
                  <Paper sx={{ p: 4, '&:hover': { boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', borderColor: theme.palette.primary.main }, transition: 'all 0.2s' }}>
                    <Typography variant="h5" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                      {item.desc}
                    </Typography>
                    <ul>
                      {item.features.map((feature, idx) => (
                        <li key={idx}>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                            {feature}
                          </Typography>
                        </li>
                      ))}
                    </ul>
                    <Typography variant="subtitle2" sx={{ mt: 3, fontWeight: 600, color: theme.palette.primary.main }}>
                      {item.credits}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </>
        );
      case 'create-project':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              Create a Project
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Add your web application and configure project settings to start accessibility scanning.
            </Typography>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Prerequisites
            </Typography>
            <ul>
              {[
                'An active AccessAudit account',
                'The URL of the website you want to scan',
                'Basic understanding of your website structure',
                'Administrative access to configure DNS/firewall if needed',
              ].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Step-by-Step Guide
            </Typography>
            <ol>
              {[
                { title: 'Navigate to Projects', desc: 'Click on "Projects" in the sidebar navigation, then click the "New Project" button in the top right corner.' },
                { title: 'Enter Basic Information', desc: 'Fill in the project name and website URL. The URL should include the protocol (https://) and point to the root of your application.' },
                { title: 'Configure Scan Settings', desc: 'Choose the default scan mode (Quick or Deep), set the maximum number of pages to scan, and configure crawl depth for multi-page scans.' },
                { title: 'Set Up Authentication (Optional)', desc: 'If your website requires login, configure authentication method in the Authentication tab. Supports form auth, OAuth, and custom headers.' },
                { title: 'Add Webhooks (Optional)', desc: 'Configure webhook endpoints to receive notifications when scans complete or fail.' },
                { title: 'Review and Create', desc: 'Review your settings, then click "Create Project" to finalize. You can start your first scan immediately after creation.' },
              ].map((item, index) => (
                <li key={index}>
                  <Typography variant="h6" sx={{ fontSize: '1.125rem', fontWeight: 600, mt: 2, mb: 1, color: theme.palette.text.primary }}>
                    Step {index + 1}: {item.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1rem', pl: 2 }}>
                    {item.desc}
                  </Typography>
                </li>
              ))}
            </ol>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Project Types
            </Typography>
            <Grid container spacing={4} sx={{ mb: 4 }}>
              {[
                { title: 'Single Page Application', desc: 'SPA websites built with React, Vue, Angular, etc. Deep scan mode recommended for full coverage.' },
                { title: 'Multi-Page Website', desc: 'Traditional server-rendered websites with multiple HTML pages. Configure crawl depth for thorough testing.' },
                { title: 'E-commerce Platform', desc: 'Online stores with product pages, cart, and checkout. Enable authentication for logged-in user testing.' },
                { title: 'Web Application', desc: 'Complex web apps with dashboards, forms, and dynamic content. Use custom rules for project-specific requirements.' },
              ].map((item) => (
                <Grid item xs={12} md={6} key={item.title}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {item.desc}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Best Practices
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: `${theme.palette.success.main}10`, border: `1px solid ${theme.palette.success.main}30`, mb: 4 }}>
              <ul>
                {[
                  'Start with a Quick Scan to verify connectivity before running Deep Scans',
                  'Use descriptive project names that reflect the application or environment',
                  'Configure webhooks early to get notified of scan results automatically',
                  'Set up scheduled scans for ongoing accessibility monitoring',
                  'Add team members to collaborate on accessibility improvements',
                  'Create separate projects for staging and production environments',
                ].map((item, index) => (
                  <li key={index}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                      {item}
                    </Typography>
                  </li>
                ))}
              </ul>
            </Paper>
          </>
        );
      case 'project-settings':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              Project Settings
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Configure scan options, authentication, notifications, and other project preferences.
            </Typography>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              General Settings
            </Typography>
            <Grid container spacing={4} sx={{ mb: 4 }}>
              {[
                { title: 'Project Name', desc: 'Display name for your project. Can be changed at any time.' },
                { title: 'Website URL', desc: 'The base URL of your website. All scans start from this URL.' },
                { title: 'Default Scan Mode', desc: 'Choose between Quick Scan (fast) and Deep Scan (comprehensive).' },
                { title: 'Timezone', desc: 'Set the timezone for scheduled scans and report timestamps.' },
              ].map((item) => (
                <Grid item xs={12} md={6} key={item.title}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {item.desc}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Scan Configuration
            </Typography>
            <ul>
              {[
                'Max Pages to Scan - Limit the number of pages crawled during a scan (default: 50)',
                'Crawl Depth - How deep the scanner follows links from the starting URL (default: 3 levels)',
                'Include/Exclude URL Patterns - Use regex to include or exclude specific pages',
                'Scan Speed - Control the rate of requests to avoid overwhelming your server',
                'User Agent - Customize the user agent string used by the scanner',
                'Ignore Robots.txt - Bypass robots.txt restrictions (use with caution)',
              ].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Scheduled Scans
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
              Set up automatic recurring scans to monitor accessibility over time. Schedules use cron syntax for flexible timing.
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace', fontSize: '0.875rem' }}>
{`# Common schedule examples:

# Daily at 2:00 AM
0 2 * * *

# Weekly on Monday at 9:00 AM
0 9 * * 1

# Every 6 hours
0 */6 * * *

# First day of each month
0 0 1 * *`}
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Notification Preferences
            </Typography>
            <ul>
              {[
                'Scan Complete - Get notified when a scan finishes successfully',
                'Scan Failed - Get notified if a scan encounters errors',
                'New Violations - Alert when new accessibility issues are detected',
                'Compliance Change - Notify when compliance status changes',
                'Weekly Summary - Receive a weekly digest of scan results',
              ].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Compliance Settings
            </Typography>
            <Paper sx={{ p: 4, mb: 4 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Setting
                    </th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Description
                    </th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Default
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { setting: 'Target WCAG Level', desc: 'The compliance level to measure against', def: 'WCAG 2.1 AA' },
                    { setting: 'Severity Threshold', desc: 'Minimum severity level to include in reports', def: 'All severities' },
                    { setting: 'Rule Categories', desc: 'Which categories of rules to run', def: 'All categories' },
                    { setting: 'Custom Rules', desc: 'Enable project-specific custom rules', def: 'Disabled' },
                  ].map((row, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary, fontWeight: 500 }}>
                        {row.setting}
                      </td>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary }}>
                        {row.desc}
                      </td>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary }}>
                        {row.def}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Danger Zone
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: `${theme.palette.error.main}10`, border: `1px solid ${theme.palette.error.main}30` }}>
              <Typography variant="body1" sx={{ color: theme.palette.text.primary, mb: 2, fontWeight: 600 }}>
                Delete Project
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                Permanently delete this project and all its scan history, reports, and configurations. This action cannot be undone.
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Export your data before deleting if you need to preserve scan history.
              </Typography>
            </Paper>
          </>
        );
      case 'webhooks':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              Webhooks
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Set up webhooks to receive real-time notifications when scans complete, fail, or detect new issues.
            </Typography>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              What are Webhooks?
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
              Webhooks allow you to receive automated notifications from AccessAudit when specific events occur. Instead of polling our API for updates, we'll send an HTTP POST request to your specified URL whenever an event happens.
            </Typography>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Supported Events
            </Typography>
            <Grid container spacing={4} sx={{ mb: 4 }}>
              {[
                { title: 'Scan Completed', desc: 'Triggered when a scan finishes successfully. Includes full scan summary and compliance score.' },
                { title: 'Scan Failed', desc: 'Triggered when a scan encounters errors. Includes error details and troubleshooting info.' },
                { title: 'New Violations', desc: 'Triggered when new accessibility issues are detected compared to the previous scan.' },
                { title: 'Compliance Changed', desc: 'Triggered when the overall compliance status changes (e.g., from passing to failing).' },
              ].map((item) => (
                <Grid item xs={12} md={6} key={item.title}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {item.desc}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Setting Up a Webhook
            </Typography>
            <ol>
              {[
                { title: 'Navigate to Webhook Settings', desc: 'Go to Project Settings → Webhooks tab and click "Add Webhook".' },
                { title: 'Enter Endpoint URL', desc: 'Provide the HTTPS URL where you want to receive webhook events. Must be publicly accessible.' },
                { title: 'Select Events', desc: 'Choose which events should trigger the webhook. You can select multiple events.' },
                { title: 'Configure Secret (Optional)', desc: 'Add a secret token to verify webhook authenticity. We recommend using this for security.' },
                { title: 'Test the Webhook', desc: 'Click "Test Webhook" to send a test payload and verify your endpoint receives it correctly.' },
                { title: 'Save and Activate', desc: 'Save the webhook configuration. It will be activated immediately for all future scans.' },
              ].map((item, index) => (
                <li key={index}>
                  <Typography variant="h6" sx={{ fontSize: '1.125rem', fontWeight: 600, mt: 2, mb: 1, color: theme.palette.text.primary }}>
                    Step {index + 1}: {item.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1rem', pl: 2 }}>
                    {item.desc}
                  </Typography>
                </li>
              ))}
            </ol>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Webhook Payload Example
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace', fontSize: '0.875rem' }}>
{`POST /your-webhook-endpoint HTTP/1.1
Content-Type: application/json
X-AccessAudit-Signature: sha256=<your_signature>
X-AccessAudit-Event: scan.completed

{
  "event": "scan.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "projectId": "proj_abc123",
  "projectName": "My Website",
  "scanId": "scan_xyz789",
  "scanMode": "deep",
  "url": "https://example.com",
  "status": "completed",
  "results": {
    "totalIssues": 23,
    "critical": 3,
    "serious": 8,
    "moderate": 7,
    "minor": 5,
    "complianceScore": 78,
    "wcagLevel": "AA"
  },
  "reportUrl": "https://app.accessaudit.com/scans/scan_xyz789"
}`}
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Verifying Webhook Signatures
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
              To ensure webhook requests are genuine, we sign each payload with your secret token. Always verify the signature before processing the webhook.
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace', fontSize: '0.875rem' }}>
{`// Node.js example - verify webhook signature
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}`}
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Best Practices
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: `${theme.palette.info.main}10`, border: `1px solid ${theme.palette.info.main}30`, mb: 4 }}>
              <ul>
                {[
                  'Always use HTTPS endpoints for webhook URLs',
                  'Verify webhook signatures to prevent spoofing',
                  'Respond with 2xx status codes quickly (within 5 seconds)',
                  'Idempotent processing - handle duplicate deliveries gracefully',
                  'Log webhook deliveries for debugging purposes',
                  'Monitor failed deliveries and retry manually if needed',
                  'Use multiple webhooks for different environments (staging/production)',
                ].map((item, index) => (
                  <li key={index}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                      {item}
                    </Typography>
                  </li>
                ))}
              </ul>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Retry Policy
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
              If your webhook endpoint fails to respond or returns a non-2xx status code, we will retry the delivery with exponential backoff:
            </Typography>
            <ul>
              {[
                '1st retry: 1 minute after initial failure',
                '2nd retry: 5 minutes after 1st retry',
                '3rd retry: 15 minutes after 2nd retry',
                '4th retry: 1 hour after 3rd retry',
                '5th retry: 4 hours after 4th retry',
                'After 5 failed attempts, the webhook is marked as failed and no further retries are attempted',
              ].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>
          </>
        );
      case 'overview':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              API Overview
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Integrate AccessAudit into your CI/CD pipeline, build tools, and custom workflows using our RESTful API.
            </Typography>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Base URL
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace' }}>
                https://api.accessaudit.com/v1
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Authentication
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
              All API requests must include your API key in the Authorization header. You can generate and manage API keys in your account settings.
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace' }}>
{`Authorization: Bearer your-api-key-here`}
              </Typography>
            </Paper>
            <Paper sx={{ p: 4, backgroundColor: `${theme.palette.warning.main}10`, border: `1px solid ${theme.palette.warning.main}30`, mb: 4 }}>
              <Typography variant="body1" sx={{ color: theme.palette.text.primary, mb: 2, fontWeight: 600 }}>
                Security Note
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Keep your API keys secure. Never expose them in client-side code, public repositories, or shared environments. Use environment variables or secret management services.
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Rate Limiting
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
              API requests are rate limited based on your plan. The current rate limit is returned in the response headers.
            </Typography>
            <Paper sx={{ p: 4, mb: 4 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Plan
                    </th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Requests per Minute
                    </th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Daily Limit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { plan: 'Free', rpm: '10', daily: '100' },
                    { plan: 'Pro', rpm: '100', daily: '10,000' },
                    { plan: 'Enterprise', rpm: '1,000', daily: 'Unlimited' },
                  ].map((row, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary, fontWeight: 500 }}>
                        {row.plan}
                      </td>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary }}>
                        {row.rpm}
                      </td>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary }}>
                        {row.daily}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Response Headers
            </Typography>
            <ul>
              {[
                'X-RateLimit-Limit - The maximum number of requests per minute',
                'X-RateLimit-Remaining - The number of requests remaining in the current window',
                'X-RateLimit-Reset - The time at which the current rate limit window resets (Unix timestamp)',
                'X-Request-ID - A unique identifier for the request (useful for support)',
              ].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Error Handling
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
              The API uses standard HTTP status codes to indicate the success or failure of requests.
            </Typography>
            <Paper sx={{ p: 4, mb: 4 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Status Code
                    </th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Meaning
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { code: '200 OK', desc: 'The request was successful' },
                    { code: '201 Created', desc: 'The resource was successfully created' },
                    { code: '400 Bad Request', desc: 'The request was invalid or malformed' },
                    { code: '401 Unauthorized', desc: 'Missing or invalid API key' },
                    { code: '403 Forbidden', desc: 'You do not have permission to access this resource' },
                    { code: '404 Not Found', desc: 'The requested resource does not exist' },
                    { code: '429 Too Many Requests', desc: 'Rate limit exceeded' },
                    { code: '500 Internal Server Error', desc: 'Something went wrong on our end' },
                  ].map((row, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary, fontFamily: 'monospace', fontWeight: 500 }}>
                        {row.code}
                      </td>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary }}>
                        {row.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              API Endpoints
            </Typography>
            <Grid container spacing={4}>
              {[
                { title: 'Scans', desc: 'Trigger and manage accessibility scans', endpoints: 'POST /scans, GET /scans, GET /scans/:id' },
                { title: 'Reports', desc: 'Retrieve detailed scan reports', endpoints: 'GET /scans/:id/report, GET /scans/:id/violations' },
                { title: 'Projects', desc: 'Manage your projects', endpoints: 'GET /projects, POST /projects, PATCH /projects/:id' },
                { title: 'Rules', desc: 'Manage custom accessibility rules', endpoints: 'GET /rules, POST /rules, DELETE /rules/:id' },
              ].map((item) => (
                <Grid item xs={12} md={6} key={item.title}>
                  <Paper sx={{ p: 4, '&:hover': { boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', borderColor: theme.palette.primary.main }, transition: 'all 0.2s' }}>
                    <Typography variant="h5" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                      {item.desc}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontFamily: 'monospace' }}>
                      {item.endpoints}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </>
        );
      case 'scan-api':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              Run Scan API
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Trigger accessibility scans programmatically and retrieve scan status.
            </Typography>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Create a Scan
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
              Start a new accessibility scan for a URL or project.
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace', fontSize: '0.875rem' }}>
{`POST /api/v1/scans
Content-Type: application/json
Authorization: Bearer your-api-key

{
  "url": "https://your-website.com",
  "mode": "quick",
  "projectId": "proj_abc123",
  "maxPages": 10,
  "crawlDepth": 2,
  "includePatterns": ["/blog/.*"],
  "excludePatterns": ["/admin/.*"]
}`}
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Request Parameters
            </Typography>
            <Paper sx={{ p: 4, mb: 4 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Parameter
                    </th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Type
                    </th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Required
                    </th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { param: 'url', type: 'string', req: 'Yes', desc: 'The URL to scan' },
                    { param: 'mode', type: 'string', req: 'No', desc: 'Scan mode: "quick" or "deep" (default: "quick")' },
                    { param: 'projectId', type: 'string', req: 'No', desc: 'Associate scan with a project' },
                    { param: 'maxPages', type: 'number', req: 'No', desc: 'Maximum pages to scan (default: 50)' },
                    { param: 'crawlDepth', type: 'number', req: 'No', desc: 'Crawl depth for multi-page scans (default: 3)' },
                    { param: 'includePatterns', type: 'string[]', req: 'No', desc: 'Regex patterns for URLs to include' },
                    { param: 'excludePatterns', type: 'string[]', req: 'No', desc: 'Regex patterns for URLs to exclude' },
                    { param: 'rules', type: 'string[]', req: 'No', desc: 'Specific rule IDs to run (runs all if not specified)' },
                  ].map((row, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary, fontFamily: 'monospace', fontWeight: 500 }}>
                        {row.param}
                      </td>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary }}>
                        {row.type}
                      </td>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary }}>
                        {row.req}
                      </td>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary }}>
                        {row.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Response Example (201 Created)
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace', fontSize: '0.875rem' }}>
{`{
  "id": "scan_xyz789",
  "status": "queued",
  "url": "https://your-website.com",
  "mode": "quick",
  "createdAt": "2024-01-15T10:30:00Z",
  "projectId": "proj_abc123",
  "estimatedTime": "2-3 minutes"
}`}
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Get Scan Status
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
              Check the status of an existing scan.
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace', fontSize: '0.875rem' }}>
{`GET /api/v1/scans/scan_xyz789
Authorization: Bearer your-api-key`}
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Scan Status Values
            </Typography>
            <Grid container spacing={4} sx={{ mb: 4 }}>
              {[
                { title: 'queued', desc: 'Scan is waiting to start' },
                { title: 'running', desc: 'Scan is currently in progress' },
                { title: 'completed', desc: 'Scan finished successfully' },
                { title: 'failed', desc: 'Scan encountered an error' },
                { title: 'cancelled', desc: 'Scan was cancelled by user' },
              ].map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.title}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 600, mb: 1, color: theme.palette.text.primary, fontFamily: 'monospace' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.8rem' }}>
                      {item.desc}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              List Scans
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
              Retrieve a list of scans with pagination and filtering.
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace', fontSize: '0.875rem' }}>
{`GET /api/v1/scans?projectId=proj_abc123&status=completed&limit=20&offset=0
Authorization: Bearer your-api-key`}
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Cancel a Scan
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace', fontSize: '0.875rem' }}>
{`POST /api/v1/scans/scan_xyz789/cancel
Authorization: Bearer your-api-key`}
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Example: Polling for Scan Completion
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace', fontSize: '0.8rem' }}>
{`// JavaScript example - poll until scan completes
async function waitForScan(scanId, apiKey) {
  const pollInterval = 5000; // 5 seconds
  
  while (true) {
    const response = await fetch(
      \`https://api.accessaudit.com/v1/scans/\${scanId}\`,
      { headers: { Authorization: \`Bearer \${apiKey}\` } }
    );
    const scan = await response.json();
    
    if (scan.status === 'completed') {
      return scan;
    }
    if (scan.status === 'failed') {
      throw new Error('Scan failed');
    }
    
    await new Promise(r => setTimeout(r, pollInterval));
  }
}`}
              </Typography>
            </Paper>
          </>
        );
      case 'report-api':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              Report API
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Retrieve detailed scan results, violation details, and compliance reports.
            </Typography>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Get Scan Report
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
              Retrieve the full accessibility report for a completed scan.
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace', fontSize: '0.875rem' }}>
{`GET /api/v1/scans/scan_xyz789/report
Authorization: Bearer your-api-key`}
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Response Example
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace', fontSize: '0.8rem' }}>
{`{
  "scanId": "scan_xyz789",
  "status": "completed",
  "url": "https://your-website.com",
  "mode": "deep",
  "startedAt": "2024-01-15T10:30:00Z",
  "completedAt": "2024-01-15T10:45:00Z",
  "pagesScanned": 15,
  "summary": {
    "totalIssues": 42,
    "critical": 5,
    "serious": 12,
    "moderate": 18,
    "minor": 7,
    "passedRules": 38,
    "complianceScore": 72
  },
  "compliance": {
    "wcag21a": { status: "partial", passed: 18, total: 25 },
    "wcag21aa": { status: "fail", passed: 22, total: 38 },
    "wcag22a": { status: "partial", passed: 15, total: 22 },
    "wcag22aa": { status: "fail", passed: 19, total: 35 }
  },
  "violations": [
    {
      "id": "color-contrast",
      "description": "Elements must have sufficient color contrast",
      "severity": "serious",
      "wcagTags": ["wcag2aa", "wcag143"],
      "count": 8,
      "nodes": [
        {
          "target": ["#header .nav-link"],
          "html": "<a href=\"/home\" class=\"nav-link\">Home</a>",
          "failureSummary": "Element has insufficient color contrast..."
        }
      ]
    }
  ]
}`}
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              List Violations
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
              Get a paginated list of violations with filtering options.
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace', fontSize: '0.875rem' }}>
{`GET /api/v1/scans/scan_xyz789/violations?severity=serious,critical&limit=10&offset=0
Authorization: Bearer your-api-key`}
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Query Parameters
            </Typography>
            <Paper sx={{ p: 4, mb: 4 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Parameter
                    </th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Type
                    </th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { param: 'severity', type: 'string', desc: 'Filter by severity: critical, serious, moderate, minor (comma-separated)' },
                    { param: 'category', type: 'string', desc: 'Filter by rule category: perceivable, operable, understandable, robust' },
                    { param: 'wcagTag', type: 'string', desc: 'Filter by WCAG tag (e.g., wcag143)' },
                    { param: 'limit', type: 'number', desc: 'Number of results per page (default: 20, max: 100)' },
                    { param: 'offset', type: 'number', desc: 'Pagination offset (default: 0)' },
                  ].map((row, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary, fontFamily: 'monospace', fontWeight: 500 }}>
                        {row.param}
                      </td>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary }}>
                        {row.type}
                      </td>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary }}>
                        {row.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Export Report
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
              Export scan reports in various formats for offline use or sharing.
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace', fontSize: '0.875rem' }}>
{`GET /api/v1/scans/scan_xyz789/report/export?format=json
GET /api/v1/scans/scan_xyz789/report/export?format=html
GET /api/v1/scans/scan_xyz789/report/export?format=pdf
Authorization: Bearer your-api-key`}
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Get Violation Details
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
              Retrieve detailed information about a specific violation, including affected elements and remediation guidance.
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace', fontSize: '0.875rem' }}>
{`GET /api/v1/scans/scan_xyz789/violations/color-contrast
Authorization: Bearer your-api-key`}
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Severity Levels
            </Typography>
            <Grid container spacing={4} sx={{ mb: 4 }}>
              {[
                { title: 'Critical', desc: 'Immediate accessibility barrier. Prevents users from accessing core functionality.', color: '#ef4444' },
                { title: 'Serious', desc: 'Significant accessibility issue. Makes content or features difficult to use.', color: '#f97316' },
                { title: 'Moderate', desc: 'Moderate accessibility issue. Impacts user experience but not critical.', color: '#eab308' },
                { title: 'Minor', desc: 'Minor accessibility issue. Cosmetic or low-impact problems.', color: '#22c55e' },
              ].map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item.title}>
                  <Paper sx={{ p: 3, borderTop: `4px solid ${item.color}` }}>
                    <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.8rem' }}>
                      {item.desc}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Get Page-by-Page Results
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
              Retrieve accessibility results broken down by individual page for multi-page scans.
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace', fontSize: '0.875rem' }}>
{`GET /api/v1/scans/scan_xyz789/pages
Authorization: Bearer your-api-key

Response:
[
  {
    "url": "https://your-website.com/",
    "issues": 8,
    "critical": 1,
    "serious": 3,
    "complianceScore": 82
  },
  {
    "url": "https://your-website.com/about",
    "issues": 5,
    "critical": 0,
    "serious": 2,
    "complianceScore": 88
  }
]`}
              </Typography>
            </Paper>
          </>
        );
      case 'cli':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              AccessAudit CLI
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Command line interface for running accessibility scans, managing projects, and integrating with build tools.
            </Typography>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Installation
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
              Install the AccessAudit CLI globally via npm or yarn.
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace', fontSize: '0.875rem' }}>
{`# Install with npm
npm install -g @accessaudit/cli

# Install with yarn
yarn global add @accessaudit/cli

# Verify installation
accessaudit --version`}
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Authentication
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
              Authenticate with your AccessAudit account using an API key.
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace', fontSize: '0.875rem' }}>
{`# Authenticate with API key
accessaudit auth your-api-key-here

# Or use environment variable
export ACCESSAUDIT_API_KEY=your-api-key-here

# Check authentication status
accessaudit auth status`}
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Available Commands
            </Typography>
            <Paper sx={{ p: 4, mb: 4 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Command
                    </th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { cmd: 'scan', desc: 'Run an accessibility scan' },
                    { cmd: 'report', desc: 'View scan reports and results' },
                    { cmd: 'project', desc: 'Manage projects' },
                    { cmd: 'tunnel', desc: 'Start tunnel mode for local testing' },
                    { cmd: 'auth', desc: 'Manage authentication' },
                    { cmd: 'configure', desc: 'Configure CLI settings' },
                    { cmd: 'help', desc: 'Display help information' },
                  ].map((row, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary, fontFamily: 'monospace', fontWeight: 500 }}>
                        {row.cmd}
                      </td>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary }}>
                        {row.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Scan Command
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
              Run accessibility scans from the command line.
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace', fontSize: '0.8rem' }}>
{`# Basic scan
accessaudit scan --url https://your-website.com

# Deep scan mode
accessaudit scan --url https://your-website.com --mode deep

# Scan with project
accessaudit scan --url https://your-website.com --project my-project

# Scan specific number of pages
accessaudit scan --url https://your-website.com --max-pages 20

# Output report to file
accessaudit scan --url https://your-website.com --output report.json

# Exit with non-zero code if violations found
accessaudit scan --url https://your-website.com --fail-on-violations

# Full options
accessaudit scan --help`}
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Scan Options
            </Typography>
            <Paper sx={{ p: 4, mb: 4 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Option
                    </th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Description
                    </th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Default
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { opt: '--url, -u', desc: 'URL to scan', def: 'required' },
                    { opt: '--mode, -m', desc: 'Scan mode: quick or deep', def: 'quick' },
                    { opt: '--project, -p', desc: 'Project name or ID', def: 'none' },
                    { opt: '--max-pages', desc: 'Maximum pages to scan', def: '50' },
                    { opt: '--output, -o', desc: 'Output file path', def: 'stdout' },
                    { opt: '--format, -f', desc: 'Output format: json, html, csv', def: 'json' },
                    { opt: '--fail-on-violations', desc: 'Exit with code 1 if violations found', def: 'false' },
                    { opt: '--tunnel', desc: 'Use tunnel mode for local URLs', def: 'false' },
                    { opt: '--timeout', desc: 'Scan timeout in seconds', def: '300' },
                  ].map((row, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary, fontFamily: 'monospace', fontWeight: 500 }}>
                        {row.opt}
                      </td>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary }}>
                        {row.desc}
                      </td>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary }}>
                        {row.def}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Report Command
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace', fontSize: '0.8rem' }}>
{`# View scan report by ID
accessaudit report --scan-id scan_xyz789

# Export report as HTML
accessaudit report --scan-id scan_xyz789 --format html --output report.html

# List recent scans
accessaudit report list --project my-project --limit 10

# View scan status
accessaudit report status --scan-id scan_xyz789`}
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Tunnel Mode
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace', fontSize: '0.8rem' }}>
{`# Start tunnel on port 3000
accessaudit tunnel --port 3000

# Start tunnel and scan in one command
accessaudit scan --url http://localhost:3000 --tunnel

# Specify tunnel region
accessaudit tunnel --port 3000 --region us-east`}
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Configuration File
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
              Create a .accessauditrc.json file in your project directory for persistent configuration.
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace', fontSize: '0.8rem' }}>
{`// .accessauditrc.json
{
  "projectId": "proj_abc123",
  "defaultMode": "quick",
  "maxPages": 20,
  "failOnViolations": true,
  "severityThreshold": "moderate",
  "includePatterns": ["/docs/.*"],
  "excludePatterns": ["/admin/.*"]
}`}
              </Typography>
            </Paper>
          </>
        );
      case 'ci-integration':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              CI Integration
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Integrate AccessAudit into your CI/CD pipeline to automatically test accessibility on every commit and pull request.
            </Typography>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              GitHub Actions
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
              Use our official GitHub Action to run accessibility scans in your GitHub workflows.
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace', fontSize: '0.75rem' }}>
{`# .github/workflows/accessibility.yml
name: Accessibility Scan

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Build and start server
        run: |
          npm install
          npm run build
          npm run start &
          npx wait-on http://localhost:3000

      - name: Run AccessAudit scan
        uses: accessaudit/action@v1
        with:
          api-key: \${{ secrets.ACCESSAUDIT_API_KEY }}
          url: http://localhost:3000
          mode: quick
          max-pages: 10
          fail-on-violations: true
          severity-threshold: moderate`}
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              GitHub Action Inputs
            </Typography>
            <Paper sx={{ p: 4, mb: 4 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Input
                    </th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Required
                    </th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Default
                    </th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { input: 'api-key', req: 'Yes', def: '', desc: 'Your AccessAudit API key' },
                    { input: 'url', req: 'Yes', def: '', desc: 'URL of the website to scan' },
                    { input: 'mode', req: 'No', def: 'quick', desc: 'Scan mode: quick or deep' },
                    { input: 'max-pages', req: 'No', def: '50', desc: 'Maximum pages to scan' },
                    { input: 'project-id', req: 'No', def: '', desc: 'Project ID to associate scan with' },
                    { input: 'fail-on-violations', req: 'No', def: 'false', desc: 'Fail the build if violations are found' },
                    { input: 'severity-threshold', req: 'No', def: 'minor', desc: 'Minimum severity to trigger failure' },
                    { input: 'tunnel', req: 'No', def: 'false', desc: 'Use tunnel mode for localhost URLs' },
                    { input: 'output-path', req: 'No', def: 'accessaudit-report', desc: 'Path to save report artifacts' },
                  ].map((row, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary, fontFamily: 'monospace', fontWeight: 500 }}>
                        {row.input}
                      </td>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary }}>
                        {row.req}
                      </td>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary }}>
                        {row.def}
                      </td>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary }}>
                        {row.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              GitLab CI
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace', fontSize: '0.75rem' }}>
{`# .gitlab-ci.yml
accessibility_scan:
  stage: test
  image: node:18
  before_script:
    - npm install -g @accessaudit/cli
  script:
    - npm install
    - npm run build
    - npm run start &
    - npx wait-on http://localhost:3000
    - accessaudit scan --url http://localhost:3000 --mode quick --max-pages 10 --fail-on-violations --output report.json
  artifacts:
    paths:
      - report.json
    when: always
  only:
    - merge_requests
    - main`}
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Jenkins
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace', fontSize: '0.75rem' }}>
{`// Jenkinsfile
pipeline {
  agent any
  environment {
    ACCESSAUDIT_API_KEY = credentials('accessaudit-api-key')
  }
  stages {
    stage('Build') {
      steps {
        sh 'npm install'
        sh 'npm run build'
      }
    }
    stage('Accessibility Test') {
      steps {
        sh '''
          npm install -g @accessaudit/cli
          npm run start &
          npx wait-on http://localhost:3000
          accessaudit scan \
            --url http://localhost:3000 \
            --mode quick \
            --max-pages 10 \
            --fail-on-violations \
            --output accessaudit-report.json
        '''
      }
      post {
        always {
          archiveArtifacts artifacts: 'accessaudit-report.json'
        }
      }
    }
  }
}`}
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              CircleCI
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace', fontSize: '0.75rem' }}>
{`# .circleci/config.yml
version: 2.1
jobs:
  accessibility_scan:
    docker:
      - image: cimg/node:18.17
    steps:
      - checkout
      - run:
          name: Install dependencies
          command: npm install
      - run:
          name: Build application
          command: npm run build
      - run:
          name: Install AccessAudit CLI
          command: npm install -g @accessaudit/cli
      - run:
          name: Start server and run scan
          command: |
            npm run start &
            npx wait-on http://localhost:3000
            accessaudit scan \
              --url http://localhost:3000 \
              --mode quick \
              --max-pages 10 \
              --fail-on-violations
      - store_artifacts:
          path: accessaudit-report.json`}
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Best Practices
            </Typography>
            <Grid container spacing={4} sx={{ mb: 4 }}>
              {[
                { title: 'Run on Pull Requests', desc: 'Scan every pull request to catch accessibility issues before they reach production.' },
                { title: 'Use Quick Scan for PRs', desc: 'Quick scans provide fast feedback. Run deep scans on main branch periodically.' },
                { title: 'Set Severity Thresholds', desc: 'Fail builds only on critical/serious issues initially, then lower the threshold over time.' },
                { title: 'Review Reports', desc: 'Always review the full report, not just pass/fail status. Minor issues add up.' },
                { title: 'Baseline Your Score', desc: 'Start with your current accessibility score as a baseline and improve incrementally.' },
                { title: 'Schedule Deep Scans', desc: 'Run full deep scans nightly or weekly for comprehensive coverage.' },
              ].map((item) => (
                <Grid item xs={12} md={6} key={item.title}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {item.desc}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Setting Up API Key
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: `${theme.palette.info.main}10`, border: `1px solid ${theme.palette.info.main}30`, mb: 4 }}>
              <Typography variant="body1" sx={{ color: theme.palette.text.primary, mb: 2, fontWeight: 600 }}>
                Security Best Practices
              </Typography>
              <ul>
                {[
                  'Store your API key as a secret in your CI platform',
                  'Never commit API keys to version control',
                  'Use separate API keys for CI/CD vs local development',
                  'Rotate API keys periodically and when team members leave',
                  'Restrict API key permissions if using organization accounts',
                ].map((item, index) => (
                  <li key={index}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                      {item}
                    </Typography>
                  </li>
                ))}
              </ul>
            </Paper>
          </>
        );
      case 'wcag-21':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              WCAG 2.1
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Web Content Accessibility Guidelines 2.1 defines how to make web content more accessible to people with disabilities.
            </Typography>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Four Principles (POUR)
            </Typography>
            <Grid container spacing={4} sx={{ mb: 4 }}>
              {[
                { title: 'Perceivable', desc: 'Information and user interface components must be presentable to users in ways they can perceive. This means users must be able to perceive the information being presented.' },
                { title: 'Operable', desc: 'User interface components and navigation must be operable. This means users must be able to operate the interface.' },
                { title: 'Understandable', desc: 'Information and the operation of the user interface must be understandable. This means users must be able to understand the information as well as the operation of the user interface.' },
                { title: 'Robust', desc: 'Content must be robust enough that it can be interpreted by a wide variety of user agents, including assistive technologies.' },
              ].map((item) => (
                <Grid item xs={12} md={6} key={item.title}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {item.desc}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Compliance Levels
            </Typography>
            <Paper sx={{ p: 4, mb: 4 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Level
                    </th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Description
                    </th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Typical Use Case
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { level: 'A', desc: 'Minimum accessibility requirements', use: 'Basic compliance' },
                    { level: 'AA', desc: 'Recommended level of accessibility', use: 'Most legal requirements' },
                    { level: 'AAA', desc: 'Highest level of accessibility', use: 'Specialized applications' },
                  ].map((row, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary, fontWeight: 600 }}>
                        Level {row.level}
                      </td>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary }}>
                        {row.desc}
                      </td>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary }}>
                        {row.use}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Key Success Criteria
            </Typography>
            <ul>
              {[
                '1.1.1 Non-text Content - All non-text content has a text alternative',
                '1.3.1 Info and Relationships - Information structure is programmatically determined',
                '1.4.3 Contrast (Minimum) - Text contrast ratio of at least 4.5:1',
                '2.1.1 Keyboard - All functionality is available via keyboard',
                '2.4.3 Focus Order - Focus moves in a meaningful sequence',
                '2.4.7 Focus Visible - Focus indicator is visible',
                '3.3.1 Error Identification - Errors are clearly identified',
                '4.1.2 Name, Role, Value - All interactive elements have proper semantics',
              ].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              References & Resources
            </Typography>
            <Grid container spacing={3}>
              {[
                { title: 'WCAG 2.1 W3C Recommendation', desc: 'W3C official specification document', link: 'https://www.w3.org/TR/WCAG21/' },
                { title: 'WCAG 2.1 Quick Reference', desc: 'How to Meet WCAG (Quick Reference Guide)', link: 'https://www.w3.org/WAI/WCAG21/quickref/' },
                { title: 'Understanding WCAG 2.1', desc: 'Detailed explanations of each success criterion', link: 'https://www.w3.org/WAI/WCAG21/Understanding/' },
                { title: 'WAI-ARIA Authoring Practices', desc: 'Design patterns for accessible components', link: 'https://www.w3.org/WAI/ARIA/apg/' },
                { title: 'WebAIM WCAG 2 Checklist', desc: 'Practical checklist for web developers', link: 'https://webaim.org/standards/wcag/checklist' },
                { title: 'axe-core Rule Documentation', desc: 'Automated accessibility testing rules', link: 'https://dequeuniversity.com/rules/axe/4.9/' },
              ].map((item, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Link href={item.link} target="_blank" rel="noopener noreferrer" sx={{ textDecoration: 'none' }}>
                    <Paper sx={{ p: 3, '&:hover': { boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', borderColor: theme.palette.primary.main }, transition: 'all 0.2s', height: '100%', cursor: 'pointer' }}>
                      <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                        {item.desc}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontFamily: 'monospace' }}>
                        {item.link}
                      </Typography>
                    </Paper>
                  </Link>
                </Grid>
              ))}
            </Grid>
          </>
        );
      case 'wcag-22':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              WCAG 2.2
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              WCAG 2.2 builds on WCAG 2.1 with nine new success criteria, focusing on people with cognitive and learning disabilities.
            </Typography>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              New in WCAG 2.2
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
              WCAG 2.2 was published as a W3C Recommendation on October 5, 2023. It includes all of WCAG 2.1 and 2.0 unchanged, and adds 9 new success criteria.
            </Typography>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              New Success Criteria (Level A)
            </Typography>
            <ul>
              {[
                '2.4.11 Focus Not Obscured (Minimum) - Focus indicator is not entirely hidden by other content',
                '3.2.6 Consistent Help - Help links are in the same relative order across pages',
                '3.3.7 Redundant Entry - Users are not required to re-enter the same information',
              ].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              New Success Criteria (Level AA)
            </Typography>
            <ul>
              {[
                '2.4.12 Focus Not Obscured (Enhanced) - Focus indicator is not obscured at all',
                '2.5.7 Dragging Movements - Alternative input for drag-and-drop',
                '2.5.8 Target Size (Minimum) - Target size is at least 24x24 CSS pixels',
                '3.2.7 Visible Controls - Controls are visible when needed',
                '3.3.8 Accessible Authentication (Minimum) - No cognitive function tests required',
              ].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              New Success Criteria (Level AAA)
            </Typography>
            <ul>
              {[
                '3.3.9 Accessible Authentication (Enhanced) - No cognitive function tests at all',
              ].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>

            <Paper sx={{ p: 4, backgroundColor: `${theme.palette.info.main}10`, border: `1px solid ${theme.palette.info.main}30`, mt: 4 }}>
              <Typography variant="body1" sx={{ color: theme.palette.text.primary, mb: 2, fontWeight: 600 }}>
                Backward Compatibility
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                WCAG 2.2 is backward compatible with 2.1 and 2.0. Content that conforms to WCAG 2.2 also conforms to 2.1 and 2.0, making it a safe upgrade path.
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              References & Resources
            </Typography>
            <Grid container spacing={3}>
              {[
                { title: 'WCAG 2.2 W3C Recommendation', desc: 'W3C official specification (Oct 2023)', link: 'https://www.w3.org/TR/WCAG22/' },
                { title: 'WCAG 2.2 Quick Reference', desc: 'How to Meet WCAG 2.2 guide', link: 'https://www.w3.org/WAI/WCAG22/quickref/' },
                { title: 'Understanding WCAG 2.2', desc: 'Detailed explanations of new criteria', link: 'https://www.w3.org/WAI/WCAG22/Understanding/' },
                { title: 'WCAG 2.2 Changes from 2.1', desc: 'What is new in WCAG 2.2', link: 'https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/' },
                { title: 'W3C WCAG 2 FAQ', desc: 'Frequently asked questions about WCAG', link: 'https://www.w3.org/WAI/standards-guidelines/wcag/faq/' },
                { title: 'Accessibility Support Database', desc: 'Assistive technology support data', link: 'https://accessibilitysupported.com/' },
              ].map((item, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Link href={item.link} target="_blank" rel="noopener noreferrer" sx={{ textDecoration: 'none' }}>
                    <Paper sx={{ p: 3, '&:hover': { boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', borderColor: theme.palette.primary.main }, transition: 'all 0.2s', height: '100%', cursor: 'pointer' }}>
                      <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                        {item.desc}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontFamily: 'monospace' }}>
                        {item.link}
                      </Typography>
                    </Paper>
                  </Link>
                </Grid>
              ))}
            </Grid>
          </>
        );
      case 'en-301-549':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              EN 301 549
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              EN 301 549 is the European standard for ICT accessibility, applicable to all digital products and services offered in the EU.
            </Typography>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              What is EN 301 549?
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
              EN 301 549 is a European standard developed by ETSI that specifies requirements for ICT products and services to be accessible to people with disabilities. It is the reference standard for the European Accessibility Act (EAA).
            </Typography>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Key Chapters
            </Typography>
            <Grid container spacing={4} sx={{ mb: 4 }}>
              {[
                { title: 'Chapter 9', desc: 'Web content accessibility (WCAG 2.1 AA)' },
                { title: 'Chapter 10', desc: 'Non-web documents (PDF, Word, etc.)' },
                { title: 'Chapter 11', desc: 'Software accessibility' },
                { title: 'Chapter 12', desc: 'Documentation and support services' },
                { title: 'Chapter 13', desc: 'Support services and accessibility features' },
                { title: 'Chapter 14', desc: 'Web content (WCAG 2.2 forward)' },
              ].map((item) => (
                <Grid item xs={12} md={6} key={item.title}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {item.desc}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Legal Framework
            </Typography>
            <ul>
              {[
                'European Accessibility Act (EAA) - Directive 2019/882',
                'Web Accessibility Directive (WAD) - Directive 2016/2102',
                'Mandatory for public sector websites and apps',
                'Applies to private sector by June 28, 2025',
                'Products must be accessible at the point of sale',
              ].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Coverage
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
              EN 301 549 covers a wide range of digital products and services:
            </Typography>
            <ul>
              {[
                'Websites and mobile applications',
                'E-commerce platforms and services',
                'Electronic banking and financial services',
                'E-books and digital publishing',
                'Software applications (desktop and mobile)',
                'Consumer electronics with user interfaces',
              ].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              References & Resources
            </Typography>
            <Grid container spacing={3}>
              {[
                { title: 'EN 301 549 V3.2.1', desc: 'ETSI official standard (current version)', link: 'https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf' },
                { title: 'EN 301 549 V4.1.1', desc: 'ETSI standard aligned with WCAG 2.2', link: 'https://www.etsi.org/deliver/etsi_en/301500_301599/301549/04.01.01_60/en_301549v040101p.pdf' },
                { title: 'European Accessibility Act', desc: 'EU Directive (EU) 2019/882', link: 'https://eur-lex.europa.eu/eli/dir/2019/882/oj' },
                { title: 'WAD - Web Accessibility Directive', desc: 'EU Directive (EU) 2016/2102', link: 'https://eur-lex.europa.eu/eli/dir/2016/2102/oj' },
                { title: 'ETSI Official Website', desc: 'European Telecommunications Standards Institute', link: 'https://www.etsi.org/standards' },
                { title: 'European Disability Strategy', desc: 'EU Strategy on the Rights of Persons with Disabilities', link: 'https://ec.europa.eu/social/main.jsp?catId=1202' },
              ].map((item, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Link href={item.link} target="_blank" rel="noopener noreferrer" sx={{ textDecoration: 'none' }}>
                    <Paper sx={{ p: 3, '&:hover': { boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', borderColor: theme.palette.primary.main }, transition: 'all 0.2s', height: '100%', cursor: 'pointer' }}>
                      <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                        {item.desc}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontFamily: 'monospace' }}>
                        {item.link}
                      </Typography>
                    </Paper>
                  </Link>
                </Grid>
              ))}
            </Grid>
          </>
        );
      case 'ada':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              ADA Compliance
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              The Americans with Disabilities Act (ADA) prohibits discrimination against individuals with disabilities in all areas of public life.
            </Typography>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              What is the ADA?
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
              The Americans with Disabilities Act (ADA) was signed into law in 1990. It is a civil rights law that prohibits discrimination against individuals with disabilities in all areas of public life, including jobs, schools, transportation, and all public and private places that are open to the general public.
            </Typography>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              ADA Title III & Web Accessibility
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
              Title III of the ADA prohibits discrimination on the basis of disability in places of public accommodation. Courts have increasingly held that websites and mobile apps are "places of public accommodation" subject to ADA requirements.
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: `${theme.palette.warning.main}10`, border: `1px solid ${theme.palette.warning.main}30`, mb: 4 }}>
              <Typography variant="body1" sx={{ color: theme.palette.text.primary, mb: 2, fontWeight: 600 }}>
                Legal Note
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                While the ADA does not explicitly reference WCAG, courts have generally looked to WCAG AA as the standard for determining web accessibility compliance. Many legal experts recommend aiming for WCAG 2.1 AA compliance.
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Who Must Comply?
            </Typography>
            <ul>
              {[
                'Businesses open to the public (15+ employees)',
                'E-commerce websites and platforms',
                'Financial institutions and banks',
                'Healthcare providers and hospitals',
                'Educational institutions',
                'Government agencies and public services',
                'Hospitality and travel services',
              ].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Best Practices
            </Typography>
            <ol>
              {[
                'Conduct regular accessibility audits of your website',
                'Aim for WCAG 2.1 AA as the minimum compliance standard',
                'Provide accessibility statements on your website',
                'Document accessibility efforts and remediation progress',
                'Train your team on accessibility best practices',
                'Involve users with disabilities in testing',
              ].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ol>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              References & Resources
            </Typography>
            <Grid container spacing={3}>
              {[
                { title: 'ADA Title III Regulations', desc: 'Nondiscrimination on the Basis of Disability', link: 'https://www.ada.gov/law-and-regs/title-iii/' },
                { title: 'ADA.gov Official Website', desc: 'U.S. Department of Justice ADA page', link: 'https://www.ada.gov/' },
                { title: 'Web Content Accessibility Guidelines', desc: 'WCAG referenced in ADA settlements', link: 'https://www.w3.org/WAI/standards-guidelines/wcag/' },
                { title: 'Section 508 Standards', desc: 'U.S. federal accessibility standards', link: 'https://www.section508.gov/' },
                { title: 'ADA Settlement Agreements', desc: 'DOJ ADA settlements database', link: 'https://www.ada.gov/program-activities/settlement-agreements/' },
                { title: 'WAI Web Accessibility Laws', desc: 'Policies worldwide overview', link: 'https://www.w3.org/WAI/policies/' },
              ].map((item, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Link href={item.link} target="_blank" rel="noopener noreferrer" sx={{ textDecoration: 'none' }}>
                    <Paper sx={{ p: 3, '&:hover': { boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', borderColor: theme.palette.primary.main }, transition: 'all 0.2s', height: '100%', cursor: 'pointer' }}>
                      <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                        {item.desc}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontFamily: 'monospace' }}>
                        {item.link}
                      </Typography>
                    </Paper>
                  </Link>
                </Grid>
              ))}
            </Grid>
          </>
        );
      case 'custom-rules':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              Custom Rules
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Define your own accessibility rules and validation criteria to extend AccessAudit's built-in checks.
            </Typography>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Register a Custom Rule
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
              Use our API to register custom accessibility rules that run alongside our built-in checks.
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace', fontSize: '0.875rem' }}>
{`POST /api/v1/scanner/rules
Content-Type: application/json
Authorization: Bearer your-api-key

{
  "id": "custom-email-label",
  "name": "Email Field Label Check",
  "category": "operable",
  "severity": "moderate",
  "description": "Ensures email input fields have associated labels",
  "selector": "input[type=\"email\"]",
  "evaluate": "(node) => {
    const ariaLabelledby = node.getAttribute('aria-labelledby');
    const hasLabel = node.labels && node.labels.length > 0;
    return hasLabel || (ariaLabelledby && document.getElementById(ariaLabelledby) !== null);
  }",
  "messages": {
    "pass": "Email field has an associated label",
    "fail": "Email field must have an associated label or aria-labelledby"
  },
  "wcagTags": ["wcag2aa", "wcag131"]
}`}
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Rule Configuration Options
            </Typography>
            <Grid container spacing={4} sx={{ mb: 4 }}>
              {[
                { title: 'Selector', desc: 'CSS selector targeting the elements to check' },
                { title: 'Evaluate Function', desc: 'JavaScript function that returns true (pass) or false (fail)' },
                { title: 'Severity Levels', desc: 'critical, serious, moderate, or minor' },
                { title: 'WCAG Tags', desc: 'Associate your rule with WCAG success criteria' },
              ].map((item) => (
                <Grid item xs={12} md={6} key={item.title}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {item.desc}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Rule Categories
            </Typography>
            <ul>
              {[
                'perceivable - Content must be perceivable by users',
                'operable - Interface components must be operable',
                'understandable - Information and operation must be understandable',
                'robust - Content must be robust enough for various user agents',
              ].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>
          </>
        );
      case 'authentication':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              Authentication
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Test authenticated pages by configuring login credentials for your scans.
            </Typography>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Supported Authentication Methods
            </Typography>
            <Grid container spacing={4} sx={{ mb: 4 }}>
              {[
                { title: 'Form Authentication', desc: 'Username and password login forms' },
                { title: 'OAuth / SSO', desc: 'Google, GitHub, and other OAuth providers' },
                { title: 'Custom Headers', desc: 'Bearer tokens or custom auth headers' },
                { title: 'Cookie Injection', desc: 'Pre-set session cookies for scanning' },
              ].map((item) => (
                <Grid item xs={12} md={6} key={item.title}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {item.desc}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Configuring Form Authentication
            </Typography>
            <ol>
              {[
                'Go to Project Settings → Authentication tab',
                'Select "Form Authentication" as the auth method',
                'Enter the login URL of your application',
                'Provide the username and password credentials',
                'Specify the username and password field selectors (auto-detected if possible)',
                'Optionally add a 2FA method if required',
                'Click "Test Connection" to verify the login works',
                'Save the settings - all future scans will use authenticated access',
              ].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ol>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Security Best Practices
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: `${theme.palette.warning.main}10`, border: `1px solid ${theme.palette.warning.main}30`, mb: 4 }}>
              <Typography variant="body1" sx={{ color: theme.palette.text.primary, mb: 2, fontWeight: 600 }}>
                Credential Security
              </Typography>
              <ul>
                {[
                  'Use dedicated test accounts, never real user accounts',
                  'Credentials are encrypted at rest using AES-256',
                  'Use the minimum required permissions for test accounts',
                  'Regularly rotate test account passwords',
                  'Enable IP whitelisting for added security',
                ].map((item, index) => (
                  <li key={index}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                      {item}
                    </Typography>
                  </li>
                ))}
              </ul>
            </Paper>
          </>
        );
      case 'tunnel-mode':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              Tunnel Mode
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Test localhost and staging environments securely using our encrypted tunnel connection.
            </Typography>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              How Tunnel Mode Works
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
              Tunnel mode creates an encrypted, secure connection between your local environment and our scanning infrastructure, allowing you to test internal applications without exposing them to the public internet.
            </Typography>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Quick Setup
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', mb: 4 }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace', fontSize: '0.875rem' }}>
{`# 1. Install the AccessAudit CLI
npm install -g @accessaudit/cli

# 2. Authenticate with your API key
accessaudit auth your-api-key

# 3. Start the tunnel to your local server
accessaudit tunnel --port 3000

# 4. Run a scan against your local app
accessaudit scan --url http://localhost:3000 --tunnel`}
              </Typography>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Use Cases
            </Typography>
            <Grid container spacing={4} sx={{ mb: 4 }}>
              {[
                { title: 'Local Development', desc: 'Test your app during development before deployment' },
                { title: 'Staging Environments', desc: 'Scan internal staging servers behind firewalls' },
                { title: 'CI/CD Pipelines', desc: 'Run accessibility checks in your build pipeline' },
                { title: 'Pre-Production QA', desc: 'Validate accessibility before production releases' },
              ].map((item) => (
                <Grid item xs={12} md={6} key={item.title}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {item.desc}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Security Features
            </Typography>
            <ul>
              {[
                'End-to-end AES-256 encryption for all tunnel traffic',
                'Tunnels are ephemeral - they exist only for the duration of the scan',
                'No data is stored on our servers after the scan completes',
                'IP whitelisting to restrict tunnel access to trusted IPs',
                'SOCKS5 proxy support for complex network configurations',
              ].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>
          </>
        );
      case 'team-collaboration':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              Team Collaboration
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Work with your team to improve accessibility across your organization.
            </Typography>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Team Roles and Permissions
            </Typography>
            <Grid container spacing={4} sx={{ mb: 4 }}>
              {[
                { title: 'Owner', desc: 'Full access to all settings, billing, and team management' },
                { title: 'Admin', desc: 'Manage projects, team members, and configurations' },
                { title: 'Developer', desc: 'Run scans, view reports, and create issues' },
                { title: 'Viewer', desc: 'View scan results and reports (read-only)' },
              ].map((item) => (
                <Grid item xs={12} md={6} key={item.title}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {item.desc}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Collaboration Features
            </Typography>
            <ul>
              {[
                'Shared project workspaces with granular access control',
                'Comment on specific violations to discuss fixes',
                'Assign issues to team members with due dates',
                'Slack and email notifications for scan completions',
                'GitHub and Jira integrations for issue tracking',
                'Shared scan history and trend tracking over time',
                'Custom dashboards for team visibility',
              ].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Adding Team Members
            </Typography>
            <ol>
              {[
                'Go to Team Settings from the sidebar navigation',
                'Click "Invite Member" button',
                'Enter the team member\'s email address',
                'Select the appropriate role (Admin, Developer, or Viewer)',
                'Optionally add a personal message',
                'Click "Send Invitation"',
                'The team member will receive an email with a link to join',
              ].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ol>
          </>
        );
      case 'scan-failures':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              Scan Failures
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Why scans fail and how to fix common issues. If your scan is failing, work through this troubleshooting guide.
            </Typography>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Common Failure Reasons
            </Typography>
            <Grid container spacing={4} sx={{ mb: 4 }}>
              {[
                { title: 'Invalid URL', desc: 'The URL you entered is not valid or accessible' },
                { title: 'Timeout', desc: 'The page took too long to load or respond' },
                { title: 'Authentication Error', desc: 'Login credentials are incorrect or expired' },
                { title: 'Rate Limiting', desc: 'Too many requests from your IP address' },
              ].map((item) => (
                <Grid item xs={12} md={6} key={item.title}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {item.desc}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Network Connectivity Issues
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
              If your scan can\'t reach your website, try these steps:
            </Typography>
            <ol>
              {[
                'Verify the URL is correct and accessible from your browser',
                'Check if your site is blocking our scanner IP addresses',
                'Ensure your firewall or WAF allows access from our servers',
                'If using CDN, check for bot protection rules',
                'Try a quick scan with a well-known site like google.com to verify',
              ].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ol>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Timeout Issues
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
              Scans may time out if your page is slow to load or has many resources:
            </Typography>
            <ul>
              {[
                'Increase the scan timeout in project settings',
                'Optimize your page load performance',
                'Reduce the number of rules being scanned',
                'Use Quick Scan mode instead of Deep Scan',
                'Check for infinite loops or long-running scripts',
              ].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Getting Help
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: `${theme.palette.info.main}10`, border: `1px solid ${theme.palette.info.main}30`, mb: 4 }}>
              <Typography variant="body1" sx={{ color: theme.palette.text.primary, mb: 2, fontWeight: 600 }}>
                Still Having Issues?
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                If you can\'t resolve the issue, contact our support team with:
              </Typography>
              <ul>
                {[
                  'The URL you were trying to scan',
                  'The scan mode (Quick or Deep)',
                  'Screenshot of the error message',
                  'Any relevant console logs or error details',
                ].map((item, index) => (
                  <li key={index}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                      {item}
                    </Typography>
                  </li>
                ))}
              </ul>
            </Paper>
          </>
        );
      case 'performance':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              Performance Optimization
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Optimize scan speed and reduce execution time without sacrificing coverage.
            </Typography>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Scan Speed Factors
            </Typography>
            <Grid container spacing={4} sx={{ mb: 4 }}>
              {[
                { title: 'Page Size', desc: 'Larger pages with more DOM elements take longer to scan' },
                { title: 'Number of Rules', desc: 'More rules means more checks per page' },
                { title: 'Network Speed', desc: 'Slow networks increase page load time' },
                { title: 'Scan Depth', desc: 'Deep scans explore more pages and interactions' },
              ].map((item) => (
                <Grid item xs={12} md={6} key={item.title}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {item.desc}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Optimization Techniques
            </Typography>
            <ol>
              {[
                'Use Quick Scan for development cycles - it focuses on the most common issues',
                'Limit scan scope to specific pages or sections using URL patterns',
                'Select only the rules relevant to your project',
                'Increase concurrency for multi-page scans (Enterprise plans)',
                'Run scans from a region closer to your server',
                'Cache static scans and only re-test changed pages',
                'Use the CLI for local testing to avoid network latency',
              ].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ol>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Typical Scan Times
            </Typography>
            <Paper sx={{ p: 4, mb: 4 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Scan Type
                    </th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Single Page
                    </th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      10 Pages
                    </th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      50 Pages
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { type: 'Quick Scan', single: '30-60 seconds', ten: '5-8 minutes', fifty: '25-40 minutes' },
                    { type: 'Deep Scan', single: '3-5 minutes', ten: '30-50 minutes', fifty: '2-3 hours' },
                    { type: 'Full Site', single: '1-2 minutes', ten: '15-25 minutes', fifty: '1-2 hours' },
                  ].map((row, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary }}>
                        {row.type}
                      </td>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary }}>
                        {row.single}
                      </td>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary }}>
                        {row.ten}
                      </td>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary }}>
                        {row.fifty}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Paper>
          </>
        );
      case 'support':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              Support
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Get help from our team and community. We\'re here to help you succeed.
            </Typography>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Support Channels
            </Typography>
            <Grid container spacing={4} sx={{ mb: 4 }}>
              {[
                { title: 'Documentation', desc: 'Read our comprehensive docs and guides' },
                { title: 'Email Support', desc: 'Contact our team at support@accessaudit.com' },
                { title: 'Community Forum', desc: 'Join discussions with other users' },
                { title: 'GitHub Issues', desc: 'Report bugs or request features' },
              ].map((item) => (
                <Grid item xs={12} md={6} key={item.title}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {item.desc}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Before You Contact Support
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
              To help us resolve your issue faster, please prepare:
            </Typography>
            <ul>
              {[
                'Your account email and project name',
                'The exact error message or a screenshot',
                'Steps to reproduce the issue',
                'Your browser and operating system',
                'Any relevant URLs or scan IDs',
              ].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Response Times
            </Typography>
            <Paper sx={{ p: 4, mb: 4 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Plan
                    </th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Response Time
                    </th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
                      Support Hours
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { plan: 'Free', response: '2-3 business days', hours: 'Community support only' },
                    { plan: 'Pro', response: 'Within 24 hours', hours: 'Monday-Friday, 9am-6pm UTC' },
                    { plan: 'Enterprise', response: 'Within 4 hours', hours: '24/7 priority support' },
                  ].map((row, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary }}>
                        {row.plan}
                      </td>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary }}>
                        {row.response}
                      </td>
                      <td style={{ padding: '8px', borderBottom: `1px solid ${theme.palette.divider}`, color: theme.palette.text.secondary }}>
                        {row.hours}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Paper>

            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary, mt: 6 }}>
              Feature Requests
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
              We love hearing your ideas! If you have a feature suggestion:
            </Typography>
            <ol>
              {[
                'Check our public roadmap to see if it\'s already planned',
                'Search existing GitHub issues to avoid duplicates',
                'Create a new issue with a clear description',
                'Explain the problem you\'re trying to solve',
                'Include examples or mockups if helpful',
              ].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ol>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      <Header onThemeToggle={onThemeToggle} isDarkMode={isDarkMode} />

      <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        <Box
          sx={{
            width: { xs: 0, md: 280 },
            flexShrink: 0,
            backgroundColor: theme.palette.background.paper,
            borderRight: { xs: 'none', md: `1px solid ${theme.palette.divider}` },
            overflowY: 'auto',
          }}
        >
          {renderSidebar()}
        </Box>

        <Box
          sx={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.palette.background.default,
            zIndex: 1200,
            display: { xs: mobileOpen ? 'block' : 'none', md: 'none' },
          }}
        >
          <Box sx={{ display: 'flex', minHeight: '100%' }}>
            <Box
              sx={{
                width: 280,
                backgroundColor: theme.palette.background.paper,
                borderRight: `1px solid ${theme.palette.divider}`,
                overflowY: 'auto',
              }}
            >
              {renderSidebar(true)}
            </Box>
          </Box>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            backgroundColor: theme.palette.background.default,
            p: { xs: 4, md: 8 },
          }}
        >
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', mb: 4 }}>
            <Button onClick={() => setMobileOpen(true)} sx={{ mr: 2 }}>
              <Menu />
            </Button>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
              }}
            >
              Documentation
            </Typography>
          </Box>

          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
}

export default Docs;