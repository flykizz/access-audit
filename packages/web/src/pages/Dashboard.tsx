import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  Search as Scan,
  Warning as AlertTriangle,
  CheckCircle,
  TrendingUp,
} from '@mui/icons-material';
import { useAppStore } from '../store/appStore';
import { Link } from 'react-router-dom';

function Dashboard() {
  const { tasks } = useAppStore();
  interface Task {
    taskId: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
  }

  const [stats, setStats] = useState<{
    totalScans: number;
    violations: { critical: number; serious: number; moderate: number; minor: number };
    coverage: number;
    recentTasks: Task[];
  }>({
    totalScans: 128,
    violations: { critical: 5, serious: 12, moderate: 8, minor: 24 },
    coverage: 92,
    recentTasks: [],
  });

  useEffect(() => {
    setStats((prev) => ({
      ...prev,
      recentTasks: tasks.slice(0, 5),
    }));
  }, [tasks]);

  const severityColors: Record<string, 'error' | 'warning' | 'info' | 'success'> = {
    critical: 'error',
    serious: 'warning',
    moderate: 'info',
    minor: 'success',
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Scan sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Scans
                  </Typography>
                  <Typography variant="h4">{stats.totalScans}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AlertTriangle sx={{ fontSize: 40, mr: 2, color: 'error.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Critical Issues
                  </Typography>
                  <Typography variant="h4">{stats.violations.critical}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle sx={{ fontSize: 40, mr: 2, color: 'success.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Coverage
                  </Typography>
                  <Typography variant="h4">{stats.coverage}%</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, mr: 2, color: 'warning.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Issues Found
                  </Typography>
                  <Typography variant="h4">
                    {stats.violations.critical + stats.violations.serious + stats.violations.moderate + stats.violations.minor}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Violation Summary
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Object.entries(stats.violations).map(([severity, count]) => (
                  <Box key={severity} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip
                      label={severity.charAt(0).toUpperCase() + severity.slice(1)}
                      color={severityColors[severity as keyof typeof severityColors]}
                      size="small"
                      sx={{ mr: 2 }}
                    />
                    <Box sx={{ flexGrow: 1, height: 20, backgroundColor: '#eee', borderRadius: 1 }}>
                      <Box
                        sx={{
                          height: '100%',
                          width: `${(count / 50) * 100}%`,
                          backgroundColor:
                            severity === 'critical'
                              ? '#f44336'
                              : severity === 'serious'
                              ? '#ff9800'
                              : severity === 'moderate'
                              ? '#2196f3'
                              : '#4caf50',
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                    <Typography sx={{ ml: 2, fontWeight: 'bold' }}>{count}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Recent Tasks</Typography>
                <Button component={Link} to="/scan" variant="contained" size="small">
                  New Scan
                </Button>
              </Box>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Task Name</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Progress</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentTasks.length > 0 ? (
                      stats.recentTasks.map((task) => (
                        <TableRow key={task.taskId}>
                          <TableCell>{task.name}</TableCell>
                          <TableCell>
                            <Chip
                              label={task.status}
                              color={
                                task.status === 'completed'
                                  ? 'success'
                                  : task.status === 'running'
                                  ? 'primary'
                                  : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{task.progress}%</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          No tasks found. Start a new scan.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
