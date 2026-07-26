import { Box, Typography, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

function PrivacyPolicy() {
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
          Privacy Policy
        </Typography>

        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 8, fontSize: '1.125rem' }}>
          Last updated: July 25, 2026
        </Typography>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            1. Introduction
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            This Privacy Policy explains how AccessAudit ("we," "us") collects, uses, and shares your personal information when you use our website, web application, API, and related services ("Services").
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            2. Information We Collect
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            We may collect the following types of information:
          </Typography>
          <ul>
            {[
              'Account Information: When creating an account, we collect your name, email address, and password (hashed).',
              'Usage Information: We collect information about how you use our Services, including scan history, API usage, and feature usage.',
              'Device Information: We collect information about the devices you use to access our Services, including IP address, browser type, and operating system.',
              'Scan Data: When you run accessibility scans, we may collect URLs, page content, and scan results to provide the Service.',
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
            3. How We Use Your Information
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            We use your information to:
          </Typography>
          <ul>
            {[
              'Provide and maintain our Services.',
              'Process your requests and provide customer support.',
              'Improve our Services through analysis and testing.',
              'Send you important updates and notifications.',
              'Comply with legal obligations.',
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
            4. Data Security
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            We take reasonable measures to protect your information from unauthorized access, use, or disclosure. However, no method of internet transmission or electronic storage is 100% secure.
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            5. Third-Party Services
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            We may use third-party services to help operate our Services. These services may have their own privacy policies governing how they handle your information.
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            6. Your Rights
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            Depending on your location, you may have the right to:
          </Typography>
          <ul>
            {[
              'Access your personal information.',
              'Correct inaccurate personal information.',
              'Delete your personal information.',
              'Restrict or object to the processing of your personal information.',
              'Withdraw your consent.',
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
            7. Children's Privacy
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            Our Services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            8. Changes to Privacy Policy
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on our website. Your continued use of the Services after the effective date of the new Privacy Policy constitutes your acceptance of the changes.
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            9. Contact Us
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            If you have any questions about this Privacy Policy, please contact us at privacy@accessaudit.com.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default PrivacyPolicy;