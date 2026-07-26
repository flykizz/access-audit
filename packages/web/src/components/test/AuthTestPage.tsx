import { useState } from 'react';
import { Box, TextField, Button, Typography, Link, useTheme, Alert } from '@mui/material';
import TestPageShell from './TestPageShell';

interface AuthTestPageProps {
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

const expectedIssues = [
  { rule: 'label', severity: 'critical' as const, description: 'Form inputs missing associated <label> elements.' },
  { rule: 'color-contrast', severity: 'serious' as const, description: 'Login button text contrast ratio below 4.5:1.' },
  { rule: 'focus-visible', severity: 'serious' as const, description: 'No visible focus indicator on inputs and buttons.' },
  { rule: 'aria-required-attr', severity: 'serious' as const, description: 'Role attributes missing required aria properties.' },
  { rule: 'form-field-multiple-labels', severity: 'moderate' as const, description: 'Password field has conflicting labels.' },
  { rule: 'autocomplete-valid', severity: 'moderate' as const, description: 'Form fields missing autocomplete attributes.' },
  { rule: 'button-name', severity: 'critical' as const, description: 'Icon-only button without accessible name.' },
];

function AuthTestPage({ onThemeToggle, isDarkMode }: AuthTestPageProps) {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showError, setShowError] = useState(false);

  return (
    <TestPageShell
      title="Authentication Test Page"
      description="A login form demonstrating common accessibility issues in authentication flows: missing labels, poor contrast, missing focus indicators, and icon buttons without accessible names."
      category="User Authentication"
      expectedIssues={expectedIssues}
      onThemeToggle={onThemeToggle}
      isDarkMode={isDarkMode}
    >
      {(isBroken) =>
        isBroken ? (
          /* BROKEN VERSION - raw HTML with intentional a11y issues */
          <Box sx={{ maxWidth: 400, mx: 'auto' }}>
            <Typography variant="h5" sx={{ mb: 3, color: theme.palette.text.primary }}>
              Sign In
            </Typography>

            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
            <div onClick={() => setShowError(true)} style={{ marginBottom: 16 }}>
              <input
                type="email"
                placeholder="Email"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  outline: 'none',
                  fontSize: 16,
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <span>Password</span>
              <input
                type="password"
                placeholder="Enter password"
                aria-label="password"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  outline: 'none',
                  fontSize: 16,
                }}
              />
            </div>

            {showError && (
              <div style={{ color: '#ef4444', marginBottom: 16, fontSize: 14 }}>
                Invalid credentials
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <button
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#c7d2fe',
                  color: '#6366f1',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Login
              </button>
              <button
                style={{
                  padding: '10px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
                aria-label=""
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" fillRule="evenodd" />
                </svg>
              </button>
            </div>

            <a href="#" style={{ color: '#a5b4fc', fontSize: 14 }}>
              Forgot password?
            </a>
          </Box>
        ) : (
          /* ACCESSIBLE VERSION */
          <Box sx={{ maxWidth: 400, mx: 'auto' }}>
            <Typography variant="h5" sx={{ mb: 3, color: theme.palette.text.primary }}>
              Sign In
            </Typography>

            <Box component="form" onSubmit={(e) => { e.preventDefault(); setShowError(true); }} noValidate>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                sx={{ mb: 3 }}
              />

              {showError && (
                <Alert severity="error" sx={{ mb: 3 }} role="alert">
                  Invalid credentials. Please check your email and password.
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button type="submit" variant="contained" fullWidth>
                  Login
                </Button>
                <Button
                  variant="outlined"
                  aria-label="Toggle password visibility"
                  onClick={() => {}}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </Button>
              </Box>
            </Box>

            <Link href="#" sx={{ fontSize: '0.875rem' }}>
              Forgot password?
            </Link>
          </Box>
        )
      }
    </TestPageShell>
  );
}

export default AuthTestPage;
