import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { MessageSharp, SmartToy, TaskAlt } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

function HowItWorks() {
  const theme = useTheme();

  const steps = [
    {
      icon: <MessageSharp sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Describe What to Test',
      description: 'Write what you want tested in plain English. No selectors, no scripts, no flaky waits.',
      example: `"Go to target.com and verify that searching for 'wireless headphones' shows relevant results"`,
    },
    {
      icon: <SmartToy sx={{ fontSize: 40, color: theme.palette.secondary.main }} />,
      title: 'AI Agent Executes',
      description: 'A real browser runs your test exactly like a human would. Handles popups, auth flows, and dynamic content.',
      example: '',
    },
    {
      icon: <TaskAlt sx={{ fontSize: 40, color: theme.palette.info.main }} />,
      title: 'Get Results in Minutes',
      description: 'Screenshots, step-by-step logs, and clear pass/fail. Includes failure reasoning so you know exactly what broke.',
      example: '',
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
        Automated QA That Finds Bugs Before Your Users Do
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
        AccessAudit delivers AI-powered accessibility testing without scripts or manual maintenance. Our AI agents scan for WCAG compliance, test keyboard navigation, and explore your application to find accessibility barriers that prevent users with disabilities from accessing your content.
      </Typography>

      <Grid container spacing={6}>
        {steps.map((step, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                  borderColor: theme.palette.primary.main,
                },
                transition: 'all 0.3s ease',
              }}
            >
              <CardContent sx={{ p: 6 }}>
                <Box sx={{ mb: 4 }}>{step.icon}</Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    mb: 2,
                    color: theme.palette.text.primary,
                  }}
                >
                  {step.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.text.secondary,
                    lineHeight: 1.6,
                    mb: step.example ? 3 : 0,
                  }}
                >
                  {step.description}
                </Typography>
                {step.example && (
                  <Box
                    sx={{
                      backgroundColor: `${theme.palette.primary.main}10`,
                      borderRadius: 1,
                      p: 3,
                      borderLeft: `4px solid ${theme.palette.primary.main}`,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.primary.main,
                        fontStyle: 'italic',
                      }}
                    >
                      {step.example}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default HowItWorks;