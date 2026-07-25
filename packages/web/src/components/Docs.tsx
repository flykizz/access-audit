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
              Add your web application and configure project settings.
            </Typography>
            <ol>
              {['Enter your website URL', 'Set a project name', 'Configure scan settings', 'Add webhooks for notifications', 'Save and start scanning'].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1.125rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ol>
          </>
        );
      case 'project-settings':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              Project Settings
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Configure scan options and project preferences.
            </Typography>
            <ul>
              {['Default scan mode', 'Scan schedule', 'Notification preferences', 'Authentication settings', 'Custom rules'].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1.125rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>
          </>
        );
      case 'webhooks':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              Webhooks
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Set up webhooks to receive notifications when scans complete.
            </Typography>
            <ol>
              {['Add a webhook endpoint URL', 'Select notification events', 'Configure payload format', 'Test your webhook', 'Save webhook configuration'].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1.125rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ol>
          </>
        );
      case 'overview':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              API Overview
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Integrate AccessAudit into your CI/CD pipeline using our REST API.
            </Typography>
            <Grid container spacing={4}>
              {[
                { title: 'Run Scan', desc: 'Trigger accessibility scans programmatically' },
                { title: 'Get Report', desc: 'Retrieve scan results and compliance reports' },
                { title: 'Manage Projects', desc: 'Create and manage your projects' },
                { title: 'API Keys', desc: 'Generate and manage API authentication keys' },
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
      case 'scan-api':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              Run Scan API
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Trigger scans programmatically using our API.
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e' }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace' }}>
                {`POST /api/v1/scans\nContent-Type: application/json\n\n{\n  "projectId": "your-project-id",\n  "mode": "quick",\n  "url": "https://your-website.com"\n}`}
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
              Retrieve scan results and compliance reports.
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e' }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace' }}>
                {`GET /api/v1/scans/{scanId}/report\nAuthorization: Bearer your-api-key`}
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
              Command line interface for automation.
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e' }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace' }}>
                {`# Install CLI\nnpm install -g @accessaudit/cli\n\n# Run a scan\naccessaudit scan --url https://your-website.com\n\n# Get report\naccessaudit report --scan-id your-scan-id`}
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
              Integrate AccessAudit into GitHub Actions and GitLab CI.
            </Typography>
            <Paper sx={{ p: 4, backgroundColor: '#1e1e1e' }}>
              <Typography variant="body1" sx={{ color: '#e4e4e4', fontFamily: 'monospace' }}>
                {`# GitHub Actions\n- name: Run AccessAudit scan\n  uses: accessaudit/action@v1\n  with:\n    api-key: \${{ secrets.ACCESSAUDIT_API_KEY }}\n    url: https://your-website.com`}
              </Typography>
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
              Web Content Accessibility Guidelines 2.1 compliance standards.
            </Typography>
            <ul>
              {['Perceivable', 'Operable', 'Understandable', 'Robust'].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1.125rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>
          </>
        );
      case 'wcag-22':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              WCAG 2.2
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Latest accessibility guidelines with new success criteria.
            </Typography>
            <ul>
              {['New success criteria', 'Better keyboard navigation', 'Focus management', 'Input modality'].map((item, index) => (
                <li key={index}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '1.125rem' }}>
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>
          </>
        );
      case 'en-301-549':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              EN 301 549
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              EU accessibility requirements for public sector websites.
            </Typography>
          </>
        );
      case 'ada':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              ADA Compliance
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Americans with Disabilities Act compliance requirements.
            </Typography>
          </>
        );
      case 'custom-rules':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              Custom Rules
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Define your own accessibility rules and validation criteria.
            </Typography>
          </>
        );
      case 'authentication':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              Authentication
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Test authenticated pages with login credentials.
            </Typography>
          </>
        );
      case 'tunnel-mode':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              Tunnel Mode
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Test localhost and staging environments securely.
            </Typography>
          </>
        );
      case 'team-collaboration':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              Team Collaboration
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Work with your team on accessibility improvements.
            </Typography>
          </>
        );
      case 'scan-failures':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              Scan Failures
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Why scans fail and how to fix common issues.
            </Typography>
          </>
        );
      case 'performance':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              Performance
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Optimize scan speed and reduce execution time.
            </Typography>
          </>
        );
      case 'support':
        return (
          <>
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
              Support
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary, mb: 6 }}>
              Get help from our team and community.
            </Typography>
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