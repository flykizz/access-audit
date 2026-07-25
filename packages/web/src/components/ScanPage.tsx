import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Chip,
  useTheme,
  Alert,
} from '@mui/material';
import {
  Public,
  Keyboard,
  Visibility,
  Mouse,
  Smartphone,
  CheckCircle,
  ArrowRight,
} from '@mui/icons-material';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/axios';
import { useAppStore } from '../store/appStore';

interface ScanPageProps {
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

import type { ScanResult } from '@accessaudit/core';

interface MultiPageScanResult {
  results: ScanResult[];
  totalPages: number;
  totalViolations: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
}

function ScanPage({ onThemeToggle, isDarkMode }: ScanPageProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState('');
  const [scanResult, setScanResult] = useState<MultiPageScanResult | null>(null);
  const [scanId, setScanId] = useState('');
  const addScanResults = useAppStore((state) => state.addScanResults);

  const scanSteps = [
    'Initializing AI agent...',
    'Loading target website...',
    'Running automated accessibility checks...',
    'Testing keyboard navigation...',
    'Verifying screen reader compatibility...',
    'Checking color contrast...',
    'Generating compliance report...',
    'Scan complete!',
  ];

  useEffect(() => {
    if (isScanning) {
      const stepIndex = Math.floor(progress / 14);
      if (stepIndex < scanSteps.length) {
        setCurrentStep(scanSteps[stepIndex]);
      }

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + Math.random() * 10;
        });
      }, 600);

      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const handleStartScan = async () => {
    if (!url) return;
    
    const newScanId = `scan-${Date.now()}`;
    
    setIsScanning(true);
    setProgress(0);
    setError('');
    setScanResult(null);
    setScanId(newScanId);

    try {
      const response = await api.post('/v1/scanner/static', { url });
      const result = response.data.data;
      setScanResult(result);
      
      if (result.results && result.results.length > 0) {
        addScanResults(result.results);
      }
      
      setProgress(100);
      setCurrentStep('Scan complete!');
      
      setTimeout(() => {
        navigate(`/results/${newScanId}`);
      }, 800);
    } catch (err) {
      setError('Scan failed. Please try again.');
      setIsScanning(false);
      setProgress(0);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      <Header onThemeToggle={onThemeToggle} isDarkMode={isDarkMode} />

      <main>
        {!isScanning ? (
          <Box sx={{ mx: 'auto', px: { xs: 4, md: 8 }, py: { xs: 8, md: 12 } }}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: 2,
                }}
              >
                Test Your Website Accessibility
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: '1.125rem',
                  color: theme.palette.text.secondary,
                  maxWidth: '500px',
                  mx: 'auto',
                }}
              >
                Our AI-powered scanner checks your website against WCAG 2.1/2.2 standards and provides detailed compliance reports.
              </Typography>
            </Box>

