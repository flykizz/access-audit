import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  type SelectChangeEvent,
} from '@mui/material';

interface SettingsState {
  apiKey: string;
  baseUrl: string;
  defaultScanRules: string[];
  autoGenerateReport: boolean;
  emailNotifications: boolean;
  language: string;
}

function Settings() {
  const [settings, setSettings] = useState<SettingsState>({
    apiKey: '',
    baseUrl: 'http://localhost:3000',
    defaultScanRules: ['color-contrast', 'image-alt', 'label', 'button-name'],
    autoGenerateReport: true,
    emailNotifications: false,
    language: 'en',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    setSettings((prev) => ({
      ...prev,
      language: e.target.value,
    }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev) => ({
      ...prev,
      [e.target.name]: e.target.checked,
    }));
  };

  const handleSave = () => {
    localStorage.setItem('accessaudit-settings', JSON.stringify(settings));
    alert('Settings saved successfully');
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                API Configuration
              </Typography>
              <TextField
                fullWidth
                label="API Key"
                name="apiKey"
                value={settings.apiKey}
                onChange={handleChange}
                type="password"
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                label="Base URL"
                name="baseUrl"
                value={settings.baseUrl}
                onChange={handleChange}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Preferences
              </Typography>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Language</InputLabel>
                <Select value={settings.language} label="Language" onChange={handleSelectChange}>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="de">Deutsch</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="it">Italiano</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoGenerateReport}
                    onChange={handleSwitchChange}
                    name="autoGenerateReport"
                  />
                }
                label="Auto Generate Report"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={handleSwitchChange}
                    name="emailNotifications"
                  />
                }
                label="Email Notifications"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'right' }}>
        <Button variant="contained" onClick={handleSave}>
          Save Settings
        </Button>
      </Box>
    </Box>
  );
}

export default Settings;
