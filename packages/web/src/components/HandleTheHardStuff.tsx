import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { Lock, Dataset, Layers, Merge, Monitor } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

function HandleTheHardStuff() {
  const theme = useTheme();

  const capabilities = [
    {
      icon: <Lock sx={{ fontSize: 36, color: theme.palette.primary.main }} />,
      title: 'Authentication Flows',
      description: 'Login, logout, password reset, MFA, OAuth, SSO - AccessAudit tests accessibility across all authentication flows. Ensure keyboard navigation and screen reader compatibility throughout your auth journey.',
    },
    {
      icon: <Dataset sx={{ fontSize: 36, color: theme.palette.secondary.main }} />,
      title: 'Data-Driven Testing',
      description: 'Test with dynamic data sets. Validate forms, search results, and CRUD operations with varying inputs and edge cases.',
    },
    {
      icon: <Layers sx={{ fontSize: 36, color: theme.palette.info.main }} />,
      title: 'Dynamic Content',
      description: 'SPAs, infinite scroll, lazy loading, real-time updates - our AI waits for and validates dynamic content like a real user.',
    },
    {
      icon: <Merge sx={{ fontSize: 36, color: theme.palette.warning.main }} />,
      title: 'Multi-Step Wizards',
      description: 'Complex user journeys with conditional logic, form validation, and state management across multiple pages.',
    },
    {
      icon: <Monitor sx={{ fontSize: 36, color: theme.palette.success.main }} />,
      title: 'Cross-Platform Testing',
      description: 'Every test runs on real browsers. No emulators, no compromises.',
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, sm: 12, md: 16 },
        px: { xs: 2, sm: 4, md: 6 },
        backgroundColor: `${theme.palette.grey[100]}`,
        maxWidth: '100%',
      }}
    >
      <Box sx={{ maxWidth: '1440px', mx: 'auto' }}>
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
          Handle the Hard Stuff
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
        Real applications have authentication, dynamic content, and complex user flows. AccessAudit ensures accessibility across them all - testing keyboard navigation, screen reader compatibility, and WCAG compliance throughout your entire application.
      </Typography>

        <Grid container spacing={4}>
          {capabilities.map((capability, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.paper,
                  '&:hover': {
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <CardContent sx={{ p: 5 }}>
                  <Box sx={{ mb: 3 }}>{capability.icon}</Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      mb: 2,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {capability.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      lineHeight: 1.6,
                    }}
                  >
                    {capability.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              mb: 4,
            }}
          >
            These capabilities are available in the full platform. Sign up to get started.
          </Typography>
          <Button
            variant="contained"
            sx={{
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            Sign up
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default HandleTheHardStuff;