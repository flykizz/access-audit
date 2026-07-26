import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  OpenInNew,
  Refresh,
  Warning,
  CheckCircle,
  Schedule,
  Cancel,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import api from '../utils/axios';

interface Task {
  id: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  currentPage: number;
  totalPages: number;
  progress: number;
  createdAt: string;
  completedAt: string | null;
  result: {
    totalPages: number;
    totalViolations: number;
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    overallScore: number;
  } | null;
  errorMessage: string | null;
}

function TaskList() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/v1/tasks');
      const data = response.data.data;
      setTasks(data || []);
      setError('');
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const handleViewResult = (taskId: string) => {
    navigate(`/results/${taskId}`);
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle sx={{ fontSize: 16, color: theme.palette.success.main }} />;
      case 'failed':
        return <Cancel sx={{ fontSize: 16, color: theme.palette.error.main }} />;
      case 'pending':
      case 'processing':
        return <Schedule sx={{ fontSize: 16, color: theme.palette.warning.main }} />;
      case 'cancelled':
        return <Warning sx={{ fontSize: 16, color: theme.palette.grey[500] }} />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'pending':
        return 'Queued';
      case 'processing':
        return 'Running';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return theme.palette.success.main;
      case 'failed':
        return theme.palette.error.main;
      case 'pending':
      case 'processing':
        return theme.palette.warning.main;
      case 'cancelled':
        return theme.palette.grey[500];
      default:
        return theme.palette.text.secondary;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ mt: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, color: theme.palette.text.primary }}
        >
          Scan History
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh sx={{ fontSize: 18 }} />}
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{
            borderRadius: '8px',
          }}
        >
          {refreshing ? <CircularProgress size={18} /> : 'Refresh'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: '8px' }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: theme.palette.primary.main }} />
        </Box>
      ) : tasks.length === 0 ? (
        <Paper sx={{ p: 8, borderRadius: '16px', textAlign: 'center' }}>
          <Warning sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 2 }} />
          <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 1 }}>
            No Scan History
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Start your first accessibility scan to see results here.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: '0 4px 60px rgba(0, 0, 0, 0.08)' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, px: 4 }}>
                  URL
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  Progress
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  Score
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  Violations
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  Date
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary, px: 4 }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell sx={{ px: 4 }}>
                    <Box sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                        {task.url}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(task.status)}
                      <Typography
                        variant="body2"
                        sx={{ color: getStatusColor(task.status), fontWeight: 600 }}
                      >
                        {getStatusLabel(task.status)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 6,
                          backgroundColor: theme.palette.divider,
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            backgroundColor: getStatusColor(task.status),
                            width: `${task.progress}%`,
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {task.progress}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {task.result ? (
                      <Chip
                        label={`${task.result.overallScore}`}
                        sx={{
                          backgroundColor:
                            task.result.overallScore >= 90
                              ? `${theme.palette.success.main}10`
                              : task.result.overallScore >= 70
                              ? `${theme.palette.warning.main}10`
                              : `${theme.palette.error.main}10`,
                          color:
                            task.result.overallScore >= 90
                              ? 'success'
                              : task.result.overallScore >= 70
                              ? 'warning'
                              : 'error',
                          fontWeight: 600,
                        }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.result ? (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {task.result.critical > 0 && (
                          <Chip
                            label={`C:${task.result.critical}`}
                            size="small"
                            sx={{ backgroundColor: `${theme.palette.error.main}10`, color: theme.palette.error.main }}
                          />
                        )}
                        {task.result.serious > 0 && (
                          <Chip
                            label={`S:${task.result.serious}`}
                            size="small"
                            sx={{ backgroundColor: `${theme.palette.warning.main}10`, color: theme.palette.warning.main }}
                          />
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {formatDate(task.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ px: 4 }}>
                    {task.status === 'completed' ? (
                      <Button
                        variant="outlined"
                        size="small"
                        endIcon={<OpenInNew sx={{ fontSize: 14 }} />}
                        onClick={() => handleViewResult(task.id)}
                        sx={{
                          borderRadius: '6px',
                          color: theme.palette.primary.main,
                          borderColor: theme.palette.primary.main,
                          '&:hover': {
                            backgroundColor: `${theme.palette.primary.main}10`,
                          },
                        }}
                      >
                        View
                      </Button>
                    ) : (
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        -
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default TaskList;
