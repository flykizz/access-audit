import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Download, Description as FileText } from '@mui/icons-material';
import { useAppStore } from '../store/appStore';
import axios from 'axios';

function Report() {
  const { id } = useParams<{ id: string }>();
  const { scanResults, behaviorResults, coverageData } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [reportContent, setReportContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const generateReport = async () => {
      try {
        const response = await axios.post('http://localhost:3000/api/v1/report/generate', {
          taskId: id || 'default',
          format: 'html',
        });
        const result = response.data.data;
        setReportContent(typeof result.content === 'string' ? result.content : JSON.stringify(result));
      } catch (err) {
        setError('Failed to generate report');
      } finally {
        setLoading(false);
      }
    };

    generateReport();
  }, [id, scanResults, behaviorResults, coverageData]);

  const handleDownload = () => {
    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-report-${id || Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Accessibility Report
        </Typography>
        {reportContent && (
          <Button variant="contained" onClick={handleDownload} startIcon={<Download />}>
            Download Report
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress size={60} />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Report Summary
                </Typography>
                <Box
                  sx={{
                    border: '1px solid #eee',
                    borderRadius: 2,
                    padding: 4,
                    backgroundColor: '#fff',
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: reportContent }} />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default Report;
