import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Button,
  IconButton,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  DesktopMac,
  Smartphone,
  Download,
  FileCopy,
  Share,
  ExpandMore,
  ExpandLess,
  Link as LinkIcon,
  Warning as AlertCircle,
} from '@mui/icons-material';
import Header from './Header';
import Footer from './Footer';
import { useAppStore } from '../store/appStore';
import { exportToJSON, exportToHTML, exportToPDF, createIssue } from '../utils/export';
import type { ScanResult } from '@accessaudit/core';

interface ResultsPageProps {
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

interface Violation {
  id: string;
  wcagTag: string;
  severity: string;
  element: string;
  message: string;
  fixSuggestion: string;
  domPath: string;
  selector: string;
}

interface SingleScanResult {
  url: string;
  scanTime: number;
  totalViolations: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  violations: Violation[];
  passedRules: string[];
  score?: number;
}

function ResultsPage({ onThemeToggle, isDarkMode }: ResultsPageProps) {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const scanResults = useAppStore((state) => state.scanResults);
  const [activeTab, setActiveTab] = useState<'desktop' | 'mobile'>('desktop');
  const [expandedViolations, setExpandedViolations] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const clipboardTimeoutRef = useRef<number | null>(null);

  const toggleViolation = (id: string) => {
    setExpandedViolations((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const copyToClipboard = async (text: string, id: string) => {
    if (clipboardTimeoutRef.current) {
      clearTimeout(clipboardTimeoutRef.current);
    }
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    clipboardTimeoutRef.current = window.setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    return () => {
      if (clipboardTimeoutRef.current) {
        clearTimeout(clipboardTimeoutRef.current);
      }
    };
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return theme.palette.error.main;
      case 'serious':
        return theme.palette.error.light;
      case 'moderate':
        return theme.palette.warning.main;
      case 'minor':
        return theme.palette.info.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getSeverityBackgroundColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return `${theme.palette.error.main}10`;
      case 'serious':
        return `${theme.palette.error.light}10`;
      case 'moderate':
        return `${theme.palette.warning.main}10`;
      case 'minor':
        return `${theme.palette.info.main}10`;
      default:
        return `${theme.palette.grey[100]}`;
    }
  };

  const getStatus = () => {
    if (scanResults.length === 0) return 'pending';
    const totalViolations = scanResults.reduce((sum, r) => sum + r.totalViolations, 0);
    if (totalViolations === 0) return 'PASSED';
    const hasCriticalOrSerious = scanResults.some(r => r.critical > 0 || r.serious > 0);
    if (hasCriticalOrSerious) return 'FAILED';
    return 'WARNING';
  };

  const status = getStatus();

  const getTotalStats = () => {
    return {
      totalViolations: scanResults.reduce((sum, r) => sum + r.totalViolations, 0),
      critical: scanResults.reduce((sum, r) => sum + r.critical, 0),
      serious: scanResults.reduce((sum, r) => sum + r.serious, 0),
      moderate: scanResults.reduce((sum, r) => sum + r.moderate, 0),
      minor: scanResults.reduce((sum, r) => sum + r.minor, 0),
    };
  };

  const totalStats = getTotalStats();

  const overallScore = scanResults.length > 0
    ? Math.round(scanResults.reduce((sum, r) => sum + (r.score || 0), 0) / scanResults.length)
    : 0;

  const getExportData = () => ({
    scanId: id || `scan-${Date.now()}`,
    timestamp: new Date().toISOString(),
    results: scanResults as unknown as ScanResult[],
    overallScore,
    ...totalStats,
  });

  const handleExportJSON = () => {
    exportToJSON(getExportData());
  };

  const handleExportHTML = () => {
    exportToHTML(getExportData());
  };

  const handleExportPDF = () => {
    exportToPDF(getExportData());
  };

  const handleCreateIssue = () => {
    createIssue(getExportData());
  };

  if (scanResults.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
        <Header onThemeToggle={onThemeToggle} isDarkMode={isDarkMode} />
        <main>
          <Box sx={{ px: { xs: 4, md: 8 }, py: { xs: 6, md: 8 } }}>
            <Box sx={{ maxWidth: '1200px', mx: 'auto', textAlign: 'center' }}>
              <Alert severity="info" sx={{ mb: 4 }}>
                No scan results found. Please run a scan first.
              </Alert>
              <Button
                variant="contained"
                onClick={() => (window.location.href = '/scan')}
                sx={{ backgroundColor: theme.palette.primary.main }}
              >
                Go to Scan
              </Button>
            </Box>
          </Box>
        </main>
        <Footer />
      </Box>
    );
  }

  const currentResult = scanResults[selectedPageIndex];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      <Header onThemeToggle={onThemeToggle} isDarkMode={isDarkMode} />

      <main>
        <Box sx={{ px: { xs: 4, md: 8 }, py: { xs: 6, md: 8 } }}>
          <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
            <Paper
              sx={{
                p: { xs: 4, md: 6 },
                boxShadow: '0 4px 60px rgba(0, 0, 0, 0.08)',
                borderRadius: '16px',
                mb: 6,
                backgroundColor:
                  status === 'PASSED'
                    ? `${theme.palette.success.main}5`
                    : status === 'FAILED'
                    ? `${theme.palette.error.main}5`
                    : `${theme.palette.warning.main}5`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor:
                      status === 'PASSED'
                        ? `${theme.palette.success.main}20`
                        : status === 'FAILED'
                        ? `${theme.palette.error.main}20`
                        : `${theme.palette.warning.main}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {status === 'PASSED' ? (
                    <CheckCircle
                      sx={{ fontSize: 28, color: theme.palette.success.main }}
                    />
                  ) : status === 'FAILED' ? (
                    <Error sx={{ fontSize: 28, color: theme.palette.error.main }} />
                  ) : (
                    <AlertCircle
                      sx={{ fontSize: 28, color: theme.palette.warning.main }}
                    />
                  )}
                </Box>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color:
                        status === 'PASSED'
                          ? theme.palette.success.main
                          : status === 'FAILED'
                          ? theme.palette.error.main
                          : theme.palette.warning.main,
                    }}
                  >
                    TEST {status}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Report ID: {id} | {scanResults.length} Page(s) Scanned
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                <Chip
                  label="Accessibility Report"
                  sx={{
                    px: 2.5,
                    py: 1,
                    backgroundColor: `${theme.palette.primary.main}10`,
                    color: theme.palette.primary.main,
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Chip
                  label={`${scanResults.length} Pages`}
                  sx={{
                    px: 2.5,
                    py: 1,
                    backgroundColor: `${theme.palette.info.main}10`,
                    color: theme.palette.info.main,
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Chip
                  label="Quick Test"
                  sx={{
                    px: 2.5,
                    py: 1,
                    backgroundColor: `${theme.palette.grey[100]}`,
                    color: theme.palette.text.secondary,
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </Box>

              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 3 }}
              >
                Overall Summary
              </Typography>

              <Grid container spacing={3} mb={4}>
                {[
                  {
                    label: 'Total Violations',
                    value: totalStats.totalViolations,
                    color: theme.palette.text.primary,
                  },
                  {
                    label: 'Critical',
                    value: totalStats.critical,
                    color: theme.palette.error.main,
                  },
                  {
                    label: 'Serious',
                    value: totalStats.serious,
                    color: theme.palette.error.light,
                  },
                  {
                    label: 'Moderate',
                    value: totalStats.moderate,
                    color: theme.palette.warning.main,
                  },
                  {
                    label: 'Minor',
                    value: totalStats.minor,
                    color: theme.palette.info.main,
                  },
                  {
                    label: 'Overall Score',
                    value: `${overallScore}/100`,
                    color: overallScore >= 80 ? theme.palette.success.main : overallScore >= 60 ? theme.palette.warning.main : theme.palette.error.main,
                    isScore: true,
                    scoreValue: overallScore,
                  },
                ].map((stat) => (
                  <Grid item xs={6} sm={4} md={2} key={stat.label}>
                    <Paper
                      sx={{
                        p: 3,
                        borderRadius: '12px',
                        textAlign: 'center',
                        backgroundColor: `${stat.color}5`,
                      }}
                    >
                      {stat.isScore ? (
                        <Box>
                          <Box
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: '50%',
                              backgroundColor: `${stat.color}20`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mx: 'auto',
                              mb: 1,
                            }}
                          >
                            <Typography
                              variant="h5"
                              sx={{ fontWeight: 700, color: stat.color }}
                            >
                              {stat.scoreValue}
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Typography
                          variant="h4"
                          sx={{ fontWeight: 700, color: stat.color, mb: 1 }}
                        >
                          {stat.value}
                        </Typography>
                      )}
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        {stat.label}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <Box
                sx={{
                  p: 3,
                  backgroundColor:
                    status === 'PASSED'
                      ? `${theme.palette.success.main}10`
                      : status === 'FAILED'
                      ? `${theme.palette.error.main}10`
                      : `${theme.palette.warning.main}10`,
                  borderRadius: '8px',
                  borderLeft: `4px solid ${
                    status === 'PASSED'
                      ? theme.palette.success.main
                      : status === 'FAILED'
                      ? theme.palette.error.main
                      : theme.palette.warning.main
                  }`,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color:
                      status === 'PASSED'
                        ? theme.palette.success.main
                        : status === 'FAILED'
                        ? theme.palette.error.main
                        : theme.palette.warning.main,
                  }}
                >
                  {status === 'PASSED'
                    ? `All ${scanResults.length} page(s) passed accessibility checks. Your website meets WCAG 2.1/2.2 AA standards.`
                    : status === 'FAILED'
                    ? `Found ${totalStats.totalViolations} accessibility violations across ${scanResults.length} page(s). Please fix critical and serious issues to ensure compliance.`
                    : `Found ${totalStats.totalViolations} minor/moderate accessibility issues across ${scanResults.length} page(s). Consider fixing these for better user experience.`}
                </Typography>
              </Box>
            </Paper>

            {scanResults.length > 1 && (
              <Paper
                sx={{
                  p: { xs: 4, md: 6 },
                  boxShadow: '0 4px 60px rgba(0, 0, 0, 0.08)',
                  borderRadius: '16px',
                  mb: 6,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 4 }}
                >
                  Pages Scanned
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {scanResults.map((result, index) => (
                    <Chip
                      key={index}
                      label={`Page ${index + 1}`}
                      onClick={() => setSelectedPageIndex(index)}
                      sx={{
                        px: 3,
                        py: 1.5,
                        backgroundColor:
                          selectedPageIndex === index
                            ? `${theme.palette.primary.main}10`
                            : `${theme.palette.grey[100]}`,
                        color:
                          selectedPageIndex === index
                            ? theme.palette.primary.main
                            : theme.palette.text.secondary,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: `${theme.palette.primary.main}5`,
                        },
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            )}

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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 4,
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: theme.palette.text.primary }}
                  >
                    Page Details
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary, mt: 1 }}
                  >
                    {currentResult.url}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: currentResult.score !== undefined && currentResult.score >= 80
                        ? `${theme.palette.success.main}20`
                        : currentResult.score !== undefined && currentResult.score >= 60
                        ? `${theme.palette.warning.main}20`
                        : `${theme.palette.error.main}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: currentResult.score !== undefined && currentResult.score >= 80
                          ? theme.palette.success.main
                          : currentResult.score !== undefined && currentResult.score >= 60
                          ? theme.palette.warning.main
                          : theme.palette.error.main,
                      }}
                    >
                      {currentResult.score || '-'}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${currentResult.critical} Critical / ${currentResult.serious} Serious`}
                    sx={{
                      px: 2.5,
                      py: 1,
                      backgroundColor: `${theme.palette.error.main}10`,
                      color: theme.palette.error.main,
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </Box>
              </Box>

              {currentResult.violations.length > 0 ? (
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, color: theme.palette.text.secondary, mb: 3 }}
                  >
                    Violations ({currentResult.violations.length})
                  </Typography>
                  {currentResult.violations.map((violation: Violation) => (
                    <Accordion
                      key={violation.id + violation.selector}
                      expanded={expandedViolations.includes(violation.id + violation.selector)}
                      onChange={() => toggleViolation(violation.id + violation.selector)}
                      sx={{
                        width: '100%',
                        mb: 2,
                        borderRadius: '8px',
                        border: `1px solid ${getSeverityColor(violation.severity)}20`,
                        '&:before': { display: 'none' },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={
                          <ExpandMore sx={{ color: theme.palette.text.secondary }} />
                        }
                        sx={{
                          backgroundColor: getSeverityBackgroundColor(violation.severity),
                          borderRadius: '8px',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
                          <Chip
                            label={violation.severity.toUpperCase()}
                            sx={{
                              px: 2,
                              py: 0.5,
                              backgroundColor: `${getSeverityColor(
                                violation.severity
                              )}20`,
                              color: getSeverityColor(violation.severity),
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                            }}
                          />
                          <Chip
                            label={violation.wcagTag}
                            sx={{
                              px: 2,
                              py: 0.5,
                              backgroundColor: `${theme.palette.info.main}10`,
                              color: theme.palette.info.main,
                              borderRadius: '4px',
                              fontSize: '11px',
                            }}
                          />
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 600,
                              color: theme.palette.text.primary,
                              flex: 1,
                            }}
                          >
                            {violation.message}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: theme.palette.text.secondary, fontSize: '12px' }}
                          >
                            {violation.element}
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ mt: 2 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 2 }}
                          >
                            Fix Suggestion
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.text.secondary,
                              mb: 3,
                              backgroundColor: `${theme.palette.success.main}5`,
                              p: 3,
                              borderRadius: '8px',
                            }}
                          >
                            {violation.fixSuggestion}
                          </Typography>

                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 600,
                                  color: theme.palette.text.primary,
                                  mb: 1,
                                }}
                              >
                                DOM Path
                              </Typography>
                              <Box
                                sx={{
                                  backgroundColor: '#f5f5f5',
                                  p: 2,
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontFamily: 'monospace',
                                  color: theme.palette.text.secondary,
                                  wordBreak: 'break-all',
                                }}
                              >
                                {violation.domPath}
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 600,
                                  color: theme.palette.text.primary,
                                  mb: 1,
                                }}
                              >
                                Selector
                              </Typography>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2,
                                }}
                              >
                                <Box
                                  sx={{
                                    flex: 1,
                                    backgroundColor: '#f5f5f5',
                                    p: 2,
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontFamily: 'monospace',
                                    color: theme.palette.text.secondary,
                                    wordBreak: 'break-all',
                                  }}
                                >
                                  {violation.selector}
                                </Box>
                                <IconButton
                                  onClick={() =>
                                    copyToClipboard(violation.selector, violation.selector)
                                  }
                                  sx={{ color: theme.palette.text.secondary }}
                                >
                                  {copiedId === violation.selector ? (
                                    <CheckCircle sx={{ color: theme.palette.success.main }} />
                                  ) : (
                                    <FileCopy />
                                  )}
                                </IconButton>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 4,
                    backgroundColor: `${theme.palette.success.main}5`,
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <CheckCircle sx={{ fontSize: 28, color: theme.palette.success.main, mb: 2 }} />
                  <Typography variant="body1" sx={{ color: theme.palette.success.main }}>
                    No accessibility violations detected on this page.
                  </Typography>
                </Box>
              )}

              {(currentResult.passedRules && currentResult.passedRules.length > 0) && (
                <Box mt={4}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, color: theme.palette.text.secondary, mb: 3 }}
                  >
                    Passed Checks ({currentResult.passedRules.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {currentResult.passedRules.map((ruleId: string) => (
                      <Chip
                        key={ruleId}
                        label={ruleId.replace(/-/g, ' ')}
                        sx={{
                          px: 2,
                          py: 0.5,
                          backgroundColor: `${theme.palette.success.main}10`,
                          color: theme.palette.success.main,
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>

            <Grid container spacing={6}>
              <Grid item xs={12} lg={8}>
                <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                  <Button
                    variant={activeTab === 'desktop' ? 'contained' : 'outlined'}
                    startIcon={<DesktopMac />}
                    onClick={() => setActiveTab('desktop')}
                    sx={{
                      borderRadius: '8px',
                      backgroundColor:
                        activeTab === 'desktop' ? theme.palette.primary.main : 'transparent',
                    }}
                  >
                    Desktop
                  </Button>
                  <Button
                    variant={activeTab === 'mobile' ? 'contained' : 'outlined'}
                    startIcon={<Smartphone />}
                    onClick={() => setActiveTab('mobile')}
                    sx={{
                      borderRadius: '8px',
                      backgroundColor:
                        activeTab === 'mobile' ? theme.palette.primary.main : 'transparent',
                    }}
                  >
                    Mobile
                  </Button>
                  {activeTab === 'desktop' && (
                    <Chip
                      label="Tested"
                      sx={{
                        px: 2,
                        py: 1,
                        backgroundColor: `${theme.palette.success.main}10`,
                        color: theme.palette.success.main,
                        borderRadius: '4px',
                      }}
                    />
                  )}
                </Box>

                <Paper
                  sx={{
                    p: { xs: 4, md: 6 },
                    boxShadow: '0 4px 60px rgba(0, 0, 0, 0.08)',
                    borderRadius: '16px',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 4,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: theme.palette.text.primary }}
                    >
                      Scan Details
                    </Typography>
                    <Chip
                      label={`URL: ${currentResult.url}`}
                      sx={{
                        px: 2.5,
                        py: 1,
                        backgroundColor: `${theme.palette.info.main}10`,
                        color: theme.palette.info.main,
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                  </Box>

                  <Grid container spacing={4}>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, color: theme.palette.text.secondary, mb: 2 }}
                      >
                        Scan Time
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, color: theme.palette.text.primary }}
                      >
                        {currentResult.scanTime}ms
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, color: theme.palette.text.secondary, mb: 2 }}
                      >
                        Test Mode
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, color: theme.palette.text.primary }}
                      >
                        Quick Test
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Paper
                  sx={{
                    p: 4,
                    boxShadow: '0 4px 60px rgba(0, 0, 0, 0.08)',
                    borderRadius: '16px',
                    mb: 6,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 3 }}
                  >
                    Ready to Test Your Site?
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary, mb: 4 }}
                  >
                    Get comprehensive AI-powered accessibility reports for your own websites.
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => (window.location.href = '/scan')}
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      '&:hover': { backgroundColor: theme.palette.primary.dark },
                      borderRadius: '12px',
                    }}
                  >
                    Run Another Scan
                  </Button>
                </Paper>

                <Paper
                  sx={{
                    p: 4,
                    boxShadow: '0 4px 60px rgba(0, 0, 0, 0.08)',
                    borderRadius: '16px',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 3 }}
                  >
                    Export Report
                  </Typography>
                  {[
                    { label: 'Download PDF', icon: <Download sx={{ fontSize: '16px' }} />, action: () => handleExportPDF() },
                    { label: 'Download HTML', icon: <Download sx={{ fontSize: '16px' }} />, action: () => handleExportHTML() },
                    { label: 'Download JSON', icon: <Download sx={{ fontSize: '16px' }} />, action: () => handleExportJSON() },
                    { label: 'Create issue', icon: <Share sx={{ fontSize: '16px' }} />, action: () => handleCreateIssue() },
                  ].map((item) => (
                    <Button
                      key={item.label}
                      fullWidth
                      variant="outlined"
                      startIcon={item.icon}
                      onClick={item.action}
                      sx={{
                        justifyContent: 'flex-start',
                        borderRadius: '8px',
                        mb: 1,
                        color: theme.palette.text.secondary,
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </main>

      <Footer />
    </Box>
  );
}

export default ResultsPage;
