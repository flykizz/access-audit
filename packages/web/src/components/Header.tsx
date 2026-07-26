import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  Avatar,
  Popper,
  Paper,
  ClickAwayListener,
} from '@mui/material';
import { Menu as MenuIcon, Brightness4, Brightness7, Logout, AccountCircle, ArrowRight } from '@mui/icons-material';
import { useAppStore } from '../store/appStore';

interface HeaderProps {
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

function Header({ onThemeToggle, isDarkMode }: HeaderProps) {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/');
  };
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Docs', href: '/docs' },
    { label: 'Test Pages', href: '/test-pages' },
  ];

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = () => {
    setMobileMenuOpen(true);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
    setUserMenuOpen(true);
  };

  const handleUserMenuClose = () => {
    setUserMenuOpen(false);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: theme.palette.background.default,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar
        sx={{
          width: 'calc(100% - 48px)',
          maxWidth: '1440px',
          mx: 'auto',
          px: { xs: 2, sm: 4, md: 6 },
        }}
      >
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="4" y="4" width="24" height="24" rx="6" fill="#6366f1" />
            <path
              d="M12 12l8 4-8 4V12z"
              fill="white"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <Typography
            variant="h6"
            sx={{
              ml: 2,
              fontSize: '1.25rem',
              fontWeight: 700,
              color: theme.palette.text.primary,
            }}
          >
            AccessAudit
          </Typography>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, ml: 8 }}>
          {navItems.map((item) => (
            <Button
              key={item.label}
              component={Link}
              to={item.href}
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  color: theme.palette.text.primary,
                  backgroundColor: 'transparent',
                },
                fontWeight: 500,
                px: 2,
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto', gap: 2 }}>
          <IconButton
            onClick={onThemeToggle}
            sx={{ color: theme.palette.text.secondary }}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          {!isMobile && (
            <>
              {user ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button
                    component={Link}
                    to="/scan"
                    variant="contained"
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    Start Scan
                  </Button>
                  <Box
                    sx={{ position: 'relative' }}
                    onMouseEnter={handleUserMenuOpen}
                  >
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                        },
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </Box>
                </Box>
              ) : (
                <Button
                  component={Link}
                  to="/login"
                  variant="contained"
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                >
                  Sign In
                </Button>
              )}
            </>
          )}

          {isMobile && (
            <IconButton onClick={handleMenuClick} sx={{ color: theme.palette.text.primary }}>
              <MenuIcon />
            </IconButton>
          )}
        </Box>

        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          keepMounted
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {navItems.map((item) => (
            <MenuItem key={item.label} onClick={handleMenuClose}>
              <Button component={Link} to={item.href} sx={{ textAlign: 'left', width: '100%' }}>
                {item.label}
              </Button>
            </MenuItem>
          ))}
          {user ? (
            <>
              <MenuItem onClick={handleMenuClose}>
                <Button component={Link} to="/scan" sx={{ textAlign: 'left', width: '100%' }}>
                  Start Scan
                </Button>
              </MenuItem>
              <MenuItem onClick={() => { handleMenuClose(); handleLogout(); }}>
                <Button sx={{ textAlign: 'left', width: '100%', color: theme.palette.error.main }}>
                  <Logout sx={{ fontSize: 16, mr: 1 }} />
                  Logout
                </Button>
              </MenuItem>
            </>
          ) : (
            <>
              <MenuItem onClick={handleMenuClose}>
                <Button component={Link} to="/login" sx={{ textAlign: 'left', width: '100%' }}>
                  Sign In
                </Button>
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <Button component={Link} to="/signup" variant="contained" sx={{ width: '100%' }}>
                  Sign Up
                </Button>
              </MenuItem>
            </>
          )}
        </Menu>

      </Toolbar>
      <ClickAwayListener onClickAway={() => setUserMenuOpen(false)}>
        <Popper
          open={userMenuOpen}
          anchorEl={userMenuAnchor}
          placement="bottom-end"
          sx={{ zIndex: 1300 }}
        >
          <Paper
            sx={{
              width: '240px',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
              mt: 1,
              transition: 'opacity 0.15s ease, transform 0.15s ease',
            }}
          >
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                  {user?.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    {user?.email}
                  </Typography>
                </Box>
              </Box>
              <Button
                component={Link}
                to="/profile"
                onClick={() => setUserMenuOpen(false)}
                sx={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  py: 2,
                  gap: 2,
                  color: theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                    borderRadius: '8px',
                  },
                }}
              >
                <AccountCircle sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                <Typography variant="body1">Profile</Typography>
                <ArrowRight sx={{ fontSize: 16, color: theme.palette.text.secondary, ml: 'auto' }} />
              </Button>
              <Button
                onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                sx={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  py: 2,
                  gap: 2,
                  color: theme.palette.error.main,
                  '&:hover': {
                    backgroundColor: theme.palette.error.light,
                    borderRadius: '8px',
                  },
                }}
              >
                <Logout sx={{ fontSize: 20 }} />
                <Typography variant="body1">Logout</Typography>
              </Button>
            </Box>
          </Paper>
        </Popper>
      </ClickAwayListener>
    </AppBar>
  );
}

export default Header;