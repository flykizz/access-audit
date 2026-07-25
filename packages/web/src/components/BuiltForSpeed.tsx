import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { Speed, Cloud, Smartphone, Public } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

function BuiltForSpeed() {
  const theme = useTheme();

  const features = [
    {
      icon: <Speed sx={{ fontSize: 32, color: theme.palette.primary.main }} />,
      title: 'From prompt to full report',
      description: 'Get comprehensive test results in minutes, not days.',
    },
    {
      icon: <Cloud sx={{ fontSize: 32, color: theme.palette.secondary.main }} />,
      title: 'Scale tests across our cloud',
      description: 'Parallel execution for faster results.',
    },
    {
      icon: <Smartphone sx={{ fontSize: 32, color: theme.palette.info.main }} />,
      title: 'Mobile & tablet testing',
      description: 'Test across devices and screen sizes.',
    },
    {
      icon: <Public sx={{ fontSize: 32, color: theme.palette.warning.main }} />,
      title: 'Test from any AWS region',
      description: 'Global coverage for your applications.',
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, sm: 12, md: 16 },
        px: { xs: 2, sm: 4, md: 6 },
        backgroundColor: `${theme.palette.primary.main}5`,
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
            color: theme.palette.text.primary,
          }}
        >
          Built for Speed. Designed for Scale.
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: '1rem', md: '1.125rem' },
            color: theme.palette.text.secondary,
            mb: 8,
            maxWidth: '600px',
          }}
        >
          Run production-grade accessibility audits powered by AI. AccessAudit scales effortlessly across your entire site, delivering comprehensive WCAG compliance reports as your product and team grow.
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  border: 'none',
                  boxShadow: 'none',
                  backgroundColor: 'transparent',
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ mb: 3 }}>{feature.icon}</Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      mb: 1,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

export default BuiltForSpeed;