            <Paper
              sx={{
                p: { xs: 4, md: 6 },
                boxShadow: '0 4px 60px rgba(0, 0, 0, 0.08)',
                borderRadius: '16px',
              }}
            >
              {error && (
                <Alert severity="error" sx={{ mb: 4, borderRadius: '8px' }}>
                  {error}
                </Alert>
              )}

              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 4 }}
              >
                Enter Website URL
              </Typography>

              <Grid container spacing={4}>
                <Grid item xs={12} md={10}>
                  <TextField
                    fullWidth
                    label="Website URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        height: '56px',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleStartScan}
                    disabled={!url}
                    sx={{
                      height: '56px',
                      borderRadius: '12px',
                      backgroundColor: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                      '&:disabled': {
                        backgroundColor: theme.palette.grey[300],
                      },
                    }}
                  >
                    Start Scan
                  </Button>
                </Grid>
              </Grid>

              <Box sx={{ mt: 6 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: theme.palette.text.secondary, mb: 3 }}
                >
                  Scan Includes
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { icon: <Public sx={{ fontSize: '18px' }} />, label: 'Desktop Scan' },
                    { icon: <Smartphone sx={{ fontSize: '18px' }} />, label: 'Mobile Scan' },
                    { icon: <Keyboard sx={{ fontSize: '18px' }} />, label: 'Keyboard Navigation' },
                    { icon: <Visibility sx={{ fontSize: '18px' }} />, label: 'Screen Reader' },
                    { icon: <Mouse sx={{ fontSize: '18px' }} />, label: 'Touch Interaction' },
                  ].map((item) => (
                    <Grid item xs={6} sm={4} key={item.label}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 2,
                          backgroundColor: `${theme.palette.primary.main}5`,
                          borderRadius: '8px',
                        }}
                      >
                        {item.icon}
                        <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                          {item.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Box
                sx={{
                  mt: 6,
                  p: 4,
                  backgroundColor: `${theme.palette.warning.main}5`,
                  borderRadius: '12px',
                  borderLeft: `4px solid ${theme.palette.warning.main}`,
                }}
              >
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Quick Scan uses our lightweight model for fast results. Full accounts unlock Deep
                  Scanning with comprehensive WCAG 2.1/2.2 coverage.
                </Typography>
              </Box>
            </Paper>

            <Box sx={{ mt: 8, textAlign: 'center' }}>
              <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary }}>
                Trusted by teams worldwide
              </Typography>
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 8, opacity: 0.5 }}>
                {['Google', 'Microsoft', 'Amazon', 'Meta'].map((company) => (
                  <Typography
                    key={company}
                    variant="h6"
                    sx={{ fontWeight: 700, color: theme.palette.text.secondary }}
                  >
                    {company}
                  </Typography>
                ))}
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ px: { xs: 4, md: 8 }, py: { xs: 8, md: 12 } }}>
            <Box sx={{ maxWidth: '1000px', mx: 'auto' }}>
              <Box sx={{ textAlign: 'center', mb: 8 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 2,
                    px: 4,
                    py: 2,
                    backgroundColor: `${theme.palette.primary.main}10`,
                    borderRadius: '20px',
                    mb: 4,
                  }}
                >
                  <CircularProgress size={20} sx={{ color: theme.palette.primary.main }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                    Running
                  </Typography>
                </Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: { xs: '1.75rem', md: '2.5rem' },
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    mb: 2,
                  }}
                >
                  AI Agent at Work
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontSize: '1.125rem', color: theme.palette.text.secondary }}
                >
                  We are scanning your site like a real user in real time
                </Typography>
              </Box>

              <Paper
                sx={{
                  p: { xs: 4, md: 6 },
                  boxShadow: '0 4px 60px rgba(0, 0, 0, 0.08)',
                  borderRadius: '16px',
                  mb: 6,
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    aspectRatio: '16/9',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '12px',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      height: '40px',
                      backgroundColor: '#e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      px: 3,
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f56' }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#27c93f' }} />
                    <Box sx={{ flexGrow: 1, mx: 2, height: 20, backgroundColor: '#d0d0d0', borderRadius: '4px' }} />
                  </Box>

                  <Box sx={{ p: 6, h: 'calc(100% - 40px)' }}>
                    <Box sx={{ height: 8, backgroundColor: '#e8e8e8', borderRadius: '4px', mb: 3 }} />
                    <Box sx={{ height: 6, backgroundColor: '#f0f0f0', borderRadius: '4px', mb: 2 }} />
                    <Box sx={{ height: 6, backgroundColor: '#f0f0f0', borderRadius: '4px', mb: 2 }} />
                    <Box sx={{ height: 6, backgroundColor: '#f0f0f0', borderRadius: '4px', mb: 2 }} />
                    <Box sx={{ height: 6, backgroundColor: '#f0f0f0', borderRadius: '4px', mb: 2 }} />
                    <Box sx={{ height: 6, backgroundColor: '#f0f0f0', borderRadius: '4px', mb: 2 }} />
                    <Box sx={{ height: 6, backgroundColor: '#f0f0f0', borderRadius: '4px' }} />
                  </Box>

                  <Box
                    sx={{
                      position: 'absolute',
                      top: 50,
                      left: 0,
                      right: 0,
                      height: 4,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        backgroundColor: theme.palette.primary.main,
                        width: `${progress}%`,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      position: 'absolute',
                      top: 60,
                      left: `${progress}%`,
                      transform: 'translateX(-50%)',
                      px: 2,
                      py: 1,
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    {Math.floor(progress)}%
                  </Box>
                </Box>
              </Paper>

              <Paper
                sx={{
                  p: { xs: 4, md: 6 },
                  boxShadow: '0 4px 60px rgba(0, 0, 0, 0.08)',
                  borderRadius: '16px',
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: theme.palette.text.secondary, mb: 4 }}
                >
                  Scan Progress
                </Typography>

                <Box sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      height: 8,
                      backgroundColor: `${theme.palette.divider}`,
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        backgroundColor: theme.palette.primary.main,
                        width: `${progress}%`,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {currentStep}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                      {Math.floor(progress)}%
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {scanSteps.map((step, index) => {
                    const stepProgress = (index + 1) * (100 / scanSteps.length);
                    const isCompleted = progress >= stepProgress;
                    const isCurrent = progress >= (index * 100) / scanSteps.length && !isCompleted;

                    return (
                      <Chip
                        key={index}
                        icon={isCompleted ? <CheckCircle sx={{ fontSize: '14px' }} /> : undefined}
                        label={step}
                        sx={{
                          px: 3,
                          py: 1.5,
                          backgroundColor: isCompleted
                            ? `${theme.palette.success.main}10`
                            : isCurrent
                            ? `${theme.palette.primary.main}10`
                            : `${theme.palette.grey[100]}`,
                          color: isCompleted
                            ? theme.palette.success.main
                            : isCurrent
                            ? theme.palette.primary.main
                            : theme.palette.text.secondary,
                          borderRadius: '8px',
                        }}
                      />
                    );
                  })}
                </Box>

                <Box sx={{ mt: 6, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {[
                    { label: 'Keyboard', color: theme.palette.primary.main },
                    { label: 'Screen Reader', color: theme.palette.success.main },
                    { label: 'Contrast', color: theme.palette.warning.main },
                    { label: 'ARIA', color: theme.palette.info.main },
                    { label: 'Touch', color: theme.palette.secondary.main },
                  ].map((tag) => (
                    <Chip
                      key={tag.label}
                      label={tag.label}
                      sx={{
                        px: 2,
                        py: 1,
                        backgroundColor: `${tag.color}10`,
                        color: tag.color,
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Box>
          </Box>
        )}
      </main>

      <Footer />
    </Box>
  );
}

export default ScanPage;
