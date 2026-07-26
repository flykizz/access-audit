import { useState } from 'react';
import { Box, TextField, Button, Typography, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel, Checkbox, useTheme } from '@mui/material';
import TestPageShell from './TestPageShell';

interface FormTestPageProps {
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

const expectedIssues = [
  { rule: 'label', severity: 'critical' as const, description: 'Text inputs missing programmatic labels.' },
  { rule: 'fieldset', severity: 'serious' as const, description: 'Radio buttons not grouped in a fieldset with legend.' },
  { rule: 'aria-required-attr', severity: 'serious' as const, description: 'Required fields not indicated with aria-required.' },
  { rule: 'autocomplete-valid', severity: 'moderate' as const, description: 'Address fields missing autocomplete attributes.' },
  { rule: 'color-contrast', severity: 'serious' as const, description: 'Placeholder text contrast below 4.5:1.' },
  { rule: 'form-field-multiple-labels', severity: 'moderate' as const, description: 'Phone field has multiple conflicting labels.' },
  { rule: 'button-name', severity: 'critical' as const, description: 'Submit button using only an icon.' },
  { rule: 'label-content-name-mismatch', severity: 'moderate' as const, description: 'Visible label text mismatched with accessible name.' },
];

function FormTestPage({ onThemeToggle, isDarkMode }: FormTestPageProps) {
  const theme = useTheme();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });

  return (
    <TestPageShell
      title="Form Submission Test Page"
      description="A multi-field registration form demonstrating common form accessibility issues: missing labels, ungrouped radio buttons, missing autocomplete, and unclear required field indicators."
      category="Forms"
      expectedIssues={expectedIssues}
      onThemeToggle={onThemeToggle}
      isDarkMode={isDarkMode}
    >
      {(isBroken) =>
        isBroken ? (
          <Box sx={{ maxWidth: 500, mx: 'auto' }}>
            <Typography variant="h6" sx={{ mb: 3, color: theme.palette.text.primary }}>
              Event Registration
            </Typography>

            {/* Broken: no labels, no fieldset */}
            <div style={{ marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Full name *"
                style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <input
                type="email"
                placeholder="Email address"
                style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Phone</label>
              <input
                type="tel"
                aria-label="Phone Number"
                placeholder="555-0100"
                style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <span style={{ display: 'block', marginBottom: 8 }}>Ticket Type</span>
              <label style={{ marginRight: 16 }}>
                <input type="radio" name="ticket" value="standard" /> Standard
              </label>
              <label>
                <input type="radio" name="ticket" value="vip" /> VIP
              </label>
            </div>

            <div style={{ marginBottom: 16 }}>
              <input type="text" placeholder="Address" style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label>
                <input type="checkbox" /> I agree to the terms
              </label>
            </div>

            <button style={{ padding: '10px 24px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" style={{ verticalAlign: 'middle' }}>
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </button>
          </Box>
        ) : (
          <Box sx={{ maxWidth: 500, mx: 'auto' }}>
            <Typography variant="h6" sx={{ mb: 3, color: theme.palette.text.primary }}>
              Event Registration
            </Typography>

            <Box component="form" onSubmit={(e) => e.preventDefault()} noValidate>
              <TextField
                fullWidth
                label="Full Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                autoComplete="name"
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                autoComplete="email"
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                autoComplete="tel"
                sx={{ mb: 3 }}
              />

              <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
                <FormLabel component="legend">Ticket Type</FormLabel>
                <RadioGroup row aria-label="ticket type" name="ticket">
                  <FormControlLabel value="standard" control={<Radio />} label="Standard" />
                  <FormControlLabel value="vip" control={<Radio />} label="VIP" />
                </RadioGroup>
              </FormControl>

              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                autoComplete="street-address"
                sx={{ mb: 3 }}
              />

              <FormControl sx={{ mb: 3, width: '100%' }}>
                <FormControlLabel
                  control={<Checkbox />}
                  label="I agree to the terms and conditions"
                />
              </FormControl>

              <Button type="submit" variant="contained" startIcon={
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                </svg>
              }>
                Submit Registration
              </Button>
            </Box>
          </Box>
        )
      }
    </TestPageShell>
  );
}

export default FormTestPage;
