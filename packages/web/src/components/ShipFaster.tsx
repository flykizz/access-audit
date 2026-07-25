import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { Schedule, Shield, BugReport, Speed, CenterFocusStrong, Commit } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

function ShipFaster() {
  const theme = useTheme();

  const benefits = [
    {
      icon: <Schedule sx={{ fontSize: 36, color: theme.palette.primary.main }} />,
      title: 'Results in Minutes',
      description: 'Tests run in minutes, not days. Ship when you\'re ready with instant feedback.',
    },
    {
      icon: <Shield sx={{ fontSize: 36, color: theme.palette.secondary.main }} />,
      title: 'Zero Test Maintenance',
      description: 'AI adapts to UI changes. No more fixing broken selectors every sprint.',
    },
    {
      icon: <BugReport sx={{ fontSize: 36, color: theme.palette.error.main }} />,
      title: 'Catch Bugs Before Users',
      description: 'Find issues in staging, not production. Save your on-call team the 3am pages.',
    },
    {
      icon: <Speed sx={{ fontSize: 36, color: theme.palette.warning.main }} />,
      title: 'Instant Test Coverage',
      description: 'Get comprehensive testing in minutes. AI explores flows you\'d never think to test.',
    },
    {
      icon: <CenterFocusStrong sx={{ fontSize: 36, color: theme.palette.info.main }} />,
      title: 'Test More, Ship Faster',
      description: 'As development velocity increases, accessibility coverage needs to scale with it. AccessAudit lets you expand accessibility testing exponentially, catching WCAG violations that would otherwise slip through.',
    },
    {
      icon: <Commit sx={{ fontSize: 36, color: theme.palette.success.main }} />,
      title: 'CI/CD Native',
      description: 'One-line integration with GitHub Actions, GitLab CI, or any pipeline. Run tests on every PR, block bad deploys, and get Slack alerts when things break.',
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, sm: 12, md: 16 },
        px: { xs: 2, sm: 4, md: 6 },
        maxWidth: '1440px',
        mx: 'auto',
      }}
    >
      <Typography
        variant="h2"
        sx={{
          fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
          fontWeight: 600,
          mb: 2,
          textAlign: 'center',
          color: theme.palette.text.primary,
        }}
      >
        Ship Faster Without Sacrificing Quality
      </Typography>
      <Typography
          variant="body1"
          sx={{
            fontSize: { xs: '1rem', md: '1.125rem' },
            color: theme.palette.text.secondary,
            textAlign: 'center',
            mb: 8,
            maxWidth: '600px',
            mx: 'auto',
          }}
        >
          Modern development teams move fast with AI coding assistants and rapid iteration. AccessAudit's AI-driven accessibility testing keeps pace by continuously validating WCAG compliance, ensuring every release is accessible to all users.
        </Typography>

      <Grid container spacing={4}>
        {benefits.map((benefit, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <CardContent sx={{ p: 5 }}>
                <Box sx={{ mb: 3 }}>{benefit.icon}</Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    mb: 2,
                    color: theme.palette.text.primary,
                  }}
                >
                  {benefit.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    lineHeight: 1.6,
                  }}
                >
                  {benefit.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default ShipFaster;