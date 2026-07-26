import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  AlertTitle,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Radar,
  BugReport,
  CheckCircle,
  ArrowBack,
  Lightbulb,
} from '@mui/icons-material';
import Header from '../Header';
import Footer from '../Footer';

interface TestPageShellProps {
  title: string;
  description: string;
  category: string;
  expectedIssues: { rule: string; severity: 'critical' | 'serious' | 'moderate' | 'minor'; description: string }[];
  children: (isBroken: boolean) => ReactNode;
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

function TestPageShell({
  title,
  description,
  category,
  expectedIssues,
  children,
  onThemeToggle,
  isDarkMode,
}: TestPageShellProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isBroken, setIsBroken] = useState(true);

  const severityColor = {
    critical: theme.palette.error.main,
    serious: '#f97316',
    moderate: theme.palette.warning.main,
    minor: theme.palette.info.main,
  };

  const handleScanThisPage = () => {
    const currentUrl = window.location.href;
    navigate('/scan', { state: { prefillUrl: currentUrl } });
  };

  return (
    <>
      <Header onThemeToggle={onThemeToggle} isDarkMode={isDarkMode} />
      <Box sx={{ maxWidth: '1440px', mx: 'auto', px: { xs: 2, sm: 4, md: 6 }, py: { xs: 4, sm: 6 } }}>
        {/* Back link */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/test-pages')}
          sx={{ mb: 3, color: theme.palette.text.secondary }}
        >
          All Test Pages
        </Button>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Chip
              label={category}
              size="small"
              sx={{
                backgroundColor: `${theme.palette.primary.main}15`,
                color: theme.palette.primary.main,
                fontWeight: 600,
              }}
            />
          </Box>
          <Typography variant="h1" sx={{ fontSize: { xs: '2rem', sm: '2.5rem' }, fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
            {title}
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxWidth: '800px' }}>
            {description}
          </Typography>
        </Box>

        {/* Action bar */}
        <Paper sx={{ p: 3, mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
          <ToggleButtonGroup
            value={isBroken ? 'broken' : 'fixed'}
            exclusive
            onChange={(_, value) => value && setIsBroken(value === 'broken')}
            size="small"
          >
            <ToggleButton value="broken" sx={{ px: 3 }}>
              <BugReport sx={{ fontSize: 18, mr: 1 }} />
              Broken Version
            </ToggleButton>
            <ToggleButton value="fixed" sx={{ px: 3 }}>
              <CheckCircle sx={{ fontSize: 18, mr: 1 }} />
              Accessible Version
            </ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="contained"
            startIcon={<Radar />}
            onClick={handleScanThisPage}
          >
            Scan This Page
          </Button>
        </Paper>

        {/* Status banner */}
        <Alert
          severity={isBroken ? 'warning' : 'success'}
          sx={{ mb: 4 }}
          icon={isBroken ? <BugReport /> : <CheckCircle />}
        >
          <AlertTitle>{isBroken ? 'Contains Intentional Accessibility Issues' : 'All Issues Fixed'}</AlertTitle>
          {isBroken
            ? 'This version contains known accessibility violations. Run a scan to detect them.'
            : 'This version demonstrates accessible implementation. Compare with the broken version to see the difference.'}
        </Alert>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4 }}>
          {/* Demo area */}
          <Box>
            <Typography variant="h4" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
              Demo Component
            </Typography>
            <Paper
              sx={{
                p: { xs: 2, sm: 4 },
                minHeight: '400px',
                border: `2px dashed ${isBroken ? theme.palette.warning.main : theme.palette.success.main}40`,
                backgroundColor: isBroken ? `${theme.palette.warning.main}05` : `${theme.palette.success.main}05`,
              }}
            >
              {children(isBroken)}
            </Paper>
          </Box>

          {/* Expected issues sidebar */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Lightbulb sx={{ color: theme.palette.warning.main }} />
              <Typography variant="h4" sx={{ fontSize: '1.25rem', fontWeight: 600, color: theme.palette.text.primary }}>
                Expected Issues
              </Typography>
            </Box>
            <Paper sx={{ p: 3 }}>
              {expectedIssues.length === 0 ? (
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  No issues expected in this version.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {expectedIssues.map((issue, index) => (
                    <Box key={index}>
                      {index > 0 && <Divider sx={{ my: 1 }} />}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          {issue.rule}
                        </Typography>
                        <Chip
                          label={issue.severity}
                          size="small"
                          sx={{
                            backgroundColor: `${severityColor[issue.severity]}20`,
                            color: severityColor[issue.severity],
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                        {issue.description}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </Box>
      <Footer />
    </>
  );
}

export default TestPageShell;
