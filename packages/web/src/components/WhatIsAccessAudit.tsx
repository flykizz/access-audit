import { Box, Typography, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';

function WhatIsAccessAudit() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: { xs: 8, sm: 12, md: 16 },
        px: { xs: 2, sm: 4, md: 6 },
        maxWidth: '1440px',
        mx: 'auto',
      }}
    >
      <Grid container spacing={8} alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
              fontWeight: 600,
              mb: 4,
              color: theme.palette.text.primary,
            }}
          >
            What is AccessAudit?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              color: theme.palette.text.secondary,
              lineHeight: 1.8,
            }}
          >
            AccessAudit is an AI-powered accessibility compliance platform that combines automated accessibility scanning with intelligent behavior testing. Our platform helps you identify WCAG 2.1/2.2 violations, test keyboard navigation, screen reader compatibility, and ensure your website is accessible to users with disabilities. Unlike traditional tools, AccessAudit uses AI agents to simulate real user interactions and discover accessibility issues that static scanners miss.
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <img
            src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Accessibility%20testing%20dashboard%20with%20WCAG%20compliance%20checks%20and%20color%20contrast%20analysis%20in%20modern%20tech%20style&image_size=landscape_16_9"
            alt="What is AccessAudit"
            style={{ width: '100%', borderRadius: 16 }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default WhatIsAccessAudit;