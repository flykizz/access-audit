import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
} from '@mui/material';
import { ArrowRight, Speed, CheckCircle } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

function Hero() {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState('');

  const quickActions = [
    { label: 'Quick', color: 'primary' },
    { label: 'Functional', color: 'secondary' },
  ];

  const examplePrompts = [
    { label: 'GitHub search', icon: 'github' },
    { label: 'Wikipedia article', icon: 'wiki' },
    { label: 'Target search', icon: 'target' },
    { label: 'Target add to cart', icon: 'shopping' },
    { label: 'Hacker News', icon: 'news' },
    { label: 'CNN News article', icon: 'news' },
    { label: 'Form submission', icon: 'form' },
    { label: 'Login test', icon: 'login' },
  ];

  const handleRunTest = () => {
    console.log('Running test with:', inputValue);
  };

  const handleExampleClick = (label: string) => {
    setInputValue(label);
  };

  return (
    <Box
      sx={{
        py: { xs: 8, sm: 12, md: 16 },
        px: { xs: 2, sm: 4, md: 6 },
        maxWidth: '1440px',
        mx: 'auto',
      }}
    >
      <Grid container spacing={6} alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.25rem', sm: '3rem', md: '3.5rem' },
              fontWeight: 700,
              lineHeight: 1.1,
              mb: 4,
              color: theme.palette.text.primary,
            }}
          >
            AI Agents for Test Automation
            <br />
            <span style={{ color: theme.palette.primary.main }}>No Scripts Required</span>
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              color: theme.palette.text.secondary,
              mb: 4,
              maxWidth: '500px',
            }}
          >
            Make Digital Experiences Accessible to Everyone. AccessAudit combines AI-powered behavior testing with comprehensive accessibility scanning to ensure your website is usable by all users, including those with disabilities. Detect WCAG violations, broken workflows, and UX issues automatically.
          </Typography>

          <Box
            sx={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              p: 1,
              mb: 4,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            }}
          >
            <TextField
              fullWidth
              placeholder="Describe what you want to test..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  border: 'none',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                },
                '& input': {
                  pl: 2,
                },
              }}
              InputProps={{
                startAdornment: (
                  <Box sx={{ display: 'flex', gap: 1, px: 2 }}>
                    {quickActions.map((action) => (
                      <Chip
                        key={action.label}
                        label={action.label}
                        color={action.color as 'primary' | 'secondary'}
                        size="small"
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 0.8,
                          },
                        }}
                      />
                    ))}
                  </Box>
                ),
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 4 }}>
            {examplePrompts.map((prompt) => (
              <Button
                key={prompt.label}
                variant="outlined"
                size="small"
                onClick={() => handleExampleClick(prompt.label)}
                sx={{
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: `${theme.palette.primary.main}10`,
                  },
                }}
              >
                {prompt.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleRunTest}
              disabled={!inputValue}
              sx={{
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
                '&:disabled': {
                  opacity: 0.5,
                  cursor: 'not-allowed',
                },
              }}
              endIcon={<ArrowRight />}
            >
              Run Free Test
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: theme.palette.divider,
                '&:hover': {
                  borderColor: theme.palette.text.primary,
                },
              }}
            >
              Sign up for $3 free
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mt: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 16 }} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Runs a real browser test
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 16 }} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                No signup required
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Speed sx={{ color: theme.palette.warning.main, fontSize: 16 }} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                3 free runs left
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box
            sx={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              p: 4,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            }}
          >
            <img
              src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Modern%20AI%20testing%20dashboard%20interface%20showing%20test%20results%20with%20charts%20and%20metrics%20in%20blue%20and%20white%20color%20scheme&image_size=landscape_16_9"
              alt="AccessAudit Demo"
              style={{ width: '100%', borderRadius: 8 }}
            />
            <Box sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: `${theme.palette.primary.main}10`,
                  },
                }}
              >
                Watch demo
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Hero;