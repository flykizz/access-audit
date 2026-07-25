import { Box, Typography, Grid, Card, CardContent, Chip } from '@mui/material';
import { Check, X } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

function ComparisonSection() {
  const theme = useTheme();

  const comparisonData = [
    {
      feature: 'Test Creation',
      testlab: 'Natural language',
      traditional: 'Scripted code',
    },
    {
      feature: 'Maintenance',
      testlab: 'AI adapts automatically',
      traditional: 'Manual fix required',
    },
    {
      feature: 'UI Changes',
      testlab: 'Self-healing tests',
      traditional: 'Broken tests',
    },
    {
      feature: 'Setup Time',
      testlab: 'Minutes',
      traditional: 'Days/weeks',
    },
    {
      feature: 'Flakiness',
      testlab: 'Low',
      traditional: 'High',
    },
    {
      feature: 'Cross-browser',
      testlab: 'Automatic',
      traditional: 'Requires configuration',
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
        AccessAudit vs. Traditional Tools
      </Typography>

      <Card
        sx={{
          mt: 6,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Grid container>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  p: 4,
                  backgroundColor: `${theme.palette.primary.main}10`,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                  }}
                >
                  Feature
                </Typography>
              </Box>
              {comparisonData.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 4,
                    borderBottom: index !== comparisonData.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 500,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {item.feature}
                  </Typography>
                </Box>
              ))}
            </Grid>

            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  p: 4,
                  backgroundColor: `${theme.palette.primary.main}`,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: 'white',
                  }}
                >
                  AccessAudit
                </Typography>
              </Box>
              {comparisonData.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 4,
                    borderBottom: index !== comparisonData.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Check sx={{ color: theme.palette.success.main, mr: 2, fontSize: 20 }} />
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.text.primary,
                    }}
                  >
                    {item.testlab}
                  </Typography>
                </Box>
              ))}
            </Grid>

            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  p: 4,
                  backgroundColor: `${theme.palette.grey[200]}`,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                  }}
                >
                  Traditional Tools
                </Typography>
              </Box>
              {comparisonData.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 4,
                    borderBottom: index !== comparisonData.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X sx={{ color: theme.palette.error.main, mr: 2, fontSize: 20 }} />
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {item.traditional}
                  </Typography>
                </Box>
              ))}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ComparisonSection;