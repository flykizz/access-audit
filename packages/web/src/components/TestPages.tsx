import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Lock,
  TableChart,
  Assignment,
  TouchApp,
  ArrowForward,
  Science,
} from '@mui/icons-material';
import Header from './Header';
import Footer from './Footer';

interface TestPagesProps {
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

const testPages = [
  {
    title: 'Authentication',
    description: 'Login and signup forms with label, contrast, and focus management issues.',
    icon: <Lock />,
    category: 'User Auth',
    route: '/test-pages/auth',
    issueCount: 7,
    wcag: ['1.3.1', '1.4.3', '2.4.7', '3.3.1', '4.1.2'],
    color: '#6366f1',
  },
  {
    title: 'Data Display',
    description: 'Data tables and dashboards with missing headers, captions, and contrast problems.',
    icon: <TableChart />,
    category: 'Data Display',
    route: '/test-pages/data-display',
    issueCount: 6,
    wcag: ['1.3.1', '1.4.3', '2.4.6'],
    color: '#10b981',
  },
  {
    title: 'Form Submission',
    description: 'Complex forms with validation errors, field grouping, and required field issues.',
    icon: <Assignment />,
    category: 'Forms',
    route: '/test-pages/form',
    issueCount: 8,
    wcag: ['1.3.1', '2.4.6', '3.2.2', '3.3.1', '3.3.2'],
    color: '#f59e0b',
  },
  {
    title: 'Interactive Components',
    description: 'Modals, dropdowns, tabs, and accordions with keyboard and ARIA issues.',
    icon: <TouchApp />,
    category: 'Interactions',
    route: '/test-pages/interaction',
    issueCount: 9,
    wcag: ['1.4.10', '2.1.1', '2.1.2', '2.4.3', '4.1.2'],
    color: '#ef4444',
  },
];

function TestPages({ onThemeToggle, isDarkMode }: TestPagesProps) {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <>
      <Header onThemeToggle={onThemeToggle} isDarkMode={isDarkMode} />
      <Box sx={{ maxWidth: '1440px', mx: 'auto', px: { xs: 2, sm: 4, md: 6 }, py: { xs: 6, sm: 10 } }}>
        {/* Hero */}
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Chip
              icon={<Science sx={{ fontSize: '18px !important' }} />}
              label="Test Fixtures"
              sx={{
                backgroundColor: `${theme.palette.primary.main}15`,
                color: theme.palette.primary.main,
                fontWeight: 600,
                fontSize: '0.875rem',
                py: 0.5,
              }}
            />
          </Box>
          <Typography variant="h1" sx={{ fontSize: { xs: '2.25rem', sm: '3rem' }, fontWeight: 700, mb: 3, color: theme.palette.text.primary }}>
            Accessibility Test Pages
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxWidth: '680px', mx: 'auto', fontSize: '1.125rem' }}>
            Demo pages with known accessibility issues. Use these to verify your scanner,
            compare broken vs. accessible implementations, and learn about WCAG violations.
          </Typography>
        </Box>

        {/* Stats bar */}
        <Paper sx={{ p: 4, mb: 8, backgroundColor: `${theme.palette.primary.main}08`, border: `1px solid ${theme.palette.primary.main}20` }}>
          <Grid container spacing={4} sx={{ textAlign: 'center' }}>
            <Grid item xs={6} md={3}>
              <Typography variant="h2" sx={{ fontSize: '2rem', fontWeight: 700, color: theme.palette.primary.main }}>
                4
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Test Categories
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h2" sx={{ fontSize: '2rem', fontWeight: 700, color: theme.palette.secondary.main }}>
                30
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Total Issues
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h2" sx={{ fontSize: '2rem', fontWeight: 700, color: theme.palette.warning.main }}>
                15
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                WCAG Criteria
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h2" sx={{ fontSize: '2rem', fontWeight: 700, color: theme.palette.error.main }}>
                2
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Versions Each
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Test page cards */}
        <Grid container spacing={4}>
          {testPages.map((page) => (
            <Grid item xs={12} md={6} key={page.route}>
              <Paper
                sx={{
                  p: 4,
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                    transform: 'translateY(-2px)',
                    borderColor: page.color,
                  },
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onClick={() => navigate(page.route)}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 3,
                      backgroundColor: `${page.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: page.color,
                    }}
                  >
                    {page.icon}
                  </Box>
                  <Chip
                    label={`${page.issueCount} issues`}
                    size="small"
                    sx={{
                      backgroundColor: `${theme.palette.error.main}15`,
                      color: theme.palette.error.main,
                      fontWeight: 600,
                    }}
                  />
                </Box>

                <Typography variant="h4" sx={{ fontSize: '1.375rem', fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
                  {page.title}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3, flexGrow: 1 }}>
                  {page.description}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {page.wcag.map((criterion) => (
                    <Chip
                      key={criterion}
                      label={`WCAG ${criterion}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}
                    />
                  ))}
                </Box>

                <Button
                  variant="text"
                  endIcon={<ArrowForward />}
                  sx={{ alignSelf: 'flex-start', color: page.color, fontWeight: 600 }}
                >
                  Open Test Page
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* How to use */}
        <Paper sx={{ p: { xs: 3, sm: 5 }, mt: 8, backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#f9fafb' }}>
          <Typography variant="h3" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
            How to Use These Pages
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[
              { step: '1', title: 'Choose a test page', desc: 'Pick a category that matches what you want to test.' },
              { step: '2', title: 'Toggle broken / accessible', desc: 'Switch between versions to see the difference in implementation.' },
              { step: '3', title: 'Click "Scan This Page"', desc: 'The scanner will analyze the current page and report violations.' },
              { step: '4', title: 'Review expected issues', desc: 'Compare scan results with the expected issues list on each page.' },
            ].map((item) => (
              <Box key={item.step} sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    flexShrink: 0,
                  }}
                >
                  {item.step}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 0.5, color: theme.palette.text.primary }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {item.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
      <Footer />
    </>
  );
}

export default TestPages;
