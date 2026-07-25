import { useState } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

function FAQSection() {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<string | false>('panel1');

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const faqs = [
    {
      id: 'panel1',
      question: 'What is AI-powered accessibility testing?',
      answer:
        'AI-powered accessibility testing uses intelligent agents to scan and test web applications for WCAG compliance. Unlike traditional static scanners, our AI simulates real user interactions, testing keyboard navigation, screen reader compatibility, and identifying accessibility barriers that automated tools often miss.',
    },
    {
      id: 'panel2',
      question: 'How does AccessAudit perform accessibility testing?',
      answer:
        'AccessAudit combines static accessibility scanning with AI-powered behavior testing. Our AI agents navigate your application using keyboard-only navigation, test screen reader compatibility, check color contrast, validate ARIA attributes, and ensure compliance with WCAG 2.1/2.2 standards.',
    },
    {
      id: 'panel3',
      question: 'Do I need to write test scripts?',
      answer:
        'No. AccessAudit eliminates the need for scripted tests. You can describe accessibility requirements in plain English, and our AI handles execution and validation. This makes accessibility testing accessible to non-technical team members and reduces the maintenance burden on engineering teams.',
    },
    {
      id: 'panel4',
      question: 'How does AccessAudit compare to other accessibility tools?',
      answer:
        'AccessAudit goes beyond traditional accessibility scanners by combining static analysis with AI-powered behavior testing. While tools like axe-core only find about 30% of accessibility issues, AccessAudit discovers 80%+ by simulating real user interactions and testing complex workflows.',
    },
    {
      id: 'panel5',
      question: 'Can AccessAudit test mobile and desktop applications?',
      answer:
        'Yes. AccessAudit supports both desktop and mobile web testing to ensure consistent accessibility across devices. Tests run on real browsers and devices, checking responsive design, touch target sizes, and mobile-specific accessibility issues.',
    },
    {
      id: 'panel6',
      question: 'How long does setup take?',
      answer:
        'You can get started in minutes. No complex configuration or scripts required. Just enter your URL, and let our AI agents scan your website for accessibility issues automatically.',
    },
    {
      id: 'panel7',
      question: 'Can I test staging or private environments?',
      answer:
        'Yes. AccessAudit supports private environments and VPN-secured testing for non-production systems. Your test credentials and data are handled securely throughout the testing process.',
    },
    {
      id: 'panel8',
      question: 'What results will I receive?',
      answer:
        'You\'ll get comprehensive WCAG compliance reports with severity ratings, detailed violation descriptions, and actionable fix suggestions. Results include color contrast analysis, keyboard navigation test results, ARIA validation, and screen reader compatibility reports.',
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, sm: 12, md: 16 },
        px: { xs: 2, sm: 4, md: 6 },
        maxWidth: '1000px',
        mx: 'auto',
      }}
    >
      <Typography
        variant="h2"
        sx={{
          fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
          fontWeight: 600,
          mb: 2,
          textAlign: 'center',
          color: theme.palette.text.primary,
        }}
      >
        Frequently Asked Questions
      </Typography>

      <Box sx={{ mt: 6 }}>
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
  );
}

export default FAQSection;