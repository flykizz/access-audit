import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
} from '@mui/material';
import { ArrowRight } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

function ForgotPassword() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to send reset link');
        return;
      }

      setSuccess('If this email exists, you will receive a reset link');
      setEmail('');
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Grid container height="100vh">
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              px: { xs: 4, md: 12 },
            }}
          >
            <Link to="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                    color: theme.palette.text.primary,
                  }}
                >
                  AccessAudit
                </Typography>
              </Box>
            </Link>

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 700,
                mb: 2,
                color: theme.palette.text.primary,
              }}
            >
              Forgot your password?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                mb: 6,
              }}
            >
              Enter your email and we'll send you a reset link
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 4 }}>
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                sx={{ mb: 4 }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={!email || loading}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  '&:disabled': {
                    opacity: 0.5,
                  },
                }}
                endIcon={<ArrowRight />}
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </Button>

              <Typography
                variant="body2"
                sx={{
                  textAlign: 'center',
                  mt: 4,
                  color: theme.palette.text.secondary,
                }}
              >
                <Link to="/login" style={{ color: theme.palette.primary.main }}>
                  Back to login
                </Link>
              </Typography>
            </form>
          </Box>
        </Grid>

        <Grid
          item
          xs={false}
          md={6}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            p: 8,
          }}
        >
          <Box textAlign="center">
            <Typography
              variant="h3"
              sx={{
                fontSize: '2rem',
                fontWeight: 700,
                color: 'white',
                mb: 4,
              }}
            >
              Make digital experiences accessible to everyone
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'white',
                opacity: 0.9,
                maxWidth: '400px',
              }}
            >
              AccessAudit combines AI-powered behavior testing with comprehensive accessibility scanning to ensure your website is usable by all users, including those with disabilities.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ForgotPassword;