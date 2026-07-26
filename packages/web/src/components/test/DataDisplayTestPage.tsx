import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, useTheme } from '@mui/material';
import TestPageShell from './TestPageShell';

interface DataDisplayTestPageProps {
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

const expectedIssues = [
  { rule: 'td-headers', severity: 'critical' as const, description: 'Table cells missing scope attributes on headers.' },
  { rule: 'table-fake-caption', severity: 'serious' as const, description: 'Table uses paragraph as caption instead of <caption> element.' },
  { rule: 'color-contrast', severity: 'serious' as const, description: 'Status text contrast ratio below 4.5:1.' },
  { rule: 'image-alt', severity: 'critical' as const, description: 'Avatar images missing alt attributes.' },
  { rule: 'empty-header', severity: 'moderate' as const, description: 'Empty table header cell without text content.' },
  { rule: 'caption', severity: 'moderate' as const, description: 'Data table missing a descriptive caption.' },
];

const data = [
  { id: 1, name: 'Alice Johnson', role: 'Admin', status: 'Active', joined: '2026-01-15' },
  { id: 2, name: 'Bob Smith', role: 'Editor', status: 'Pending', joined: '2026-02-20' },
  { id: 3, name: 'Carol White', role: 'Viewer', status: 'Inactive', joined: '2026-03-10' },
  { id: 4, name: 'Dave Brown', role: 'Editor', status: 'Active', joined: '2026-04-05' },
];

function DataDisplayTestPage({ onThemeToggle, isDarkMode }: DataDisplayTestPageProps) {
  const theme = useTheme();

  return (
    <TestPageShell
      title="Data Display Test Page"
      description="A data table demonstrating common accessibility issues in data presentation: missing table headers, captions, image alt text, and insufficient color contrast."
      category="Data Display"
      expectedIssues={expectedIssues}
      onThemeToggle={onThemeToggle}
      isDarkMode={isDarkMode}
    >
      {(isBroken) =>
        isBroken ? (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
              User Management
            </Typography>

            {/* Broken table */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px', borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}></th>
                  <th style={{ padding: '8px', borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '8px', borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>Role</th>
                  <th style={{ padding: '8px', borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '8px', borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #f3f4f6' }}>
                      <img src={`https://via.placeholder.com/32`} width="32" height="32" style={{ borderRadius: '50%' }} />
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #f3f4f6', color: '#9ca3af' }}>{row.name}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #f3f4f6', color: '#9ca3af' }}>{row.role}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ color: row.status === 'Active' ? '#d1d5db' : '#fde68a' }}>
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #f3f4f6', color: '#9ca3af' }}>{row.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
              User Management
            </Typography>

            <TableContainer component={Paper} variant="outlined">
              <caption style={{ padding: '8px', textAlign: 'left', color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
                List of team members with their roles, status, and join dates
              </caption>
              <Table>
                <TableHead>
                  <TableRow>
                    <th scope="col" style={{ padding: '12px', textAlign: 'left' }}>Avatar</th>
                    <th scope="col" style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                    <th scope="col" style={{ padding: '12px', textAlign: 'left' }}>Role</th>
                    <th scope="col" style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                    <th scope="col" style={{ padding: '12px', textAlign: 'left' }}>Joined</th>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Box
                          component="img"
                          src={`https://via.placeholder.com/32`}
                          alt={`${row.name} avatar`}
                          width="32"
                          height="32"
                          sx={{ borderRadius: '50%' }}
                        />
                      </TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.role}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          color={row.status === 'Active' ? 'success' : row.status === 'Pending' ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{row.joined}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )
      }
    </TestPageShell>
  );
}

export default DataDisplayTestPage;
