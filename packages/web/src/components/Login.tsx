import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
} from '@mui/material';
import { ArrowRight } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

function Login() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/');
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const isValid = formData.email && formData.password;

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
              Welcome back
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                mb: 6,
              }}
            >
              Sign in to your AccessAudit account
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  mb: 2,
                  borderColor: theme.palette.divider,
                  '&:hover': {
                    backgroundColor: `${theme.palette.grey[100]}`,
                  },
                }}
                startIcon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.295 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                }
              >
                Continue with Google
              </Button>

              <Button
                variant="outlined"
                fullWidth
                sx={{
                  mb: 4,
                  borderColor: theme.palette.divider,
                  '&:hover': {
                    backgroundColor: `${theme.palette.grey[100]}`,
                  },
                }}
                startIcon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                }
              >
                Continue with GitHub
              </Button>

              <Divider sx={{ mb: 4 }}>or</Divider>

              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                sx={{ mb: 2 }}
              />

              <Typography
                variant="body2"
                sx={{
                  textAlign: 'right',
                  mb: 4,
                }}
              >
                <Link to="/forgot-password" style={{ color: theme.palette.primary.main }}>
                  Forgot your password?
                </Link>
              </Typography>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={!isValid || loading}
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
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>

              <Typography
                variant="body2"
                sx={{
                  textAlign: 'center',
                  mt: 4,
                  color: theme.palette.text.secondary,
                }}
              >
                Don't have an account?{' '}
                <Link to="/signup" style={{ color: theme.palette.primary.main }}>
                  Sign up
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

export default Login;