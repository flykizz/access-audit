import { useState } from 'react';
import { Box, Typography, Button, IconButton, useTheme, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import TestPageShell from './TestPageShell';

interface InteractionTestPageProps {
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

const expectedIssues = [
  { rule: 'aria-dialog-name', severity: 'serious' as const, description: 'Modal dialog missing accessible name.' },
  { rule: 'focus-trap', severity: 'critical' as const, description: 'Modal does not trap focus within the dialog.' },
  { rule: 'tabindex', severity: 'serious' as const, description: 'Interactive elements with tabindex > 0.' },
  { rule: 'aria-roles', severity: 'critical' as const, description: 'Invalid or missing ARIA roles on tabs.' },
  { rule: 'aria-valid-attr-value', severity: 'serious' as const, description: 'aria-expanded has invalid value on dropdown.' },
  { rule: 'keyboard-navigation', severity: 'critical' as const, description: 'Custom dropdown not keyboard accessible.' },
  { rule: 'click-events-have-key-events', severity: 'serious' as const, description: 'Click handler without keyboard equivalent.' },
  { rule: 'button-name', severity: 'critical' as const, description: 'Icon button missing accessible name.' },
  { rule: 'nested-interactive', severity: 'moderate' as const, description: 'Interactive elements nested inside each other.' },
];

function InteractionTestPage({ onThemeToggle, isDarkMode }: InteractionTestPageProps) {
  const theme = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <TestPageShell
      title="Interactive Components Test Page"
      description="Modals, tabs, dropdowns, and accordions demonstrating common interaction accessibility issues: missing focus traps, invalid ARIA, keyboard inaccessibility, and missing button names."
      category="Interactive Components"
      expectedIssues={expectedIssues}
      onThemeToggle={onThemeToggle}
      isDarkMode={isDarkMode}
    >
      {(isBroken) =>
        isBroken ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Broken Modal trigger */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>Modal Dialog</Typography>
              <button
                onClick={() => setModalOpen(true)}
                style={{ padding: '8px 20px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
              >
                Open Modal
              </button>
              {modalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                  <div style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, maxWidth: 400 }}>
                    <h3>Confirm Action</h3>
                    <p style={{ color: '#6b7280' }}>Are you sure you want to proceed?</p>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button onClick={() => setModalOpen(false)} style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                      <button onClick={() => setModalOpen(false)} style={{ padding: '8px 16px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </Box>

            {/* Broken Tabs */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>Tabs</Typography>
              <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid #e5e7eb', marginBottom: 16 }}>
                <div
                  onClick={() => setActiveTab(0)}
                  style={{ padding: '8px 16px', cursor: 'pointer', borderBottom: activeTab === 0 ? '2px solid #6366f1' : 'none', color: activeTab === 0 ? '#6366f1' : '#6b7280' }}
                >
                  Overview
                </div>
                <div
                  onClick={() => setActiveTab(1)}
                  style={{ padding: '8px 16px', cursor: 'pointer', borderBottom: activeTab === 1 ? '2px solid #6366f1' : 'none', color: activeTab === 1 ? '#6366f1' : '#6b7280' }}
                >
                  Details
                </div>
              </div>
              <p style={{ color: '#6b7280' }}>
                {activeTab === 0 ? 'Overview content here.' : 'Details content here.'}
              </p>
            </Box>

            {/* Broken Dropdown */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>Dropdown Menu</Typography>
              <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ display: 'inline-block', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 8, cursor: 'pointer', color: '#6b7280' }}
                aria-expanded="true"
              >
                Select Option ▾
                {dropdownOpen && (
                  <div style={{ position: 'absolute', marginTop: 8, border: '1px solid #e5e7eb', borderRadius: 8, backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <div onClick={() => setDropdownOpen(false)} style={{ padding: '8px 16px', cursor: 'pointer' }}>Option 1</div>
                    <div onClick={() => setDropdownOpen(false)} style={{ padding: '8px 16px', cursor: 'pointer' }}>Option 2</div>
                    <div onClick={() => setDropdownOpen(false)} style={{ padding: '8px 16px', cursor: 'pointer' }}>Option 3</div>
                  </div>
                )}
              </div>
            </Box>

            {/* Broken icon button */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>Action Button</Typography>
              <button style={{ padding: 8, border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', backgroundColor: '#f9fafb' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
              </button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Accessible Modal */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>Modal Dialog</Typography>
              <Button variant="contained" onClick={() => setModalOpen(true)}>
                Open Modal
              </Button>
              <Dialog
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                aria-labelledby="modal-title"
                aria-describedby="modal-desc"
              >
                <DialogTitle id="modal-title">Confirm Action</DialogTitle>
                <DialogContent>
                  <Typography id="modal-desc" sx={{ color: theme.palette.text.secondary }}>
                    Are you sure you want to proceed?
                  </Typography>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                  <Button variant="contained" onClick={() => setModalOpen(false)} autoFocus>
                    Confirm
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>

            {/* Accessible Tabs */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>Tabs</Typography>
              <Box role="tablist" sx={{ display: 'flex', gap: 1, borderBottom: `2px solid ${theme.palette.divider}`, mb: 2 }}>
                <Button
                  role="tab"
                  aria-selected={activeTab === 0}
                  aria-controls="tab-0"
                  id="tab-btn-0"
                  onClick={() => setActiveTab(0)}
                  sx={{ borderBottom: activeTab === 0 ? `2px solid ${theme.palette.primary.main}` : 'none' }}
                >
                  Overview
                </Button>
                <Button
                  role="tab"
                  aria-selected={activeTab === 1}
                  aria-controls="tab-1"
                  id="tab-btn-1"
                  onClick={() => setActiveTab(1)}
                  sx={{ borderBottom: activeTab === 1 ? `2px solid ${theme.palette.primary.main}` : 'none' }}
                >
                  Details
                </Button>
              </Box>
              <Box role="tabpanel" id="tab-0" aria-labelledby="tab-btn-0" hidden={activeTab !== 0}>
                <Typography sx={{ color: theme.palette.text.secondary }}>Overview content here.</Typography>
              </Box>
              <Box role="tabpanel" id="tab-1" aria-labelledby="tab-btn-1" hidden={activeTab !== 1}>
                <Typography sx={{ color: theme.palette.text.secondary }}>Details content here.</Typography>
              </Box>
            </Box>

            {/* Accessible Dropdown */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>Dropdown Menu</Typography>
              <Button
                aria-haspopup="listbox"
                aria-expanded={dropdownOpen}
                aria-label="Select option"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                variant="outlined"
                endIcon={<span aria-hidden="true">▾</span>}
              >
                Select Option
              </Button>
              {dropdownOpen && (
                <Box role="listbox" sx={{ mt: 1, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
                  {['Option 1', 'Option 2', 'Option 3'].map((opt) => (
                    <Box
                      key={opt}
                      role="option"
                      aria-selected={false}
                      tabIndex={0}
                      onClick={() => setDropdownOpen(false)}
                      onKeyDown={(e) => { if (e.key === 'Enter') setDropdownOpen(false); }}
                      sx={{ px: 3, py: 1.5, cursor: 'pointer', '&:hover': { backgroundColor: theme.palette.action.hover } }}
                    >
                      {opt}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* Accessible icon button */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>Action Button</Typography>
              <IconButton aria-label="More options">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </IconButton>
            </Box>
          </Box>
        )
      }
    </TestPageShell>
  );
}

export default InteractionTestPage;
