import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormGroup,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAppStore } from '../store/appStore';
import api from '../utils/axios';

interface ScanResult {
  url: string;
  scanTime: number;
  totalViolations: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  violations: { id: string; wcagTag: string; severity: string; element: string; message: string; fixSuggestion: string }[];
}

function Scan() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [includeStaticScan, setIncludeStaticScan] = useState(true);
  const [includeBehaviorTest, setIncludeBehaviorTest] = useState(true);
  const { addScanResult } = useAppStore();

  const handleScan = async () => {
    if (!url) {
      setError('Please enter a URL to scan');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/v1/scanner/static', { url });
      const result = response.data.data;
      setScanResult(result);
      addScanResult(result);
    } catch (err) {
      setError('Scan failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Accessibility Scan
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Enter URL to start accessibility audit
          </Typography>
          <Grid container spacing={3} alignItems="flex-end">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Website URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                error={!!error}
                helperText={error}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleScan}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Start Scan'}
              </Button>
            </Grid>
          </Grid>
          <FormGroup sx={{ mt: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeStaticScan}
                  onChange={(e) => setIncludeStaticScan(e.target.checked)}
                />
              }
              label="Include Static Scan"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeBehaviorTest}
                  onChange={(e) => setIncludeBehaviorTest(e.target.checked)}
                />
              }
              label="Include Behavior Tests"
            />
          </FormGroup>
        </CardContent>
      </Card>

      {scanResult && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Scan Results
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="h4" color="error">
                    {scanResult.critical}
                  </Typography>
                  <Typography variant="body2">Critical</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#fff3e0', borderRadius: 1 }}>
                  <Typography variant="h4" color="warning">
                    {scanResult.serious}
                  </Typography>
                  <Typography variant="body2">Serious</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                  <Typography variant="h4" color="primary">
                    {scanResult.moderate}
                  </Typography>
                  <Typography variant="body2">Moderate</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
                  <Typography variant="h4" color="success">
                    {scanResult.minor}
                  </Typography>
                  <Typography variant="body2">Minor</Typography>
                </Box>
              </Grid>
            </Grid>

            {scanResult.violations && scanResult.violations.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Violations
                </Typography>
                {scanResult.violations.map((violation: { id: string; wcagTag: string; severity: string; element: string; message: string; fixSuggestion: string }, index: number) => (
                  <Alert
                    key={index}
                    severity={
                      violation.severity === 'critical'
                        ? 'error'
                        : violation.severity === 'serious'
                        ? 'warning'
                        : violation.severity === 'moderate'
                        ? 'info'
                        : 'success'
                    }
                    sx={{ mb: 2 }}
                  >
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {violation.message}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Rule: {violation.id}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Fix: {violation.fixSuggestion}
                      </Typography>
                    </Box>
                  </Alert>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default Scan;
