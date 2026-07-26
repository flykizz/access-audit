import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Avatar,
  Chip,
} from '@mui/material';
import {
  AccountCircle,
  Mail,
  CreditCard,
  Settings,
  Help,
  Logout,
  Star,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAppStore } from '../store/appStore';
import TaskList from './TaskList';

function Profile() {
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Box sx={{ py: 8, px: 4 }}>
      <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 6, color: theme.palette.text.primary }}>
            Profile
          </Typography>

        <Paper sx={{ p: 6, borderRadius: '16px', mb: 4 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item>
              <Avatar sx={{ width: 100, height: 100, bgcolor: theme.palette.primary.main }}>
                <AccountCircle sx={{ fontSize: 48, color: '#fff' }} />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: theme.palette.text.primary }}>
                {user.name}
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                {user.email}
              </Typography>
              <Chip
                  label={user.role === 'vip' ? 'VIP' : 'User'}
                  color={user.role === 'vip' ? 'success' : 'default'}
                  icon={user.role === 'vip' ? <Star sx={{ fontSize: 14 }} /> : undefined}
                  sx={{ borderRadius: '20px', px: 3 }}
                />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 6, borderRadius: '16px', mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            Account Info
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Mail sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                <Box>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.75rem' }}>
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
                    {user.email}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CreditCard sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                <Box>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.75rem' }}>
                    Credits
                  </Typography>
                  <Typography variant="body1" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                    {user.credits} credits
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 6, borderRadius: '16px', mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 4, color: theme.palette.text.primary }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  py: 3,
                  borderRadius: '12px',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <Settings sx={{ mr: 2, color: theme.palette.primary.main }} />
                Account Settings
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  py: 3,
                  borderRadius: '12px',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <Help sx={{ mr: 2, color: theme.palette.primary.main }} />
                Help Center
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <TaskList />

        <Paper sx={{ p: 6, borderRadius: '16px', mt: 6 }}>
          <Button
            onClick={handleLogout}
            variant="outlined"
            color="error"
            fullWidth
            sx={{
              py: 3,
              borderRadius: '12px',
              borderColor: theme.palette.error.main,
              color: theme.palette.error.main,
              '&:hover': {
                backgroundColor: theme.palette.error.light,
                borderColor: theme.palette.error.main,
              },
            }}
          >
            <Logout sx={{ mr: 2 }} />
            Logout
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}

export default Profile;
