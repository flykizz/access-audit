import { useState } from 'react';
import { Link } from 'react-router-dom';
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
} from '@mui/material';
import { Menu as MenuIcon, Brightness4, Brightness7 } from '@mui/icons-material';

interface HeaderProps {
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

function Header({ onThemeToggle, isDarkMode }: HeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
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
              href={item.href}
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
              <Button href={item.href} sx={{ textAlign: 'left', width: '100%' }}>
                {item.label}
              </Button>
            </MenuItem>
          ))}
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
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Header;