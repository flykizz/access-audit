import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { ExpandMore, Check, ArrowRight } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

function Pricing() {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<string | false>('panel1');

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const plans = [
    {
      name: 'Pay as you go',
      description: 'Start free, pay only for what you use. No commitment required.',
      features: [
        '$3 free credits to start',
        'Top up credits anytime',
        'Up to 3 parallel scans',
        'WCAG 2.1/2.2 compliance reports',
        'Color contrast analysis',
        'Keyboard navigation testing',
        'Screen reader compatibility checks',
        'Downloadable accessibility reports',
        'CI / API integration',
        '30 days scan history',
        'Chat support',
      ],
      bestFor: 'Individuals and teams getting started with accessibility compliance.',
      cta: 'Get Started',
      ctaVariant: 'contained' as const,
      highlighted: false,
    },
    {
      name: 'Scale',
      description: 'For teams running continuous accessibility monitoring.',
      features: [
        'Unlimited script minutes*',
        '$25 AI credits included / month',
        'Up to 5 parallel scans',
        'AI-powered behavior testing',
        'Self-healing accessibility tests',
        'Team collaboration features',
        'Custom accessibility rules',
        'Priority support',
        'Unlimited scan history',
        'Everything in Pay as you go',
      ],
      bestFor: 'Teams running accessibility monitoring at scale.',
      cta: 'Upgrade to Scale',
      ctaVariant: 'contained' as const,
      highlighted: true,
      disclaimer: '*Fair use policy applies.',
    },
    {
      name: 'Custom',
      description: 'Private infra, higher limits, tailored workflows.',
      features: [
        'Higher limits & SLAs',
        'Dedicated infrastructure',
        'Custom workflows & integrations',
        'Intelligent test targeting',
        'Private network access',
        'Real device testing',
        'Geolocation testing',
        'Security reviews & compliance support',
        'Engineering support',
      ],
      bestFor: 'Enterprises and teams with compliance needs.',
      cta: 'Contact us',
      ctaVariant: 'outlined' as const,
      highlighted: false,
    },
  ];

  const scanModes = [
    {
      name: 'Quick',
      description: 'Fast accessibility scans for everyday checks.',
      features: ['Single agent execution', 'Faster turnaround', 'Lower compute usage', 'Ideal for frequent runs'],
    },
    {
      name: 'Deep',
      description: 'Thorough analysis for critical flows and releases.',
      features: ['Multiple agents working together', 'More detailed exploration', 'Thorough, multi-perspective testing', 'ARIA validation and semantic analysis'],
    },
  ];

  const faqs = [
    {
      id: 'panel1',
      question: 'How do credits work?',
      answer:
        'Credits are the currency for running accessibility scans on AccessAudit. Top up credits anytime to run scans. Credits never expire.',
    },
    {
      id: 'panel2',
      question: 'What\'s the difference between Quick and Deep scans?',
      answer:
        'Quick scans give you fast feedback - ideal for everyday iteration and frequent checks. Deep scans use more compute for thorough exploration and reasoning, making them perfect for critical flows and release validation.',
    },
    {
      id: 'panel3',
      question: 'What exactly counts as a "scan"?',
      answer:
        'A scan is an AI-powered session where agents explore your app like real users - navigating pages, interacting with UI using keyboard-only navigation, identifying accessibility barriers, and capturing detailed compliance reports.',
    },
    {
      id: 'panel4',
      question: 'What happens when I run out of credits?',
      answer:
        'You can top up credits anytime to run more scans, or upgrade to the Scale plan for unlimited script minutes and included AI credits.',
    },
    {
      id: 'panel5',
      question: 'Do credits expire?',
      answer:
        'No, credits never expire. Top up when you need them and use them at your own pace.',
    },
    {
      id: 'panel6',
      question: 'What is the Scale plan?',
      answer:
        'Scale is built for teams running continuous accessibility monitoring. For $149/month you get unlimited script minutes (fair use), $25 in AI credits included, up to 5 parallel scans, unlimited team members, and advanced accessibility testing features.',
    },
    {
      id: 'panel7',
      question: 'Can I switch between plans?',
      answer:
        'Yes. You can move between Pay as you go and Scale whenever you need. No contracts, no long-term commitments.',
    },
    {
      id: 'panel8',
      question: 'Do you offer custom or enterprise plans?',
      answer:
        'Yes. If you need more apps, higher limits, private infrastructure, or custom workflows, contact us. We\'ll figure it out together.',
    },
  ];

  return (
    <Box
      id="pricing"
      sx={{
        py: { xs: 8, sm: 12, md: 16 },
        px: { xs: 2, sm: 4, md: 6 },
        maxWidth: '1440px',
        mx: 'auto',
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 12 }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2.25rem', sm: '3rem', md: '3.5rem' },
            fontWeight: 700,
            mb: 4,
            color: theme.palette.text.primary,
          }}
        >
          Start free. Scale as you grow.
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: '1rem', md: '1.125rem' },
            color: theme.palette.text.secondary,
            mb: 2,
            maxWidth: '600px',
            mx: 'auto',
          }}
        >
          $3 free credits to start. Top up when you need more, or upgrade to Scale for unlimited script runs.
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            opacity: 0.7,
          }}
        >
          All prices in USD. Taxes may apply at checkout.
        </Typography>
      </Box>

      <Grid container spacing={6} mb={12}>
        {plans.map((plan, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                border: plan.highlighted ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
                backgroundColor: plan.highlighted ? `${theme.palette.primary.main}5` : theme.palette.background.paper,
                '&:hover': {
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <CardContent sx={{ p: 6 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    mb: 2,
                    color: theme.palette.text.primary,
                  }}
                >
                  {plan.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    mb: 4,
                  }}
                >
                  {plan.description}
                </Typography>

                <List sx={{ mb: 4 }}>
                  {plan.features.map((feature, featureIndex) => (
                    <ListItem key={featureIndex} sx={{ py: 1.5 }}>
                      <Check sx={{ color: theme.palette.success.main, mr: 2, fontSize: 18, flexShrink: 0 }} />
                      <ListItemText
                        primary={feature}
                        sx={{
                          '& .MuiListItemText-primary': {
                            fontSize: '0.875rem',
                            color: theme.palette.text.secondary,
                          },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>

                {plan.disclaimer && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      opacity: 0.7,
                      mb: 4,
                      display: 'block',
                    }}
                  >
                    {plan.disclaimer}
                  </Typography>
                )}

                <Typography
                  variant="body2"
                  sx={{
                    fontStyle: 'italic',
                    color: theme.palette.text.secondary,
                    mb: 4,
                  }}
                >
                  "{plan.bestFor}"
                </Typography>

                <Button
                  variant={plan.ctaVariant}
                  fullWidth
                  sx={{
                    backgroundColor: plan.highlighted ? theme.palette.primary.main : undefined,
                    '&:hover': {
                      backgroundColor: plan.highlighted ? theme.palette.primary.dark : undefined,
                    },
                  }}
                  endIcon={<ArrowRight />}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mb: 12 }}>
        <Typography
          variant="h3"
          sx={{
            fontSize: '1.75rem',
            fontWeight: 600,
            mb: 2,
            color: theme.palette.text.primary,
            textAlign: 'center',
          }}
        >
          Scan Modes
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            textAlign: 'center',
            mb: 6,
          }}
        >
          Every scan can be executed in one of two modes:
        </Typography>

        <Grid container spacing={6}>
          {scanModes.map((mode, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <CardContent sx={{ p: 6 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      mb: 2,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {mode.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      mb: 4,
                    }}
                  >
                    {mode.description}
                  </Typography>

                  <List>
                    {mode.features.map((feature, featureIndex) => (
                      <ListItem key={featureIndex} sx={{ py: 1.5 }}>
                        <Check sx={{ color: theme.palette.success.main, mr: 2, fontSize: 18, flexShrink: 0 }} />
                        <ListItemText
                          primary={feature}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontSize: '0.875rem',
                              color: theme.palette.text.secondary,
                            },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            opacity: 0.7,
            textAlign: 'center',
            mt: 4,
          }}
        >
          Deep scans use more compute and consume more credits than Quick scans.
        </Typography>
      </Box>

      <Box sx={{ mb: 12, py: 8, backgroundColor: `${theme.palette.primary.main}5`, borderRadius: 2 }}>
        <Typography
          variant="h3"
          sx={{
            fontSize: '1.75rem',
            fontWeight: 600,
            mb: 2,
            color: theme.palette.text.primary,
            textAlign: 'center',
          }}
        >
          Start Free Today
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            textAlign: 'center',
            mb: 4,
            maxWidth: '600px',
            mx: 'auto',
          }}
        >
          Get $3 free credits to start. No credit card required. Top up credits anytime or upgrade to Scale when you're ready.
        </Typography>
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
            endIcon={<ArrowRight />}
          >
            Run a Free Scan
          </Button>
        </Box>
      </Box>

      <Box>
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: '1.75rem', sm: '2.25rem' },
            fontWeight: 600,
            mb: 2,
            textAlign: 'center',
            color: theme.palette.text.primary,
          }}
        >
          Frequently Asked Questions
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            textAlign: 'center',
            mb: 6,
          }}
        >
          Everything you need to know about AccessAudit pricing.
        </Typography>

        <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
          {faqs.map((faq) => (
            <Accordion
              key={faq.id}
              expanded={expanded === faq.id}
              onChange={handleChange(faq.id)}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                mb: 2,
                '&:before': {
                  display: 'none',
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore sx={{ color: theme.palette.primary.main }} />}
                sx={{
                  minHeight: '64px',
                  '&.Mui-expanded': {
                    minHeight: '64px',
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                  }}
                >
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.text.secondary,
                    lineHeight: 1.8,
                  }}
                >
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default Pricing;