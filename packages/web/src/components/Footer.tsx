import { Box, Typography, Grid, Link } from '@mui/material';
import { Twitter, LinkedIn, YouTube } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

function Footer() {
  const theme = useTheme();

  const footerLinks = {
    product: [
      { label: 'Home', href: '#' },
      { label: 'Features', href: '#features' },
      { label: 'Examples', href: '#examples' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Compare', href: '#compare' },
      { label: 'Best AI QA Tools', href: '#best-ai-qa' },
      { label: 'Free Tools', href: '#tools' },
    ],
    company: [
      { label: 'Blog', href: '#blog' },
      { label: 'Docs', href: '#docs' },
      { label: 'Privacy', href: '#privacy' },
      { label: 'Terms', href: '#terms' },
      { label: 'Refunds', href: '#refunds' },
      { label: 'Contact', href: '#contact' },
    ],
  };

  const socialLinks = [
    {
      icon: <Twitter sx={{ fontSize: 20 }} />,
      label: 'Follow us on X',
      href: '#twitter',
    },
    {
      icon: <LinkedIn sx={{ fontSize: 20 }} />,
      label: 'Follow us on LinkedIn',
      href: '#linkedin',
    },
    {
      icon: <YouTube sx={{ fontSize: 20 }} />,
      label: 'Subscribe on YouTube',
      href: '#youtube',
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, sm: 12 },
        px: { xs: 2, sm: 4, md: 6 },
        backgroundColor: `${theme.palette.grey[900]}`,
        color: 'white',
        maxWidth: '100%',
      }}
    >
      <Box sx={{ maxWidth: '1440px', mx: 'auto' }}>
        <Grid container spacing={8}>
          <Grid item xs={12} md={3}>
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
                  color: 'white',
                }}
              >
                AccessAudit
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.grey[400],
                lineHeight: 1.6,
              }}
            >
              AI-powered accessibility compliance for modern teams. Make digital experiences accessible to everyone.
            </Typography>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 4,
                color: 'white',
              }}
            >
              Product
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {footerLinks.product.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  sx={{
                    color: theme.palette.grey[400],
                    '&:hover': {
                      color: 'white',
                      textDecoration: 'none',
                    },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 4,
                color: 'white',
              }}
            >
              Company
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {footerLinks.company.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  sx={{
                    color: theme.palette.grey[400],
                    '&:hover': {
                      color: 'white',
                      textDecoration: 'none',
                    },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 4,
                color: 'white',
              }}
            >
              Follow Us
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    color: theme.palette.grey[400],
                    '&:hover': {
                      color: 'white',
                      textDecoration: 'none',
                    },
                  }}
                >
                  {social.icon}
                  {social.label}
                </Link>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 8,
            pt: 6,
            borderTop: `1px solid ${theme.palette.grey[800]}`,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.grey[500],
            }}
          >
            © 2026 AccessAudit. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default Footer;