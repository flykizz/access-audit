import { Box, Typography, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

function TermsOfService() {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="24" height="24" rx="6" fill="#6366f1" />
              <path d="M12 12l8 4-8 4V12z" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <Typography variant="h6" sx={{ ml: 2, fontSize: '1.25rem', fontWeight: 700, color: theme.palette.text.primary }}>
              AccessAudit
            </Typography>
          </Box>
        </Link>

        <Typography variant="h1" sx={{ fontSize: '2.5rem', fontWeight: 700, mb: 6, color: theme.palette.text.primary }}>
          Terms of Service
        </Typography>

        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 8, fontSize: '1.125rem' }}>
          Last updated: July 25, 2026
        </Typography>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            1. Introduction
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            These Terms of Service ("Terms") govern your access to and use of AccessAudit website, web application, API, and related services ("Services"). By accessing or using our Services, you agree to be bound by these Terms.
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            2. Account Registration
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            To use certain features of our Services, you must register for an account. You agree to provide accurate, complete, and up-to-date information during registration and to update such information to maintain its accuracy, completeness, and timeliness. You are responsible for protecting your password and any activity or action under your account.
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            3. Service Usage
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            You may use our Services only for lawful purposes and in accordance with these Terms. You agree not to use our Services:
          </Typography>
          <ul>
            {[
              'In any way that violates any applicable national or international law or regulation.',
              'To send or facilitate sending any advertising or promotional material without our prior written consent.',
              'To impersonate or attempt to impersonate AccessAudit, AccessAudit employees, other users, or any other person or entity.',
              'To engage in any other conduct that restricts or inhibits anyone\'s use or enjoyment of the Services, or which, as determined by us, may harm AccessAudit or users of the Services or expose them to liability.',
            ].map((item, index) => (
              <li key={index}>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, lineHeight: 1.8, pl: 2 }}>
                  {item}
                </Typography>
              </li>
            ))}
          </ul>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            4. API Usage
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            If you use our API, you agree to comply with the API documentation and any rate limits we may set. You may not use our API:
          </Typography>
          <ul>
            {[
              'To make excessive API calls that disrupt our Services.',
              'For any purpose unrelated to integrating with your application.',
              'To reverse engineer or attempt to reverse engineer our API.',
            ].map((item, index) => (
              <li key={index}>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2, lineHeight: 1.8, pl: 2 }}>
                  {item}
                </Typography>
              </li>
            ))}
          </ul>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            5. Fees and Payment
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            We may charge fees for certain features of the Services. All fees are non-refundable unless otherwise stated. You agree to pay all fees associated with your use of the Services. We may change fees at any time, but will notify you in advance.
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            6. Intellectual Property
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            The Services and all content contained in or made available through the Services, such as text, graphics, logos, images, and software, are the property of AccessAudit or its licensors and are protected by copyright and other intellectual property laws. You may not copy, reproduce, distribute, or create derivative works from any content without our prior written consent.
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            7. Termination
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            We may terminate or suspend your account and access to the Services at any time, without notice or liability, if you violate these Terms or for any other reason. Upon termination, your right to use the Services will immediately cease.
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            8. Disclaimers
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            The Services are provided "as is" and "as available" without warranties of any kind, express or implied. We do not warrant that the Services will be uninterrupted, secure, or error-free.
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            9. Limitation of Liability
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            In no event shall AccessAudit be liable for any indirect, incidental, special, or consequential damages arising from your use of the Services.
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            10. Changes to Terms
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            We may update these Terms from time to time. We will notify you of any changes by posting the new Terms on our website. Your continued use of the Services after the effective date of the new Terms constitutes your acceptance of the changes.
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            11. Contact Us
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            If you have any questions about these Terms, please contact us at support@accessaudit.com.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default TermsOfService;